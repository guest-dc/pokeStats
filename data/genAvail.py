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
     "single strike": "single-strike",
     "rapid strike": "rapid-strike",
     "pom-pom" : "pompom",
     "dusk mane": "duskmane",
     "dawn wings": "dawnwings",
     "low key": "lowkey"
}

skippedVariants = [
     "0201", "0327", "0412", "0413", "0422", "0423", "0550", "0585", "0586", "0649", "0658",
     "0666", "0669", "0670", "0671", "0676", "0681", "7010", "0711", "0854", "0855", "0877",
     "0925", "0931", "0978", "0982", "0999", "1012", "1013"
]

specialAdds = {
     "0150": [{"nametag": "A", "entrytag": "armored", "released": True, "shadow": False}],
     "0421": [{"nametag": "OVERCAST", "entrytag": "overcast", "released": True, "shadow": False}],
     "0487": [{"nametag": "ALTERED", "entrytag": "altered", "released": True, "shadow": False}],
     "0492": [{"nametag": "LAND", "entrytag": "land", "released": True, "shadow": False}],
     "0555": [{"nametag": "STANDARD", "entrytag": "standard", "released": True, "shadow": True}],
     "0641": [{"nametag": "INCARNATE", "entrytag": "incarnate", "released": True, "shadow": False}],
     "0642": [{"nametag": "INCARNATE", "entrytag": "incarnate", "released": True, "shadow": False}],
     "0645": [{"nametag": "INCARNATE", "entrytag": "incarnate", "released": True, "shadow": False}],
     "0647": [{"nametag": "ORDINARY", "entrytag": "ordinary", "released": True, "shadow": False}],
     "0648": [{"nametag": "ARIA", "entrytag": "aria", "released": True, "shadow": False}],
     "0678": [{"nametag": "FEMALE", "entrytag": "female", "released": True, "shadow": False}],
     "0718": [{"nametag": "FIFTY_PERCENT", "entrytag": "50", "released": True, "shadow": False}],
     "0720": [{"nametag": "CONFINED", "entrytag": "confined", "released": True, "shadow": False}],
     "0741": [{"nametag": "BAILE", "entrytag": "baile", "released": True, "shadow": False}],
     "0745": [{"nametag": "MIDDAY", "entrytag": "midday", "released": True, "shadow": False}],
     "0746": [{"nametag": "SOLO", "entrytag": "solo", "released": True, "shadow": False}]
     #"": [{"nametag": "", "entrytag": "", "released": True, "shadow": False}]
}

print("Writing released pokemon to CSV")

# Initialized CSV file and generate released/unreleased pokemon
with open(FILENAME, mode='w', newline='') as file:
     writer = csv.writer(file)
     writer.writerow(["pokeID", "dexID", "isReleased", "hasShadow"])

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

                         rawName = re.search(r'<div class="pogo-list-item-name" id="[^"]*"><a [^>]*>(.*?)</a></div>', line)
                         rawName = rawName.group(1)

                         if '♀' in rawName:
                              rawName = rawName.strip('♀')
                              rawName = rawName.upper() + "_FEMALE"
                         elif '♂' in rawName:
                              rawName = rawName.strip('♂')
                              rawName = rawName.upper() + "_MALE"
                         elif "Mr. " in rawName:
                              rawName = rawName.strip("Mr.")
                              rawName = rawName.strip(" ")
                              rawName = "MR_" + rawName.upper()
                         elif " Jr." in rawName:
                              rawName = rawName.strip("Jr.")
                              rawName = rawName.strip(" ")
                              rawName = rawName.upper() + "_JR"
                         elif "'d" in rawName:
                              rawName = rawName.strip("'d")
                              rawName = rawName.upper() + "D"

                         name = rawName.upper()

                         if name == "HO-OH":
                              name = "HO_OH"
                         elif name == "TYPE: NULL":
                              name = "TYPE_NULL"

                         rawNumber = re.search(r'<div class="pogo-list-item-number" title="[^"]*">(.*?)</div>', line)
                         number = re.sub(r'\D', '', rawNumber.group(1))

                         entry = f"{number}"

                         # If under the varient header "Other" and varient is to be skipped...
                         if tag == "other" and number in skippedVariants:
                              continue

                         # If under a regional tag...
                         elif tag != "":
                              if tag != "other":
                                   entry += f"-{tag}"
                                   if tag == "galar":
                                        name += "_GALARIAN"
                                        
                                        if name == "DARMANITAN_GALARIAN":
                                             name += "_STANDARD"

                                   elif tag == "hisui":
                                        name += "_HISUIAN"
                                   else:
                                        name += f"_{tag.upper()}"
                              
                              rawForm = re.search(r'<div class="pogo-list-item-form" [^>]*>(.*?)</div>', line)
                              if rawForm:
                                   form = rawForm.group(1).lower()
                                   form = re.sub(r' (form|mode|forme|style|kyurem|breed)+$', '', form)

                                   if form in tagIDs:
                                        entry += f"-{tagIDs[form]}"
                                        name  += f"_{tagIDs[form].upper()}"
                                   elif form == "sunshine":
                                        entry += "-sunshine"
                                        name += "_SUNNY"
                                   elif form == "galarian zen":
                                        entry += "-galar-zen"
                                        name += "_GALARIAN_ZEN"
                                   elif form == "10%":
                                        entry += "-10"
                                        name = "ZYGARDE_TEN_PERCENT"
                                   elif form == "pa'u":
                                        entry += "-pau"
                                        name += "_PAU"
                                   else:
                                        entry += f"-{form}"
                                        name  += f"_{form.upper()}"

                         writer.writerow([f"{name}", f"{entry}", isReleased, False])
                         
                         processed.append(entry)

                         if entry in specialAdds:
                              for e in specialAdds[entry]:
                                   nametag  = e["nametag"]
                                   entrytag = e["entrytag"]
                                   released = e["released"]
                                   shadow   = e["shadow"]
                                   writer.writerow([f"{name}_{nametag}", f"{entry}-{entrytag}", released, shadow])
                                   processed.append(f"{entry}-{entrytag}")

     except Exception as e:
          print("Error:", e)


variants = {
     #gen 1
     "0128-paldea": ["combat", "blaze", "aqua"],
     "150": ["armored"],

     # gen 3
     "0351": ["sunny", "rainy", "snowy"],
     "0386": ["attack", "defense", "speed"],

     # gen 4
     "0479": ["heat", "wash", "frost", "fan", "mow"],
     "0487": ["altered", "origin"],
     "0492": ["land", "sky"],
     "0493": ["fighting", "flying", "poison", "ground", "rock", "bug", "ghost", "steel", "fire",
             "water", "grass", "electric", "psychic", "ice", "dragon", "dark", "fairy"         ],

     # gen 5
     "0550": ["red-striped", "blue-striped", "white-striped"],
     "0555": ["zen"],
     "0555-galar": ["zen"],
     "0641": ["incarnate", "therian"],
     "0642": ["incarnate", "therian"],
     "0645": ["incarnate", "therian"],
     "0646": ["black", "white"],
     "0647": ["ordinary", "resolute"],
     "0648": ["aria", "pirouette"],
     "0649": [f"drive-{d}" for d in ["shock", "burn", "chill", "douse"]],

     # gen 6
     "0678": ["male", "female"],
     "0681": ["shield", "blade"],
     "0710": ["small", "average", "large", "super"],
     "0711": ["small", "average", "large", "super"],
     "0716": ["neutral", "active"],
     "0718": ["10%", "50%", "complete"],
     "0720": ["confined", "unbound"],

     # gen 7
     "0746": ["school"],
     "0773": ["fighting", "flying", "poison", "ground", "rock", "bug", "ghost", "steel", "fire",
             "water", "grass", "electric", "psychic", "ice", "dragon", "dark", "fairy"         ],
     "0800": ["dusk mane", "dawn wings", "ultra"],

     # gen 8
     "0844": ["gulping", "gorging"],
     "0849": ["amped", "lowkey"],
     "0876": ["male", "female"],
     "0877": ["full belly", "hangry"],
     "0888": ["hero", "crowned"],
     "0889": ["hero", "crowned"],
     "0892": ["single strike", "rapid strike"],
     "0898": ["ice rider", "shadow rider"],

     # gen 9
     "0999": ["chest", "roaming"],
     "1005": ["teal mask", "wellspring mask", "hearthflame mask", "cornerstone mask"],
}

skippedShadows = ["150"]


# Iterates CSV to find input id, sets hasShadow element to true
def updateShadow(lookupID):
     with open(FILENAME, mode='r', newline='') as infile:
          reader = csv.reader(infile)
          lines = list(reader)

     for line in lines:
          if line[1] == lookupID:
               line[3] = True

     with open(FILENAME, mode='w', newline='') as outfile:
          writer = csv.writer(outfile)
          writer.writerows(lines)



# Change hasShadow values for those that have shadows
try:
     print("Updating pokemon shadows to CSV")

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
                    number = re.sub(r'\D', '', rawNumber.group(1))
                    
                    entry = f"{number}-{tag}" if tag else number

                    # change shadow variable
                    updateShadow(entry)
                    if entry in variants and entry not in skippedShadows:
                         for form in variants[entry]:
                              entry = f"{entry}-{form}"
                              updateShadow(entry)
     
     print("CSV successfully written and updated")

except Exception as e:
     print("Error:", e)