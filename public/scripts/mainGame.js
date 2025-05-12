// VALUES DECLARE -----------------------------------------------------------
const Resources = {}
const Sectors = [];
const BaseDepletion = 10000;

let activeSector = 0;
let activeElement = null;

// ENUMS --------------------------------------------------------------------
const BuildingTypes = {
    Housing: "Housing",
    Extraction: "Extraction",
    Processing: "Processing"
}

const ResourceTypes = {
    Water: "Water",
    Food: "Food",
    BuildingMaterials: "Building Materials",
    Metal: "Metal",
    Chemicals: "Chemicals",
    AdvancedGoods: "Advanced Goods",
    Metamaterials: "Metamaterials"
}

// TEMPLATES -----------------------------------------------------------------
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

// OBJECTS -------------------------------------------------------------------
function GeographicalElement(id, name, passiveProduction, situationalBuildings, buildingBaseCapacity, depletesInto) {
    this.uuid = crypto.randomUUID(); //uuid of this element
    this.id = id; //id of this element, is seperate from uuid as multiple of the same element can inhabit a sector
    this.name = name; //display name of this element
    this.passiveProduction = passiveProduction; //array of arrays that contain a resource and production amount per tick
    this.situationalBuildings = situationalBuildings; //array of building ids that can be built. subarrays are mutually exclusive.
    this.buildingBaseCapacity = buildingBaseCapacity; //total buildings that can be made on that element.
    this.depletion = BaseDepletion; //abritrary value of how much this element can take before being depleted.
    this.depletesInto = depletesInto; //what element does this element turn into after being depleted? based on id


    this.doTick = function() {
        this.passiveProduction.forEach(val => {
            Resources[val[0]] += val[1]
        })
    }

    this.depleteBy = function(value) {
        this.depletion -= value;

        if (this.depletion <= 0) {
            //TODO: Logic for depletion
        }
    }
}

function Building(id, type, name, consumptionArray, productionArray, costArray, depletion, needsType, builtOnElement) {
    this.uuid = crypto.randomUUID(); //uuid of this element
    this.id = id; //id of this element, is seperate from uuid as multiple of the same building can inhabit an element
    this.type = type; //type of building, used for seperation into categories for build meny
    this.name = name; //display name of this element
    this.consumptionArray = consumptionArray; //array of arrays that contain a resource and amount to be used per tick
    this.productionArray = productionArray; //array of arrays that contain a resource and amount to produce per tick
    this.costArray = costArray; //array of arrays that contain what ResourceTypes to use and their amount
    this.builtOnElement = builtOnElement; //which geographical element is this building built on?

    this.doesDeplete = false; //this building does not deplete the resource of what its built on
    if (depletion) {
        this.doesDeplete = true; //nvm it does deplete 
        this.depletion = depletion; //amount to deplete by
    }

    if (needsType) {
        this.needsType = needsType;
    } 
    this.doTick = function() {
        this.productionArray.forEach(val => {
            Resources[val[0]] += val[1]
        })
        this.consumptionArray.forEach(val => {
            Resources[val[0]] -= val[1]
        })
        if (this.doesDeplete) {
            getGeographicalElementById(this.builtOnElement).depleteBy(this.depletion);
        }
    }

    this.getFormattedString = function() {
        return `${this.name}, ${this.type}
        ${Array.isArray(this.consumptionArray) && this.consumptionArray.length ? `<br>  Consumes: ${this.consumptionArray.map(e => `<br>${ResourceTypes[e[0]]}, ${e[1]}/tick`).join()}` : ""}
        ${Array.isArray(this.productionArray) && this.productionArray.length ? `<br>  Produces: ${this.productionArray.map(e => `<br>${ResourceTypes[e[0]]}, ${e[1]}/tick`).join()}` : ""}
        `
    }
    
}

function Sector(id, name, geographicalElements, buildings) {
    this.id = id;
    this.name = name;
    this.geographicalElements = geographicalElements;
    this.buildings = buildings;

    this.doTick = function() {
        this.buildings.forEach(building => {
            building.doTick();
        })

        this.geographicalElements.forEach(element => {
            element.doTick();
        })
    }
}

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
                if(!hasBuildings) {
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

// GAME LOOP -----------------------------------------------------------------
function gameLoop() {
    updateResources();
    displayActiveSector();

    Sectors.forEach(sector => {
        sector.doTick();
    })

}

// TICK CONTROL --------------------------------------------------------------
const tickInterval = 100; //in milliseconds
const fastInterval = 50; //in milliseconds
let fastMode = false;

let a = 0;
const e = document.getElementById("test");


let gameInterval;

function pause() {
    if (gameInterval) {
        clearInterval(gameInterval);
        gameInterval = null;
        console.log("cleared")
    }
}

function resume() {
    if (!gameInterval) {
        gameInterval = setInterval(gameLoop, fastMode ? fastInterval : tickInterval);
        console.log("started ticking");
    }
}

document.getElementById('play_state').addEventListener("click", e => {
    if (gameInterval) {
        pause();
    } else {
        resume();
    }
})