import json
import os
import pandas as pd
from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any
from app.services.controversy_engine import DATA_DIR, generate_mock_data

router = APIRouter(prefix="/trends", tags=["trends"])

def load_data_frames():
    comp_path = os.path.join(DATA_DIR, "companies.json")
    cont_path = os.path.join(DATA_DIR, "controversies.json")
    
    if not os.path.exists(comp_path) or not os.path.exists(cont_path):
        generate_mock_data()
        
    try:
        df_companies = pd.read_json(comp_path)
        df_controversies = pd.read_json(cont_path)
        return df_companies, df_controversies
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to read data frames: {str(e)}")

@router.get("")
def get_trends():
    """
    Retrieve aggregated analytical trend reports including time-series, category counts, and sector risk profiles.
    """
    df_companies, df_controversies = load_data_frames()
    
    if df_controversies.empty or df_companies.empty:
        return {
            "time_series": [],
            "by_category": [],
            "by_sector": []
        }
        
    # Merge datasets to link controversies with company sectors
    df_merged = df_controversies.merge(
        df_companies.rename(columns={"name": "company", "country": "company_country", "id": "company_id"}),
        on="company",
        how="left"
    )
    
    # 1. Time Series: controversies count and avg severity grouped by date (last 60 days)
    df_merged["date_parsed"] = pd.to_datetime(df_merged["date"])
    
    # Group by date and sort
    df_ts = df_merged.groupby("date").agg(
        count=("id", "count"),
        avg_severity=("severity", "mean")
    ).reset_index()
    
    df_ts["avg_severity"] = df_ts["avg_severity"].round(1)
    df_ts = df_ts.sort_values(by="date")
    time_series = df_ts.to_dict(orient="records")
    
    # 2. Category Aggregates
    # Standardize categories mapping
    category_mapping = {
        "Governance Fraud": "Governance",
        "Accounting Issues": "Governance",
        "Corruption": "Governance",
        "Environmental Spill": "Environmental",
        "Labor Rights": "Labor",
        "Data Privacy": "Privacy",
        "Workplace Safety": "Safety",
        "Executive Misconduct": "Governance"
    }
    df_merged["mapped_category"] = df_merged["category"].map(category_mapping).fillna("Other")
    
    df_cat = df_merged.groupby("mapped_category").agg(
        count=("id", "count"),
        avg_severity=("severity", "mean")
    ).reset_index()
    df_cat["avg_severity"] = df_cat["avg_severity"].round(1)
    by_category = df_cat.rename(columns={"mapped_category": "category"}).to_dict(orient="records")
    
    # 3. Sector risk ranking
    df_sector = df_merged.groupby("sector").agg(
        count=("id", "count"),
        avg_severity=("severity", "mean")
    ).reset_index()
    df_sector["avg_severity"] = df_sector["avg_severity"].round(1)
    df_sector = df_sector.sort_values(by="avg_severity", ascending=False)
    by_sector = df_sector.to_dict(orient="records")
    
    return {
        "time_series": time_series,
        "by_category": by_category,
        "by_sector": by_sector
    }
