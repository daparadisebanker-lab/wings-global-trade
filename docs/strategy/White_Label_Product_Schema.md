# Point B: White-Label Product Schema & Transformation Logic

## 1. The Transformation Objective
The platform must ingest raw data from Alibaba and "whitewash" it to prevent clients from bypassing the platform. This involves stripping supplier identities, calculating price markups, and re-branding factory specifications.

---

## 2. The Data Transformation Flow
1.  **Ingestion:** AI scrapes/fetches data from Alibaba (Title, Price, Supplier, Images, Specs).
2.  **Filtering:** AI evaluates the supplier based on "Verified/Gold" status and longevity.
3.  **Abstraction:** Factory names are replaced with a persistent **Internal Supplier ID**.
4.  **Enrichment:** AI calculates the "Landed Cost" estimation and applies your platform's margin.
5.  **Storage:** The cleaned data is saved to the platform's database.

---

## 3. White-Label Database Schema (JSON)

This schema represents a single product listing as shown to the client on your platform.

```json
{
  "platform_product_id": "SKU-ABC-123",
  "internal_mapping": {
    "original_source": "Alibaba",
    "original_url": "https://www.alibaba.com/product-detail/...", // HIDDEN FROM CLIENT
    "original_supplier_name": "Shenzhen Super Electronics Ltd.", // HIDDEN FROM CLIENT
    "internal_supplier_id": "SUPP-CN-SZ-99" // SHOWN TO CLIENT
  },
  "display_info": {
    "title": "Premium Industrial UV Water Purifier (Tier 1 Certified)", // Optimized Title
    "category": "Industrial Equipment",
    "images": [
      "https://your-platform-cdn.com/img1.jpg", // Proxied or watermarked
      "https://your-platform-cdn.com/img2.jpg"
    ],
    "specifications": [
      { "label": "Flow Rate", "value": "500L/h" },
      { "label": "Certifications", "value": "CE, RoHS, ISO9001" },
      { "label": "Material", "value": "316 Stainless Steel" }
    ]
  },
  "vetting_scorecard": {
    "overall_rating": 4.9,
    "factory_verified": true,
    "on_site_audit_passed": true,
    "production_capacity": "10,000 units/mo",
    "lead_time_days": 15
  },
  "pricing_engine": {
    "currency": "USD",
    "moq": 50,
    "tier_pricing": [
      { "min_qty": 50, "unit_price": 125.00 },
      { "min_qty": 200, "unit_price": 110.00 },
      { "min_qty": 1000, "unit_price": 95.00 }
    ],
    "landed_cost_estimate": {
      "estimated_freight": 15.50,
      "estimated_duties": 8.25,
      "platform_service_fee": 12.00,
      "total_delivered_unit_price": 160.75
    }
  }
}
```

---

## 4. The "Moat" Mechanics (Logic Rules)

### A. Title & Description "Spinning"
*   **Rule:** The AI must rewrite Alibaba titles (which are often keyword-stuffed for SEO) into professional B2B terminology.
*   **Original:** *"Hot Selling 2024 New Design Cheap Factory Price UV Water Purifier"*
*   **White-Label:** *"Industrial Grade UV Sterilization System - 2024 Series"*

### B. Image Scrubbing
*   **Rule:** Any images containing supplier logos, contact info (WhatsApp numbers), or factory signage must be flagged by the `see_image` tool.
*   **Action:** AI recommends using neutral product photos or requests the "Import Consultant" to obtain clean assets during the WhatsApp phase.

### C. The Price "Shield"
*   **Rule:** We never show the "Factory Price" alone. We always lead with the **Project Quote**.
*   **Logic:** Unit Price is always presented as part of a "Service Bundle" that includes quality inspection and customs brokerage.

---

## 5. Admin View vs. Client View

| Field | Client (Buyer) | Admin (You) |
| :--- | :--- | :--- |
| **Supplier** | `SUPP-CN-SZ-99` | `Shenzhen Super Electronics Ltd.` |
| **Price** | \$160.75 (Landed) | \$125.00 (Ex-Works) |
| **Logistics** | "Managed Freight Included" | "Freightos Quote ID: 99821" |
| **Documents** | Redacted Certifications | Full Original Certificates |

---

## 6. Implementation Notes for Developers
*   **Database Type:** Document-oriented (MongoDB or PostgreSQL JSONB) is recommended due to the varying specifications across categories.
*   **CDN Proxy:** Use a proxy server to serve images so the client cannot inspect the image source URL to find the original Alibaba CDN links.
