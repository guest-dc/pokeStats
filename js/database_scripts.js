
const COL_SPAN = 5;


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
     "Oikologne", "Maushold", "Squawkabilly", "Tatsugiri", "Dudunsparce", "Koraidon", "Miraidon"
]

function getPokemonIcon(id, gen) {
     return `<img src="/images/sprites/gen${gen}/${id}_icon.png" class="pokemon-icon" alt="${id}">`;
}

function getTypeIcon(typeName) {
     return `<img src="/images/icons/types/${typeName.toLowerCase()}_icon.png" alt="${typeName}">`;
}

function getMegaIcon() {
     return `<img src="/images/icons/mega_icon.png" class="mega-icon" alt="mega">`;
}

function getShadowIcon() {
     return `<img src="/images/icons/shadow_icon.png" class="shadow-icon" alt="shadow">`;
}

function createRow(pokemon) {
     let dexNr = pokemon.dexNr;
     let name = pokemon.names.English;
     
     let primaryType = pokemon.primaryType.names.English;
     let secondaryType = pokemon.secondaryType ? pokemon.secondaryType.names.English : "";
     let typeIcons = getTypeIcon(primaryType);
     if (secondaryType) typeIcons += getTypeIcon(secondaryType);

     let megaIcon = pokemon.hasMegaEvolution ? getMegaIcon() : "";
     let shadowIcon = pokemon.hasShadow ? getShadowIcon() : "";

     let row = document.createElement("tr");
     row.innerHTML = `
          <td>${dexNr}</td>
          <td>${name}</td>
          <td id="type-icons">${typeIcons}</td>
          <td id="mega-icon">${megaIcon}</td>
          <td id="shadow-icon">${shadowIcon}</td>
     `;
     return row;
}

function fetchDataAndRender() {
     return new Promise((resolve, reject) => {
          fetch('/data/database.json')
          .then(response => response.json())
          .then(data => {
               const tableBody = document.querySelector('#databaseTable tbody');
               tableBody.innerHTML = '';     // Clear existing rows

               data = data.filter(pokemon => pokemon.isReleased);

               for (const pokeData in data) {
                    
                    // insert pokemon
                    const pokemon = data[pokeData];
                    const row = createRow(pokemon);
                    tableBody.appendChild(row);

                    // insert regionals and varients
                    if (pokemon.regionForms && !skippedVarients.includes(pokemon.names.English)) {
                         Object.keys(pokemon.regionForms).forEach(regionKey => {
                              const regional = pokemon.regionForms[regionKey];
                              const row = createRow(regional);
                              tableBody.appendChild(row);
                         });
                    }
               }

               if (data.length === 0) {
                    tableBody.innerHTML = `<tr><td colspan="${COL_SPAN}">No Pokémon found.</td></tr>`;
               }
               resolve();
          })
          .catch(error => {
               console.error('Error fetching Pokémon: ', error);
               reject(error);
          });
     });
}



$(document).ready(function() {

     function renderTable() {
          fetchDataAndRender().then(function() {
               var table = $('#databaseTable').DataTable();
         
               table.clear().draw();
         
               // Re-populate DataTable with updated data
               fetchDataAndRender().then(function() {
                 table.rows.add($('#databaseTable tbody tr')).draw();
               });
         
          }).catch(function(error) {
               console.error('Error rendering table:', error);
          });
     }

     // Initial rendering
     renderTable();

});