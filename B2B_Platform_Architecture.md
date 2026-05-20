# B2B Managed Sourcing Platform: Technical & Operational Architecture

## 1. Executive Summary
A service-oriented B2B platform that abstracts the complexity of Chinese sourcing (Alibaba) into a premium, white-labeled experience. The platform uses AI as the primary "Concierge" to handle induction, vetting, and landed cost calculation, transitioning to a human "Import Consultant" for finalization and fulfillment.

---

## 2. Core Value Propositions
*   **Abstracted Trust:** Clients buy from *us*, not unknown factories. Suppliers are masked with internal IDs.
*   **Landed Cost Transparency:** We move from "Unit Price" (Alibaba) to "Total Landed Cost" (Door-to-Door).
*   **Managed Risk:** We handle the "Black Box" of customs, duties, and quality control.

---

## 3. System Architecture (The "Orchestrator" Model)

### A. The Three-Layer Stack
1.  **Frontend (Client Dashboard):** A project-based UI where buyers manage their sourcing "intentions."
2.  **AI Orchestration Layer (Accio/Engine):** The brain that processes natural language, calls Alibaba APIs, calculates logistics, and manages state.
3.  **The Supply Layer:** Integration with Alibaba (via `product_supplier_search` or API) and Logistics providers (Freight Forwarders).

### B. Data Abstracting (The "White-Label" Layer)
To prevent "Platform Skipping," the system must perform a data transformation:
*   **Supplier Name** $\rightarrow$ **Internal ID** (e.g., `Supplier CN-GZ-204`).
*   **Original Price** $\rightarrow$ **Marked-up Price** (including platform fees).
*   **Factory Details** $\rightarrow$ **Vetting Scorecard** (Audit history, Certifications, Capacity).

---

## 4. The Double-Sided Workflow

### Phase 1: AI-Led Induction
*   **Objective:** Turn a vague "idea" into a Technical Product Requirement (TPR).
*   **UX:** Professional chat interface + Dynamic "Spec Canvas."
*   **Data Collection:** Framing Tax IDs and Shipping addresses as "Compliance Requirements" to build trust through professional rigor.

### Phase 2: Automated Sourcing & Vetting
*   **Search:** AI queries Alibaba for the TPR specs.
*   **Vetting Logic:** 
    *   Verified/Gold Suppliers only.
    *   3+ years in business.
    *   Specific certification matches (CE, UL, FDA).
*   **Output:** A "Preliminary Sourcing Proposal" showing 3 vetted options with internal IDs.

### Phase 3: The Landed Cost Moat
The AI calculates the **Total Landed Cost** using the formula:
$$Total\ Landed\ Cost = (Unit\ Price \times Qty) + Freight + Duties + VAT + Handling\ Fee$$
*This is the "Lock-up" point: the client cannot easily replicate this calculation elsewhere.*

---

## 5. The AI-to-Human Bridge (WhatsApp Handoff)

### The Trigger Point
The transition occurs when the client moves from **"Researching"** to **"Ordering."**
*   **Trigger:** Client clicks "Request Final Quotation & Logistics Plan."
*   **The Action:** 
    1. AI generates a **Project Brief** (PDF/JSON).
    2. Brief is sent to the Consultant's CRM.
    3. UI displays: **[Connect with Senior Consultant on WhatsApp]**.

### Why WhatsApp?
*   **B2B Context:** High-value sourcing requires "relationship" trust.
*   **Efficiency:** Asynchronous communication for time-zone differences (China vs. West).
*   **Audit Trail:** Easy to track negotiations and photo/video proof of production.

---

## 6. UI/UX Strategy
*   **Project-Based Navigation:** Users manage "Projects" (Inventory restocks), not "Shopping Carts."
*   **Split-Screen Induction:** Left (Chat) / Right (Real-time PRD builder).
*   **Milestone Stepper:** Horizontal timeline showing: `Induction` → `Sourcing` → `Handoff` → `Production` → `Shipping` → `Customs` → `Delivered`.

---

## 7. Security & Compliance Framework
*   **Data Privacy:** Tax IDs and Business licenses stored in encrypted vaults.
*   **Financial Trust:** Use of Escrow-style payment logic (Funds released to supplier only after QA approval).
*   **Compliance Shield:** AI explains duty codes (HTS/TARIC) to the user, positioning the platform as a legal safeguard.

---

## 8. Development Roadmap (Pilot Phase)
1.  **MVP Induction:** Build the AI prompt logic for one specific category (e.g., Furniture).
2.  **Sourcing Engine:** Integrate the Alibaba search and white-labeling parser.
3.  **Landed Cost Calculator:** Build the logic for US/EU duty rates and sea-freight estimations.
4.  **The Handoff:** Automated briefing system for the WhatsApp consultant.
