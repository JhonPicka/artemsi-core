#!/usr/bin/env python3
"""Generate ARTEMSI growth plan PDF from markdown."""

from __future__ import annotations

import re
from pathlib import Path

from fpdf import FPDF

ROOT = Path(__file__).parent
MD_PATH = ROOT / "plan-croissance-artemsi-2026.md"
PDF_PATH = ROOT / "plan-croissance-artemsi-2026.pdf"


class PlanPDF(FPDF):
    def content_width(self) -> float:
        return self.w - self.l_margin - self.r_margin

    def write_wrapped(self, text: str, h: float = 6, font_style: str = "") -> None:
        if self.get_y() > self.h - 20:
            self.add_page()
        self.set_x(self.l_margin)
        self.set_font("Helvetica", font_style, 10)
        self.multi_cell(self.content_width(), h, text)

    def header(self):
        if self.page_no() > 1:
            self.set_font("Helvetica", "I", 8)
            self.set_text_color(100, 116, 139)
            self.cell(0, 8, "ARTEMSI - Plan de croissance 2026", align="R")
            self.ln(10)

    def footer(self):
        self.set_y(-12)
        self.set_font("Helvetica", "I", 8)
        self.set_text_color(100, 116, 139)
        self.cell(0, 8, f"Page {self.page_no()}", align="C")


def clean_inline(text: str) -> str:
    replacements = {
        "**": "",
        "`": "",
        "→": "->",
        "—": "-",
        "–": "-",
        "«": '"',
        "»": '"',
        "…": "...",
        "€": " EUR",
        "×": "x",
        "’": "'",
        "‘": "'",
        "“": '"',
        "”": '"',
    }
    for src, dst in replacements.items():
        text = text.replace(src, dst)
    return text.encode("latin-1", "replace").decode("latin-1")


def parse_table(lines: list[str], start: int) -> tuple[list[list[str]], int]:
    rows: list[list[str]] = []
    i = start
    while i < len(lines):
        line = lines[i].strip()
        if not line.startswith("|"):
            break
        if re.match(r"^\|[-| :]+\|$", line):
            i += 1
            continue
        cells = [clean_inline(c.strip()) for c in line.strip("|").split("|")]
        rows.append(cells)
        i += 1
    return rows, i


def render_table(pdf: PlanPDF, rows: list[list[str]]) -> None:
    if not rows:
        return
    col_count = max(len(r) for r in rows)
    page_width = pdf.w - pdf.l_margin - pdf.r_margin
    col_width = page_width / col_count

    pdf.set_font("Helvetica", "B", 8)
    pdf.set_fill_color(239, 246, 255)
    header = rows[0]
    for cell in header:
        pdf.cell(col_width, 7, cell[:40], border=1, fill=True)
    pdf.ln()

    pdf.set_font("Helvetica", "", 8)
    for row in rows[1:]:
        if pdf.get_y() > pdf.h - 20:
            pdf.add_page()
        for idx in range(col_count):
            value = row[idx] if idx < len(row) else ""
            pdf.cell(col_width, 6, value[:50], border=1)
        pdf.ln()
    pdf.ln(3)


def render_blockquote(pdf: PlanPDF, text: str) -> None:
    pdf.set_font("Helvetica", "I", 10)
    pdf.set_text_color(51, 65, 85)
    pdf.set_fill_color(241, 245, 249)
    pdf.set_x(pdf.l_margin)
    pdf.multi_cell(pdf.content_width(), 6, text, fill=True)
    pdf.set_text_color(0, 0, 0)
    pdf.ln(2)


def render_list_item(pdf: PlanPDF, text: str, ordered: bool, number: int) -> None:
    prefix = f"{number}. " if ordered else "- "
    pdf.set_font("Helvetica", "", 10)
    pdf.set_x(pdf.l_margin)
    pdf.multi_cell(pdf.content_width(), 6, f"  {prefix}{text}")
    pdf.ln(1)


def build_pdf() -> None:
    lines = MD_PATH.read_text(encoding="utf-8").splitlines()
    pdf = PlanPDF()
    pdf.set_auto_page_break(auto=True, margin=15)
    pdf.add_page()

    i = 0
    ordered_counter = 0
    in_code = False

    while i < len(lines):
        raw = lines[i]
        line = raw.rstrip()
        stripped = line.strip()

        if stripped.startswith("```"):
            in_code = not in_code
            i += 1
            continue

        if in_code:
            if stripped:
                if pdf.get_y() > pdf.h - 20:
                    pdf.add_page()
                pdf.set_x(pdf.l_margin)
                pdf.set_font("Courier", "", 8)
                pdf.set_fill_color(241, 245, 249)
                text = clean_inline(stripped)
                pdf.multi_cell(pdf.content_width(), 5, text, fill=True)
            i += 1
            continue

        if not stripped:
            pdf.ln(2)
            i += 1
            ordered_counter = 0
            continue

        if stripped == "---":
            pdf.ln(2)
            pdf.set_draw_color(226, 232, 240)
            y = pdf.get_y()
            pdf.line(pdf.l_margin, y, pdf.w - pdf.r_margin, y)
            pdf.ln(4)
            i += 1
            continue

        if stripped.startswith("# "):
            pdf.ln(4)
            pdf.set_font("Helvetica", "B", 20)
            pdf.set_text_color(15, 23, 42)
            pdf.set_x(pdf.l_margin)
            pdf.multi_cell(pdf.content_width(), 10, clean_inline(stripped[2:]))
            pdf.set_text_color(0, 0, 0)
            pdf.ln(2)
            i += 1
            continue

        if stripped.startswith("## "):
            if pdf.get_y() > 250:
                pdf.add_page()
            pdf.ln(4)
            pdf.set_font("Helvetica", "B", 14)
            pdf.set_text_color(30, 64, 175)
            pdf.set_x(pdf.l_margin)
            pdf.multi_cell(pdf.content_width(), 8, clean_inline(stripped[3:]))
            pdf.set_text_color(0, 0, 0)
            pdf.ln(2)
            i += 1
            continue

        if stripped.startswith("### "):
            pdf.ln(2)
            pdf.set_font("Helvetica", "B", 11)
            pdf.set_text_color(51, 65, 85)
            pdf.set_x(pdf.l_margin)
            pdf.multi_cell(pdf.content_width(), 7, clean_inline(stripped[4:]))
            pdf.set_text_color(0, 0, 0)
            pdf.ln(1)
            i += 1
            continue

        if stripped.startswith("|"):
            rows, next_i = parse_table(lines, i)
            render_table(pdf, rows)
            i = next_i
            continue

        if stripped.startswith("> "):
            render_blockquote(pdf, clean_inline(stripped[2:]))
            i += 1
            continue

        if stripped.startswith("- [ ] ") or stripped.startswith("- [x] "):
            checked = "[x]" in stripped[:6]
            box = "[x]" if checked else "[ ]"
            render_list_item(pdf, f"{box} {clean_inline(stripped[6:])}", ordered=False, number=0)
            i += 1
            continue

        if stripped.startswith("- "):
            render_list_item(pdf, clean_inline(stripped[2:]), ordered=False, number=0)
            i += 1
            continue

        if re.match(r"^\d+\.\s", stripped):
            ordered_counter += 1
            render_list_item(pdf, clean_inline(re.sub(r"^\d+\.\s", "", stripped)), ordered=True, number=ordered_counter)
            i += 1
            continue

        pdf.write_wrapped(clean_inline(stripped))
        pdf.ln(1)
        i += 1

    pdf.output(str(PDF_PATH))
    print(f"PDF generated: {PDF_PATH} ({PDF_PATH.stat().st_size} bytes)")


if __name__ == "__main__":
    build_pdf()
