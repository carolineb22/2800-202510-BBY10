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