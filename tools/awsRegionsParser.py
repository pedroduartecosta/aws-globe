import requests
import json
import time
from geopy.geocoders import Nominatim

def get_lat_lon(city_name, retries=3):
    geolocator = Nominatim(user_agent="city_locator")
    while retries > 0:
        try:
            location = geolocator.geocode(city_name)
            if location:
                return location.latitude, location.longitude
            else:
                return None, None  # Return None values if location is not found
        except Exception as e:
            print("Retry after error:", str(e))
            time.sleep(2)  # Wait for 2 seconds before retrying
            retries -= 1
    return None, None

def convert_regions_data():
    url = "https://b0.p.awsstatic.com/locations/1.0/aws/current/locations.json"

    try:
        response = requests.get(url)
        data = response.json()

        converted_regions = []

        for region_code, region_info in data.items():
            region_type = region_info["type"]

            # Only process AWS Regions and AWS Local Zones
            if region_type not in ["AWS Region", "AWS Local Zone"]:
                continue

            longName = region_info["label"].split(" (")[1].replace(')', '')
            lat, lon = get_lat_lon(longName)

            region_type = "Region" if region_type == "AWS Region" else ("Local Zone" if region_type == "AWS Local Zone" else "Unknown")

            converted_region = {
                "name": region_info["code"],
                "longName": longName,
                "type": region_type,
                "size": 1.0 if region_type == "Region" else 0.5,
                "lat": lat,
                "lng": lon
            }
            converted_regions.append(converted_region)

        final_data = {
            "type": "RegionsCollection",
            "regions": converted_regions
        }

        with open('regions.json', 'w') as file:
            json.dump(final_data, file, indent=4)

        print("Data saved to regions.json")

    except Exception as e:
        print("An error occurred:", str(e))

if __name__ == "__main__":
    convert_regions_data()
