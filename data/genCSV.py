import csv
import urllib.request
import re

START_DEX = 1
END_DEX = 1024

SHADOW_URL = "https://pokemongo.fandom.com/wiki/List_of_Shadow_Pok%C3%A9mon"
RELEASED_URL = "https://pokemongo.fandom.com/wiki/List_of_Pok%C3%A9mon"

pokemonTypes = [
     "normal", "fighting", "flying", "poison", "ground", "rock", "bug", "ghost", "steel",
     "fire", "water", "grass", "electric", "psychic", "ice", "dragon", "dark", "fairy",
]

id_tags = {
    "Alolan": "alola",
    "Galarian": "galar",
    "Paldean": "paldea",
    "Hisuian": "hisui"
}

regional_forms = {
    "19" : ["alola"],
    "20" : ["alola"],
    "26" : ["alola"],
    "27" : ["alola"],
    "28" : ["alola"],
    "37" : ["alola"],
    "38" : ["alola"],
    "50" : ["alola"],
    "51" : ["alola"],
    "52" : ["alola", "galar"],
    "53" : ["alola"],
    "58" : ["hisui"],
    "59" : ["hisui"],
    "74" : ["alola"],
    "75" : ["alola"],
    "76" : ["alola"],
    "77" : ["galar"],
    "78" : ["galar"],
    "79" : ["galar"],
    "80" : ["galar"],
    "83" : ["galar"],
    "88" : ["alola"],
    "89" : ["alola"],
    "100": ["hisui"],
    "101": ["hisui"],
    "103": ["alola"],
    "105": ["alola"],
    "110": ["galar"],
    "122": ["galar"],
    "128": ["paldea-combat", "paldea-blaze", "paldea-aqua"],
    "144": ["galar"],
    "145": ["galar"],
    "146": ["galar"],
    "157": ["hisui"],
    "194": ["paldea"],
    "199": ["galar"],
    "211": ["hisui"],
    "215": ["hisui"],
    "222": ["galar"],
    "263": ["galar"],
    "264": ["galar"],
    "503": ["hisui"],
    "549": ["hisui"],
    "550": ["hisui"],
    "554": ["galar"],
    "555": ["galar"],
    "562": ["galar"],
    "570": ["hisui"],
    "571": ["hisui"],
    "618": ["galar"],
    "628": ["hisui"],
    "704": ["hisui"],
    "705": ["hisui"],
    "713": ["hisui"],
    "724": ["hisui"],
}

variants = {
     #gen 1
     "128-paldea": ["combat", "blaze", "aqua"],
     "150": ["armored"],

     # gen 3
     "351": ["sunny", "rainy", "snowy"],
     "386": ["attack", "defense", "speed"],

     # gen 4
     "479": ["heat", "wash", "frost", "fan", "mow"],
     "487": ["altered", "origin"],
     "492": ["land", "sky"],
     "493": [f"{pokemonTypes[t]}" for t in range(1, 18)],

     # gen 5
     "550": ["red-striped", "blue-striped", "white-striped"],
     "555": ["zen"],
     "555-galar": ["zen"],
     "641": ["incarnate", "therian"],
     "642": ["incarnate", "therian"],
     "645": ["incarnate", "therian"],
     "646": ["black", "white"],
     "647": ["ordinary", "resolute"],
     "648": ["aria", "pirouette"],
     "649": [f"drive-{d}" for d in ["shock", "burn", "chill", "douse"]],

     # gen 6
     "678": ["male", "female"],
     "681": ["shield", "blade"],
     "710": ["small", "average", "large", "super"],
     "711": ["small", "average", "large", "super"],
     "716": ["neutral", "active"],
     "718": ["10%", "50%", "complete"],
     "720": ["confined", "unbound"],

     # gen 7
     "746": ["school"],
     "773": [f"{pokemonTypes[t]}" for t in range(1, 18)],
     "800": ["dusk mane", "dawn wings", "ultra"],

     # gen 8
     "844": ["gulping", "gorging"],
     "849": ["amped", "lowkey"],
     "876": ["male", "female"],
     "877": ["full belly", "hangry"],
     "888": ["hero", "crowned"],
     "889": ["hero", "crowned"],
     "892": ["single strike", "rapid strike"],
     "898": ["ice rider", "shadow rider"],

     # gen 9
     "999": ["chest", "roaming"],
     "1005": ["teal mask", "wellspring mask", "hearthflame mask", "cornerstone mask"],
}

skippedVariants = [
     "201", "327", "412", "413", "422", "423", "550", "585", "586", "649", "658",
     "666", "669", "670", "671", "676", "681", "710", "711", "854", "855", "877",
     "925", "931", "978", "982", "999", "1012", "1013"
]

############### Generate unreleased list ###############

def get_unreleased(url):
     try:
          with urllib.request.urlopen(url) as response:
               html = response.read().decode('utf-8')

          unreleased = []
          tag = ""

          for line in html.split("\n"):
               line = line.strip()

               if 'class="pogo-list-header"' in line:
                    tag = ""

               if 'class="pogo-list-header2"' in line:
                    match = re.search(r'>(.*?)<', line)
                    if match:
                         header = match.group(1).strip().split()[0]
                         if header in ["Mega", "Gigantamax"] : tag = "skip"
                         elif header in ["Other"]            : tag = "other"
                         else                                : tag = id_tags[header]
               
               if tag == "skip": continue

               if 'class="pogo-list-item greyed-out' in line:
                    match = re.search(r'<div class="pogo-list-item-number" title="[^"]*">(.*?)</div>', line)
                    if match:
                         number = re.sub(r'\D', '', match.group(1)).lstrip("0")

                         entry = f"{number}"
                         if tag == "other":
                              if number in skippedVariants:
                                   continue
                         elif tag != "":
                              entry += f"-{tag}"

                         if entry in unreleased: continue

                         elif entry in variants:
                              for form in variants[entry]:
                                   variant_entry = f"{entry}-{form}"

                                   if variant_entry in unreleased: continue

                                   unreleased.append(f"{variant_entry}")
                                   print(variant_entry)
                         
                         # else if entry == ...
                         
                         else:
                              unreleased.append(entry)
                              print(entry)

          return unreleased

     except Exception as e:
          print("Error:", e)
          return []

unreleased = get_unreleased(RELEASED_URL)

############### Generate noShadow list ###############

def get_unreleased_shadows(url):
     try:
          with urllib.request.urlopen(url) as response:
               html = response.read().decode('utf-8')

          unreleased = []
          tag = ""

          for line in html.split("\n"):
               line = line.strip()

               if 'class="pogo-list-header"' in line:
                    tag = ""

               if 'class="pogo-list-header2"' in line:
                    match = re.search(r'>(.*?)<', line)
                    if match:
                         header = match.group(1).strip().split()[0]
                         tag = id_tags[header]

               if 'class="pogo-list-item greyed-out' in line:
                    match = re.search(r'<div class="pogo-list-item-number" title="[^"]*">(.*?)</div>', line)
                    if match:
                         number = re.sub(r'\D', '', match.group(1)).lstrip("0")
                         entry = f"{number}-{tag}" if tag else number

                         if entry == "128-paldea":
                              for form in regional_forms[number]:
                                   entry = f"{number}-{form}"
                                   unreleased.append(entry)
                         
                         # else if entry == ...
                         
                         else:
                              unreleased.append(entry)

          return unreleased

     except Exception as e:
          print("Error:", e)
          return []

unreleasedShadows = get_unreleased_shadows(SHADOW_URL)

#################### Write to CSV ####################

# Write to CSV file
CSV_FILENAME = "./data/availability.csv"
with open(CSV_FILENAME, mode='w', newline='') as file:
     writer = csv.writer(file)
     writer.writerow(["DexID", "isReleased", "hasShadow"])

     for dexNum in range(1, END_DEX + 1):

          # Write normal forms
          dexID = str(dexNum)
          isReleased = dexID not in unreleased
          hasShadow  = dexID not in unreleasedShadows
          writer.writerow([f"{dexID}", isReleased, hasShadow])

          # Write Regional Forms
          if dexID in regional_forms:
               for region in regional_forms[dexID]:
                    regional_dexID = f"{dexID}-{region}"
                    isReleased = regional_dexID not in unreleased
                    hasShadow  = regional_dexID not in unreleasedShadows

                    writer.writerow([f"{regional_dexID}", isReleased, hasShadow])
          
          # Write Variant Forms
          if dexID in variants:
               for variant in variants[dexID]:
                    variant_dexID = f"{dexID}-{variant}"
                    isReleased = regional_dexID not in unreleased
                    hasShadow  = regional_dexID not in unreleasedShadows

                    writer.writerow([f"{variant_dexID}", isReleased, hasShadow])