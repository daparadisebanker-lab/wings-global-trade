# Euro Global Machinery Portal

Professional marketplace for agricultural and industrial machinery.

## Project Structure

The project is organized into logical buckets for clean architecture and team collaboration:

### 📂 `src/`
The core application source code (Next.js 14+).
- `/app`: Hierarchical routing organized by machinery category (`agricultural`, `trucks`, `buses`, `industrial`).
- `/components`: Reusable UI components.
- `/lib`: Shared utilities and configurations (including `categories.ts`).
- `/types`: TypeScript definitions.

### 📂 `data/`
Static data assets and catalogs.
- `product-catalog.json`: The master machinery database.
- `listings.ts`: Server-side data fetching logic.

### 📂 `infrastructure/`
Tools and configuration for external services.
- `/supabase`: SQL schemas, seeds, and storage setup.
- `/scripts`: Python and TS utilities for data processing and catalog management.

### 📂 `documentation/`
Architectural analysis, design guides, and project notes.

### 📂 `legacy/`
Archived setup files and previous versions of the codebase.

### 📂 `public/`
Static assets served by the application.
- `/icons`: Technical SVG line-art icons.
- `/images`: High-quality product photography.

## Getting Started

1.  Install dependencies: `npm install`
2.  Run dev server: `npm run dev`
3.  Build for production: `npm run build`

## Catalog Management

To update the machinery catalog:
1.  Edit `data/product-catalog.json`.
2.  Run `python infrastructure/scripts/fix-catalog.py` to normalize data.
3.  Run `python infrastructure/scripts/generate-sql-seed.py` to generate the Supabase seed.
4.  Apply the seed in the Supabase SQL editor using `infrastructure/supabase/seed-catalog.sql`.
