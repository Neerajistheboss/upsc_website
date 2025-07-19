# PDF Files Directory

This directory contains the static PDF files for UPSC question papers and answer keys.

## Directory Structure

```
public/pdfs/
├── question-papers/     # Question paper PDFs
├── answer-keys/        # Answer key PDFs
└── README.md          # This file
```

## How to Add Your PDF Files

### 1. Question Papers
Place your question paper PDFs in the `question-papers/` directory with the following naming convention:

- `upsc-cse-pre-2024-gs.pdf`
- `upsc-cse-pre-2024-csat.pdf`
- `upsc-cse-pre-2023-gs.pdf`
- `upsc-cse-pre-2022-gs.pdf`
- `upsc-cse-pre-2021-gs.pdf`
- `upsc-cse-pre-2020-gs.pdf`
- `upsc-cse-pre-2019-gs.pdf`
- `upsc-cse-pre-2018-gs.pdf`
- `upsc-cse-pre-2017-gs.pdf`

### 2. Answer Keys
Place your answer key PDFs in the `answer-keys/` directory with the following naming convention:

- `upsc-cse-pre-2024-gs-ak.pdf`
- `upsc-cse-pre-2024-csat-ak.pdf`
- `upsc-cse-pre-2023-gs-ak.pdf`
- `upsc-cse-pre-2022-gs-ak.pdf`
- `upsc-cse-pre-2021-gs-ak.pdf`
- `upsc-cse-pre-2020-gs-ak.pdf`
- `upsc-cse-pre-2019-gs-ak.pdf`
- `upsc-cse-pre-2018-gs-ak.pdf`
- `upsc-cse-pre-2017-gs-ak.pdf`

## File Naming Convention

- Use lowercase letters
- Use hyphens (-) instead of spaces
- Include the year (2024, 2023, etc.)
- Include the paper type (gs, csat)
- Add `-ak` suffix for answer keys
- Use `.pdf` extension

## Accessing Files

Once you place the PDF files in these directories, they will be automatically accessible at:

- Question Papers: `http://localhost:5173/pdfs/question-papers/filename.pdf`
- Answer Keys: `http://localhost:5173/pdfs/answer-keys/filename.pdf`

## Example

If you have a PDF file named `UPSC CSE PRE 2024 GS.pdf`, rename it to `upsc-cse-pre-2024-gs.pdf` and place it in the `question-papers/` directory.

The file will then be accessible at: `/pdfs/question-papers/upsc-cse-pre-2024-gs.pdf` 