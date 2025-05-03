
// ===============================================================================================
// GLOBALS

let activeType = null;
let bestChecked = false;
let sameMoveChecked = false;
let shadowsChecked = false;
let megasChecked = false;

const COL_SPAN = 5;

skippedNormals = [
     "Cherrim", "Giratina", "Shaymin", "Darmanitan", "Tornadus", "Thundurus", "Landorus", "Keldeo", "Meloetta", "Zygarde", "Hoopa", "Oricorio", "Lycanroc", "Wishiwashi"
]

skippedVarients = [
     "Pikachu", "Eevee",
     "Espeon", "Umbreon", "Unown", "Entei", "Raikou", "Suicune", "Lugia", "Ho-Oh",
     "Latios", "Latias", "Burmy", "Wormadam", "Spinda",
     "Shellos", "Gastrodon",
     "Basculin", "Deerling", "Sawsbuck", "Frillish", "Jellicent",
     "Scatterbug", "Spewpa", "Vivillon", "Flabebe", "Floette", "Florges", "Furfrou",
     "Pumpkaboo", "Gourgeist",
     "Rockruff", "Minior", "Mimikyu", "Magearna",
     "Sinistea", "Polteageist", "Morpeko", "Eternatus",
     "Oikologne", "Maushold", "Squawkabilly", "Tatsugiri", "Dudunsparce", "Koraidon", "Miraidon"
]

weirdDatabaseIncludes = [
     "ZYGARDE_COMPLETE_TEN_PERCENT", "ZYGARDE_COMPLETE_FIFTY_PERCENT"
]

// ===============================================================================================
// Formula METHODS

function calcMaxCP(pokemon) {
     const cpm = 0.84029999;
     const attack = pokemon.stats.attack + 15;
     const defense = Math.sqrt(pokemon.stats.defense + 15);
     const hp = Math.sqrt(pokemon.stats.stamina + 15);
     const cp = (attack * defense * hp * (cpm ** 2)) / 10;
     return Math.floor(Math.max(10, cp));
}

function calcAllMoveComboDPS(pokemon, isShadow) {
     const results = [];

     const fastMoves = [
          ...Object.values(pokemon.quickMoves || {}),
          ...Object.values(pokemon.eliteQuickMoves || {})
     ];
     const chargeMoves = [
          ...Object.values(pokemon.cinematicMoves || {}),
          ...Object.values(pokemon.eliteCinematicMoves || {})
     ];

     const DMG_multiA = 0.5;
     const DMG_Const  = 1.0;
     const EnergyPerHPLost = 0.5;

     const pokemonType1 = pokemon.primaryType.names.English;
     const pokemonType2 = pokemon.secondaryType ? pokemon.secondaryType.names.English : "";

     const HP = pokemon.stats.stamina;
     const Atk = pokemon.stats.attack; 
     const Def = pokemon.stats.defense;

     const Sh_atk_multi = isShadow ? 1.2 : 1.0;
     const Sh_def_multi = isShadow ? 0.83 : 1.0;

     const BossDef = 160;
     const BossDPS = 1900 / (Def * Sh_def_multi);

     for (const fast of fastMoves) {

          const fastType = fast.type.names.English;
          const F_multi = (pokemonType1 == fastType || pokemonType2 == fastType) ? 1.2 : 1.0;

          const F_DmgBase = fast.power * Sh_atk_multi * F_multi * DMG_multiA;
          const FDmg = Math.floor(F_DmgBase * Atk / BossDef) + DMG_Const;
          const F_DPS = FDmg / (fast.durationMs / 1000); // waived server delay integration
          const F_EPS = fast.energy / (fast.durationMs / 1000);

          for (const charge of chargeMoves) {

               const chargeType = charge.type.names.English;

               const C_multi = (pokemonType1 == chargeType || pokemonType2 == chargeType) ? 1.2 : 1.0;

               const C_DmgBase = charge.power * Sh_atk_multi * C_multi * DMG_multiA;
               const CDmg = Math.floor(C_DmgBase * Atk / BossDef) + DMG_Const;
               const C_DPS = CDmg / (charge.durationMs / 1000); // waived server delay & waived player charged move cast time integration

               const C_EPS = -charge.energy / (fast.durationMs / 1000);
               //const CDWS = 1.0; // assume avg CDWS, not provided in API
               //const C_EPSθ = (-charge.energy == 100) ? 0.5 * fast.energy + (0.5 * BossDPS) * CDWS : 0.0;

               const DPS_Cycle = (F_DPS * C_EPS + C_DPS * F_EPS) / (F_EPS + C_EPS);
               const EnergyLeft = 0.5 * fast.energy + 0.5 * -charge.energy;
               const DPS_Comp = (F_DPS > C_DPS) ? DPS_Cycle : Math.max(0, DPS_Cycle + ((C_DPS - F_DPS) / (C_EPS + F_EPS) * (EnergyPerHPLost - (EnergyLeft / HP)) * BossDPS));
               const DPS_Max = Math.max(F_DPS, DPS_Comp);
               const TDO = HP / BossDPS * DPS_Max;

               results.push({
                    pokemon: pokemon.formId,
                    dex: pokemon.dexNr,
                    fastMove: fast.names.English,
                    fastType: fast.type.names.English,
                    chargeMove: charge.names.English,
                    chargeType: charge.type.names.English,
                    DPS: DPS_Comp.toFixed(2),
                    TDO: TDO.toFixed(2)
               });
          }
     }

     return results;
}

function calcAllMoveComboDPS_Mega(mega, parent) {
     const results = [];

     const fastMoves = [
          ...Object.values(parent.quickMoves || {}),
          ...Object.values(parent.eliteQuickMoves || {})
     ];
     const chargeMoves = [
          ...Object.values(parent.cinematicMoves || {}),
          ...Object.values(parent.eliteCinematicMoves || {})
     ];

     const DMG_multiA = 0.5;
     const DMG_Const  = 1.0;
     const EnergyPerHPLost = 0.5;

     const pokemonType1 = mega.primaryType.names.English;
     const pokemonType2 = mega.secondaryType ? mega.secondaryType.names.English : "";

     const HP  = mega.stats.stamina;
     const Atk = mega.stats.attack; 
     const Def = mega.stats.defense;

     const Sh_atk_multi = 1.0;
     const Sh_def_multi = 1.0;

     const BossDef = 160;
     const BossDPS = 2200 / (Def * Sh_def_multi);

     for (const fast of fastMoves) {

          const fastType = fast.type.names.English;
          const F_multi = (pokemonType1 == fastType || pokemonType2 == fastType) ? 1.2 : 1.0;

          const F_DmgBase = fast.power * Sh_atk_multi * F_multi * DMG_multiA;
          const FDmg = Math.floor(F_DmgBase * Atk / BossDef) + DMG_Const;
          const F_DPS = FDmg / (fast.durationMs / 1000); // waived server delay integration
          const F_EPS = fast.energy / (fast.durationMs / 1000);

          for (const charge of chargeMoves) {

               const chargeType = charge.type.names.English;

               const C_multi = (pokemonType1 == chargeType || pokemonType2 == chargeType) ? 1.2 : 1.0;

               const C_DmgBase = charge.power * Sh_atk_multi * C_multi * DMG_multiA;
               const CDmg = Math.floor(C_DmgBase * Atk / BossDef) + DMG_Const;
               const C_DPS = CDmg / (charge.durationMs / 1000); // waived server delay & waived player charged move cast time integration

               const C_EPS = -charge.energy / (fast.durationMs / 1000);
               //const CDWS = 1.0; // assume avg CDWS, not provided in API
               //const C_EPSθ = (-charge.energy == 100) ? 0.5 * fast.energy + (0.5 * BossDPS) * CDWS : 0.0;

               const DPS_Cycle = (F_DPS * C_EPS + C_DPS * F_EPS) / (F_EPS + C_EPS);
               const EnergyLeft = 0.5 * fast.energy + 0.5 * -charge.energy;
               const DPS_Comp = (F_DPS > C_DPS) ? DPS_Cycle : Math.max(0, DPS_Cycle + ((C_DPS - F_DPS) / (C_EPS + F_EPS) * (EnergyPerHPLost - (EnergyLeft / HP)) * BossDPS));
               const DPS_Max = Math.max(F_DPS, DPS_Comp);
               const TDO = HP / BossDPS * DPS_Max;

               results.push({
                    pokemon: mega.id,
                    dex: parent.dexNr,
                    fastMove: fast.names.English,
                    fastType: fast.type.names.English,
                    chargeMove: charge.names.English,
                    chargeType: charge.type.names.English,
                    DPS: DPS_Comp.toFixed(2),
                    TDO: TDO.toFixed(2)
               });
          }
     }

     return results;
}

// ===============================================================================================
// HELPER METHODS

// function shouldInclude(pokemon) {
//      if (activeType) {
//           const type1 = pokemon.primaryType.names.English;
//           const type2 = pokemon.secondaryType ? pokemon.secondaryType.names.English : "";
//           if (type1 !== activeType && type2 !== activeType) return false;
//      }

//      if (bestChecked && !pokemon.names.English.includes("★")) return false;

//      if (megasChecked && !pokemon.hasMegaEvolution) return false;

//      if (shadowsChecked && !pokemon.hasShadow) return false;

//      return true;
// }

function getPokemonIcon(id, gen) {
     return `<img src="images/sprites/gen${gen}/${id}.png" class="pokemon-icon" alt="${id}">`;
}

function getTypeIcon(typeName) {
     return `<img src="images/icons/types/${typeName.toLowerCase()}_icon.png" alt="${typeName}">`;
}

function getMegaIcon(parent, id) {
     let dexNr = parent.imgID;
     return `<img src="images/sprites/megas/${dexNr}${id}.png" class="mega-icon" alt="mega">`;
}

function getShadowIcon() {
     return `<img src="images/icons/shadow_icon.png" class="shadow-icon" alt="shadow">`;
}

function formatMegaTag(formId) {
     if (formId.includes("MEGA")) {
          const parts = formId.split("_");
          const suffix = parts.slice(2).join("-").toLowerCase();
          return suffix ? `-mega-${suffix}` : `-mega`;
     } else if (formId.includes("PRIMAL")) {
          return `-mega`;
     } else {
          return "";
     }
}

// ===============================================================================================
// TABLE GENERATION

function createRow(pokemon, combo, isShadow) {
     let dexNr = pokemon.dexNr;
     let name = pokemon.names.English;
     if (isShadow) name += " (Shadow)"

     let id = pokemon.imgID;
     let pokemonIcon = getPokemonIcon(id, pokemon.generation);
     
     let primaryType = pokemon.primaryType.names.English;
     let secondaryType = pokemon.secondaryType ? pokemon.secondaryType.names.English : "";
     let typeIcons = getTypeIcon(primaryType);
     if (secondaryType) typeIcons += getTypeIcon(secondaryType);

     let maxCP = calcMaxCP(pokemon);

     let DPS = combo.DPS;
     let TDO = combo.TDO;
     
     let fastMove = combo.fastMove;
     let fastMoveIcon = getTypeIcon(combo.fastType);

     let chargeMove = combo.chargeMove;
     let chargeMoveIcon = getTypeIcon(combo.chargeType);

     let row = document.createElement("tr");
     row.innerHTML = `
          <td>${dexNr}</td>
          <td>${pokemonIcon} ${name}</td>
          <td id="type-icons">${typeIcons}</td>
          <td id="move-icons">${fastMoveIcon}  ${fastMove}</td>
          <td id="move-icons">${chargeMoveIcon}  ${chargeMove}</td>
          <td>${DPS}</td>
          <td>${TDO}</td>
          <td>${maxCP}</td>
     `;
     return row;
}

function createRow_Mega(mega, combo, parent) {
     let name = mega.names.English;
     let dexNr = parent.dexNr;
     let id = formatMegaTag(mega.id);

     let megaIcon = getMegaIcon(parent, id);
     
     let primaryType = mega.primaryType.names.English;
     let secondaryType = mega.secondaryType ? mega.secondaryType.names.English : "";
     let typeIcons = getTypeIcon(primaryType);
     if (secondaryType) typeIcons += getTypeIcon(secondaryType);

     let maxCP = calcMaxCP(mega);

     let DPS = combo.DPS;
     let TDO = combo.TDO;
     
     let fastMove = combo.fastMove;
     let fastMoveIcon = getTypeIcon(combo.fastType);

     let chargeMove = combo.chargeMove;
     let chargeMoveIcon = getTypeIcon(combo.chargeType);

     let row = document.createElement("tr");
     row.innerHTML = `
          <td>${dexNr}</td>
          <td>${megaIcon} ${name}</td>
          <td id="type-icons">${typeIcons}</td>
          <td id="move-icons">${fastMoveIcon}  ${fastMove}</td>
          <td id="move-icons">${chargeMoveIcon}  ${chargeMove}</td>
          <td>${DPS}</td>
          <td>${TDO}</td>
          <td>${maxCP}</td>
     `;
     
     return row;
}

function fetchDataAndRender() {
     return new Promise((resolve, reject) => {
          fetch("data/database.json")
          .then(response => response.json())
          .then(data => {
               const tableBody = document.querySelector("#dmgTable tbody");
               tableBody.innerHTML = '';

               // Only include released pokemon
               data = data.filter(pokemon => pokemon.isReleased);

               for (const pokeData in data) {
                    const pokemon = data[pokeData];

                    const primaryType = pokemon.primaryType.names.English;
                    const secondaryType = pokemon.secondaryType ? pokemon.secondaryType.names.English : "";
                    
                    if (activeType == null || activeType == primaryType || activeType == secondaryType) {
                         const movesetData = calcAllMoveComboDPS(pokemon, false);
                         for (const combo of movesetData) {
                              const row = createRow(pokemon, combo, false);
                              if (!skippedNormals.includes(pokemon.names.English)) {
                                   tableBody.appendChild(row);
                              }
                         }

                         // insert shadows
                         if (pokemon.hasShadow) {
                              const movesetData = calcAllMoveComboDPS(pokemon, true);
                              for (const combo of movesetData) {
                                   const row = createRow(pokemon, combo, true);
                                   if (!skippedNormals.includes(pokemon.names.English)) {
                                        tableBody.appendChild(row);
                                   }
                              }
                         }
                    }

                    // insert regionals and variants
                    if (pokemon.regionForms && !skippedVarients.includes(pokemon.names.English)) {
                         Object.keys(pokemon.regionForms).forEach(regionKey => {

                              const variant = pokemon.regionForms[regionKey];
                              const movesetData = calcAllMoveComboDPS(variant, false);

                              const primaryType = variant.primaryType.names.English;
                              const secondaryType = variant.secondaryType ? variant.secondaryType.names.English : "";

                              if (activeType == null || activeType == primaryType || activeType == secondaryType) {

                                   if (!weirdDatabaseIncludes.includes(regionKey) && variant.isReleased) {
                                        for (const combo of movesetData) {
                                             const row = createRow(variant, combo, false);
                                             tableBody.appendChild(row);
                                        }

                                        // insert shadows
                                        if (variant.hasShadow) {
                                             const movesetData = calcAllMoveComboDPS(variant, true);
                                             for (const combo of movesetData) {
                                                  const row = createRow(variant, combo, true);
                                                  if (!skippedNormals.includes(variant.names.English)) {
                                                       tableBody.appendChild(row);
                                                  }
                                             }
                                        }
                                   }
                              }
                         });
                    }

                    // insert megas
                    if (pokemon.hasMegaEvolution) {
                         Object.keys(pokemon.megaEvolutions).forEach(megaKey => {

                              const mega = pokemon.megaEvolutions[megaKey];
                              const movesetMegaData = calcAllMoveComboDPS_Mega(mega, pokemon);

                              const primaryType = mega.primaryType.names.English;
                              const secondaryType = mega.secondaryType ? mega.secondaryType.names.English : "";

                              if (activeType == null || activeType == primaryType || activeType == secondaryType) {

                                   if (!weirdDatabaseIncludes.includes(megaKey)) {
                                        for (const combo of movesetMegaData) {
                                             const row = createRow_Mega(mega, combo, pokemon);
                                             tableBody.appendChild(row);
                                        }
                                   }
                              }
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

// ===============================================================================================
// TABLE & BUTTON RENDERING

function renderTable() {
     fetchDataAndRender().then(function() {
          const table = $('#dmgTable').DataTable();
          table.clear().draw();

          fetchDataAndRender().then(function() {
               table.rows.add($('#dmgTable tbody tr')).draw();
               setupFilterButtons(table);
          });

     }).catch(function(error) {
          console.error('Error rendering table:', error);
     });
}

function setupFilterButtons(table) {
     $('.type-toggle').off('click').on('click', function () {
          const type = $(this).data('type');

          if (activeType === type) {
               activeType = null;
               $('.type-toggle').removeClass('active-toggle');
          } else {
               activeType = type;
               $('.type-toggle').removeClass('active-toggle');
               $(this).addClass('active-toggle');
          }
          renderTable()
     });

     $('#best-checkbox').off('change').on('change', function () {
          bestChecked = this.checked;
          renderTable()
     });

     $('#same-type-checkbox').off('change').on('change', function () {
          sameMoveChecked = this.checked;
          renderTable()
     });

     $('#shadow-checkbox').off('change').on('change', function () {
          shadowsChecked = this.checked;
          renderTable()
     });

     $('#mega-checkbox').off('change').on('change', function () {
          megasChecked = this.checked;
          renderTable()
     });
}

// ===============================================================================================
// RENDER EXECUTION 


$(document).ready(function() {
     renderTable();
});




