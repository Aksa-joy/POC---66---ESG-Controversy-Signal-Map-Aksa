import os
import sys
import json
from datetime import datetime, timedelta

# Adjust sys.path to support direct execution of this script
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

import pandas as pd
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from app.routes import companies, controversies, trends, taxonomy
from app.services.controversy_engine import DATA_DIR, generate_mock_data

app = FastAPI(
    title="ESG Controversy Signal Map API",
    description="Intelligence backend for governance and trust ESG signaling",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routes
app.include_router(companies.router, prefix="/api")
app.include_router(controversies.router, prefix="/api")
app.include_router(trends.router, prefix="/api")
app.include_router(taxonomy.router, prefix="/api")

@app.on_event("startup")
def startup_event():
    """
    Ensure mock data files are generated on startup.
    """
    comp_file = os.path.join(DATA_DIR, "companies.json")
    cont_file = os.path.join(DATA_DIR, "controversies.json")
    tax_file = os.path.join(DATA_DIR, "taxonomy.json")
    
    if not os.path.exists(comp_file) or not os.path.exists(cont_file) or not os.path.exists(tax_file):
        print("Data files missing. Generating mock datasets...")
        generate_mock_data()
    else:
        print("Data files verified.")

@app.get("/")
def read_root():
    """
    Root endpoint returning API status, version, and endpoints list.
    """
    return {
        "title": "ESG Controversy Signal Map API",
        "status": "online",
        "version": "1.0.0",
        "docs_url": "/docs",
        "endpoints": [
            "/api/companies",
            "/api/controversies",
            "/api/overview",
            "/api/trends",
            "/api/taxonomy"
        ]
    }

@app.get("/api/overview")
def get_overview():
    """
    Retrieve high-level ESG risk insights and summary statistics.
    """
    comp_path = os.path.join(DATA_DIR, "companies.json")
    cont_path = os.path.join(DATA_DIR, "controversies.json")
    
    if not os.path.exists(comp_path) or not os.path.exists(cont_path):
        generate_mock_data()
        
    try:
        df_companies = pd.read_json(comp_path)
        df_controversies = pd.read_json(cont_path)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to read data for overview: {str(e)}")
        
    if df_controversies.empty:
        return {
            "total_signals": 0,
            "high_risk_companies": 0,
            "average_severity": 0.0,
            "last_30_day_trend": 0.0
        }
        
    # 1. Total Signals
    total_signals = int(len(df_controversies))
    
    # 2. Average Severity
    avg_severity = round(float(df_controversies["severity"].mean()), 1)
    
    # 3. High Risk Companies (Average controversy severity > 75.0)
    company_avg = df_controversies.groupby("company")["severity"].mean()
    high_risk_companies = int((company_avg > 75.0).sum())
    
    # 4. Last 30 Day Trend (comparing last 30 days vs prior 30 days from 2026-06-12)
    # Target date: 2026-06-12
    base_date = datetime(2026, 6, 12)
    t30_start = base_date - timedelta(days=30)
    t60_start = base_date - timedelta(days=60)
    
    df_controversies["date_parsed"] = pd.to_datetime(df_controversies["date"])
    
    recent_count = len(df_controversies[(df_controversies["date_parsed"] >= t30_start) & (df_controversies["date_parsed"] <= base_date)])
    prior_count = len(df_controversies[(df_controversies["date_parsed"] >= t60_start) & (df_controversies["date_parsed"] < t30_start)])
    
    if prior_count > 0:
        trend = round(((recent_count - prior_count) / prior_count) * 100, 1)
    else:
        trend = 0.0
        
    return {
        "total_signals": total_signals,
        "high_risk_companies": high_risk_companies,
        "average_severity": avg_severity,
        "last_30_day_trend": trend
    }

if __name__ == "__main__":
    import uvicorn
    app_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True, app_dir=app_dir)
