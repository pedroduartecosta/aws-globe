import requests
import json

def convert_azure_data():
    regions_url = "https://datacenters.microsoft.com/globe/data/geo/regions.json"
    local_zones_url = "https://datacenters.microsoft.com/globe/data/geo/edgezones.json"
    pops_url = "https://datacenters.microsoft.com/globe/data/geo/pop.json"

    try:
        # Fetch Azure Regions
        regions_response = requests.get(regions_url)
        azure_regions = regions_response.json()

        converted_regions = [convert_region_data(region) for region in azure_regions]

        # Fetch Azure Local Zones
        local_zones_response = requests.get(local_zones_url)
        azure_local_zones = local_zones_response.json()

        converted_local_zones = [convert_local_zone_data(local_zone) for local_zone in azure_local_zones]

        # Fetch Azure PoPs
        pops_response = requests.get(pops_url)
        azure_pops = pops_response.json()

        converted_pops = [convert_pop_data(pop) for pop in azure_pops]

        # Combine Regions, Local Zones, and PoPs
        final_data = {
            "type": "AzureDataCollection",
            "regions": converted_regions + converted_local_zones + converted_pops
        }

        with open('azure_data.json', 'w') as file:
            json.dump(final_data, file, indent=4)

        print("Data saved to azure_data.json")

    except Exception as e:
        print("An error occurred:", str(e))

def convert_region_data(region):
    return {
        "name": region.get("id", ""),
        "longName": region.get("location", ""),
        "type": "Region",
        "status": "available" if region.get("isOpen", False) else "unavailable",
        "size": 1.0,
        "lat": region.get("latitude", None),
        "lng": region.get("longitude", None)
    }

def convert_local_zone_data(local_zone):
    return {
        "name": local_zone.get("id", ""),
        "longName": local_zone.get("location", ""),
        "type": "Local Zone",
        "status": "available",
        "size": 0.5,
        "lat": local_zone.get("latitude", None),
        "lng": local_zone.get("longitude", None)
    }

def convert_pop_data(pop):
    return {
        "name": pop.get("id", ""),
        "longName": pop.get("city", ""),
        "type": "PoP",
        "status": "available",
        "size": 0.2,  # Assuming smaller size for PoPs
        "lat": pop.get("latitude", None),
        "lng": pop.get("longitude", None),
    }

if __name__ == "__main__":
    convert_azure_data()
