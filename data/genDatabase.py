import requests
import json
import csv

FILENAME = "./data/database.json"
CSV_FILE = "./data/releasedMons.csv"
API_URL = "https://pokemon-go-api.github.io/pokemon-go-api/api/pokedex.json"



# Function to read the CSV and return a dictionary mapping id to (isReleased, hasShadow)
def load_csv_data(csv_file):
    release_data = {}
    with open(csv_file, mode='r', newline='', encoding='ISO-8859-1') as f:
        reader = csv.DictReader(f)
        for row in reader:
            release_data[row['pokeID']] = {
                'isReleased': row['isReleased'].strip() == 'True',
                'hasShadow': row['hasShadow'].strip() == 'True',
                'imgID':row['dexID']
            }
    return release_data


print("Processing API data...")


response = requests.get(API_URL)
if response.status_code == 200:
    data = response.json()
    
    with open(FILENAME, "w", encoding="utf-8") as file:
        json.dump(data, file, indent=4)
    
    print(f"JSON data saved successfully as '{FILENAME}'")

else:
    print(f"Failed to fetch data. Status Code: {response.status_code}")


print("Adding availability dexID to JSON...")


release_data = load_csv_data(CSV_FILE)

with open(FILENAME, 'r', encoding='utf-8') as f:
    pokemon_data = json.load(f)

for pokemon in pokemon_data:

    poke_id = pokemon['id']

    if poke_id in release_data:
        pokemon.update(release_data[poke_id])
    
    if pokemon.get('regionForms'):
        for region_form in pokemon['regionForms']:
            if region_form in release_data:
                pokemon['regionForms'][region_form].update(release_data[region_form])

with open(FILENAME, 'w', encoding='utf-8') as f:
    json.dump(pokemon_data, f, indent=4)

print(f"JSON data successfully updated")