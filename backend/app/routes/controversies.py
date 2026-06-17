import json
import os
from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from datetime import datetime
from app.models.schemas import Controversy
from app.services.controversy_engine import DATA_DIR, generate_mock_data
from app.services.gdelt_service import gdelt_client
from app.services.edgar_service import edgar_client

router = APIRouter(prefix="/controversies", tags=["controversies"])

def load_data():
    comp_path = os.path.join(DATA_DIR, "companies.json")
    cont_path = os.path.join(DATA_DIR, "controversies.json")
    
    if not os.path.exists(comp_path) or not os.path.exists(cont_path):
        generate_mock_data()
        
    with open(comp_path, "r") as f:
        companies = json.load(f)
    with open(cont_path, "r") as f:
        controversies = json.load(f)
        
    return companies, controversies

@router.get("")
def get_controversies(
    country: Optional[str] = Query(None, description="Filter by Country Code (e.g. USA, GBR)"),
    sector: Optional[str] = Query(None, description="Filter by Sector (e.g. Energy, Finance)"),
    company: Optional[str] = Query(None, description="Filter by Company Name"),
    category: Optional[str] = Query(None, description="Filter by ESG Category"),
    min_severity: Optional[float] = Query(None, description="Filter by Minimum Severity Score"),
    max_severity: Optional[float] = Query(None, description="Filter by Maximum Severity Score"),
    start_date: Optional[str] = Query(None, description="Start Date (YYYY-MM-DD)"),
    end_date: Optional[str] = Query(None, description="End Date (YYYY-MM-DD)")
):
    """
    Retrieve ESG controversy records with multi-dimensional filtering.
    Payload is enriched with company sector, GDELT news headlines, and SEC EDGAR disclosures.
    """
    companies, controversies = load_data()
    
    # Create company-to-sector lookup
    company_sectors = {c["name"]: c["sector"] for c in companies}
    
    filtered = []
    for cont in controversies:
        comp_name = cont["company"]
        comp_sector = company_sectors.get(comp_name, "Unknown")
        
        # Apply filters
        if country and cont["country"].upper() != country.upper():
            continue
        if sector and comp_sector.lower() != sector.lower():
            continue
        if company and comp_name.lower() != company.lower():
            continue
        if category and cont["category"].lower() != category.lower():
            continue
        if min_severity is not None and cont["severity"] < min_severity:
            continue
        if max_severity is not None and cont["severity"] > max_severity:
            continue
            
        if start_date:
            try:
                if datetime.strptime(cont["date"], "%Y-%m-%d") < datetime.strptime(start_date, "%Y-%m-%d"):
                    continue
            except ValueError:
                pass
                
        if end_date:
            try:
                if datetime.strptime(cont["date"], "%Y-%m-%d") > datetime.strptime(end_date, "%Y-%m-%d"):
                    continue
            except ValueError:
                pass
                
        # Enrich controversy with details
        gdelt_meta = gdelt_client.get_controversy_source_metadata(comp_name, cont["category"])
        edgar_meta = edgar_client.get_filing_disclosure(comp_name, cont["category"])
        
        enriched_cont = {
            **cont,
            "sector": comp_sector,
            "headline": gdelt_meta["headline"],
            "url": gdelt_meta["url"],
            "source_domain": gdelt_meta["domain"],
            "sec_disclosure": edgar_meta["disclosure_text"],
            "sec_url": edgar_meta["sec_url"],
            "filing_type": edgar_meta["filing_type"]
        }
        filtered.append(enriched_cont)
        
    return filtered
