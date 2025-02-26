import csv
import urllib.request
import re

FILENAME = "./data/releasedMons.csv"
RELEASED_URL = "https://pokemongo.fandom.com/wiki/List_of_Pok%C3%A9mon"

tagIds = {
    "Alolan": "alola",
    "Galarian": "galar",
    "Paldean": "paldea",
    "Hisuian": "hisui"
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
                         else                                : tag = tagIds[header]
                    
                    # If pokemon reached...
                    elif 'class="pogo-list-item' in line:

                         if tag == "skip": continue

                         match = re.search(r'<div class="pogo-list-item-number" title="[^"]*">(.*?)</div>', line)

                         isReleased = 'class="pogo-list-item greyed-out' not in line
                         number = re.sub(r'\D', '', match.group(1)).lstrip("0")
                         entry = f"{number}"

                         # If under the varient header "Other" and varient is to be skipped...
                         if tag == "other" and number in skippedVariants:
                              continue

                         # If under a regional tag...
                         elif tag != "":
                              entry += f"-{tag}"

                         # implement the addition of forms to tags here

                         writer.writerow([f"{entry}", isReleased])
                         
                         processed.append(entry)
                         #print(f"processed {entry}")

     except Exception as e:
          print("Error:", e)



print("\nAll nonreleased mons:\n")
with open(FILENAME, newline="") as csvfile:
     reader = csv.reader(csvfile)

     # Iterate through each row
     for row in reader:
          if len(row) > 1 and row[1].strip() == "False":
               print(row[0])