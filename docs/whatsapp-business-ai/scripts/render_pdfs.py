#!/usr/bin/env python3
"""Render the WhatsApp Business AI knowledge-base .md/.csv sources to PDF.

Regenerate after any content edit — never hand-edit a PDF in pdf/ directly.
Minimal, dependency-light markdown subset (headers, bullets, numbered lists,
blockquotes, bold, inline code, hr, fenced code, pipe tables) since the
source docs are deliberately simple. No external binary (pandoc/wkhtmltopdf)
required — reportlab only.

Source lines are hard-wrapped at ~80 columns, so wrapped continuation lines
(indented, no block marker) are joined back into their paragraph/bullet/quote
before rendering — otherwise every wrapped line becomes its own fragment.
"""
import csv
import re
from pathlib import Path
from xml.sax.saxutils import escape

from reportlab.lib import colors
from reportlab.lib.pagesizes import LETTER
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, ListFlowable, ListItem,
    HRFlowable, Table, TableStyle, Preformatted,
)

SRC_DIR = Path(__file__).resolve().parent.parent
OUT_DIR = SRC_DIR / "pdf"

NAVY = colors.HexColor("#001E50")
GOLD = colors.HexColor("#C4933F")
INK = colors.HexColor("#1A1A1A")

styles = getSampleStyleSheet()
styles.add(ParagraphStyle("H1", parent=styles["Heading1"], textColor=NAVY,
                           spaceBefore=4, spaceAfter=12, fontSize=20))
styles.add(ParagraphStyle("H2", parent=styles["Heading2"], textColor=NAVY,
                           spaceBefore=16, spaceAfter=8, fontSize=15))
styles.add(ParagraphStyle("H3", parent=styles["Heading3"], textColor=GOLD,
                           spaceBefore=12, spaceAfter=6, fontSize=12.5))
styles.add(ParagraphStyle("Body", parent=styles["Normal"], textColor=INK,
                           fontSize=10.3, leading=15, spaceAfter=8))
styles.add(ParagraphStyle("Quote", parent=styles["Normal"], textColor=INK,
                           fontSize=10.3, leading=15, spaceAfter=8,
                           leftIndent=18, backColor=colors.HexColor("#F8F6F0"),
                           borderPadding=6))
styles.add(ParagraphStyle("BulletItem", parent=styles["Normal"], textColor=INK,
                           fontSize=10.3, leading=15))
styles.add(ParagraphStyle("Mono", parent=styles["Code"], fontSize=8.5,
                           leading=11, backColor=colors.HexColor("#F0EFEE")))

TABLE_STYLE = TableStyle([
    ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#CCCCCC")),
    ("BACKGROUND", (0, 0), (-1, 0), NAVY),
    ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
    ("VALIGN", (0, 0), (-1, -1), "TOP"),
    ("LEFTPADDING", (0, 0), (-1, -1), 6),
    ("RIGHTPADDING", (0, 0), (-1, -1), 6),
    ("TOPPADDING", (0, 0), (-1, -1), 4),
    ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
])


def inline(text: str) -> str:
    """Escape for reportlab mini-XML, then restore **bold** / `code`."""
    text = escape(text)
    text = re.sub(r"\*\*(.+?)\*\*", r"<b>\1</b>", text)
    text = re.sub(r"`(.+?)`", r'<font face="Courier">\1</font>', text)
    return text


class Renderer:
    """Line-buffered state machine: joins wrapped continuation lines into
    whatever block (paragraph / bullet item / numbered item / quote
    paragraph) is currently open, and only flushes to a flowable when the
    block actually ends (blank line, new block marker, EOF)."""

    def __init__(self, title: str):
        self.story = [Paragraph(title, styles["H1"]), Spacer(1, 4)]
        self.mode = None          # None | 'para' | 'bullets' | 'numbered' | 'quote' | 'table'
        self.para_lines = []
        self.list_items = []      # list[list[str]] — each item's wrapped lines
        self.quote_paras = []     # list[list[str]] — each quote paragraph's wrapped lines
        self.table_rows = []

    def flush(self):
        if self.mode == "para" and self.para_lines:
            text = inline(" ".join(self.para_lines))
            self.story.append(Paragraph(text, styles["Body"]))
        elif self.mode in ("bullets", "numbered") and self.list_items:
            bullet_type = "1" if self.mode == "numbered" else "bullet"
            self.story.append(ListFlowable(
                [ListItem(Paragraph(inline(" ".join(item)), styles["BulletItem"]))
                 for item in self.list_items if item],
                bulletType=bullet_type, leftIndent=20,
            ))
            self.story.append(Spacer(1, 8))
        elif self.mode == "quote" and self.quote_paras:
            paras = [" ".join(p) for p in self.quote_paras if p]
            text = "<br/><br/>".join(inline(p) for p in paras)
            self.story.append(Paragraph(text, styles["Quote"]))
            self.story.append(Spacer(1, 8))
        elif self.mode == "table" and self.table_rows:
            rows = [r for r in self.table_rows if not re.match(r"^\|?[\s:|-]+\|?$", r)]
            data = []
            for r in rows:
                cells = [c.strip() for c in r.strip().strip("|").split("|")]
                data.append([Paragraph(inline(c), styles["BulletItem"]) for c in cells])
            if data:
                t = Table(data, hAlign="LEFT")
                t.setStyle(TABLE_STYLE)
                self.story.append(t)
                self.story.append(Spacer(1, 10))

        self.mode = None
        self.para_lines = []
        self.list_items = []
        self.quote_paras = []
        self.table_rows = []

    def add_heading(self, text: str, style: str):
        self.flush()
        self.story.append(Paragraph(inline(text), styles[style]))

    def add_hr(self):
        self.flush()
        self.story.append(Spacer(1, 4))
        self.story.append(HRFlowable(width="100%", color=colors.HexColor("#DDDDDD")))
        self.story.append(Spacer(1, 10))

    def add_code_block(self, lines):
        self.flush()
        self.story.append(Preformatted("\n".join(lines), styles["Mono"]))
        self.story.append(Spacer(1, 8))

    def table_line(self, line):
        if self.mode != "table":
            self.flush()
            self.mode = "table"
        self.table_rows.append(line)

    def bullet_start(self, content, numbered):
        mode = "numbered" if numbered else "bullets"
        if self.mode != mode:
            self.flush()
            self.mode = mode
        self.list_items.append([content])

    def quote_line(self, content):
        if self.mode != "quote":
            self.flush()
            self.mode = "quote"
            self.quote_paras = [[]]
        if content == "":
            if self.quote_paras[-1]:
                self.quote_paras.append([])
        else:
            self.quote_paras[-1].append(content)

    def plain_line(self, stripped, indented):
        if indented and self.mode in ("bullets", "numbered") and self.list_items:
            self.list_items[-1].append(stripped)
        elif indented and self.mode == "para" and self.para_lines:
            self.para_lines.append(stripped)
        elif indented and self.mode == "quote" and self.quote_paras:
            self.quote_paras[-1].append(stripped)
        else:
            if self.mode != "para":
                self.flush()
                self.mode = "para"
            self.para_lines.append(stripped)


def render_md(path: Path, out_path: Path):
    raw_lines = path.read_text(encoding="utf-8").splitlines()
    r = Renderer(path.stem)

    in_code, code_buf = False, []

    for raw in raw_lines:
        stripped = raw.strip()

        if stripped.startswith("```"):
            if in_code:
                r.add_code_block(code_buf)
                code_buf = []
            in_code = not in_code
            continue
        if in_code:
            code_buf.append(raw)
            continue

        if stripped.startswith("|"):
            r.table_line(stripped)
            continue

        if not stripped:
            r.flush()
            continue

        if stripped.startswith("# "):
            r.add_heading(stripped[2:], "H1")
        elif stripped.startswith("## "):
            r.add_heading(stripped[3:], "H2")
        elif stripped.startswith("### "):
            r.add_heading(stripped[4:], "H3")
        elif stripped == "---":
            r.add_hr()
        elif stripped.startswith(">"):
            content = stripped[1:].lstrip() if len(stripped) > 1 else ""
            r.quote_line(content)
        elif re.match(r"^-\s+", stripped):
            r.bullet_start(re.sub(r"^-\s+", "", stripped), numbered=False)
        elif re.match(r"^\d+\.\s+", stripped):
            r.bullet_start(re.sub(r"^\d+\.\s+", "", stripped), numbered=True)
        else:
            indented = raw != stripped and raw.startswith((" ", "\t"))
            r.plain_line(stripped, indented)

    r.flush()

    doc = SimpleDocTemplate(
        str(out_path), pagesize=LETTER,
        topMargin=0.85 * inch, bottomMargin=0.85 * inch,
        leftMargin=0.85 * inch, rightMargin=0.85 * inch,
        title=path.stem,
    )
    doc.build(r.story)


def render_csv(path: Path, out_path: Path):
    with path.open(encoding="utf-8") as f:
        rows = list(csv.reader(f))

    story = [Paragraph(path.stem, styles["H1"]), Spacer(1, 8)]
    header, body = rows[0], rows[1:]
    data = [[Paragraph(inline(h), styles["BulletItem"]) for h in header]]
    for row in body:
        data.append([Paragraph(inline(c), styles["BulletItem"]) for c in row])

    col_count = len(header)
    page_width = LETTER[0] - 1.2 * inch
    weights = [0.11, 0.24, 0.55, 0.1] if col_count == 4 else None
    col_widths = [page_width * w for w in weights] if weights else None

    t = Table(data, hAlign="LEFT", repeatRows=1, colWidths=col_widths)
    style = TableStyle(TABLE_STYLE.getCommands() + [
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#F8F6F0")]),
    ])
    t.setStyle(style)
    story.append(t)

    doc = SimpleDocTemplate(
        str(out_path), pagesize=LETTER,
        topMargin=0.7 * inch, bottomMargin=0.7 * inch,
        leftMargin=0.6 * inch, rightMargin=0.6 * inch,
        title=path.stem,
    )
    doc.build(story)


def main():
    OUT_DIR.mkdir(exist_ok=True)
    for path in sorted(SRC_DIR.glob("*.md")):
        out_path = OUT_DIR / (path.stem + ".pdf")
        render_md(path, out_path)
        print(f"wrote {out_path.relative_to(SRC_DIR.parent.parent)}")
    for path in sorted(SRC_DIR.glob("*.csv")):
        out_path = OUT_DIR / (path.stem + ".pdf")
        render_csv(path, out_path)
        print(f"wrote {out_path.relative_to(SRC_DIR.parent.parent)}")


if __name__ == "__main__":
    main()
