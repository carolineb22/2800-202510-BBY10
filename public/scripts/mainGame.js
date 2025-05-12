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