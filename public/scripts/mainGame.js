// VALUES DECLARE -----------------------------------------------------------
const Resources = {}
const Sectors = [];
const BaseDepletion = 10000;

let activeSector = 0;
let activeElement = null;

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

// OBJECTS -------------------------------------------------------------------

// JSON template for creating a GeographicalElement:
// [
//     "id",    -- the internal name of this GE. (What the developer sees)
//     "name",  -- the external name of this GE. (What the player sees)
//     [                                    -- passiveProduction array of resources.
//         ["Resource", productionAmount]   -- the resourcetype and it's production amount per tick. 
//     ],
//     [                                        -- situationalBuildings, array of arrays.
//         [                                    -- The types of buildings that can be built on this GE.
//             ["building_id_1", max_amount],   -- since these groups are mutually exclusive (XOR), in this example 
//             ["building_id_2", max_amount]    -- if you built a building_id_3, you would be locked out of building any
//         ],                                   -- of IDs, 1 or 2. The IDs in this case being the internal names of that 
//         ["building_id_3", max_amount]        -- particular building. max_amount being the maximum amount of that building
//     ],                                       -- you can build on this GE.
//     buildingBaseCapacity,    -- The total buildings you can have built at a time on this GE
//     "depletesInto"   -- The ID (Internal name) of the GE that this turns into upon resource depletion.
// ]
function GeographicalElement(id, name, passiveProduction, situationalBuildings, buildingBaseCapacity, depletesInto) {
    this.uuid = crypto.randomUUID(); //uuid of this element
    this.id = id; //id of this element, is seperate from uuid as multiple of the same element can inhabit a sector
    this.name = name; //display name of this element
    this.passiveProduction = passiveProduction; //array of arrays that contain a resource and production amount per tick
    this.situationalBuildings = situationalBuildings; //array of building ids that can be built. subarrays are mutually exclusive.
    this.buildingBaseCapacity = buildingBaseCapacity; //total buildings that can be made on that element.
    this.depletion = BaseDepletion; //abritrary value of how much this element can take before being depleted.
    this.depletesInto = depletesInto; //what element does this element turn into after being depleted? based on id

    // Whenever this GeographicalElement is called to do a tick,
    // run through every resource that this GE has in passiveProduction 
    // and increment by some set value
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

// JSON template for creating a Building:
// [
//     "id",    -- internal name of this Building (what the developer sees)
//     BuildingTypes.Foo,   -- the type of production that this Building does.
//     "name",  -- External name of this Building (what the player sees)
//     [                                    -- consumptionArray
//         ["resource", amount_per_tick]    -- resources used up per tick
//     ],
//     [                                    -- productionArray
//         ["resource", amount_per_tick]    -- resources produced per tick
//     ],
//     [                        -- costArray
//         ["resource", cost]   -- resources and their cost needed to build this Building
//     ],
//     depletion,   -- the amount of the parent GeographicalElement's resource that this Building
//                  -- depletes per tick (depletion/tick). Can be null, but must be present.
//     "needsType", -- the ID (internal name) of the GE that this building can be built on.
//     builtOnElement   -- the UUID of the GE that this Building is built on.
//                      -- This is left out of the JSON internally since UUIDs change each session.
// ]
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

// JSON Template for creating a sector
// [
//     "id",    -- The internal name for this sector (what the developer sees)
//     "name",  -- the external name for this sector (what the player sees)
//     [
//         exampleGeographicalElement,      -- geographicalElements array.
//         exampleGeographicalElement       -- an array of GE objects tied to this sector. 
//     ],
//     [
//             exampleBuilding, -- buildings array
//             exampleBuilding  -- a list of Building objects tied to this sector.
//     ]
// ]
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

function buildBuilding(building_id, element_uuid) {
    Sectors.forEach(sector => {
    
        if (sector.geographicalElements.map(val => val.uuid).join().includes(element_uuid)) {
            let newBuilding = new Building(...BuildingTemplates[building_id], element_uuid)
            sector.buildings.push(newBuilding);
            console.log("made!");
        }
    })
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

const fastForward = document.getElementById('fast_forward');
fastForward.addEventListener("click", e => {
    fastMode = !fastMode;
    pause()
    resume()

    if (fastMode) {
        fastForward.style.backgroundColor = '#777';
    }
    else {
        fastForward.style.backgroundColor = '#444';
    }

})

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

// ON OPEN -------------------------------------------------------------------
updateResources();
displayActiveSector();