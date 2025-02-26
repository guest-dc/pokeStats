import requests
import json
import math

API_URL = "https://pokemon-go-api.github.io/pokemon-go-api/api/pokedex.json"

FILENAME = "./data/pokedex.json"



# Function to calculate max CP using a known CP multiplier
def calc_max_cp(stats):
    cpm = 0.84029999
    attack = stats["attack"] + 15
    defense = math.sqrt(stats["defense"] + 15)
    hp = math.sqrt(stats["hp"] + 15)
    cp = (attack * defense * hp * (cpm ** 2)) / 10
    return math.floor(max(10, cp))



# Function to parse move data from API response
def parse_moves(pokemon):
    # fast_moves = [move["names"]["English"] for move in pokemon.get("quickMoves", {}).values()]
    # charged_moves = [move["names"]["English"] for move in pokemon.get("cinematicMoves", {}).values()]
    # return {"fast": fast_moves, "charged": charged_moves}
    return {}



# Function to format Pokémon data
def format_pokemon_data(pokemon):
    
    dex_number = pokemon["dexNr"]

    name = pokemon["names"]["English"]

    name_id = name.upper().replace(" ", "_")
    
    types = [pokemon["primaryType"]["names"]["English"].lower()]
    if pokemon.get("secondaryType"):
        types.append(pokemon["secondaryType"]["names"]["English"].lower())

    gen_number = pokemon.get("generation")

    stats = {
        "attack": pokemon["stats"]["attack"],
        "defense": pokemon["stats"]["defense"],
        "hp": pokemon["stats"]["stamina"]
    }

    is_released = pokemon.get("released", False)

    is_shadow = pokemon.get("isShadowPokemon", False)

    is_shiny = False

    image_url = f"./images/sprites/gen{gen_number}/{dex_number:04d}.png"

    return {
        dex_number: {
            "name": name,
            "nameID": name_id,
            "type": types,
            "generation": gen_number,
            "stats": stats,
            "maxCP": calc_max_cp(stats),
            "moves": parse_moves(pokemon),
            "isReleased": is_released,
            "isShiny": is_shiny,
            "isShadow": is_shadow,
            "image": image_url,
            "forms": []
        }
    }



# Function to fetch Pokémon data from the API
def fetch_pokemon_data():
    try:
        response = requests.get(API_URL)
        response.raise_for_status()
        return response.json()
    except requests.RequestException as e:
        print(f"Error fetching data from API: {e}")
        return []



# Function to generate the Pokémon JSON file
def generate_pokedex():
    data = fetch_pokemon_data()
    pokedex = {}

    for pokemon in data:

        if pokemon["dexNr"] == 152: break

        dex_entry = format_pokemon_data(pokemon)
        pokedex.update(dex_entry)

    # Save structured JSON data
    with open(FILENAME, "w", encoding="utf-8") as file:
        json.dump(pokedex, file, indent=4)

    print(f"Pokédex data saved to {FILENAME}")



############################################################################################################

generate_pokedex()
