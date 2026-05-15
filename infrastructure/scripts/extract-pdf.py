import pdfplumber
import sys

sys.stdout.reconfigure(encoding='utf-8')

with pdfplumber.open('product catalog.pdf') as pdf:
    for i, page in enumerate(pdf.pages):
        text = page.extract_text()
        if text:
            print(f'--- PAGE {i+1} ---')
            print(text)
            print()
