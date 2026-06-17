# Visual Audit & Responsiveness (VAR) Report

**Project Code:** POC-66  
**Project Title:** ESG Controversy Signal Map  
**Target Rail:** Governance & Trust  
**Evaluation Standard:** Real Rails Visual Manifest V2  

---

## 1. Visual Identity & Palette Compliance

The platform strictly incorporates the designated dark cybernetic palette to present high-density, Bloomberg-style compliance signals.

| Element | Hex Color | Role / Use Case | Compliance |
| :--- | :--- | :--- | :--- |
| **Background** | `#030712` | Deep-space primary backdrop for absolute contrast. | PASS |
| **Card Fill** | `#0B1117` | Secondary panel backgrounds for elevation. | PASS |
| **Borders** | `#1F2937` | Low-noise dividers and map boundaries. | PASS |
| **Primary Accent** | `#38BDF8` | Interactive highlights, news, and map focus rings. | PASS |
| **Secondary Accent** | `#818CF8` | SEC filing links, authority icons, trend indicators. | PASS |
| **Text Primary** | `#F3F4F6` | High-readability content lines. | PASS |

- **Typography:** Inter Google Font imported globally, configured with weights ranging from 300 (Light) to 800 (Extra Bold) for strong contrast hierarchy.
- **Glassmorphism:** Embedded backdrop blurs (`backdrop-filter: blur(12px)`) on panels to establish layering over the Leaflet dark maps.
- **Glow Effects:** Subtle shadow glow animations (`box-shadow: 0 0 15px rgba(56, 189, 248, 0.15)`) applied to hover states and primary widgets.

---

## 2. Readability & Information Hierarchy

- **Color Contrast:** White and light-gray text lines on card bases (`#0B1117`) provide a minimum of 7:1 contrast ratio, fully meeting AAA readability standards.
- **Dossier Density:** Features three distinct hierarchical layers:
  1. *Global Aggregation:* Top overview cards detailing overall count and risk percentages.
  2. *Geospatial Context:* Interactive Leaflet coordinates showing risk distribution.
  3. *Granular Detail:* Selected company cards showing GDELT headlines and SEC disclosures.

---

## 3. Dashboard Storytelling

The platform layout is organized in a logical left-to-right (70% - 30%) hierarchy designed to answer the six core questions of the rail:
- **What/Where:** The Interactive Signal Map maps controversy incidents instantly.
- **Who/Why:** The Company Card and Stakeholder Authority list identify controlling organizations.
- **Decisions:** The interactive Filter Panel and Export button translate visual charts into downloadable data assets.

---

## 4. Responsiveness Matrix

| Device Breakpoint | Screen Width | Layout Adaptation | Status |
| :--- | :--- | :--- | :--- |
| **Desktop / Wide** | $\ge 1280\text{px}$ | 70% width Left (Map + Charts Row), 30% Right (Dossier + Stats). | PASS |
| **Laptop** | $1024\text{px} - 1279\text{px}$ | Standard 70/30 flex wrap, map height optimized to 550px. | PASS |
| **Tablet** | $768\text{px} - 1023\text{px}$ | Stacked vertically: Filters $\rightarrow$ Map $\rightarrow$ Charts Row $\rightarrow$ Dossier Card $\rightarrow$ Sidebar. | PASS |
| **Mobile** | $< 768\text{px}$ | Stacked layout. Map collapses gracefully to 400px height. Chart row collapses into a single-column scroll. | PASS |

---

## 5. Interaction Quality

- **Filter Latency:** Real-time client-side transitions via React's `useTransition` hooks provide instant map marker filters without page refreshes.
- **Loading Skeletons:** Styled `animate-pulse` boxes prevent layout shift (CLS) during initial API queries.
- **Map & Panel Sync:** Clicking a marker updates the Map center, sets the selected company, and immediately populates the Company Dossier.

---

## Final Audit Result

**VAR Result: PASS**
