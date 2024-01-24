import requests
import json
from geopy.geocoders import Nominatim
import time
from bs4 import BeautifulSoup

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

def parse_pops_from_html(html_content):
    soup = BeautifulSoup(html_content, 'html.parser')
    table = soup.find('table', class_='table iata')
    rows = table.find_all('tr')[1:]  # Skip header row

    pops = []
    for row in rows:
        cols = row.find_all('td')
        iata_code = cols[0].text.strip()
        airport = cols[1].text.strip()
        city = cols[2].text.strip()
        country = cols[3].text.strip()

        pops.append((iata_code, airport, city, country))
    return pops

def convert_regions_data(html_file_path):
    url = "https://b0.p.awsstatic.com/locations/1.0/aws/current/locations.json"

    try:
        # Read HTML file for PoPs data
        with open(html_file_path, 'r') as file:
            html_content = file.read()
        all_pops = parse_pops_from_html(html_content)
        
        # Get latitude and longitude for unique cities
        unique_cities = set([pop[2] for pop in all_pops])
        city_lat_lon = {city: get_lat_lon(city) for city in unique_cities}

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

            region_type = "Region" if region_type == "AWS Region" else "Local Zone"

            converted_region = {
                "name": region_info["code"],
                "longName": longName,
                "type": region_type,
                "status": "available",
                "size": 1.0 if region_type == "Region" else 0.5,
                "lat": lat,
                "lng": lon
            }
            converted_regions.append(converted_region)

        # Initialize a set to track processed cities
        processed_cities = set()

        # Add PoPs data to converted_regions with check for duplicates
        for pop in all_pops:
            iata_code, airport, city, country = pop

            # Skip if the city is already processed
            if city in processed_cities:
                continue

            lat, lon = city_lat_lon.get(city, (None, None))
            converted_regions.append({
                "name": iata_code,
                "longName": city,
                "type": "PoP",
                "status": "available",
                "size": 0.3,  # Assuming smaller size for PoPs
                "lat": lat,
                "lng": lon
            })

            # Mark this city as processed
            processed_cities.add(city)

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
    convert_regions_data("awspops")
