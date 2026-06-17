import json
import os
from fastapi import APIRouter, HTTPException
from typing import List
from app.models.schemas import Company
from app.services.controversy_engine import DATA_DIR, generate_mock_data

router = APIRouter(prefix="/companies", tags=["companies"])

def get_companies_data() -> List[dict]:
    file_path = os.path.join(DATA_DIR, "companies.json")
    if not os.path.exists(file_path):
        generate_mock_data()
    
    try:
        with open(file_path, "r") as f:
            return json.load(f)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to read companies data: {str(e)}")

@router.get("", response_model=List[Company])
def get_companies():
    """
    Retrieve all registered corporate entities.
    """
    return get_companies_data()
