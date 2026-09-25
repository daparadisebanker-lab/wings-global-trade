#!/usr/bin/env python3
"""Render ficha.html to ficha.pdf via headless Chromium, then post-process
with pymupdf to add:

  - a running per-page "Página X de Y" footer on every page. Chromium's
    --print-to-pdf CLI has no header/footer templating, and its print
    engine doesn't reliably support CSS counter(page)/counter(pages), so
    this is drawn directly onto the rendered PDF instead of relying on
    print CSS. (A running top mini-header used to be drawn here too — removed
    per feedback; the page-number footer stays.)

  - the table of contents' page numbers and jump links. build_ficha.py
    leaves a unique placeholder token per TOC row ("•PN01•" etc.)
    because the real page each section lands on isn't known until Chromium
    has paginated the content; this script finds each section's actual page
    by searching the rendered text, writes the real number over the
    placeholder, and adds a clickable link over the row.

Run: python3 build_ficha.py && python3 render_pdf.py
"""
import subprocess
from pathlib import Path

import pymupdf

from build_ficha import TOC_SECTIONS

HERE = Path(__file__).resolve().parent
HTML = HERE / "ficha.html"
PDF = HERE / "ficha.pdf"
CHROMIUM = "/opt/pw-browsers/chromium"

MUTED = (0.42, 0.44, 0.47)

# Pages before the numbered sections start: 0 = cover, 1 = table of contents.
CONTENT_START_PAGE = 2


def render_base_pdf() -> None:
    subprocess.run(
        [
            CHROMIUM, "--headless", "--disable-gpu", "--no-sandbox",
            f"--print-to-pdf={PDF}", "--no-pdf-header-footer",
            "--print-to-pdf-no-header", f"file://{HTML}",
        ],
        check=True, capture_output=True,
    )


def find_section_pages(doc: "pymupdf.Document") -> dict[int, int]:
    """Map section idx -> 0-based page index where its section bar lands.

    Section-bar titles render as uppercase in the PDF (CSS text-transform is
    baked into the glyphs Chromium emits), while the TOC lists them in their
    natural case, so the two must be searched for differently.
    """
    pages = {}
    for idx, title in TOC_SECTIONS:
        needle = title.upper()
        for pno in range(CONTENT_START_PAGE, len(doc)):
            if doc[pno].search_for(needle):
                pages[idx] = pno
                break
    missing = [idx for idx, _ in TOC_SECTIONS if idx not in pages]
    if missing:
        raise RuntimeError(f"could not locate section(s) in rendered PDF: {missing}")
    return pages


def fill_toc(doc: "pymupdf.Document", section_pages: dict[int, int]) -> None:
    toc_page = doc[1]
    for idx, title in TOC_SECTIONS:
        target_page = section_pages[idx]
        token = f"•PN{idx:02d}•"
        token_rects = toc_page.search_for(token)
        if not token_rects:
            raise RuntimeError(f"TOC placeholder for section {idx:02d} not found")
        token_rect = token_rects[0]

        toc_page.add_redact_annot(token_rect, fill=(1, 1, 1))
        toc_page.apply_redactions()

        page_label = str(target_page + 1)
        tw = pymupdf.get_text_length(page_label, fontname="helv", fontsize=9.5)
        toc_page.insert_text(
            (token_rect.x1 - tw, token_rect.y1 - 2), page_label,
            fontsize=9.5, fontname="helv", color=(0.06, 0.07, 0.09),
        )

        label_rects = toc_page.search_for(title)
        if label_rects:
            link_rect = label_rects[0] | token_rect
            link_rect.x1 = toc_page.rect.width - 34  # extend to the row's right edge
            toc_page.insert_link({
                "kind": pymupdf.LINK_GOTO, "from": link_rect,
                "page": target_page, "to": pymupdf.Point(0, 0),
            })


def add_page_number_footer(doc: "pymupdf.Document") -> None:
    n = len(doc)
    for i, page in enumerate(doc):
        page_num = i + 1
        w, h = page.rect.width, page.rect.height

        footer = f"Página {page_num} de {n}"
        tw = pymupdf.get_text_length(footer, fontname="helv", fontsize=7)
        page.insert_text((w - 34 - tw, h - 12), footer, fontsize=7, fontname="helv", color=MUTED)


def main() -> None:
    render_base_pdf()
    doc = pymupdf.open(PDF)
    section_pages = find_section_pages(doc)
    fill_toc(doc, section_pages)
    add_page_number_footer(doc)
    doc.saveIncr()
    doc.close()

    doc = pymupdf.open(PDF)
    print(f"rendered {PDF} ({len(doc)} pages) with TOC + page-number footer")
    doc.close()


if __name__ == "__main__":
    main()
