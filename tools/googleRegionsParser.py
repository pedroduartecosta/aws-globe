from bs4 import BeautifulSoup
from geopy.geocoders import Nominatim
import json
import time

def get_lat_lon(city_name, retries=3):
    geolocator = Nominatim(user_agent="city_locator")
    while retries > 0:
        try:
            location = geolocator.geocode(city_name)
            if location:
                return location.latitude, location.longitude
            else:
                return None, None
        except Exception as e:
            print("Retry after error:", str(e))
            time.sleep(2)
            retries -= 1
    return None, None

def convert_google_cloud_regions(html_file):
    with open(html_file, 'r') as file:
        soup = BeautifulSoup(file, 'html.parser')

    converted_regions = []

    for tr in soup.find_all('tr'):
        td_elements = tr.find_all('td')
        if len(td_elements) == 4:
            country = td_elements[0].text.strip()
            city = td_elements[1].text.strip()
            region_codes = td_elements[2].get_text(separator=' ').split(' ')[0][:-2]
            num_zones = int(td_elements[3].text.strip())

            lat, lon = get_lat_lon(city)

            converted_region = {
                "name": region_codes,
                "longName": city,
                "type": "Region",
                "status": "available",
                "size": 1.0,
                "lat": lat,
                "lng": lon
            }
            converted_regions.append(converted_region)

    final_data = {
        "type": "GoogleCloudRegions",
        "regions": converted_regions
    }

    with open('google_cloud_regions.json', 'w') as file:
        json.dump(final_data, file, indent=4)

    print("Data saved to google_cloud_regions.json")

if __name__ == "__main__":
    convert_google_cloud_regions('regions')
