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
        "A forested landscape rife with trees. A few clearings exist for buildings, but otherwise quite forested.",
        [
            new GenericTypeValue("BuildingMaterials", 0.1)
        ],
        [
            [
                new GenericTypeValue("building_logging_site", 1),
                new GenericTypeValue("building_wood_power_plant", 1)
            ],
            new GenericTypeValue("building_forest_cabins", 1)
        ],
        2,
        0,
        10000,
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
        "A dedicated area in which trees are harvested for building materials.",
        [],
        [
            new GenericTypeValue("BuildingMaterials", 10)
        ],
        [
            new GenericTypeValue("BuildingMaterials", 10000)
        ],
        1
    ],
    building_wood_power_plant: [
        "building_wood_power_plant",
        BuildingTypes.Extraction,
        "Wood Power Plant",
        "A simplistic power plant that burns wood to turn a turbine, generating power.",
        [],
        [],
        [
            new GenericTypeValue("BuildingMaterials", 30000)
        ],
        3
    ],
    building_forest_cabins: [
        "building_forest_cabins",
        BuildingTypes.Housing,
        "Forest Cabins",
        "A forest cabin for a few lucky people.",
        [],
        [],
        [
            new GenericTypeValue("BuildingMaterials", 20000)
        ],
        null
    ],
    building_test: [
        "building_test",
        BuildingTypes.Extraction,
        "Test Building",
        "A dev-only test building.",
        [
            new GenericTypeValue("Water", 20)
        ],
        [
            new GenericTypeValue("Chemicals", 40)
        ],
        [
            new GenericTypeValue("BuildingMaterials", 1000)
        ],
        null
    ],
    building_impossible: [
        "building_impossible",
        BuildingTypes.Extraction,
        "Impossible ahh building",
        "Bro",
        [],
        [],
        [],
        null
    ]
}
// TEMPLATES -----------------------------------------------------------------


// VALUES DECLARE -----------------------------------------------------------

// Load the saved data from the database
const Resources = databaseResources;

// Load the sectors from the database
const Sectors = [];
databaseSectors.forEach((sector) => {
    let tempGeographicalElements = [];
    if(sector.geographicalElements) {
        sector.geographicalElements.forEach(element => {
            let newGeoElem = new GeographicalElement(element.id,
                                                     element.name,
                                                     element.description,
                                                     element.passiveProduction,
                                                     element.situationalBuildings,
                                                     element.buildingBaseCapacity,
                                                     element.depletion,
                                                     element.depletesInto);
            tempGeographicalElements.push(newGeoElem);
            if(element.buildings) {
                element.buildings.forEach((b) => {
                    initBuilding(b.id, newGeoElem);
                });
            }
    })};
    Sectors.push(new Sector(sector.id,
                            sector.name,
                            tempGeographicalElements));
});

console.log(Sectors)

let activeSector = 0;
let activeElement = null;
let lastTimestampSaved = Date.now();


// OBJECTS -------------------------------------------------------------------

// JSON Template for creating a sector
// [
//     "id",    -- The internal name for this sector (what the developer sees)
//     "name",  -- the external name for this sector (what the player sees)
//     [
//         exampleGeographicalElement,      -- geographicalElements array.
//         exampleGeographicalElement       -- an array of GE objects tied to this sector. 
//     ]
function Sector(id, name, geographicalElements) {
    this.id = id;
    this.name = name;
    this.geographicalElements = geographicalElements;

    this.doTick = function() {
        this.geographicalElements.forEach(geoElement => {
            geoElement.doTick();
        })
    }
}

// JSON template for creating a GeographicalElement:
// [
//     "id",    -- the internal name of this GE. (What the developer sees)
//     "name",  -- the external name of this GE. (What the player sees)
//     "description", --text blurb regarding the GE.
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
function GeographicalElement(id, name, description, passiveProduction, situationalBuildings, buildingBaseCapacity, baseDepletion, maxDepletion, depletesInto) {
    this.uuid = crypto.randomUUID(); //uuid of this element
    this.id = id; //id of this element, is seperate from uuid as multiple of the same element can inhabit a sector
    this.name = name; //display name of this element
    this.description = description; //description of geoelement
    this.passiveProduction = passiveProduction; //array of arrays that contain a resource and production amount per tick
    this.situationalBuildings = situationalBuildings; //array of building ids that can be built. subarrays are mutually exclusive.
    this.buildingBaseCapacity = buildingBaseCapacity; //total buildings that can be made on that element.
    this.depletion = baseDepletion; //abritrary value of how much this element can take before being depleted.
    this.maxDepletion = maxDepletion;
    this.depletesInto = depletesInto; //what element does this element turn into after being depleted? based on id
    this.buildings = [];
    

    // Whenever this GeographicalElement is called to do a tick,
    // run through every resource that this GE has in passiveProduction 
    // and increment by some set value
    this.doTick = function() {
        this.passiveProduction.forEach(typeValueObject => {
            Resources[typeValueObject.type] += typeValueObject.value
        })

        this.buildings.forEach(building => {
            building.doTick();
        })

        let display = document.getElementById(`depletion-${this.uuid}`);
        if (display) {
            display.innerHTML = `Depletion: ${this.depletion}/${this.maxDepletion}`;
        }

    }

    this.depleteBy = function(value) {
        this.depletion += value;

        if (this.depletion >= this.maxDepletion && this.depletesInto) {
            //BOGOS
        }
    }
}

// JSON template for creating a Building:
// [
//     "id",    -- internal name of this Building (what the developer sees)
//     BuildingTypes.Foo,   -- the type of production that this Building does.
//     "name",  -- External name of this Building (what the player sees)
//     "description", --Text blurb for building
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
function Building(id, type, name, description, consumptionArray, productionArray, costArray, depletion, builtOnElement) {
    this.uuid = crypto.randomUUID(); //uuid of this element
    this.id = id; //id of this element, is seperate from uuid as multiple of the same building can inhabit an element
    this.type = type; //type of building, used for seperation into categories for build meny
    this.name = name; //display name of this element
    this.description = description;
    this.consumptionArray = consumptionArray; //array of arrays that contain a resource and amount to be used per tick
    this.productionArray = productionArray; //array of arrays that contain a resource and amount to produce per tick
    this.costArray = costArray; //array of arrays that contain what ResourceTypes to use and their amount
    this.builtOnElement = builtOnElement; //which geographical element is this building built on?

    this.doesDeplete = false; //this building does not deplete the resource of what its built on
    if (depletion) {
        this.doesDeplete = true; //nvm it does deplete 
        this.depletion = depletion; //amount to deplete by
    }

    this.doTick = function() {
        this.productionArray.forEach(typeValueObject => {
            Resources[typeValueObject.type] += typeValueObject.value
        })
        this.consumptionArray.forEach(typeValueObject => {
            Resources[typeValueObject.type] -= typeValueObject.value
        })
        if (this.doesDeplete) {
            getGeographicalElementById(this.builtOnElement).depleteBy(this.depletion);
        }
    }
}

//Generic holder of a type and value to reduce subarrays.
function GenericTypeValue(type, value) {
    this.type = type;
    this.value = value;
}
// OBJECTS -------------------------------------------------------------------
 

// STORING ARRAYS INIT -------------------------------------------------------
// (only do if Resources or Sectors are empty)

for (var key in ResourceTypes) {
    if (!Resources[key]) Resources[key] = 0;
}
console.log("No resources loaded!")



let gah = new GeographicalElement(...GeographicalElementTemplates.element_forest)
gah.buildings = [
    new Building(...BuildingTemplates.building_logging_site, gah.uuid)
]

if(Sectors.length == 0)
{
    Sectors.push(new Sector("northwest_boglo", "Northwest Boglo", [
            gah,
            new GeographicalElement(...GeographicalElementTemplates.element_forest),
            new GeographicalElement(...GeographicalElementTemplates.element_forest),
            new GeographicalElement(...GeographicalElementTemplates.element_forest)
        ])
    )
    Sectors.push(new Sector("flumpland", "Flumpland", [
        new GeographicalElement(...GeographicalElementTemplates.element_forest),
        new GeographicalElement(...GeographicalElementTemplates.element_forest),
        new GeographicalElement(...GeographicalElementTemplates.element_forest)
    ])
    )
}

// HELPER FUNCTIONS ----------------------------------------------------------
function getGeographicalElementById(uuid) {
    let returnVal = null;
    Sectors.forEach(sector => {
        sector.geographicalElements.forEach(geoElem => {
            if (geoElem.uuid == uuid && !returnVal) {
                returnVal = geoElem;
            }
        })
    })
    return returnVal;
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

// Builds a building post-initialization
function buildBuilding(building_id, element_uuid) {
    Sectors.forEach(sector => {
        sector.geographicalElements.forEach(element => {
            if (element.uuid == element_uuid) {
                initBuilding(building_id, element)
                updateSectorDisplay();
            }
        })
    })
}

// Builds a building during initialization
function initBuilding(building_id, element) {
    let newBuilding = new Building(...BuildingTemplates[building_id], element.uuid)
    element.buildings.push(newBuilding);
    console.log(element);
    console.log("made!");
}

function openBuildMenu(element_uuid) {
    let buildMenuNode = document.getElementById('build_menu').content.cloneNode(true);
    let buildTabsNode = buildMenuNode.querySelector('.build_tabs');

    makeBuildMenuTab(buildTabsNode, "All", element_uuid);
    Object.entries(BuildingTypes).forEach(type => {
        makeBuildMenuTab(buildTabsNode, type[0], element_uuid)
    })
    
    document.getElementById("build_sidebar").replaceChildren(buildMenuNode);
    switchBuildTab("All", element_uuid);
}

function closeBuildMenu() {
    document.getElementById("build_sidebar").innerHTML = "";
}

function makeBuildMenuTab(buildTabsNode, tab_name, element_uuid) {
    let buildTabNode = document.createElement('p');
    buildTabNode.classList = [`hud-button col-sm-6 text-sm-center ${tab_name}`];
    buildTabNode.innerHTML = tab_name;
    buildTabNode.addEventListener("click", e => {
        switchBuildTab(tab_name, element_uuid);
    })

    buildTabsNode.appendChild(buildTabNode);
}

function switchBuildTab(tab_name, element_uuid) {
    Array.from(document.getElementById("build_sidebar").querySelector(".build_tabs").children).forEach(tabNode => {
        tabNode.style.backgroundColor = "#444";
    })
    document.getElementById("build_sidebar").querySelector(`.${tab_name}`).style.backgroundColor = "#777";

    let geoElem = getGeographicalElementById(element_uuid);
    let buildingsNode = document.querySelector('.building_options_display');
    buildingsNode.replaceChildren();

    geoElem.situationalBuildings.forEach(building => {
        if (Array.isArray(building)) {//is a mutually exclusive group
            buildingsNode.appendChild(document.createElement("hr"));
            let mutExGroupDisplay = document.createElement("p");
            mutExGroupDisplay.innerHTML = "Mutually Exclusive Group";
            buildingsNode.appendChild(mutExGroupDisplay);
            building.forEach(mutexBuilding => {
                let buildingTemplate = BuildingTemplates[mutexBuilding.type]
                let buildingInfo = document.createElement("p");
                buildingInfo.innerHTML = `Build ${buildingTemplate[2]}, Costs ${prettyStringFromGenericTypeValueArray(buildingTemplate[6])}`
                buildingInfo.classList = ["hud-button"];
                buildingsNode.appendChild(buildingInfo);
                buildingInfo.addEventListener('click', e => {
                buildBuilding(buildingTemplate[0], element_uuid);
            })
            })

            buildingsNode.appendChild(document.createElement("hr"));
        } else {//is a normal group
            
            let buildingTemplate = BuildingTemplates[building.type]
            let buildingInfo = document.createElement("p");
            if(buildingTemplate[1] == tab_name || tab_name == "All") {
                buildingInfo.innerHTML = `Build ${buildingTemplate[2]}, Costs ${prettyStringFromGenericTypeValueArray(buildingTemplate[6])}`
                buildingInfo.classList = ["hud-button"];
                buildingsNode.appendChild(buildingInfo);
                buildingInfo.addEventListener('click', e => {
                    buildBuilding(buildingTemplate[0], element_uuid);
                })
            }
        }

        
    })
    
}

function prettyStringFromGenericTypeValueArray(typeValueArray) {
    let aggregator = "";

    typeValueArray.forEach(genericTypeValue => {
        aggregator += `${genericTypeValue.type}: ${genericTypeValue.value}`
    })

    return aggregator;
}

function wipeCurrentSector() {
    Array.prototype.map.call(document.getElementsByClassName("sector_display"), elem => {
        elem.remove();//only ever should be one, wipes all as a precaution
    })
}

function displayNewSector(sector) {
    let newSector = document.getElementById("sector").content.cloneNode(true);
    newSector.querySelector('.sector_name').innerHTML = `Overview of ${sector.name}`;
    addGeoElemsToNode(sector.geographicalElements, newSector.querySelector('.sector_details'))
    
    document.getElementById('gerge').appendChild(newSector);
    
}


function addGeoElemsToNode(elementArray, detailNode) {
    elementArray.forEach(element => {
        let geoElementNode = document.getElementById("geoelement").content.cloneNode(true);
        geoElementNode.querySelector('.geoelement_name').innerHTML = `${element.name}`
        geoElementNode.querySelector('.depletion').innerHTML = `Depletion: ${element.depletion}/${element.maxDepletion}`
        geoElementNode.querySelector('.depletion').id = `depletion-${element.uuid}`;
        geoElementNode.querySelector('.geoelement_build').addEventListener("click", e => {
            e.stopPropagation();
            openBuildMenu(element.uuid);
        })

        if (element.passiveProduction && element.passiveProduction.length != 0) {
            let passiveTextDisplay = document.createElement("p");
            passiveTextDisplay.innerHTML = "Passive production:";
            geoElementNode.querySelector('.passive_production').appendChild(passiveTextDisplay);
            element.passiveProduction.forEach(passiveProductionObject => {
                let passiveInfo = document.createElement("p");
                passiveInfo.innerHTML = `${ResourceTypes[passiveProductionObject.type]}: ${passiveProductionObject.value}/tick`;
                geoElementNode.querySelector('.passive_production').appendChild(passiveInfo);
            })
 
        }

        if (element.buildings && element.buildings.length != 0) {
            geoElementNode.querySelector('.buildings').appendChild(document.createElement("br"));
            let buildingTextDisplay = document.createElement("p");
            buildingTextDisplay.innerHTML = "Buildings:";
            geoElementNode.querySelector('.buildings').appendChild(buildingTextDisplay);
            element.buildings.forEach(building => {
                let buildingNode = document.getElementById("building").content.cloneNode(true);
                buildingNode.querySelector('.building_name').innerHTML = `${building.name} | ${BuildingTypes[building.type]}`;

                if (building.productionArray && building.productionArray.length != 0) {
                    let productionTextDisplay = document.createElement("p");
                    productionTextDisplay.innerHTML = "Production:";
                    buildingNode.querySelector('.building_production').appendChild(productionTextDisplay);



                    building.productionArray.forEach(productionObject => {
                        let productionInfo = document.createElement('p');
                        productionInfo.innerHTML = `${ResourceTypes[productionObject.type]}: ${productionObject.value}/tick`;
                        buildingNode.querySelector('.building_production').appendChild(productionInfo);
                    })
                }

                if (building.consumptionArray && building.consumptionArray.length != 0) {
                    let consumptionTextDisplay = document.createElement("p");
                    consumptionTextDisplay.innerHTML = "Consumption:";
                    buildingNode.querySelector('.building_consumption').appendChild(consumptionTextDisplay);


                    building.consumptionArray.forEach(consumptionObject => {
                        let consumptionInfo = document.createElement('p');
                        consumptionInfo.innerHTML = `${ResourceTypes[consumptionObject.type]}: ${consumptionObject.value}/tick`;
                        buildingNode.querySelector('.building_consumption').appendChild(consumptionInfo);
                    })
                }
                
                
                geoElementNode.querySelector('.buildings').appendChild(buildingNode);

            })
        }



        detailNode.appendChild(geoElementNode);
    })
}

function updateSectorDisplay() { //this is costly. no other way around it.
    wipeCurrentSector();
    displayNewSector(Sectors[activeSector]);
}

function wipeResourceDisplays() {
    document.getElementById("resource_container").replaceChildren();
}

function createResourceDisplays() {
    let container = document.getElementById("resource_container");

    Object.entries(ResourceTypes).forEach(([id, resourceName]) => {
        let newDisplayNode = document.createElement("p");
        newDisplayNode.innerText = `${resourceName}: ${(Math.round(Resources[id] * 100) / 100).toFixed(2)}`
        newDisplayNode.id = id;
        container.appendChild(newDisplayNode);
    })
}

function updateResourceDisplays() {
    Object.entries(ResourceTypes).forEach(([id, resourceName]) => {
        let node = document.getElementById(id);
        if (!node) {
            console.log("Resource type was missing!");
            wipeResourceDisplays();
            createResourceDisplays();
            return;
        }
        document.getElementById(id).innerText = `${resourceName}: ${(Math.round(Resources[id] * 100) / 100).toFixed(2)}`;
    });
}

function sectorsTick() {
    Sectors.forEach(sector => {
        sector.doTick(); 
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
    if (gameInterval) {
        pauseGame()
        resumeGame()
    }

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
    sectorsTick();
}
// GAME LOOP -----------------------------------------------------------------


// CONSTANT LOOP -------------------------------------------------------------

setInterval(() => {
    updateResourceDisplays();
}, 25)


// CONSTANT LOOP -------------------------------------------------------------

// HTML EVENTS ---------------------------------------------------------------

document.getElementById('cycle_sector').addEventListener("click", e => {
    activeSector += 1;
    if (activeSector >= Sectors.length) {
        activeSector = 0;
    }
    wipeCurrentSector();
    displayNewSector(Sectors[activeSector])
})

/*
document.getElementById('update_elem').addEventListener("click", e => {
    activeElement = document.getElementById('elementInput').value;
    displayBuildingSidebar();
})
*/
// HTML EVENTS ---------------------------------------------------------------


// SAVING/LOADING ------------------------------------------------------------

function save() {
    lastTimestampSaved = Date.now();
    console.log(lastTimestampSaved);
    fetch('/save', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',  // This header is crucial
        },
        body: JSON.stringify({  // Make sure to stringify
            sectors: Sectors,
            resources: Resources
        })
    })
    .then(response => {
        if (!response.ok) {
            console.error('Save failed');
        }
        return response.text();
    })
    .then(text => console.log(text))
    .catch(error => console.error('Error:', error));
}

// ON OPEN -------------------------------------------------------------------
displayNewSector(Sectors[activeSector])
createResourceDisplays();

window.addEventListener("beforeunload", e => {
    console.log(Date.now() - lastTimestampSaved);
    // If user hasn't saved in the last sixty seconds
    if((Date.now() - lastTimestampSaved) / 1000 >= 60)
    {
        e.preventDefault();
    }
});

document.body.addEventListener("click", () => {
    closeBuildMenu();
});