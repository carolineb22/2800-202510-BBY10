// ENUMS --------------------------------------------------------------------

// Building Types used in the game.
// Housing is unused as of now.
const BuildingTypes = {
	Housing: "Housing",
	Extraction: "Extraction",
	Processing: "Processing",
	Research: "Research"
}

// Resources that buildings use as types of currency in the game.
const ResourceTypes = {
	Water: "Water",
	Food: "Food",
	BuildingMaterials: "Building Materials",
	Metal: "Metal",
	Chemicals: "Chemicals",
	ResearchPoints: "Research Points",
	PopulationCapacity: "PopulationCapacity"
}

// Resources that buildings use as types of currency in the game.
const ModifierTypes = {
	additive: {
        populationCap: "populationCap"
    },
    multiplicative: {
        buildSpeed: "buildSpeed",
        researchSpeed: "researchSpeed",
        productionEfficiency: "productionEfficiency",
        diseaseRate: "diseaseRate",
        environmentalStrain: "environmentalStrain",
        transportPollution: "transportPollution",
        laborRequirements: "laborRequirements",
        landUse: "landUse",
        harvestSpeed: "harvestSpeed",
        foodQuality: "foodQuality",
        materialEfficiency: "materialEfficiency",
        energyCapacity: "energyCapacity",
        foodSpoilage: "foodSpoilage",
        foodYield: "foodYield",
        waterOutput: "waterOutput",
    },
    unlocks: {
        newRegions: "newRegions",
        newAreas: "newAreas"
    }
}
// ENUMS --------------------------------------------------------------------


// GAMEPLAY ELEMENT TEMPLATES -----------------------------------------------
// For information on how to create more of these objects, visit gameplayObjects.js for the relevant templates.

// Geographical Element JSON Templates
const GeographicalElementTemplates = {
	element_forest: [
		"element_forest",
		"Forest",
		"A forested landscape rife with trees. A few clearings exist for buildings, but otherwise quite forested.",
		[
			new GenericTypeValue("BuildingMaterials", 0.1)
		],
		[
			new GenericTypeValue("building_logging_site", 3),
			new GenericTypeValue("building_wood_power_plant", 1),
			new GenericTypeValue("building_library", 1),
			new GenericTypeValue("building_forest_cabins", 2)
		],
		5,
		0,
		200,
		"element_grassland"
	],
	element_grassland: [
		"element_grassland",
		"Grassland",
		"A grassy plain with lots of arable land.",
		[],
		[
			new GenericTypeValue("building_farm", 3),
			new GenericTypeValue("building_greenhouse", 2),
			new GenericTypeValue("building_vertical_hydroponics", 2),
			new GenericTypeValue("building_research_lab", 2),
			new GenericTypeValue("building_apartments", 1),
			new GenericTypeValue("building_skyscraper", 1)
		],
		6,
		0,
		500,
		null
	],
	element_mountain_rich: [
		"element_mountain_rich",
		"Mineral Rich Mountain",
		"A mountain with vast resources to mine. Also take advantage of the nearby trees!",
		[
			new GenericTypeValue("BuildingMaterials", 0.1)
		],
		[
			new GenericTypeValue("building_iron_mine", 3),
			new GenericTypeValue("building_deep_mine", 1)
		],
		4,
		0,
		200,
		"element_mountain"
	],
	element_mountain: [
		"element_mountain",
		"Depleted Mountain",
		"A mountain with no valueable resources to take advantage of. Just a beautiful sight.",
		[],
		[
			[
				new GenericTypeValue("building_logging_site", 2),
				new GenericTypeValue("building_observatory", 1)
			]
		],
		5,
		0,
		200,
		null
	],
	element_river: [
		"element_river",
		"River Valley",
		"Just your run-of-the-mill River through a valley. Hey, you could put some mills here!",
		[
			new GenericTypeValue("Water", 0.3)
		],
		[
			[
				new GenericTypeValue("building_logging_site", 1),
				new GenericTypeValue("building_wood_power_plant", 1)
			],
			[
				new GenericTypeValue("building_well", 3),
				new GenericTypeValue("building_groundwater_pump", 2),
				new GenericTypeValue("building_desalinator", 1)
			]
		],
		10,
		0,
		500,
		"element_cracked_earth"
	],
	element_cracked_earth: [
		"element_cracked_earth",
		"Dry Valley",
		"With overuse of water, there's only a dry wasteland of sparce plants and animals left.",
		[],
		[
			new GenericTypeValue("building_lumber_mill", 3),
			new GenericTypeValue("building_chemical_plant", 2),
			new GenericTypeValue("building_toxic_dump_miner", 2),
			[
				new GenericTypeValue("building_modular_factory", 2),
				new GenericTypeValue("building_nano_assembler", 2)
			]
		],
		10,
		0,
		300,
		null
	]
}

// Building JSON Templates
const BuildingTemplates = {
	// Testing buildings
	building_logging_site: [
		"building_logging_site",
		BuildingTypes.Extraction,
		"Logging Site",
		"A dedicated area in which trees are harvested for building materials.",
		[],
		[
			new GenericTypeValue("BuildingMaterials", 5)
		],
		[
			new GenericTypeValue("BuildingMaterials", 100)
		],
		["element_forest","element_river"],
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
			new GenericTypeValue("BuildingMaterials", 100)
		],
		["element_forest"],
		3
	],
	building_forest_cabins: [
		"building_forest_cabins",
		BuildingTypes.Housing,
		"Forest Cabins",
		"A forest cabin for a few lucky people.",
		[],
		[
			new GenericTypeValue("PopulationCapacity", 50)
		],
		[
			new GenericTypeValue("BuildingMaterials", 100)
		],
		["element_forest"],
		null
	],
	building_apartments: [
		"building_apartments",
		BuildingTypes.Housing,
		"Apartment Building",
		"Wide Buildings to house many people.",
		[],
		[
			new GenericTypeValue("PopulationCapacity", 100)
		],
		[
			new GenericTypeValue("BuildingMaterials", 200)
		],
		["element_grassland"],
		null
	],
	building_skyscraper: [
		"building_skyscraper",
		BuildingTypes.Housing,
		"Skyscraper",
		"Tall buildings for housing many, many people.",
		[],
		[
			new GenericTypeValue("PopulationCapacity", 250)
		],
		[
			new GenericTypeValue("BuildingMaterials", 1000)
		],
		["element_grassland"],
		null
	],
	// Buildings to do with Water
	building_well: [
		"building_well",
		BuildingTypes.Extraction,
		"Well",
		"Simple ground water well",
		[],
		[new GenericTypeValue("Water", 25)],
		[new GenericTypeValue("BuildingMaterials", 100)],
		["element_river"],
		null
	],
	building_groundwater_pump: [
		"building_groundwater_pump",
		BuildingTypes.Extraction,
		"Groundwater Pump",
		"Extracts groundwater using a powered pump system. More efficient than traditional wells, but limited by aquifer depth.",
		[],
		[new GenericTypeValue("Water", 50)],
		[new GenericTypeValue("BuildingMaterials", 250)],
		["element_river", "element_grassland"],
		null
	],
	building_desalinator: [
		"building_desalinator",
		BuildingTypes.Processing,
		"Desalinator",
		"Extracts fresh water from seawater",
		[],
		[new GenericTypeValue("Water", 100)],
		[new GenericTypeValue("BuildingMaterials", 500)],
		["element_river"],
		5
	],
	// Buildings to do with Food
	building_farm: [
		"building_farm",
		BuildingTypes.Extraction,
		"Farm",
		"Produces food from crops.",
		[new GenericTypeValue("Water", 3)],
		[new GenericTypeValue("Food", 25)],
		[new GenericTypeValue("BuildingMaterials", 200)],
		["element_grassland"],
		null
	],
	building_greenhouse: [
		"building_greenhouse",
		BuildingTypes.Extraction,
		"Greenhouse",
		"Produces food in a controlled environment.",
		[new GenericTypeValue("Water", 5)],
		[new GenericTypeValue("Food", 50)],
		[new GenericTypeValue("BuildingMaterials", 500)],
		[],
		null
	],
	building_vertical_hydroponics: [
		"building_vertical_hydroponics",
		BuildingTypes.Extraction,
		"Vertical Hydroponics",
		"Instead of growing food sideways, we grow it up now!",
		[new GenericTypeValue("Water", 10)],
		[new GenericTypeValue("Food", 100)],
		[new GenericTypeValue("BuildingMaterials", 750)],
		[],
		null
	],
	// Buildings to do with Building Materials
	building_lumber_mill: [
		"building_lumber_mill",
		BuildingTypes.Extraction,
		"Lumber Mill",
		"Processes wood from forests.",
		[],
		[
			new GenericTypeValue("BuildingMaterials", 5)
		],
		[
			new GenericTypeValue("BuildingMaterials", 100)
		],
		["element_forest"],
		1
	],
	building_modular_factory: [
		"building_modular_factory",
		BuildingTypes.Processing,
		"Modular Construction Factory",
		"Produces pre-fabricated building materials using advanced techniques.",
		[],
		[],
		[
			new GenericTypeValue("BuildingMaterials", 5000)
		],
		["element_cracked_earth"],
		3
	],
	building_nano_assembler: [
		"building_nano_assembler",
		BuildingTypes.Processing,
		"Nano Assembler Plant",
		"Uses nanotechnology to construct ultra-light, high-strength building materials atom by atom.",
		[new GenericTypeValue("Metal", 100)],
		[],
		[
			new GenericTypeValue("BuildingMaterials", 10000)
		],
		["element_cracked_earth"],
		null
	],
	// Buildings to do with Metal
	building_iron_mine: [
		"building_iron_mine",
		BuildingTypes.Extraction,
		"Iron Mine",
		"Extracts iron ore from underground.",
		[
			new GenericTypeValue("BuildingMaterials", 3),
			new GenericTypeValue("Water", 5)
		],
		[new GenericTypeValue("Metal", 50)],
		[new GenericTypeValue("BuildingMaterials", 300)],
		["element_mountain_rich"],
		null
	],
	building_deep_mine: [
		"building_deep_mine",
		BuildingTypes.Extraction,
		"Deep Mine",
		"Better mining techniques allow for access to deeper ore veins.",
		[
			new GenericTypeValue("BuildingMaterials", 30),
			new GenericTypeValue("Water", 15)
		],
		[new GenericTypeValue("Metal", 100)],
		[new GenericTypeValue("BuildingMaterials", 1000)],
		["element_mountain_rich"],
		5
	],
	building_recycler: [
		"building_recycler",
		BuildingTypes.Processing,
		"Recycler",
		"Reclaims metal from scrap materials.",
		[
			new GenericTypeValue("Metal", 5),
			new GenericTypeValue("BuildingMaterials", 20)
		],
		[new GenericTypeValue("Metal", 200)],
		[new GenericTypeValue("BuildingMaterials", 2000)],
		[],
		null
	],
	// Buildings to do with Chemicals
	building_chemical_plant: [
		"building_chemical_plant",
		BuildingTypes.Processing,
		"Chemical Plant",
		"Synthesizes basic industrial chemicals.",
		[
			new GenericTypeValue("Water", 100),
			new GenericTypeValue("Metal", 50),
			new GenericTypeValue("BuildingMaterials", 50)
		],
		[new GenericTypeValue("Chemicals", 50)],
		[
			new GenericTypeValue("BuildingMaterials", 5000),
			new GenericTypeValue("Metal", 1000)
		],
		["element_grasslands"],
		3
	],
	building_toxic_dump_miner: [
		"building_toxic_dump_miner",
		BuildingTypes.Extraction,
		"Toxic Dump Miner",
		"Harvest useful chemicals from old waste sites.",
		[
			new GenericTypeValue("Water", 250),
			new GenericTypeValue("Metal", 100),
			new GenericTypeValue("Chemicals", 50),
			new GenericTypeValue("BuildingMaterials", 100)
		],
		[new GenericTypeValue("Chemicals", 100)],
		[
			new GenericTypeValue("BuildingMaterials", 5000),
			new GenericTypeValue("Metal", 1000)
		],
		["element_cracked_earth"],
		null
	],
	building_alchemist_lab: [
		"building_alchemist_lab",
		BuildingTypes.Processing,
		"Alchemist Lab",
		"Creates rare but useful compounds using research and advanced goods.",
		[
			new GenericTypeValue("Water", 500),
			new GenericTypeValue("Metal", 300),
			new GenericTypeValue("Chemicals", 200),
			new GenericTypeValue("ResearchPoints", 100)
		],
		[new GenericTypeValue("Chemicals", 100)],
		[
			new GenericTypeValue("BuildingMaterials", 5000),
			new GenericTypeValue("Metal", 1000)
		],
		[],
		null
	],
	// Buildings to do with Research
	building_library: [
		"building_library",
		BuildingTypes.Research,
		"Library",
		"Provide scholars a place to gather their knowledge. Generates Research Points slowly.",
		[
			new GenericTypeValue("Food", 100),
			new GenericTypeValue("Water", 100)
		],
		[new GenericTypeValue("ResearchPoints", 10)],
		[new GenericTypeValue("BuildingMaterials", 1000)],
		[],
		null
	],
	building_research_lab: [
		"building_research_lab",
		BuildingTypes.Research,
		"Research Lab",
		"A nice place to devote your time for scientific advancement! Generates Research Points moderately.",
		[
			new GenericTypeValue("Food", 250),
			new GenericTypeValue("Water", 250),
			new GenericTypeValue("Chemicals", 50)
		],
		[new GenericTypeValue("ResearchPoints", 50)],
		[new GenericTypeValue("BuildingMaterials", 5000)],
		[],
		null
	],
	building_observatory: [
		"building_observatory",
		BuildingTypes.Research,
		"Observatory",
		"Study the skies and other planets for scientific insight. Generates Research Points quickly.",
		[
			new GenericTypeValue("Food", 250),
			new GenericTypeValue("Water", 250),
			new GenericTypeValue("Metal", 100)
		],
		[new GenericTypeValue("ResearchPoints", 250)],
		[
			new GenericTypeValue("BuildingMaterials", 10000),
			new GenericTypeValue("Metal", 5000)
		],
		[],
		null
	],
	// The following are kept for testing.
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
		[],
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
		[],
		null
	]
}
// TEMPLATES -----------------------------------------------------------------

//Generic holder of a type and value to reduce subarrays.
function GenericTypeValue(type, value) {
	this.type = type;
	this.value = value;
}