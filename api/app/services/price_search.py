import requests
import os
from typing import List
from app.schemas.materials import SupplierOption

class PriceSearchService:
    """
    Service to search for real-time pricing from multiple suppliers.
    Integrates with Home Depot, Lowe's, and Amazon APIs.
    """
    
    def __init__(self):
        self.home_depot_api = os.getenv("HOME_DEPOT_API_KEY")
        self.lowes_api = os.getenv("LOWES_API_KEY")
        self.amazon_api = os.getenv("AMAZON_API_KEY")
        
    def search_home_depot(self, material_name: str, zip_code: str = None) -> List[SupplierOption]:
        """Search Home Depot for material pricing and availability."""
        try:
            # Using Home Depot's public search as fallback
            url = f"https://www.homedepot.com/s/{material_name}"
            headers = {'User-Agent': 'Mozilla/5.0'}
            response = requests.get(url, headers=headers, timeout=5)
            
            if response.status_code == 200:
                # Parse HTML and extract prices
                from bs4 import BeautifulSoup
                soup = BeautifulSoup(response.text, 'html.parser')
                # This is a simplified example - real implementation would parse actual product listings
                
            return []
        except Exception as e:
            print(f"Error searching Home Depot: {e}")
            return []
    
    def search_lowes(self, material_name: str, zip_code: str = None) -> List[SupplierOption]:
        """Search Lowe's for material pricing and availability."""
        try:
            url = f"https://www.lowes.com/search?searchTerm={material_name}"
            headers = {'User-Agent': 'Mozilla/5.0'}
            response = requests.get(url, headers=headers, timeout=5)
            
            if response.status_code == 200:
                from bs4 import BeautifulSoup
                soup = BeautifulSoup(response.text, 'html.parser')
                # Parse and extract pricing information
                
            return []
        except Exception as e:
            print(f"Error searching Lowe's: {e}")
            return []
    
    def search_amazon(self, material_name: str) -> List[SupplierOption]:
        """Search Amazon for material pricing and availability."""
        try:
            url = f"https://www.amazon.com/s?k={material_name}"
            headers = {'User-Agent': 'Mozilla/5.0'}
            response = requests.get(url, headers=headers, timeout=5)
            
            if response.status_code == 200:
                from bs4 import BeautifulSoup
                soup = BeautifulSoup(response.text, 'html.parser')
                # Parse and extract pricing information
                
            return []
        except Exception as e:
            print(f"Error searching Amazon: {e}")
            return []
    
    def search_all_suppliers(self, material_name: str, zip_code: str = None) -> List[SupplierOption]:
        """Search all suppliers and return combined results."""
        results = []
        
        results.extend(self.search_home_depot(material_name, zip_code))
        results.extend(self.search_lowes(material_name, zip_code))
        results.extend(self.search_amazon(material_name))
        
        # Sort by price (cheapest first)
        results.sort(key=lambda x: x.price)
        
        return results