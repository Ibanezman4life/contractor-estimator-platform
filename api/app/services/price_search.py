import requests
from typing import List

class SupplierResult:
    def __init__(self, supplier_name: str, product_name: str, price: float, shipping_cost: float, availability: str):
        self.supplier_name = supplier_name
        self.product_name = product_name
        self.price = price
        self.shipping_cost = shipping_cost
        self.availability = availability

    def __repr__(self):
        return f"<SupplierResult(supplier_name={self.supplier_name}, product_name={self.product_name}, price={self.price}, shipping_cost={self.shipping_cost}, availability={self.availability})>"


def search_material_prices(material_name: str, location: str) -> List[SupplierResult]:
    results = []
    
    # Simulated search for Home Depot
    home_depot_url = f"https://www.homedepot.com/s/{material_name}?cm_sp=Google"  # Using a mock URL for search
    home_depot_response = requests.get(home_depot_url)
    # Here you would implement actual parsing of home_depot_response to extract prices.
    # Mocking a response for demonstration purposes:
    results.append(SupplierResult("Home Depot", "{material_name}", 19.99, 5.99, "In Stock"))

    
    # Simulated search for Lowes
    lowes_url = f"https://www.lowes.com/search?searchTerm={material_name}"  # Using a mock URL for search
    lowes_response = requests.get(lowes_url)
    # Here you would implement actual parsing of lowes_response to extract prices.
    # Mocking a response for demonstration purposes:
    results.append(SupplierResult("Lowes", "{material_name}", 22.49, 4.99, "In Stock"))

    
    # Simulated search for local suppliers, assuming a function get_local_suppliers() exists to fetch supplier data.
    # local_suppliers = get_local_suppliers(location)
    results.append(SupplierResult("Local Supplier", "{material_name}", 20.00, 3.50, "Available"))

    return results

if __name__ == '__main__':
    # Example usage
    material = "2x4 Lumber"
    location = "San Francisco, CA"
    print(search_material_prices(material, location))
