import requests
import json

FILENAME = "./data/database.json"
API_URL = "https://pokemon-go-api.github.io/pokemon-go-api/api/pokedex.json"

response = requests.get(API_URL)

if response.status_code == 200:
    data = response.json()
    
    with open(FILENAME, "w", encoding="utf-8") as file:
        json.dump(data, file, indent=4)
    
    print(f"JSON data saved successfully as '{FILENAME}'")
else:
    print(f"Failed to fetch data. Status Code: {response.status_code}")