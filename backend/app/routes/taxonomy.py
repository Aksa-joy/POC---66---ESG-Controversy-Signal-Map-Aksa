import json
import os
from fastapi import APIRouter, HTTPException
from typing import List
from app.models.schemas import TaxonomyItem
from app.services.controversy_engine import DATA_DIR, generate_mock_data

router = APIRouter(prefix="/taxonomy", tags=["taxonomy"])

def get_taxonomy_data() -> List[dict]:
    file_path = os.path.join(DATA_DIR, "taxonomy.json")
    if not os.path.exists(file_path):
        generate_mock_data()
        
    try:
        with open(file_path, "r") as f:
            return json.load(f)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to read taxonomy data: {str(e)}")

@router.get("", response_model=List[TaxonomyItem])
def get_taxonomy():
    """
    Retrieve ESG controversies categories, weights, and regulatory severity definitions.
    """
    return get_taxonomy_data()
