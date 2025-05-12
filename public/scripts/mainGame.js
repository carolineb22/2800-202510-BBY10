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