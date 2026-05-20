# B2B Managed Sourcing Platform: Master Blueprint

## 1. Executive Summary
A premium B2B "Managed Marketplace" that abstracts the complexity of Chinese sourcing (Alibaba) into a white-labeled service. The platform uses AI as a stateful orchestrator for induction, vetting, and landed cost calculation, with a strategic transition to human expertise via WhatsApp for closing and fulfillment.

---

## 2. System Architecture (The "Orchestrator" Model)

### A. The Three-Layer Stack
1.  **Frontend (Client Dashboard):** A project-based UI where buyers manage "Sourcing Projects" instead of shopping carts.
2.  **AI Orchestration Layer (Accio Engine):** A headless service that processes natural language, executes sourcing tools, and manages project state.
3.  **The Supply Layer:** Direct integration with Alibaba (via `product_supplier_search`) and Logistics APIs (Freightos/Flexport).

### B. Core Functionality Mapping
| Component | AI Action | Outcome |
| :--- | :--- | :--- |
| **Induction** | Probing questions on specs/compliance. | Technical Product Requirement (TPR) JSON. |
| **Sourcing** | Automated search + Filter for "Verified/Gold". | Curated shortlist (3-5 options). |
| **White-Labeling** | Masking supplier IDs + Title rewriting. | Protection against "Platform Skipping." |
| **Landed Cost** | Calculating Duties + Freight + Markup. | Price "Delivered-to-Door" (The Moat). |

---

## 3. Point A: The Induction Schema
The AI collects this structured data during the "Concierge" chat to hand off a high-quality lead. This schema is designed to be **Stateful**—allowing the user to pause and resume.

```json
{
  "project_id": "PROJ-10293",
  "status": "Induction_Complete",
  "client_info": {
    "company_name": "string",
    "contact_person": "string",
    "import_region": "US | EU | MX",
    "tax_id": "string (Encrypted)",
    "verification_status": "Verified | Unverified",
    "business_type": "Retailer | Wholesaler | Amazon_Seller"
  },
  "product_specs": {
    "category": "string",
    "sub_category": "string",
    "hs_code_estimated": "string (e.g., 9403.30)",
    "target_unit_price": "float",
    "target_qty": "integer",
    "annual_volume_estimate": "integer",
    "materials": ["string"],
    "dimensions": { "length": "float", "width": "float", "height": "float", "unit": "cm/in" },
    "weight_per_unit": { "value": "float", "unit": "kg/lb" },
    "certifications_required": ["CE", "UL", "RoHS", "FDA"],
    "packaging_requirements": {
      "retail_ready": "boolean",
      "bulk_packed": "boolean",
      "custom_branding": "boolean"
    }
  },
  "quality_standards": {
    "aql_level": "Level I | II | III",
    "inspection_required": "Pre-shipment | During Production",
    "sample_required": "boolean"
  },
  "ai_analysis": {
    "market_feasibility_score": "1-10",
    "price_gap_analysis": "Target vs Market Average",
    "suggested_incoterms": "DDP | CIF | FOB",
    "estimated_lead_time": "integer (days)"
  }
}
```

---

## 4. Point B: White-Label Product Schema
This defines how the AI transforms raw Alibaba data into your platform’s proprietary listings. It adds a "Service Layer" to the raw product.

```json
{
  "platform_sku": "SKU-ABC-123",
  "internal_mapping": {
    "original_source": "Alibaba",
    "original_url": "https://www.alibaba.com/...", // HIDDEN
    "original_supplier": "Shenzhen Factory Ltd.", // HIDDEN
    "internal_supplier_id": "SUPP-CN-SZ-99", // SHOWN
    "factory_location": "Shenzhen, Guangdong"
  },
  "display_info": {
    "title": "Industrial Grade Professional [Category] - Elite Series",
    "short_description": "Curated by [Your Platform] for high-durability B2B applications.",
    "specs_table": { "Material": "316 Steel", "Capacity": "500L/h", "Power": "220V/50Hz" },
    "images": [
      { "url": "cdn.yourplatform.com/p1.jpg", "type": "Main" },
      { "url": "cdn.yourplatform.com/p2.jpg", "type": "Spec_Sheet" }
    ]
  },
  "supplier_performance_metrics": {
    "vetting_score": 4.9,
    "years_in_business": 8,
    "response_rate": "98%",
    "on_time_delivery_rate": "95%",
    "onsite_audit_status": "Passed_Third_Party_Audit"
  },
  "pricing_calculator": {
    "factory_base_price": 125.00,
    "platform_markup_percentage": "10%",
    "landed_cost_estimation": {
      "sea_freight_est": 15.50,
      "duty_est_percentage": "8%",
      "customs_clearance_fee": 120.00,
      "total_delivered_unit_price": 160.75
    },
    "moq": 50,
    "sample_price": 250.00
  },
  "logistics_metadata": {
    "cbm_per_carton": 0.45,
    "units_per_carton": 10,
    "gross_weight_kg": 15.0
  }
}
```

---

## 5. Point C: The WhatsApp Handoff Brief
This is the **"Intelligence Packet"** sent to the Human Consultant. It minimizes onboarding time and maximizes closing probability.

### Consultant Brief (Markdown Structure)

**1. Client Persona & Intent**
*   **Company:** [Company Name] (Based in [Region])
*   **Decision Maker:** [Contact Name]
*   **Urgency:** [High | Medium | Low] (Based on AI sentiment analysis of chat)
*   **Budget Alignment:** [Matched | Tight | High-Budget]

**2. The Sourcing Solution**
*   **Shortlisted Supplier:** [Internal_Supplier_ID]
*   **Top 3 Vetted Options:** [Link to Admin Dashboard View]
*   **Key Advantage:** "This supplier is the only one in our network currently holding the [Specific_Cert] needed for [Region]."

**3. Negotiation & Closing Strategy**
*   **Identified Objection:** "Client is hesitant about the 15-day lead time."
*   **Consultant Action:** "Offer to check if the factory can rush the first 100 units via Air Freight."
*   **Upsell Opportunity:** "Suggest our 'On-site QA Video' service for \$150 to ease quality concerns."

**4. The Handoff Handshake**
*   **Deep Link to CRM:** `https://your-admin-crm.com/projects/PROJ-10293`
*   **WhatsApp Trigger:**
    > *"Hi Marco, I have the full brief for [Company Name]. They are ready to move on the [Product] but need a final confirmation on the Mexican customs duties. Check section 4.2 of the brief."*

---

## 6. The "Landed Cost" Moat (The Lock-up)
The primary reason clients stay on the platform is the **Total Landed Cost** calculation, which is invisible on Alibaba.

$$Total\ Landed\ Cost = (Unit\ Price \times Qty) + Freight + Duties + VAT + \text{Handling Fee}$$

**The Logic:**
1.  **Phase 1 (Anonymous):** Show estimated price ranges.
2.  **Phase 2 (Trust):** Request Tax ID to calculate "Exact Duties."
3.  **Phase 3 (Lock):** User sees a door-to-door price they cannot calculate themselves.

---

## 7. UI/UX Strategy
*   **The Induction UI:** Split-screen (Chat on Left / Dynamic Spec Sheet on Right).
*   **The Image Shield:** AI automatically removes or flags supplier contact information (QR codes, numbers) from factory photos.
*   **Milestone Stepper:** Clear horizontal progress: `Research` $\rightarrow$ `Vetting` $\rightarrow$ `Quotation` $\rightarrow$ `Expert Review (WhatsApp)` $\rightarrow$ `Fulfillment`.

---

## 8. Security & Trust Framework
*   **Verification Ladder:** Trust is built by the AI acting as a rigorous compliance officer (asking for business licenses to "ensure legal import").
*   **Abstracted Trust:** The platform brands the suppliers as "Our Network," ensuring the relationship is with the platform, not the factory.
*   **Data Vault:** Sensitive import documents (POA, Customs Bonds) are handled via secure uploads, never via plain text.
