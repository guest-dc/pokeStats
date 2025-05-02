
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

function calcDPS0(FDmg, CDmg, FE, CE, FDur, CDur) {
     const FDPS = FDmg / FDur;
     const CDPS = CDmg / CDur;
     const FEPS = FE / FDur;
     const CEPS = CE / CDur;
     return (FDPS * CEPS + CDPS * FEPS) / (CEPS + FEPS);
}

function calcEnergyEfficiency(FDmg, CDmg, FE, CE, FDur, CDur) {
     const FDPS = FDmg / FDur;
     const CDPS = CDmg / CDur;
     const FEPS = FE / FDur;
     const CEPS = CE / CDur;
     return (CDPS - FDPS) / (CEPS + FEPS);
}

function calcComprehensiveDPS(FDmg, CDmg, FE, CE, FDur, CDur, x, y, HP) {
     const FDPS = FDmg / FDur;
     const CDPS = CDmg / CDur;
     const FEPS = FE / FDur;
     const CEPS = CE / CDur;
     const DPS0 = (FDPS * CEPS + CDPS * FEPS) / (CEPS + FEPS);
     const EE = (CDPS - FDPS) / (CEPS + FEPS);
     return DPS0 + EE * (0.5 - x / HP) * y;
}

function adjustedOneBarCEPS(CE, FE, y, CDWS, CDur) {
     const adjustedCE = CE + 0.5 * FE + 0.5 * y * CDWS;
     return adjustedCE / CDur;
}

function calculateBattleDuration(HP, y) {
     return HP / y;
}

function calculateNM(T, CE, CDur, x, HP, FDur, FE) {
     const numeratorN = T * CE + CDur * (x - 0.5 * HP);
     const numeratorM = T * FE - FDur * (x - 0.5 * HP);
     const denominator = FDur * CE + CDur * FE;

     const n = numeratorN / denominator;
     const m = numeratorM / denominator;

     return { n, m };
}

function calculateTrueDPS(FDmg, CDmg, n, m, T) {
     return (n * FDmg + m * CDmg) / T;
}

function expectedXNeutral(CE, FE) {
     return 0.5 * CE + 0.5 * FE;
}

function expectedYNeutral(Def) {
     return 900 / Def;
}

function expectedXSpecific(CE, FE, lambda, FDmgEnemy, CDmgEnemy) {
     return 0.5 * CE + 0.5 * FE + 0.5 * (lambda * FDmgEnemy + CDmgEnemy / (lambda + 1));
}

function expectedYSpecific(lambda, FDmgEnemy, CDmgEnemy, FDurEnemy, CDurEnemy) {
     return (lambda * FDmgEnemy + CDmgEnemy) / (lambda * (FDurEnemy + 2) + CDurEnemy + 2);
}

function calculateAllMoveCombosDPS(pokemon) {
     const results = [];

     const fastMoves = [
          ...Object.values(pokemon.quickMoves || {}),
          ...Object.values(pokemon.eliteQuickMoves || {})
     ];

     const chargeMoves = [
          ...Object.values(pokemon.cinematicMoves || {}),
          ...Object.values(pokemon.eliteCinematicMoves || {})
     ];

     const { stamina, defense } = pokemon.stats;
     const HP = stamina * 2;
     const Def = defense;

     const y = expectedYNeutral(Def); // enemy DPS

     for (const fast of fastMoves) {
          const fCombat = fast.combat;
          const FDmg = fCombat.power;
          const FE = fCombat.energy;
          const FDur = (fast.durationMs || 0) / 1000;
          if (FDur === 0) continue; // skip incomplete

          const FDPS = FDmg / FDur;
          const FEPS = FE / FDur;

          for (const charge of chargeMoves) {
               const cCombat = charge.combat;
               const CDmg = cCombat.power;
               const CE = -cCombat.energy; // stored as negative
               const CDur = (charge.durationMs || 0) / 1000;
               const CDWS = 1.0; // assume avg CDWS if not provided

               if (CDur === 0 || CE === 0) continue;

               // Expected x energy remaining
               const x = expectedXNeutral(CE, FE);

               const CDPS = CDmg / CDur;
               const CEPS = CE / CDur;

               // Calculate DPS0 and DPS using modular functions
               const DPS0 = calcDPS0(FDmg, CDmg, FE, CE, FDur, CDur);
               const DPS = calcComprehensiveDPS(FDmg, CDmg, FE, CE, FDur, CDur, x, y, HP);

               results.push({
                    pokemon: pokemon.formId,
                    dex: pokemon.dexNr,
                    fastMove: fast.names.English,
                    fastType: fast.type.names.English,
                    chargeMove: charge.names.English,
                    chargeType: charge.type.names.English,
                    DPS0: DPS0.toFixed(2),
                    DPS: DPS.toFixed(2)
               });
          }
     }

     return results;
}

function calculateAllMoveCombosDPS_Mega(mega, parent) {
     const results = [];

     const fastMoves = [
          ...Object.values(parent.quickMoves || {}),
          ...Object.values(parent.eliteQuickMoves || {})
     ];

     const chargeMoves = [
          ...Object.values(parent.cinematicMoves || {}),
          ...Object.values(parent.eliteCinematicMoves || {})
     ];

     const { stamina, defense } = mega.stats;
     const HP = stamina * 2;
     const Def = defense;

     const y = expectedYNeutral(Def); // enemy DPS

     for (const fast of fastMoves) {
          const fCombat = fast.combat;
          const FDmg = fCombat.power;
          const FE = fCombat.energy;
          const FDur = (fast.durationMs || 0) / 1000;
          if (FDur === 0) continue; // skip incomplete

          const FDPS = FDmg / FDur;
          const FEPS = FE / FDur;

          for (const charge of chargeMoves) {
               const cCombat = charge.combat;
               const CDmg = cCombat.power;
               const CE = -cCombat.energy; // stored as negative
               const CDur = (charge.durationMs || 0) / 1000;
               const CDWS = 1.0; // assume avg CDWS if not provided

               if (CDur === 0 || CE === 0) continue;

               // Expected x energy remaining
               const x = expectedXNeutral(CE, FE);

               const CDPS = CDmg / CDur;
               const CEPS = CE / CDur;

               // Calculate DPS0 and DPS using modular functions
               const DPS0 = calcDPS0(FDmg, CDmg, FE, CE, FDur, CDur);
               const DPS = calcComprehensiveDPS(FDmg, CDmg, FE, CE, FDur, CDur, x, y, HP);

               results.push({
                    pokemon: mega.id,
                    dex: parent.dexNr,
                    fastMove: fast.names.English,
                    fastType: fast.type.names.English,
                    chargeMove: charge.names.English,
                    chargeType: charge.type.names.English,
                    DPS0: DPS0.toFixed(2),
                    DPS: DPS.toFixed(2)
               });
          }
     }

     return results;
}

function calcMaxCP(pokemon) {
     const cpm = 0.84029999;

     const attack = pokemon.stats.attack + 15;
     const defense = Math.sqrt(pokemon.stats.defense + 15);
     const hp = Math.sqrt(pokemon.stats.stamina + 15);

     const cp = (attack * defense * hp * (cpm ** 2)) / 10;

     return Math.floor(Math.max(10, cp));
}

// ===============================================================================================
// HELPER METHODS

function shouldInclude(pokemon) {
     if (activeType) {
          const type1 = pokemon.primaryType.names.English;
          const type2 = pokemon.secondaryType ? pokemon.secondaryType.names.English : "";
          if (type1 !== activeType && type2 !== activeType) return false;
     }

     if (bestChecked && !pokemon.names.English.includes("★")) return false;

     if (megasChecked && !pokemon.hasMegaEvolution) return false;

     if (shadowsChecked && !pokemon.hasShadow) return false;

     return true;
}

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

function createRow(pokemon, combo) {
     let dexNr = pokemon.dexNr;
     let name = pokemon.names.English;

     let id = pokemon.imgID;
     let pokemonIcon = getPokemonIcon(id, pokemon.generation);
     
     let primaryType = pokemon.primaryType.names.English;
     let secondaryType = pokemon.secondaryType ? pokemon.secondaryType.names.English : "";
     let typeIcons = getTypeIcon(primaryType);
     if (secondaryType) typeIcons += getTypeIcon(secondaryType);

     //let megaIcon = pokemon.hasMegaEvolution ? getMegaIcon() : "";
     //let shadowIcon = pokemon.hasShadow ? getShadowIcon() : "";

     let maxCP = calcMaxCP(pokemon);

     let DPS0 = combo.DPS0;
     let DPS = combo.DPS;
     
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
          <td>${DPS0}</td>
          <td>${DPS}</td>
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

     let DPS0 = combo.DPS0;
     let DPS = combo.DPS;
     
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
          <td>${DPS0}</td>
          <td>${DPS}</td>
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

                    const movesetData = calculateAllMoveCombosDPS(pokemon);
                    for (const combo of movesetData) {
                         const row = createRow(pokemon, combo);
                         if (!skippedNormals.includes(pokemon.names.English)) {
                              tableBody.appendChild(row);
                         }
                    }

                    // insert regionals and variants
                    if (pokemon.regionForms && !skippedVarients.includes(pokemon.names.English)) {
                         Object.keys(pokemon.regionForms).forEach(regionKey => {

                              const variant = pokemon.regionForms[regionKey];
                              const movesetData = calculateAllMoveCombosDPS(variant);

                              if (!weirdDatabaseIncludes.includes(regionKey) && variant.isReleased) {
                                   for (const combo of movesetData) {
                                        const row = createRow(variant, combo);
                                        tableBody.appendChild(row);
                                   }
                              }
                         });
                    }

                    //insert megas
                    if (pokemon.hasMegaEvolution) {
                         Object.keys(pokemon.megaEvolutions).forEach(megaKey => {

                              const mega = pokemon.megaEvolutions[megaKey];
                              const movesetMegaData = calculateAllMoveCombosDPS_Mega(mega, pokemon);

                              if (!weirdDatabaseIncludes.includes(megaKey)) {
                                   for (const combo of movesetMegaData) {
                                        const row = createRow_Mega(mega, combo, pokemon);
                                        tableBody.appendChild(row);
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




