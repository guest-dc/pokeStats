import requests
import json
import math

"""
 Pokemon needed to be manually added:
 - Paldean Tauros
 - Mega Mewtwo X and Y
 - everything after 1008
"""

API_URL = "https://pokemon-go-api.github.io/pokemon-go-api/api/pokedex.json"
FILENAME = "./data/pokedex.json"

tagIDs = {
    "galarian": "galar",
    "hisuian": "hisui",
}

specialIDs = {
    "MEWTWO_A": "MEWTWO_ARMORED",
    "DARMANITAN_GALARIAN_STANDARD": "DARMANITAN_GALARIAN",
    "HOOPA": "HOOPA_CONFINED",
}

specialNames = {
    "GROWLITHE_HISUIAN": "Hisuian Growlithe",
    "ARCANINE_HISUIAN": "Hisuian Arcanine",
    "DARMANITAN_GALARIAN": "Galarian Darmanitan",
    "DARMANITAN_GALARIAN_ZEN": "Galarian Darmanitan (Zen Mode)",
    "MEWTWO_ARMORED": "Armored Mewtwo",
    "HOOPA_CONFINED": "Hoopa Confined",
    "HOOPA_UNBOUND": "Hoopa Unbound",
}



skippedVariants = [
    "0025", "0133", "DARMANITAN_STANDARD", "0550", "HOOPA_CONFINED"
]



# Function to fetch Pokémon data from the API
def fetch_pokemon_data():
    try:
        response = requests.get(API_URL)
        response.raise_for_status()
        return response.json()
    except requests.RequestException as e:
        print(f"Error fetching data from API: {e}")
        return []



# Function to calculate max CP using a known CP multiplier
def calc_max_cp(stats):
    cpm = 0.84029999
    attack = stats["attack"] + 15
    defense = math.sqrt(stats["defense"] + 15)
    stamina = math.sqrt(stats["stamina"] + 15)
    cp = (attack * defense * stamina * (cpm ** 2)) / 10
    return math.floor(max(10, cp))



# Function to parse move data from API response
# def parse_moves(pokemon):
#     fast_moves = [move["names"]["English"] for move in pokemon.get("quickMoves", {}).values()]
#     charged_moves = [move["names"]["English"] for move in pokemon.get("cinematicMoves", {}).values()]
#     return {"fast": fast_moves, "charged": charged_moves}



# Function to format Pokémon data
def format_pokemon_data(pokemon, is_varient):

    dex_number = pokemon["dexNr"]
    dex_id = f"{dex_number:04d}"

    name = pokemon["names"]["English"]
    name_id = pokemon["formId"]

    if name_id in specialIDs:
        name_id = specialIDs[name_id]

    if name_id in specialNames:
        name = specialNames[name_id]
    
    types = [pokemon["primaryType"]["names"]["English"].lower()]
    if pokemon.get("secondaryType"):
        types.append(pokemon["secondaryType"]["names"]["English"].lower())

    gen_number = pokemon.get("generation")

    if pokemon["stats"]:
        stats = {
            "attack": pokemon["stats"]["attack"],
            "defense": pokemon["stats"]["defense"],
            "stamina": pokemon["stats"]["stamina"]
        }
        max_cp = calc_max_cp(stats)
    else:
        stats = None
        max_cp = 0

    is_released = False
    is_shadow = False

    if is_varient:
        tags = name_id.lower().split("_")
        for i in range(1, len(tags)):
            dex_id += f"-{tagIDs[tags[i]]}" if tags[i] in tagIDs else f"-{tags[i]}"

    image_url = f"./images/sprites/gen{gen_number}/{dex_id}.png"

    return { dex_id: {
        "name": name,
        "nameID": name_id,
        "dexNum": dex_number,
        "type": types,
        "generation": gen_number,
        "stats": stats,
        "maxCP": max_cp,
        "moves": {"fast": [], "charged": []},
        "isReleased": is_released,
        "isShadow": is_shadow,
        "image": image_url,
        "forms": []
    }}



def format_mega_data(pokemon, parent):

    dex_number = parent["dexNr"]

    name = pokemon["names"]["English"]
    name_id = pokemon["id"]

    if name_id in specialIDs:
        name_id = specialIDs[name_id]

    if name_id in specialNames:
        name = specialNames[name_id]

    name_id_arr = name_id.split("_")
    if len(name_id_arr) == 2:
        dex_id = f"{dex_number:04d}-mega"
    else:
        dex_id = f"{dex_number:04d}-mega-{name_id_arr[2].lower()}"

    types = [pokemon["primaryType"]["names"]["English"].lower()]
    if pokemon.get("secondaryType"):
        types.append(pokemon["secondaryType"]["names"]["English"].lower())

    if pokemon["stats"]:
        stats = {
            "attack": pokemon["stats"]["attack"],
            "defense": pokemon["stats"]["defense"],
            "stamina": pokemon["stats"]["stamina"]
        }
        max_cp = calc_max_cp(stats)
    else:
        stats = None
        max_cp = 0

    is_released = False

    image_url = f"./images/sprites/megas/{dex_id}.png"

    return { dex_id: {
        "name": name,
        "nameID": name_id,
        "type": types,
        "stats": stats,
        "maxCP": max_cp,
        "moves": {"fast": [], "charged": []},
        "isReleased": is_released,
        "image": image_url,
        "forms": []
    }}



# Function to generate the Pokémon JSON file
def generate_pokedex():
    data = fetch_pokemon_data()
    pokedex = {}

    for pokemon in data:

        dexNr = f"{pokemon["dexNr"]:04d}"

        print(f"processing {dexNr}")

        dex_entry = format_pokemon_data(pokemon, False)

        # process megas
        if pokemon["hasMegaEvolution"]:
                
            for mega in pokemon["megaEvolutions"]:

                print(f"processing {mega}")

                mega_data = pokemon["megaEvolutions"][mega]

                mega_entry = format_mega_data(mega_data, pokemon)

                dex_entry[dexNr]["forms"].append(mega_entry)

        #process regionals and variants
        if dexNr not in skippedVariants:

            for variant in pokemon["regionForms"]:

                variant_data = pokemon["regionForms"][variant]

                if variant_data["formId"] in skippedVariants: continue

                var_entry = format_pokemon_data(variant_data, True)

                dex_entry[dexNr]["forms"].append(var_entry)
        
        

        pokedex.update(dex_entry)

    # Save structured JSON data
    with open(FILENAME, "w", encoding="utf-8") as file:
        json.dump(pokedex, file, indent=4)

    print(f"Pokédex data saved to {FILENAME}")



############################################################################################################

generate_pokedex()
