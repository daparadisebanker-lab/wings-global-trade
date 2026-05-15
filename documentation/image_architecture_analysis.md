# Branded Photography & Image Architecture Analysis

Based on the codebase analysis of Euro Global Machinery, here is the comprehensive breakdown of all image and icon placepoints required to replace the current Unsplash placeholders and elevate the site to a premium B2B marketplace.

## 1. Global & Structural Backgrounds (Heroes & Sections)
These are large-scale images that set the mood and establish the premium, trustworthy nature of the platform.

| Section / Component | Current State | Visual Description & Communication Goal | Dimensions / Ratio | Format |
| :--- | :--- | :--- | :--- | :--- |
| **Home Page Hero**<br/>`page.tsx` | `/images/hero.jpg` | **The First Impression**: A high-end, expansive shot of European agriculture or industrial machinery in action. Should feel monumental, reliable, and active. Must have enough negative space (or handle a dark/cream overlay well) for the main H1 text. | **1920x1080px**<br/>(16:9 to Cover) | WebP |
| **Featured Carousel BG**<br/>`page.tsx` | Unsplash (Plowing) | **Inventory Showcase**: A darker, moodier, or more abstract background that contrasts with the bright hero. Perhaps a close-up of machinery texture (tires, metal, grill) or a clean dealership yard at dusk. Needs to make the foreground listing cards pop. | **1920x1080px**<br/>(16:9 to Cover) | WebP |
| **Call to Action (CTA) BG**<br/>`page.tsx` | Unsplash (Fields) | **Lower Funnel Inspiration**: This sits behind the "Sell Your Machinery" CTA. Should depict a successful business interaction—e.g., a handshake with machinery in the blurred background, or a modern farm/depot bathed in golden hour light. | **1920x800px**<br/>(~21:9 Pan) | WebP |

> [!TIP]
> For all global backgrounds, ensure the focus point of the image is adaptable across mobile breakpoints (e.g., center-weighted action) so it crops elegantly on smaller screens.

---

## 2. Taxonomy: Categories & Sub-Types
The platform has evolved to a 5-category taxonomy with 28+ sub-types. The visual language here needs a dual-approach: **Icons** for functional navigation (like the Airbnb horizontal switcher) and **Photos** for visually rich grid cards.

### 2A. Sub-Type Navigation Icons
Currently, Agricultural sub-types have SVG icons, but others (Trucks, Buses, Industrial, Spare Parts) rely entirely on photos.

- **Placement**: Home Page Search Dropdown, `CategoryHubPage` header navigation, Horizontal Switchers.
- **Requirement**: **28 custom SVGs**. 
- **Visual Description**: Consistent, 1.5 stroke-width, technical blueprint/line-art aesthetic. No fills. Needs to immediately communicate the vehicle/part type (e.g., a distinct silhouette for a Dump Truck vs. a Cargo Truck).
- **Format**: SVG (ViewBox 64x64px), Single color (Current color `brown-900` / `#currentColor`).

### 2B. Sub-Type Grid Cards
Used on the Home Page ("Browse by Type") and `CategoryHubPage`.

- **Placement**: `CategoryHubPage.tsx` and Home Page grids.
- **Current State**: 28 distinct `unsplashId` placeholders.
- **Requirement**: **28 Branded Photos**.
- **Visual Description**: These need to feel like a cohesive set. Instead of random stock photos, they should ideally share lighting, color grading, or composition.
  - *Agricultural (8)*: Tractors, Harvesters, Balers, Plows, etc.
  - *Trucks (5)*: Tractor Trucks, Dump Trucks, etc.
  - *Buses (4)*: City Buses, Coaches, etc.
  - *Industrial (7)*: Forklifts, Excavators, Cranes, etc.
  - *Spare Parts (4)*: Engines, Transmissions, Axles, etc. (Studio shots with clean white/grey backgrounds work best here).
- **Dimensions / Ratio**: **600x400px** (3:2 Aspect Ratio).
- **Format**: WebP, optimized for grid loading.

> [!IMPORTANT]
> The `CategoryHubPage.tsx` uses a grayscale overlay for "Coming Soon" sub-types. Ensure the original photos have enough contrast to still be readable when converted to grayscale by CSS.

---

## 3. Trust Signals & People
B2B marketplaces require high trust. Human faces and authentic environments bridge the digital gap.

| Section / Component | Current State | Visual Description & Communication Goal | Dimensions / Ratio | Format |
| :--- | :--- | :--- | :--- | :--- |
| **Testimonials (Home Page)**<br/>`page.tsx` | 2x Unsplash Portraits | **Social Proof**: Professional yet authentic portraits of buyers/sellers. Ideally, the subject is in focus with their purchased machinery (e.g., a Fendt tractor or a John Deere) slightly out of focus in the background. | **500x500px**<br/>(1:1 Square) | WebP |
| **About Us / Team**<br/>*(Future/Potential)* | None currently | **Corporate Authority**: If an About page is added, high-quality team photos or office/inspection depot photos will be needed to legitimize the pan-European operation. | Various | WebP |

---

## 4. Product Listing & Utility Images

| Section / Component | Current State | Visual Description & Communication Goal | Dimensions / Ratio | Format |
| :--- | :--- | :--- | :--- | :--- |
| **Missing Image Fallback**<br/>`TractorCard.tsx` / `[id]/page.tsx` | `listing.thumbnail` or blank | **Graceful Degradation**: When a dealer uploads a listing without photos, we need a branded fallback. A sleek wireframe of a tractor/truck or a clean layout with the Euro Global Machinery logo on a soft cream (`cream-50`) background. | **800x600px**<br/>(4:3 Aspect Ratio) | WebP or SVG |
| **Dealer Avatar Fallback**<br/>`DealerProfile` (Implied) | None currently | **Dealer Identity**: A standard placeholder for dealer logos. A simple building icon or abstract geometric shape representing a dealership. | **200x200px**<br/>(1:1 Aspect Ratio) | SVG |

## Implementation Roadmap for Assets

1. **Phase 1: Global Backgrounds** - Replace the 3 major backgrounds on the homepage immediately to establish the brand tone.
2. **Phase 2: Iconography System** - Design the remaining ~20 SVG icons for Trucks, Buses, Industrial, and Spare Parts to unify the navigation experience.
3. **Phase 3: Sub-Type Grid Photos** - Curate or shoot 28 cohesive images for the category cards. Standardize color grading across all 28.
4. **Phase 4: Trust & Utility** - Finalize testimonial portraits and create the standard Missing Image fallback.
