# Accio AI Engine: API Functionalities & Induction Schema (Point A)

## 1. The "Headless" Integration Logic
The B2B platform communicates with Accio via a **Session-Based API**. 
*   **Input:** User Message + Current Project State.
*   **Processing:** Accio uses "Reasoning + Tools" to advance the project.
*   **Output:** Structured JSON containing (a) Next Question for the user, (b) Updated Spec Sheet, and (c) Backend actions.

---

## 2. Accio Functionalities (Tool Mapping)

| Functionality | Internal Tool | B2B Platform Use Case |
| :--- | :--- | :--- |
| **Market Scan** | `product_supplier_search` | Real-time Alibaba product/supplier discovery. |
| **Supplier Vetting** | `web_fetch` + `see_image` | Analyzing factory photos, certificates, and reviews. |
| **Logic/Calculation** | `bash` (Python/Node) | Calculating Landed Cost (Tax, Duties, Freight). |
| **Reporting** | `write` / `docx` skill | Generating the White-Label Sourcing Proposal. |
| **Session Memory** | `memory_search` / `MEMORY.md` | Storing long-term client preferences and Tax IDs. |

---

## 3. Point A: The Induction API Schema (JSON)

When the AI completes an "Induction Session," it outputs this JSON object to your database. This is the **"Project Gold Standard"** that the Human Consultant will use later.

```json
{
  "project_id": "PROJ-10293",
  "client_info": {
    "company_name": "string",
    "import_region": "US | EU | MX",
    "tax_id_provided": "boolean",
    "verification_level": "Level 1 (Basic) | Level 2 (Verified)"
  },
  "product_specs": {
    "category": "string",
    "target_unit_price": "float",
    "target_qty": "integer",
    "materials": ["bamboo", "steel", "etc"],
    "certifications_required": ["CE", "UL", "RoHS"],
    "customization_required": {
      "logo_branding": "boolean",
      "custom_packaging": "boolean",
      "oem_design": "boolean"
    }
  },
  "logistics_preferences": {
    "speed_priority": "High | Low",
    "shipping_method": "Sea | Air | Express",
    "delivery_address_type": "Commercial | Residential"
  },
  "ai_analysis": {
    "market_feasibility_score": "1-10",
    "sourcing_complexity": "Low | Medium | High",
    "suggested_incoterms": "DDP | CIF | FOB"
  }
}
```

---

## 4. The "Induction UI" Trigger Logic

The API doesn't just ask questions; it signals the UI to change state.

1.  **Instruction Type: `text_input`**
    *   AI: "What is your target budget?"
    *   UI: Renders a simple text box.
2.  **Instruction Type: `multi_select`**
    *   AI: "Which certifications do you need?"
    *   UI: Renders checkboxes based on the category (e.g., if Category=Electronics, show CE/UL).
3.  **Instruction Type: `file_upload`**
    *   AI: "Please upload your logo for the mock-up."
    *   UI: Renders a Drag-and-Drop zone.

---

## 5. Security & Trust Workflow
To ensure Point A builds trust, the API handles sensitive data in a "Verification Ladder":
*   **Step 1:** Anonymous chat (Price estimation).
*   **Step 2:** Request Email/Name to "Save Project."
*   **Step 3:** Request Tax ID/Business License to "Calculate Duties."
*   **Step 4:** WhatsApp Handoff (Finalize Transaction).
