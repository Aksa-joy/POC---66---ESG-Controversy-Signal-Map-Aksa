from pydantic import BaseModel, Field
from typing import List, Optional

class Company(BaseModel):
    id: int
    name: str
    country: str
    sector: str

class Controversy(BaseModel):
    id: int
    company: str
    category: str
    severity: float
    country: str
    date: str
    latitude: float
    longitude: float
    source: str

class TrendPoint(BaseModel):
    date: str
    count: int
    avg_severity: float

class TaxonomyItem(BaseModel):
    category: str
    weight: int
    description: str

class OverviewStats(BaseModel):
    total_signals: int
    high_risk_companies_count: int
    average_severity: float
    last_30_days_trend_percent: float
