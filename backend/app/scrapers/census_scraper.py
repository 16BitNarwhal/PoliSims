import aiohttp
import ssl
import certifi
import logging
import json
from datetime import datetime
from typing import Dict, List, Any, Optional

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class CensusScraper:
    """Scraper for Statistics Canada census data using WDS API."""

    def __init__(self):
        self.base_url = "https://www150.statcan.gc.ca/t1/wds/rest"
        self.metadata_url = f"{self.base_url}/getCubeMetadata"
        self.data_url = f"{self.base_url}/getDataFromVectorsAndLatestNPeriods"
        self.series_url = f"{self.base_url}/getSeriesInfoFromVector"

        # SSL context for secure connections
        self.ssl_context = ssl.create_default_context(cafile=certifi.where())

        # Census vectors for key metrics (2021 Census)
        # These vectors need to be updated with actual Statistics Canada vector IDs
        self.vectors = {
            "total_population": "1",  # Total population (Canada)
            "demographics": {
                "age_groups": {
                    "0_14": "2",  # Population aged 0-14
                    "15_64": "3",  # Population aged 15-64
                    "65_plus": "4",  # Population aged 65+
                },
                "gender": {
                    "male": "5",  # Male population
                    "female": "6",  # Female population
                },
            },
        }

    async def fetch_data(
        self, url: str, params: Any = None, method: str = "POST"
    ) -> Dict:
        """Fetch data from Statistics Canada WDS API with proper headers and SSL."""
        try:
            conn = aiohttp.TCPConnector(ssl=self.ssl_context)
            async with aiohttp.ClientSession(connector=conn) as session:
                headers = {"Content-Type": "application/json"}

                if method.upper() == "POST":
                    # Convert params to JSON string
                    if isinstance(params, (dict, list)):
                        params = json.dumps(params)

                    async with session.post(
                        url, data=params, headers=headers
                    ) as response:
                        if response.status == 200:
                            return await response.json()
                        logger.error(
                            f"API request failed with status {response.status}"
                        )
                        logger.error(f"Response text: {await response.text()}")
                        return {}
                else:
                    async with session.get(url, headers=headers) as response:
                        if response.status == 200:
                            return await response.json()
                        logger.error(
                            f"API request failed with status {response.status}"
                        )
                        logger.error(f"Response text: {await response.text()}")
                        return {}

        except Exception as e:
            logger.error(f"Error fetching data: {str(e)}")
            return {}

    async def get_population_data(self) -> Dict[str, Any]:
        """Get population data from Statistics Canada."""
        try:
            # First get the metadata for the population vector
            vector_info_params = [{"vectorId": int(self.vectors["total_population"])}]
            vector_info = await self.fetch_data(self.series_url, vector_info_params)

            if not vector_info:
                logger.error("Failed to fetch vector information")
                return {}

            # Get the latest population data
            data_params = [
                {"vectorId": int(self.vectors["total_population"]), "latestN": 1}
            ]
            data = await self.fetch_data(self.data_url, data_params)

            if not data:
                logger.error("Failed to fetch population data")
                return {}

            # Process and return the data
            processed_data = {
                "total_population": None,
                "timestamp": datetime.now().isoformat(),
                "metadata": vector_info,
            }

            if isinstance(data, list) and len(data) > 0 and "object" in data[0]:
                vector_data = data[0]["object"]
                if (
                    "vectorDataPoint" in vector_data
                    and len(vector_data["vectorDataPoint"]) > 0
                ):
                    latest_point = vector_data["vectorDataPoint"][0]
                    processed_data["total_population"] = float(
                        latest_point.get("value", 0)
                    )
                    processed_data["reference_period"] = latest_point.get("refPer")

            return processed_data

        except Exception as e:
            logger.error(f"Error getting population data: {str(e)}")
            return {}

    async def get_age_distribution(self) -> Dict[str, Any]:
        """Get age distribution data."""
        try:
            vector_ids = [
                int(v) for v in self.vectors["demographics"]["age_groups"].values()
            ]
            data_params = [
                {"vectorId": vector_id, "latestN": 1} for vector_id in vector_ids
            ]

            data = await self.fetch_data(self.data_url, data_params)

            if not data:
                logger.error("Failed to fetch age distribution data")
                return {}

            processed_data = {"age_groups": {}, "timestamp": datetime.now().isoformat()}

            for response in data:
                if "object" in response and "vectorDataPoint" in response.get(
                    "object", {}
                ):
                    vector_id = str(response["object"].get("vectorId"))
                    vector_data = response["object"]["vectorDataPoint"]
                    if vector_data and len(vector_data) > 0:
                        latest_point = vector_data[0]

                        # Map vector ID back to age group
                        for age_group, v_id in self.vectors["demographics"][
                            "age_groups"
                        ].items():
                            if v_id == vector_id:
                                processed_data["age_groups"][age_group] = float(
                                    latest_point.get("value", 0)
                                )

            return processed_data

        except Exception as e:
            logger.error(f"Error getting age distribution: {str(e)}")
            return {}
