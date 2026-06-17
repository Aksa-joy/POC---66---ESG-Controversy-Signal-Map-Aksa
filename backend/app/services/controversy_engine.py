import json
import os
import random
from datetime import datetime, timedelta
from typing import List, Dict, Any

# Ensure directory exists
DATA_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "data"))

TAXONOMY = {
    "Governance Fraud": {"weight": 100, "description": "Systemic corporate fraud, deceptive practices, or illegal financial reporting by board or executive leadership."},
    "Accounting Issues": {"weight": 90, "description": "Misstatement of financial reports, audit failures, or intentional misclassification of assets."},
    "Corruption": {"weight": 85, "description": "Bribery, extortion, political lobbying violations, or illegal kickbacks."},
    "Environmental Spill": {"weight": 80, "description": "Release of pollutants, oil spills, toxic waste dumpings, or ecological habitat destruction."},
    "Labor Rights": {"weight": 75, "description": "Exploitative labor, child labor, modern slavery, collective bargaining suppression, or wage theft."},
    "Data Privacy": {"weight": 70, "description": "Unconsented surveillance, data leaks, customer tracking abuses, or failure to secure personal identifiable info."},
    "Workplace Safety": {"weight": 65, "description": "Industrial accidents, hazardous working environments, lack of protective equipment, or fatalities."},
    "Executive Misconduct": {"weight": 60, "description": "Harassment, ethical breaches, insider trading, or abuse of power by high-level management."}
}

COMPANIES_LIST = [
    # Energy (10)
    {"name": "Aether Petroleum", "sector": "Energy"},
    {"name": "Vertex Gas & Power", "sector": "Energy"},
    {"name": "Helios Solar Corp", "sector": "Energy"},
    {"name": "Deepwater Drillers", "sector": "Energy"},
    {"name": "Nordic Wind Ltd", "sector": "Energy"},
    {"name": "Zephyr Energy Solutions", "sector": "Energy"},
    {"name": "Apex Coal & Mining", "sector": "Energy"},
    {"name": "Terra Thermal Partners", "sector": "Energy"},
    {"name": "Horizon Hydrogen", "sector": "Energy"},
    {"name": "Nova Biofuels Corp", "sector": "Energy"},
    
    # Finance (10)
    {"name": "Apex Wealth Management", "sector": "Finance"},
    {"name": "Meridian Union Bank", "sector": "Finance"},
    {"name": "Crestview Holdings", "sector": "Finance"},
    {"name": "Nexus Venture Partners", "sector": "Finance"},
    {"name": "Vanguard Trust Group", "sector": "Finance"},
    {"name": "Stellar Credit Corp", "sector": "Finance"},
    {"name": "Alpine Reinsurance", "sector": "Finance"},
    {"name": "First Capital Assurance", "sector": "Finance"},
    {"name": "Omni Securities", "sector": "Finance"},
    {"name": "Zenith Microfinance", "sector": "Finance"},
    
    # Technology (10)
    {"name": "Quantum Compute Co", "sector": "Technology"},
    {"name": "Cyberdyne Systems", "sector": "Technology"},
    {"name": "Sovereign Cloud Labs", "sector": "Technology"},
    {"name": "Signal Dynamics LLC", "sector": "Technology"},
    {"name": "OmniData Analytics", "sector": "Technology"},
    {"name": "NeuralLink Solutions", "sector": "Technology"},
    {"name": "Matrix Telecoms", "sector": "Technology"},
    {"name": "Prism Social Media", "sector": "Technology"},
    {"name": "Apex Semiconductor", "sector": "Technology"},
    {"name": "Krypton Cyber Security", "sector": "Technology"},
    
    # Healthcare (10)
    {"name": "BioGenix Pharma", "sector": "Healthcare"},
    {"name": "Thera Therapeutics", "sector": "Healthcare"},
    {"name": "Apex Medical Devices", "sector": "Healthcare"},
    {"name": "CareAlliance Health", "sector": "Healthcare"},
    {"name": "Beacon Diagnostics", "sector": "Healthcare"},
    {"name": "Genesis Genomics", "sector": "Healthcare"},
    {"name": "Pinnacle Pharmaceuticals", "sector": "Healthcare"},
    {"name": "Salus Biotech", "sector": "Healthcare"},
    {"name": "Summit Medical Group", "sector": "Healthcare"},
    {"name": "VitaLife Laboratories", "sector": "Healthcare"},
    
    # Manufacturing (10)
    {"name": "Titan Heavy Industries", "sector": "Manufacturing"},
    {"name": "Atlas Auto Group", "sector": "Manufacturing"},
    {"name": "Standard Steel Corp", "sector": "Manufacturing"},
    {"name": "Precision Polymer Co", "sector": "Manufacturing"},
    {"name": "EcoPack Materials", "sector": "Manufacturing"},
    {"name": "NextGen Avionics", "sector": "Manufacturing"},
    {"name": "Pioneer Chemical Corp", "sector": "Manufacturing"},
    {"name": "Vanguard Robotics", "sector": "Manufacturing"},
    {"name": "Starlight Textiles", "sector": "Manufacturing"},
    {"name": "Summit Ceramics", "sector": "Manufacturing"}
]

COUNTRIES_COORDINATES = {
    "USA": {"lat": 37.0902, "lng": -95.7129},
    "GBR": {"lat": 55.3781, "lng": -3.4360},
    "DEU": {"lat": 51.1657, "lng": 10.4515},
    "FRA": {"lat": 46.2276, "lng": 2.2137},
    "JPN": {"lat": 36.2048, "lng": 138.2529},
    "CAN": {"lat": 56.1304, "lng": -106.3468},
    "AUS": {"lat": -25.2744, "lng": 133.7751},
    "BRA": {"lat": -14.2350, "lng": -51.9253},
    "IND": {"lat": 20.5937, "lng": 78.9629},
    "CHN": {"lat": 35.8617, "lng": 104.1954},
    "ZAF": {"lat": -30.5595, "lng": 22.9375},
    "NLD": {"lat": 52.1326, "lng": 5.2913},
    "SGP": {"lat": 1.3521, "lng": 103.8198},
    "CHE": {"lat": 46.8182, "lng": 8.2275},
    "SWE": {"lat": 60.1282, "lng": 18.6435}
}

SOURCES_WEIGHTS = {
    "SEC EDGAR": 25,
    "Bloomberg": 20,
    "Reuters": 18,
    "GDELT": 15,
    "NGO Report": 10,
    "Local News": 5
}

def calculate_recency_weight(date_str: str, base_date_str: str = "2026-06-12") -> float:
    fmt = "%Y-%m-%d"
    date_val = datetime.strptime(date_str, fmt)
    base_date = datetime.strptime(base_date_str, fmt)
    delta_days = (base_date - date_val).days
    
    if delta_days <= 7:
        return 25
    elif delta_days <= 30:
        return 18
    elif delta_days <= 90:
        return 10
    else:
        return 3

def calculate_repetition_weight(prev_count: int) -> float:
    if prev_count == 0:
        return 0
    elif prev_count == 1:
        return 5
    elif prev_count == 2:
        return 10
    else:
        return 15

def get_category_weight(category: str) -> float:
    # Scale taxonomy score from 0-100 down to 0-35 to maintain a clean balanced score
    raw_weight = TAXONOMY.get(category, {}).get("weight", 60)
    return raw_weight * 0.35

def get_severity_score(source: str, date_str: str, prev_count: int, category: str) -> float:
    src_w = SOURCES_WEIGHTS.get(source, 10)
    rec_w = calculate_recency_weight(date_str)
    rep_w = calculate_repetition_weight(prev_count)
    cat_w = get_category_weight(category)
    
    severity = src_w + rec_w + rep_w + cat_w
    # Clamp between 30 and 100
    return round(max(30.0, min(100.0, severity)), 1)

def generate_mock_data():
    os.makedirs(DATA_DIR, exist_ok=True)
    
    # 1. Generate companies
    random.seed(42)  # Set seed for reproducibility
    countries = list(COUNTRIES_COORDINATES.keys())
    
    companies = []
    for idx, c_info in enumerate(COMPANIES_LIST):
        country = countries[idx % len(countries)]
        companies.append({
            "id": idx + 1,
            "name": c_info["name"],
            "country": country,
            "sector": c_info["sector"]
        })
        
    # Write companies
    companies_file = os.path.join(DATA_DIR, "companies.json")
    with open(companies_file, "w") as f:
        json.dump(companies, f, indent=2)
        
    # 2. Generate ESG Taxonomy
    taxonomy_data = []
    for cat, details in TAXONOMY.items():
        taxonomy_data.append({
            "category": cat,
            "weight": details["weight"],
            "description": details["description"]
        })
    taxonomy_file = os.path.join(DATA_DIR, "taxonomy.json")
    with open(taxonomy_file, "w") as f:
        json.dump(taxonomy_data, f, indent=2)

    # 3. Generate 200+ Controversies
    controversies = []
    base_date = datetime(2026, 6, 12)
    categories = list(TAXONOMY.keys())
    sources = list(SOURCES_WEIGHTS.keys())
    
    # Track repetitions per company
    company_counts = {}
    
    for c_id in range(1, 230):  # Generate 229 records (well over 200)
        # Select random company
        company = random.choice(companies)
        company_name = company["name"]
        
        # Keep track of previous occurrences for repeating weights
        prev_count = company_counts.get(company_name, 0)
        company_counts[company_name] = prev_count + 1
        
        # Select random category
        category = random.choice(categories)
        
        # Select random source
        source = random.choice(sources)
        
        # Select random date within last 120 days
        days_ago = random.randint(0, 120)
        event_date = base_date - timedelta(days=days_ago)
        date_str = event_date.strftime("%Y-%m-%d")
        
        # Let's add slight variance to coordinates so map markers don't overlap perfectly
        base_coord = COUNTRIES_COORDINATES[company["country"]]
        lat = base_coord["lat"] + random.uniform(-1.5, 1.5)
        lng = base_coord["lng"] + random.uniform(-1.5, 1.5)
        
        severity = get_severity_score(source, date_str, prev_count, category)
        
        controversies.append({
            "id": c_id,
            "company": company_name,
            "category": category,
            "severity": severity,
            "country": company["country"],
            "date": date_str,
            "latitude": round(lat, 4),
            "longitude": round(lng, 4),
            "source": source
        })
        
    # Sort controversies by date descending (most recent first)
    controversies.sort(key=lambda x: x["date"], reverse=True)
    
    # Write controversies
    controversies_file = os.path.join(DATA_DIR, "controversies.json")
    with open(controversies_file, "w") as f:
        json.dump(controversies, f, indent=2)

if __name__ == "__main__":
    generate_mock_data()
    print("Successfully generated mock data in data/")
