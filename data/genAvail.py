import csv
import urllib.request
import re

FILENAME = "./data/releasedMons.csv"
RELEASED_URL = "https://pokemongo.fandom.com/wiki/List_of_Pok%C3%A9mon"

tagIDs = {
    "Alolan": "alola",
    "Galarian": "galar",
    "Paldean": "paldea",
    "Hisuian": "hisui"
}

formIDs = {
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

with open(FILENAME, mode='w', newline='') as file:
     writer = csv.writer(file)

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

                                   if form in formIDs: entry += f"-{formIDs[form]}"
                                   else:               entry += f"-{form}"

                         writer.writerow([f"{entry}", isReleased])
                         
                         processed.append(entry)

                         if entry == "151":
                              writer.writerow([f"{entry}-armored", True])
                              processed.append(f"{entry}-armored")

     except Exception as e:
          print("Error:", e)



print("\nAll nonreleased mons:\n")
with open(FILENAME, newline="") as csvfile:
     reader = csv.reader(csvfile)

     # Iterate through each row
     for row in reader:
          if len(row) > 1 and row[1].strip() == "False":
               print(row[0])