from fastapi import APIRouter, HTTPException
from typing import Dict
import logging
from app.scrapers.census_scraper import CensusScraper

logger = logging.getLogger(__name__)
router = APIRouter(prefix="")  # Empty prefix to maintain original URLs

# Initialize components
census_scraper = CensusScraper()

@router.get("/population", response_model=Dict)
async def get_population():
    """Get total population data."""
    try:
        # Remove async context manager since CensusScraper doesn't support it
        data = await census_scraper.get_population_data()
        if not data or "total_population" not in data:
            raise HTTPException(
                status_code=503,
                detail="Unable to fetch population data. Please try again later."
            )
        return data
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        logger.error(f"Error in /population: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="An error occurred while processing your request."
        )

@router.get("/population/age", response_model=Dict)
async def get_age_distribution():
    """Get population age distribution data."""
    try:
        # Remove async context manager since CensusScraper doesn't support it
        data = await census_scraper.get_age_distribution()
        if not data or not data.get("age_groups"):
            raise HTTPException(
                status_code=503,
                detail="Unable to fetch age distribution data. Please try again later."
            )
        return data
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        logger.error(f"Error in /population/age: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="An error occurred while processing your request."
        )
