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
