from typing import Dict, Any, List
import random

class GDELTService:
    def __init__(self):
        self.domains = ["reuters.com", "bloomberg.com", "apnews.com", "ft.com", "wsj.com", "nytimes.com"]
        
    def get_controversy_source_metadata(self, company: str, category: str) -> Dict[str, Any]:
        """
        Simulates retrieving article metadata from GDELT registry for a given company and controversy category
        """
        domain = random.choice(self.domains)
        slug = f"{company.lower().replace(' ', '-')}-{category.lower().replace(' ', '-')}-incident"
        url = f"https://www.{domain}/business/sustainability/{slug}"
        
        headlines = [
            f"Regulatory probe launched into {company} following {category} reports",
            f"Leaked documents highlight issues of {category} at {company}",
            f"{company} shares dip amid mounting concerns over {category}",
            f"Independent audit reveals details on {company} {category} event",
            f"Coalition urges stakeholders to hold {company} accountable for {category}"
        ]
        
        return {
            "source_system": "GDELT Global Knowledge Graph",
            "headline": random.choice(headlines),
            "url": url,
            "domain": domain,
            "confidence_score": round(random.uniform(70.0, 99.5), 1),
            "mentions_count": random.randint(3, 45)
        }

gdelt_client = GDELTService()
