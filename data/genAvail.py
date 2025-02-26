import csv
import urllib.request
import re

FILENAME = "./data/releasedMons.csv"
RELEASED_URL = "https://pokemongo.fandom.com/wiki/List_of_Pok%C3%A9mon"
SHADOW_URL = "https://pokemongo.fandom.com/wiki/List_of_Shadow_Pok%C3%A9mon"

tagIDs = {
     "Alolan": "alola",
     "Galarian": "galar",
     "Paldean": "paldea",
     "Hisuian": "hisui",
     "combat breed": "combat",
     "blaze breed": "blaze",
     "aqua breed": "aqua",
     "galarian zen": "galar-zen",
     "single strike": "single-strike",
     "rapid strike": "rapid-strike",
     "pom-pom" : "pompom",
     "dusk mane": "duskmane",
     "dawn wings": "dawnwings",
     "low key": "lowkey"
}

skippedVariants = [
     "201", "327", "412", "413", "422", "423", "550", "585", "586", "649", "658",
     "666", "669", "670", "671", "676", "681", "710", "711", "854", "855", "877",
     "925", "931", "978", "982", "999", "1012", "1013"
]

# Initialized CSV file and generate released/unreleased pokemon
with open(FILENAME, mode='w', newline='') as file:
     writer = csv.writer(file)
     writer.writerow(["dexID", "isReleased", "hasShadow"])

     try:
          with urllib.request.urlopen(RELEASED_URL) as response:
               html = response.read().decode('utf-8')

               processed = []
               tag = ""

               for line in html.split("\n"):
                    line = line.strip()

                    # If region header reached, reset tag
                    if 'class="pogo-list-header"' in line:
                         tag = ""

                    # If varient header reached...
                    elif 'class="pogo-list-header2"' in line:
                         header = re.search(r'>(.*?)<', line).group(1).strip().split()[0]
                         if header in ["Mega", "Gigantamax"] : tag = "skip"
                         elif header in ["Other"]            : tag = "other"
                         else                                : tag = tagIDs[header]
                    
                    # If pokemon reached...
                    elif 'class="pogo-list-item' in line:

                         if tag == "skip": continue

                         isReleased = 'class="pogo-list-item greyed-out' not in line
                         rawNumber = re.search(r'<div class="pogo-list-item-number" title="[^"]*">(.*?)</div>', line)
                         number = re.sub(r'\D', '', rawNumber.group(1)).lstrip("0")
                         entry = f"{number}"

                         # If under the varient header "Other" and varient is to be skipped...
                         if tag == "other" and number in skippedVariants:
                              continue

                         # If under a regional tag...
                         elif tag != "":
                              if tag != "other":
                                   entry += f"-{tag}"
                              
                              rawForm = re.search(r'<div class="pogo-list-item-form" [^>]*>(.*?)</div>', line)
                              if rawForm:
                                   form = rawForm.group(1).lower()
                                   form = re.sub(r' (form|mode|forme|style|kyurem)+$', '', form)

                                   if form in tagIDs: entry += f"-{tagIDs[form]}"
                                   else:               entry += f"-{form}"

                         writer.writerow([f"{entry}", isReleased, False])
                         
                         processed.append(entry)

                         if entry == "150":
                              writer.writerow([f"{entry}-armored", True, False])
                              processed.append(f"{entry}-armored")

     except Exception as e:
          print("Error:", e)



# print("\nAll nonreleased mons:\n")
# with open(FILENAME, newline="") as csvfile:
#      reader = csv.reader(csvfile)

#      # Iterate through each row
#      for row in reader:
#           if len(row) > 1 and row[1].strip() == "False":
#                print(row[0])


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
     "493": ["fighting", "flying", "poison", "ground", "rock", "bug", "ghost", "steel", "fire",
             "water", "grass", "electric", "psychic", "ice", "dragon", "dark", "fairy"         ],

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
     "773": ["fighting", "flying", "poison", "ground", "rock", "bug", "ghost", "steel", "fire",
             "water", "grass", "electric", "psychic", "ice", "dragon", "dark", "fairy"         ],
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

skippedShadows = ["150"]


# Iterates CSV to find input id, sets hasShadow element to true
def updateShadow(lookupID):
     with open(FILENAME, mode='r', newline='') as infile:
          reader = csv.reader(infile)
          lines = list(reader)

     for line in lines:
          if line[0] == lookupID:
               line[2] = True

     with open(FILENAME, mode='w', newline='') as outfile:
          writer = csv.writer(outfile)
          writer.writerows(lines)



# Change hasShadow values for those that have shadows
try:
     with urllib.request.urlopen(SHADOW_URL) as response:
          html = response.read().decode('utf-8')

          tag = ""

          for line in html.split("\n"):
               line = line.strip()
               
               # If region header reached, reset tag
               if 'class="pogo-list-header"' in line:
                    tag = ""

               # If varient header reached...
               elif 'class="pogo-list-header2"' in line:
                    header = re.search(r'>(.*?)<', line).group(1).strip().split()[0]
                    tag = tagIDs[header]

               # If released shadow reached...
               elif 'class="pogo-list-item' in line and 'class="pogo-list-item greyed-out' not in line:

                    rawNumber = re.search(r'<div class="pogo-list-item-number" title="[^"]*">(.*?)</div>', line)
                    number = re.sub(r'\D', '', rawNumber.group(1)).lstrip("0")
                    entry = f"{number}-{tag}" if tag else number

                    # change shadow variable
                    updateShadow(entry)
                    if entry in variants and entry not in skippedShadows:
                         for form in variants[entry]:
                              entry = f"{entry}-{form}"
                              updateShadow(entry)

except Exception as e:
     print("Error:", e)