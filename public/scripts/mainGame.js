// TODO consider moving templates for Sectors, GeographicalElements, and Buildings into a separate file, perhaps a JSON file, to keep hardcoded values separate from game logic.

// VALUES DECLARE -----------------------------------------------------------
const Resources = {}
const Sectors = [];
const BaseDepletion = 10000;

let activeSector = 0;
let activeElement = null;
// VALUES DECLARE -----------------------------------------------------------


// ENUMS --------------------------------------------------------------------

// Some examples of building types.
const BuildingTypes = {
    Housing: "Housing",
    Extraction: "Extraction",
    Processing: "Processing"
}

// some example resources
const ResourceTypes = {
    Water: "Water",
    Food: "Food",
    BuildingMaterials: "Building Materials",
    Metal: "Metal",
    Chemicals: "Chemicals",
    AdvancedGoods: "Advanced Goods",
    Metamaterials: "Metamaterials"
}
// ENUMS --------------------------------------------------------------------


// TEMPLATES -----------------------------------------------------------------

// Testing templates for a Geographical Element
// View GeographicalElement() for explanation on how to create new GeographicalElements.
const GeographicalElementTemplates = {
    element_forest: [
        "element_forest",
        "Forest",
        [
            ["BuildingMaterials", 0.1]
        ],
        [
            [
                ["building_logging_site", 1],
                ["building_wood_power_plant", 1]
            ],
            ["building_forest_cabins", 1]
        ],
        2,
        "element_grassland"
    ]
}

// Testing templates for Buildings
// View Building() for explanation on how to create new Buildings
const BuildingTemplates = {
    building_logging_site: [
        "building_logging_site",
        BuildingTypes.Extraction,
        "Logging Site",
        [],
        [
            ["BuildingMaterials", 10]
        ],
        [
            ["BuildingMaterials", 10000]
        ],
        1,
        "element_forest"
    ],
    building_wood_power_plant: [
        "building_wood_power_plant",
        BuildingTypes.Extraction,
        "Wood Power Plant",
        [],
        [],
        [
            ["BuildingMaterials", 30000]
        ],
        3,
        "element_forest"
    ],
    building_forest_cabins: [
        "building_forest_cabins",
        BuildingTypes.Housing,
        "Forest Cabins",
        [],
        [],
        [
            ["BuildingMaterials", 20000]
        ],
        null,
        "element_forest"
    ],
    building_test: [
        "building_test",
        BuildingTypes.Extraction,
        "Test Building",
        [
            ["Water", 20]
        ],
        [
            ["Chemicals", 40]
        ],
        [
            ["BuildingMaterials", 1000]
        ],
        null,
        null
    ],
    building_impossible: [
        "building_impossible",
        BuildingTypes.Extraction,
        "Impossible ahh building",
        [],
        [],
        [],
        null,
        "surface_of_the_sun"
    ]
}
// TEMPLATES -----------------------------------------------------------------


// STORING ARRAYS INIT -------------------------------------------------------
for (var key in ResourceTypes) {
    Resources[key] = 0;
}

let gah = new GeographicalElement(...GeographicalElementTemplates.element_forest)
Sectors.push(new Sector("northwest_boglo", "Northwest Boglo", [
    gah,
    new GeographicalElement(...GeographicalElementTemplates.element_forest),
    new GeographicalElement(...GeographicalElementTemplates.element_forest),
    new GeographicalElement(...GeographicalElementTemplates.element_forest)
],
    [
        new Building(...BuildingTemplates.building_logging_site, gah.uuid)
    ])
)
Sectors.push(new Sector("flumpland", "Flumpland", [
    new GeographicalElement(...GeographicalElementTemplates.element_forest),
    new GeographicalElement(...GeographicalElementTemplates.element_forest),
    new GeographicalElement(...GeographicalElementTemplates.element_forest)
],
    [

    ])
)
// STORING ARRAYS INIT -------------------------------------------------------


// HELPER FUNCTIONS ----------------------------------------------------------
function getGeographicalElementById(id) {
    let returnVal = null;
    for (var sector of Sectors) {
        for (var element of sector.geographicalElements) {
            if (element.uuid == id) {
                returnVal = element;
                break;
            }
        }
        if (returnVal) {
            break
        }
    }

    return returnVal;
}

function updateResources() {
    let formattedResources = "";
    for (var key in Resources) {
        formattedResources += `${ResourceTypes[key]}: ${Resources[key].toFixed(2)} <br>`;
    }

    document.getElementById("resources").innerHTML = formattedResources;
}

function displayActiveSector() {
    let formattedInfo = "";
    let sector = Sectors[activeSector];

    formattedInfo += `Selected sector <b>${sector.name}</b><br><br>Geographical elements<br> `;

    sector.geographicalElements.forEach(element => {
        formattedInfo += `<hr><br>${element.name}, ${element.depletion == BaseDepletion ? "untouched" : `${element.depletion}/${BaseDepletion} depletion`} TEMP id: ${element.uuid}<br>`
        if (element.passiveProduction && element.passiveProduction.length) {
            formattedInfo += `Passively makes: ${element.passiveProduction.map(e => `<br>${ResourceTypes[e[0]]}, ${e[1]}/tick`).join()}<br><br>`
        }

        let hasBuildings = false;
        sector.buildings.forEach(val => {
            if (val.builtOnElement == element.uuid) {
                if (!hasBuildings) {
                    formattedInfo += "Buildings:<br>";
                    hasBuildings = true;
                }
                formattedInfo += `<hr>${val.getFormattedString()}`;
            }
        })
        if (hasBuildings) {
            formattedInfo += `<br><br>`;
        }
    })

    document.getElementById("sector_info").innerHTML = formattedInfo;
}

function displayBuildingSidebar() {
    console.log("meowa");
    if (activeElement) {
        console.log("meowb");
        let elem = getGeographicalElementById(activeElement);
        if (elem) {
            Object.values(BuildingTemplates).forEach(grah => {
                if (!grah[7] || grah[7] == elem.id) {
                    let newThing = document.createElement("p");
                    newThing.innerHTML = `Build ${grah[2]}, Costs ${grah[5]}`
                    newThing.classList = ["hud-button"];
                    document.getElementById('gluh').appendChild(newThing);
                    newThing.addEventListener('click', e => {
                        buildBuilding(grah[0], elem.uuid);
                    })
                }
            })
        }
    }
}

function buildBuilding(building_id, element_uuid) {
    Sectors.forEach(sector => {

        if (sector.geographicalElements.map(val => val.uuid).join().includes(element_uuid)) {
            let newBuilding = new Building(...BuildingTemplates[building_id], element_uuid)
            sector.buildings.push(newBuilding);
            console.log("made!");
        }
    })
}
// HELPER FUNCTIONS ----------------------------------------------------------


// TICK CONTROL --------------------------------------------------------------
const tickInterval = 100; //in milliseconds
const fastInterval = 50; //in milliseconds
let fastMode = false;
let gameInterval;

function pauseGame() {
    if (gameInterval) {
        clearInterval(gameInterval);
        gameInterval = null;
        console.log("cleared")
    }
}

function resumeGame() {
    if (!gameInterval) {
        gameInterval = setInterval(gameLoop, fastMode ? fastInterval : tickInterval);
        console.log("started ticking");
    }
}

document.getElementById('play_state').addEventListener("click", e => {
    if (gameInterval) {
        pauseGame();
    } else {
        resumeGame();
    }
})

const fastForward = document.getElementById('fast_forward');
fastForward.addEventListener("click", e => {
    fastMode = !fastMode;
    pauseGame()
    resumeGame()

    if (fastMode) {
        fastForward.style.backgroundColor = '#777';
    }
    else {
        fastForward.style.backgroundColor = '#444';
    }

})
// TICK CONTROL --------------------------------------------------------------


// GAME LOOP -----------------------------------------------------------------
function gameLoop() {
    updateResources();
    displayActiveSector();

    Sectors.forEach(sector => {
        sector.doTick();
    })
}
// GAME LOOP -----------------------------------------------------------------


// HTML EVENTS ---------------------------------------------------------------
document.getElementById('cycle_sector').addEventListener("click", e => {
    activeSector += 1;
    if (activeSector >= Sectors.length) {
        activeSector = 0;
    }
    displayActiveSector()
})

document.getElementById('update_elem').addEventListener("click", e => {
    activeElement = document.getElementById('elementInput').value;
    displayBuildingSidebar();
})
// HTML EVENTS ---------------------------------------------------------------


// ON OPEN -------------------------------------------------------------------
updateResources();
displayActiveSector();
// ON OPEN -------------------------------------------------------------------
