/**
 * stage-hero.ts — Route 1 (deterministic composite) staging for the Wings
 * Catalog Hero Cutout Standard (C-HERO).
 *
 * Governing spec: spec/WINGS_CATALOG_HERO_STANDARD.md — sections THE GRID,
 * "Shadow spec", "Step 5 — Staging". The spec is authoritative; the constants
 * below encode it. Pure deterministic raster math via sharp — no AI, no network.
 *
 * Usage:
 *   pnpm tsx scripts/stage-hero.ts --input <cutout.png> --sku <sku> \
 *     --facing <left|right> [--outdir assets/image-generation/outputs/<sku>]
 *
 * The input MUST be a transparent-background product cutout PNG. The product is
 * NEVER mirrored/flipped (Gate G7) — there is no flip option by design.
 */

import path from "node:path";
import { mkdir, writeFile } from "node:fs/promises";
import sharp from "sharp";

// --- C-HERO grid constants (THE GRID) ---
const CANVAS_W = 2000;
const CANVAS_H = 1500;
const WARM_WHITE = { r: 0xf8, g: 0xf6, b: 0xf0 }; // #F8F6F0 exactly (Gate G6)
const WARM_WHITE_HEX = "#F8F6F0";
const NAVY_HEX = "#001E50"; // shadow hue (Palette Law)

const SAFE_W_FRAC = 0.78; // product bbox <= 78% canvas width
const SAFE_H_FRAC = 0.7; // product bbox <= 70% canvas height
const GROUND_FRAC = 0.84; // wheel-contact line at 84% canvas height
const FACING_MARGIN_FRAC = 0.04; // +4% canvas width extra margin on facing side

// --- Shadow spec (two layers only, navy #001E50) ---
const CONTACT_OPACITY = 0.2; // contact ellipses: 20%
const CONTACT_BLUR_PX = 40; // ~40px at 2000px canvas width
const BODY_OPACITY = 0.1; // body ellipse: 10%
const BODY_BLUR_PX = 120; // ~120px
const BODY_WIDTH_FRAC = 0.9; // body ellipse spans ~90% of product bbox width

// Ellipse flatness factors (ry as a fraction of rx / bbox width). Contact
// patches are flat pads; the body mass is a broad low smear on the ground line.
const CONTACT_RY_FACTOR = 0.18; // ry = rx * factor
const BODY_RY_FRAC = 0.05; // ry = bboxWidthCanvas * factor

// A CSS-style blur radius of ~Npx corresponds to a Gaussian sigma of N/3
// (visible spread ≈ 3·sigma), which is how sharp.blur() is parameterised.
const blurPxToSigma = (px: number) => px / 3;

// Alpha detection threshold (0-255): ignores faint anti-alias fringe so the
// bounding box and wheel patches track the real silhouette.
const ALPHA_THRESHOLD = 16;
const BAND_FRAC = 0.04; // bottom 4% of bbox height = the contact band

const GROUND_TOL_FRAC = 0.01; // G1 ground line tolerance (±1%)
const MARGIN_TOL_PX = 1.5; // G1 facing-margin rounding tolerance

// Pre-flight resolution floor (spec Step 1): the product's long edge must be
// at least this many source pixels, else staging would have to soften/upscale.
const MIN_SOURCE_EDGE = 1200;

interface Facing {
  facing: "left" | "right";
}

interface Args extends Facing {
  input: string;
  sku: string;
  outdir?: string;
}

function parseArgs(argv: string[]): Args {
  const map = new Map<string, string>();
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (token.startsWith("--")) {
      const key = token.slice(2);
      const value = argv[i + 1];
      if (value === undefined || value.startsWith("--")) {
        throw new Error(`Missing value for --${key}`);
      }
      map.set(key, value);
      i += 1;
    }
  }
  const input = map.get("input");
  const sku = map.get("sku");
  const facing = map.get("facing");
  if (!input) throw new Error("--input <cutout.png> is required");
  if (!sku) throw new Error("--sku <sku> is required");
  if (facing !== "left" && facing !== "right") {
    throw new Error("--facing must be 'left' or 'right'");
  }
  return { input, sku, facing, outdir: map.get("outdir") };
}

interface Bbox {
  left: number;
  top: number;
  width: number;
  height: number;
}

interface Patch {
  x0: number; // original-pixel column, inclusive
  x1: number; // original-pixel column, inclusive
}

/** Alpha bounding box of the cutout, in source-pixel coordinates. */
function alphaBbox(data: Buffer, width: number, height: number): Bbox {
  let minX = width;
  let minY = height;
  let maxX = -1;
  let maxY = -1;
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const alpha = data[(y * width + x) * 4 + 3];
      if (alpha > ALPHA_THRESHOLD) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  if (maxX < 0) throw new Error("Input has no opaque pixels — not a valid cutout");
  return { left: minX, top: minY, width: maxX - minX + 1, height: maxY - minY + 1 };
}

/**
 * Detect wheel-contact patches: columns carrying alpha within the bottom
 * BAND_FRAC of the bbox height, clustered into patches (small gaps bridged).
 */
function detectContactPatches(
  data: Buffer,
  width: number,
  height: number,
  bbox: Bbox,
): Patch[] {
  const bandHeight = Math.max(1, Math.round(bbox.height * BAND_FRAC));
  const bandTop = bbox.top + bbox.height - bandHeight;
  const bandBottom = bbox.top + bbox.height - 1;

  const present: number[] = [];
  for (let x = bbox.left; x < bbox.left + bbox.width; x += 1) {
    let hit = false;
    for (let y = bandTop; y <= bandBottom && y < height; y += 1) {
      if (data[(y * width + x) * 4 + 3] > ALPHA_THRESHOLD) {
        hit = true;
        break;
      }
    }
    if (hit) present.push(x);
  }

  const gapTolerance = Math.max(2, Math.round(bbox.width * 0.02));
  const minPatchWidth = Math.max(1, Math.round(bbox.width * 0.015));

  const patches: Patch[] = [];
  let start = -1;
  let prev = -1;
  for (const x of present) {
    if (start < 0) {
      start = x;
    } else if (x - prev > gapTolerance) {
      if (prev - start + 1 >= minPatchWidth) patches.push({ x0: start, x1: prev });
      start = x;
    }
    prev = x;
  }
  if (start >= 0 && prev - start + 1 >= minPatchWidth) {
    patches.push({ x0: start, x1: prev });
  }
  return patches;
}

interface Ellipse {
  cx: number;
  cy: number;
  rx: number;
  ry: number;
}

/** Render one navy shadow layer (all its ellipses) to a full-canvas blurred RGBA buffer. */
async function renderShadowLayer(
  ellipses: Ellipse[],
  opacity: number,
  blurPx: number,
): Promise<Buffer> {
  const shapes = ellipses
    .map(
      (e) =>
        `<ellipse cx="${e.cx.toFixed(2)}" cy="${e.cy.toFixed(2)}" ` +
        `rx="${e.rx.toFixed(2)}" ry="${e.ry.toFixed(2)}" ` +
        `fill="${NAVY_HEX}" fill-opacity="${opacity}"/>`,
    )
    .join("");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${CANVAS_W}" height="${CANVAS_H}">${shapes}</svg>`;
  return sharp(Buffer.from(svg))
    .blur(blurPxToSigma(blurPx))
    .png()
    .toBuffer();
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));
  const inputPath = path.resolve(args.input);
  const outdir = path.resolve(
    args.outdir ?? path.join("assets", "image-generation", "outputs", args.sku),
  );
  await mkdir(outdir, { recursive: true });

  // Read source pixels (force RGBA so alpha is always present).
  const { data, info } = await sharp(inputPath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const srcW = info.width;
  const srcH = info.height;

  const bbox = alphaBbox(data, srcW, srcH);

  // --- Scale: fit bbox into the safe area; never upscale beyond source pixels. ---
  // The safe-area fractions are upper bounds: a product larger than the safe
  // area is scaled DOWN to fit; a smaller one is placed at 100% (never upscaled,
  // which would soften edges). A source below the pre-flight resolution floor is
  // refused rather than staged soft.
  const maxBboxW = SAFE_W_FRAC * CANVAS_W; // 1560
  const maxBboxH = SAFE_H_FRAC * CANVAS_H; // 1050
  const longestSrcEdge = Math.max(bbox.width, bbox.height);
  if (longestSrcEdge < MIN_SOURCE_EDGE) {
    throw new Error(
      `Source too small: product bbox long edge is ${longestSrcEdge}px (< ${MIN_SOURCE_EDGE}px floor). ` +
        `Staging must not upscale/soften a hero — re-source at higher resolution.`,
    );
  }
  const fitScale = Math.min(maxBboxW / bbox.width, maxBboxH / bbox.height);
  const scale = Math.min(1, fitScale); // never upscale beyond 100% of source
  const scaledW = Math.round(srcW * scale);
  const scaledH = Math.round(srcH * scale);

  // --- Placement: ground line at 84%, product centered then shifted for lead room. ---
  const groundY = GROUND_FRAC * CANVAS_H; // 1260
  const facingShift = FACING_MARGIN_FRAC * CANVAS_W; // 80
  // Facing side gains extra margin => product shifts AWAY from the facing side.
  const targetCenterX = CANVAS_W / 2 + (args.facing === "left" ? facingShift : -facingShift);

  const scaledBboxLeft = bbox.left * scale;
  const scaledBboxBottom = (bbox.top + bbox.height) * scale;
  const scaledBboxCenterX = (bbox.left + bbox.width / 2) * scale;

  const placeLeftFloat = targetCenterX - scaledBboxCenterX;
  const placeTopFloat = groundY - scaledBboxBottom;
  const placeLeft = Math.round(placeLeftFloat);
  const placeTop = Math.round(placeTopFloat);

  const bboxCanvasWidth = bbox.width * scale;
  const bboxCanvasHeight = bbox.height * scale;

  // --- Shadow ellipses (canvas coords), centered on the ground line. ---
  const patches = detectContactPatches(data, srcW, srcH, bbox);
  let contactSource: Patch[];
  let fallbackUsed = false;
  if (patches.length >= 2) {
    contactSource = patches;
  } else {
    // Fallback: two ellipses at 25% and 75% of the bbox width.
    fallbackUsed = true;
    const q = bbox.width * 0.15; // half-width of each fallback pad in source px
    contactSource = [
      { x0: bbox.left + bbox.width * 0.25 - q, x1: bbox.left + bbox.width * 0.25 + q },
      { x0: bbox.left + bbox.width * 0.75 - q, x1: bbox.left + bbox.width * 0.75 + q },
    ];
  }

  const toCanvasX = (col: number) => placeLeftFloat + col * scale;
  const contactEllipses: Ellipse[] = contactSource.map((p) => {
    const cx = (toCanvasX(p.x0) + toCanvasX(p.x1)) / 2;
    const rx = Math.max(4, ((p.x1 - p.x0) * scale) / 2);
    return { cx, cy: groundY, rx, ry: Math.max(6, rx * CONTACT_RY_FACTOR) };
  });

  const bodyEllipse: Ellipse = {
    cx: placeLeftFloat + scaledBboxCenterX,
    cy: groundY,
    rx: (bboxCanvasWidth * BODY_WIDTH_FRAC) / 2,
    ry: Math.max(12, bboxCanvasWidth * BODY_RY_FRAC),
  };

  // --- Build the layers: shadow (under) then cutout (over). ---
  const cutoutBuf = await sharp(inputPath)
    .ensureAlpha()
    .resize(scaledW, scaledH, { fit: "fill", kernel: "lanczos3" })
    .png()
    .toBuffer();

  const bodyLayer = await renderShadowLayer([bodyEllipse], BODY_OPACITY, BODY_BLUR_PX);
  const contactLayer = await renderShadowLayer(contactEllipses, CONTACT_OPACITY, CONTACT_BLUR_PX);

  const masterBuf = await sharp({
    create: {
      width: CANVAS_W,
      height: CANVAS_H,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([
      { input: bodyLayer, left: 0, top: 0 },
      { input: contactLayer, left: 0, top: 0 },
      { input: cutoutBuf, left: placeLeft, top: placeTop },
    ])
    .png()
    .toBuffer();

  // Warm-white composite (flatten the transparent master onto #F8F6F0).
  const compositeBuf = await sharp(masterBuf).flatten({ background: WARM_WHITE }).png().toBuffer();

  // --- Write deliverables. ---
  const masterPath = path.join(outdir, `${args.sku}_hero_master.png`);
  const path4x3 = path.join(outdir, `${args.sku}_hero_4x3.webp`);
  const path1x1 = path.join(outdir, `${args.sku}_hero_1x1.webp`);
  const path16x9 = path.join(outdir, `${args.sku}_hero_16x9.webp`);

  await writeFile(masterPath, masterBuf);
  await sharp(compositeBuf).webp({ quality: 90 }).toFile(path4x3);
  // Crops derive from the SAME placement, never re-staged.
  await sharp(compositeBuf)
    .extract({ left: (CANVAS_W - CANVAS_H) / 2, top: 0, width: CANVAS_H, height: CANVAS_H })
    .webp({ quality: 90 })
    .toFile(path1x1);
  const h16x9 = Math.round((CANVAS_W * 9) / 16); // 1125
  await sharp(compositeBuf)
    .extract({ left: 0, top: Math.round((CANVAS_H - h16x9) / 2), width: CANVAS_W, height: h16x9 })
    .webp({ quality: 90 })
    .toFile(path16x9);

  // --- Machine checks (Gate G1 grid, Gate G6 ground). ---
  const bboxCanvasBottom = placeTop + scaledBboxBottom;
  const groundLineFrac = bboxCanvasBottom / CANVAS_H;
  const g1GroundOk = Math.abs(groundLineFrac - GROUND_FRAC) <= GROUND_TOL_FRAC;
  const g1SafeAreaOk =
    bboxCanvasWidth <= maxBboxW + 1 && bboxCanvasHeight <= maxBboxH + 1;

  const bboxCanvasLeft = placeLeft + scaledBboxLeft;
  const bboxCanvasRight = bboxCanvasLeft + bboxCanvasWidth;
  const leftMargin = bboxCanvasLeft;
  const rightMargin = CANVAS_W - bboxCanvasRight;
  const centerMargin = (CANVAS_W - bboxCanvasWidth) / 2;
  const facingMargin = args.facing === "left" ? leftMargin : rightMargin;
  const g1FacingOk = Math.abs(facingMargin - (centerMargin + facingShift)) <= MARGIN_TOL_PX;

  // G6: composite corners must be exactly #F8F6F0.
  const { data: cData, info: cInfo } = await sharp(compositeBuf)
    .raw()
    .toBuffer({ resolveWithObject: true });
  const ch = cInfo.channels;
  const cornerHex = (x: number, y: number): string => {
    const idx = (y * cInfo.width + x) * ch;
    const r = cData[idx];
    const g = cData[idx + 1];
    const b = cData[idx + 2];
    return (
      "#" +
      [r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("").toUpperCase()
    );
  };
  const corners = {
    topLeft: cornerHex(0, 0),
    topRight: cornerHex(CANVAS_W - 1, 0),
    bottomLeft: cornerHex(0, CANVAS_H - 1),
    bottomRight: cornerHex(CANVAS_W - 1, CANVAS_H - 1),
  };
  const g6GroundOk = Object.values(corners).every((hex) => hex === WARM_WHITE_HEX);

  const report = {
    sku: args.sku,
    facing: args.facing,
    input: inputPath,
    source: { width: srcW, height: srcH },
    alphaBbox: bbox,
    scale,
    scaledCutout: { width: scaledW, height: scaledH },
    groundLineY: groundY,
    placement: {
      left: placeLeft,
      top: placeTop,
      bboxCanvas: {
        left: round2(bboxCanvasLeft),
        right: round2(bboxCanvasRight),
        width: round2(bboxCanvasWidth),
        height: round2(bboxCanvasHeight),
        bottom: round2(bboxCanvasBottom),
      },
      leftMargin: round2(leftMargin),
      rightMargin: round2(rightMargin),
      centerMargin: round2(centerMargin),
      facingMarginTarget: round2(centerMargin + facingShift),
    },
    shadow: {
      navy: NAVY_HEX,
      contactPatchesDetected: patches.length,
      fallbackUsed,
      contactLayer: {
        opacity: CONTACT_OPACITY,
        blurPx: CONTACT_BLUR_PX,
        ellipses: contactEllipses.map(round2Ellipse),
      },
      bodyLayer: {
        opacity: BODY_OPACITY,
        blurPx: BODY_BLUR_PX,
        ellipse: round2Ellipse(bodyEllipse),
      },
    },
    outputs: {
      master: masterPath,
      "4x3": path4x3,
      "1x1": path1x1,
      "16x9": path16x9,
    },
    checks: {
      G1: {
        groundLineFrac: round4(groundLineFrac),
        groundLineOk: g1GroundOk,
        safeAreaOk: g1SafeAreaOk,
        facingMarginOk: g1FacingOk,
        pass: g1GroundOk && g1SafeAreaOk && g1FacingOk,
      },
      G6: {
        corners,
        expected: WARM_WHITE_HEX,
        pass: g6GroundOk,
      },
    },
  };

  const reportPath = path.join(outdir, `${args.sku}_stage_report.json`);
  await writeFile(reportPath, JSON.stringify(report, null, 2) + "\n");

  const allPass = report.checks.G1.pass && report.checks.G6.pass;
  process.stdout.write(
    `Staged ${args.sku} (facing ${args.facing}) -> ${outdir}\n` +
      `  scale ${scale.toFixed(4)} | ground ${(groundLineFrac * 100).toFixed(2)}% | ` +
      `G1 ${report.checks.G1.pass ? "PASS" : "FAIL"} | G6 ${report.checks.G6.pass ? "PASS" : "FAIL"}\n` +
      `  report: ${reportPath}\n`,
  );
  if (!allPass) {
    process.exitCode = 1;
    process.stderr.write("Staging produced a card that fails a machine gate — see report.\n");
  }
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
function round4(n: number): number {
  return Math.round(n * 10000) / 10000;
}
function round2Ellipse(e: Ellipse) {
  return { cx: round2(e.cx), cy: round2(e.cy), rx: round2(e.rx), ry: round2(e.ry) };
}

main().catch((err: unknown) => {
  process.stderr.write(`stage-hero failed: ${err instanceof Error ? err.message : String(err)}\n`);
  process.exit(1);
});
