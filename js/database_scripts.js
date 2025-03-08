
skippedVarients = [
     "Pikachu", "Eevee",
     "Espeon", "Umbreon", "Entei", "Raikou", "Suicune", "Lugia", "Ho-Oh",
     "Latios", "Latias", "Burmy", "Wormadam", "Cherrim",
     "Shellos", "Gastrodon",
     "Basculin", "Deerling", "Sawsbuck", "Frillish", "Jellicent",
     "Scatterbug", "Spewpa", "Vivillon", "Flabebe", "Floette", "Florges", "Furfrou",
     "Pumpkaboo", "Gourgeist",
     "Rockruff", "Minior", "Mimikyu", "Magearna",
     "Sinistea", "Polteageist", "Morpeko", "Eternatus",
     "Oikologne", "Maushold", "Squawkabilly", "Tatsugiri", "Dudunsparce", "Koraidon", "Miraidon"]

function getPokemonIcon(id, gen) {
     return `<img src="/images/sprites/gen${gen}/${id}_icon.png" class="pokemon-icon" alt="${id}">`;
}

function getTypeIcon(typeName) {
     return `<img src="/images/icons/types/${typeName.toLowerCase()}_icon.png" alt="${typeName}">`;
}

function getMegaIcon() {
     return `<img src="/images/icons/mega_icon.png" class="mega-icon" alt="mega">`;
}

fetch('/data/database.json')
     .then(response => response.json())
     .then(data => {
          let tableBody = document.getElementById('pokemon-table-body');
          tableBody.innerHTML = '';

          let filteredData = data.filter(pokemon => pokemon.assetForms && pokemon.stats && pokemon.assetForms.length > 0);

          filteredData.forEach(pokemon => {
               // format pokemon cell
               let icon = "";
               let poke_name = pokemon.names.English;
               
               // format typing cell
               let primaryType = pokemon.primaryType.names.English;
               let secondaryType = pokemon.secondaryType ? pokemon.secondaryType.names.English : "";

               let typeIcons = getTypeIcon(primaryType);
               if (secondaryType) typeIcons += getTypeIcon(secondaryType);

               let megaIcon = pokemon.hasMegaEvolution ? getMegaIcon() : "";

               let row = `
                    <tr>
                         <td>${pokemon.dexNr}</td>
                         <td class="pokemon-container">${poke_name}</td>
                         <td class="type-icons">${typeIcons}</td>
                         <td>${megaIcon}</td>
                         <td></td>
                    </tr>
               `;
               tableBody.innerHTML += row;

               // insert regionals
               if (pokemon.regionForms && !skippedVarients.includes(poke_name)) {
                    Object.keys(pokemon.regionForms).forEach(regionKey => {
                         let regional = pokemon.regionForms[regionKey];

                         let poke_name = regional.names.English;
                         
                         // format typing cell
                         let primaryType = regional.primaryType.names.English;
                         let secondaryType = regional.secondaryType ? regional.secondaryType.names.English : "";

                         let typeIcons = getTypeIcon(primaryType);
                         if (secondaryType) typeIcons += getTypeIcon(secondaryType);

                         let megaIcon = regional.hasMegaEvolution ? getMegaIcon() : "";

                         let row = `
                              <tr>
                                   <td>${regional.dexNr}</td>
                                   <td class="pokemon-container">${poke_name}</td>
                                   <td class="type-icons">${typeIcons}</td>
                                   <td>${megaIcon}</td>
                                   <td></td>
                              </tr>
                         `;
                         tableBody.innerHTML += row;
                    });
               }
          });

          if (filteredData.length === 0) {
               tableBody.innerHTML = '<tr><td colspan="3">No Pokémon found.</td></tr>';
          }
     })
     .catch(error => {
          console.error('Error fetching Pokémon:', error);
          document.getElementById('pokemon-table-body').innerHTML = '<tr><td colspan="3">Failed to load data</td></tr>';
     });