# Architecture Summary

An in-depth summary of the system architecture, data workflows, mathematical scoring parameters, and design guidelines for the **ESG Controversy Signal Map (POC 66)**.

---

## 1. System Topology

The platform is organized as a decoupled web application containing a Python FastAPI backend and a Next.js 15 App Router client.

```
+-------------------------------------------------------------+
|                      Client Web App                         |
|                    (Next.js 15 + TS)                        |
|                                                             |
|   +-------------------+  +---------------+  +-----------+   |
|   |   SignalMap       |  |  CompanyCard  |  |  Filters  |   |
|   |  (React Leaflet)  |  |   (Dossier)   |  |  (React)  |   |
|   +-------------------+  +---------------+  +-----------+   |
|             |                    |                |         |
+-------------|--------------------|----------------|---------+
              |                    |                |
   HTTP REST  | GET /api/trends    | GET /api/overview
   Queries    | GET /api/taxonomy  | GET /api/companies
              v                    v                v
+-------------------------------------------------------------+
|                    FastAPI Web Server                       |
|                                                             |
|     +-------------------------------------------------+     |
|     |                     Routes                      |     |
|     |  (companies, controversies, trends, taxonomy)   |     |
|     +-------------------------------------------------+     |
|           |                      |                          |
|           v                      v                          |
|     +-----------+          +-----------+                    |
|     | Services  |          |  Models   |                    |
|     | (Scoring) |          | (Schemas) |                    |
|     +-----------+          +-----------+                    |
|           |                      |                          |
|           v                      v                          |
|     +----------------------------------+                    |
|     |               Data               |                    |
|     |     (JSON database structures)    |                    |
|     +----------------------------------+                    |
+-------------------------------------------------------------+
```

---

## 2. Core Modules

### Frontend Service
- **App Directory Configuration:** Implements standard App Router folder mappings. Page components utilize dynamic client-side bootstrapping for mapping hooks.
- **Dynamic Leaflet Integration:** Incorporates a Next.js dynamic loader (`ssr: false`) to bypass Server-Side Rendering (SSR) compilation limits since React Leaflet references global browser window variables.
- **State Management:** Manages centralized filters, active company selections, data query responses, and connection statuses at the main route wrapper. Passes down states to modular UI elements.
- **Responsive Flex Grid:** Grid breakpoints adapt from single columns on mobile viewports to a 70% left, 30% right dashboard layout on desktops.

### Backend Service
- **Python FastAPI Application:** Structured to separate data schemas (Pydantic validation), controller routes, and service helper layers.
- **Mock Data Seeding:** Startup hooks verify data folders and trigger seeder algorithms if JSON files are missing.
- **Pandas Data Analysis:** The `/trends` endpoint uses Pandas to perform SQL-like aggregations (groupings, mean calculations, sorting) for charts, optimizing speed and reducing client-side processing load.

---

## 3. Data Schema & Models

Data structures are validated using Pydantic schemas.

### Company
```json
{
  "id": 1,
  "name": "ABC Corp",
  "country": "USA",
  "sector": "Energy"
}
```

### Controversy (Enriched Schema)
```json
{
  "id": 1,
  "company": "ABC Corp",
  "category": "Environmental Spill",
  "severity": 82,
  "country": "USA",
  "date": "2026-04-15",
  "latitude": 37.77,
  "longitude": -122.41,
  "source": "GDELT",
  "sector": "Energy",
  "headline": "Probe launched into ABC Corp following spill",
  "url": "https://www.reuters.com/...",
  "source_domain": "reuters.com",
  "sec_disclosure": "Item 1A. Risk Factors updated: Environmental liabilities.",
  "sec_url": "https://www.sec.gov/...",
  "filing_type": "Form 8-K"
}
```

---

## 4. Scoring Engine Mathematics

The Controversy Severity Score is computed dynamically or pre-calculated during seeding according to the following formula:

$$\text{Severity} = \text{Source Weight} + \text{Recency Weight} + \text{Repetition Weight} + \text{Category Weight}$$

### Weighting Parameters

#### 1. Source Weight (`source_weight`)
Reflects the credibility and distribution reach of the report:
- **SEC EDGAR:** $25$
- **Bloomberg:** $20$
- **Reuters:** $18$
- **GDELT:** $15$
- **NGO Report:** $10$
- **Local News:** $5$

#### 2. Recency Weight (`recency_weight`)
Calculated based on days elapsed relative to the target epoch (`2026-06-12`):
- **0 - 7 Days:** $25$
- **8 - 30 Days:** $18$
- **31 - 90 Days:** $10$
- **91+ Days:** $3$

#### 3. Repetition Weight (`repetition_weight`)
Adds severity for companies with repeated incidents:
- **First Incident:** $0$
- **Second Incident:** $5$
- **Third Incident:** $10$
- **Fourth or more:** $15$

#### 4. Category Weight (`category_weight`)
Determined by mapping the ESG Taxonomy base score (`taxonomy_weight`) to a scaled maximum of $35$:
$$\text{Category Weight} = \text{Taxonomy Weight} \times 0.35$$

Base taxonomy weights:
- **Governance Fraud:** $100$
- **Accounting Issues:** $90$
- **Corruption:** $85$
- **Environmental Spill:** $80$
- **Labor Rights:** $75$
- **Data Privacy:** $70$
- **Workplace Safety:** $65$
- **Executive Misconduct:** $60$

*Example: A news report about an Environmental Spill ($80 \times 0.35 = 28$ category weight) from Reuters ($18$ weight) occurring 5 days ago ($25$ weight) for a company with 1 prior incident ($5$ weight) yields:*
$$\text{Severity} = 18 + 25 + 5 + 28 = 76$$

---

## 5. Visual Rendering Strategy

- **Interactive Leaflet Markers:** Renders custom HTML markers with `L.divIcon` whose color shifts dynamically. Includes a CSS `@keyframes` pulse animation to draw focus.
- **Dark Mode Tiles:** Displays CartoDB Dark Matter tiles (`/dark_all/{z}/{x}/{y}.png`), which map details without background noise.
- **Hover Tooltips:** Charts are configured with customized tooltip components that display absolute values alongside clear metric definitions.

---

## 6. Deployment Strategy

The application is container-ready for orchestration.

- **Docker Multistage Layout:** Set up to build the Next.js static asset tree, run it with an active Node image, and containerize the FastAPI Python app with Uvicorn.
- **Environment Parity:** The frontend requires `NEXT_PUBLIC_API_URL` to route requests to the API gateway. The backend allows setting `PORT` and `HOST` options.
