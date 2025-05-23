// VALUES DECLARE -----------------------------------------------------------

// Load the saved data from the database
const Resources = databaseResources;
const Modifiers = databaseMods;

// Load the sectors from the database
const Sectors = [];
databaseSectors.forEach((sector) => {
	let tempGeographicalElements = [];
	if (sector.geographicalElements) {
		sector.geographicalElements.forEach(element => {
			let newGeoElem = new GeographicalElement(element.id,
				element.name,
				element.description,
				element.passiveProduction,
				element.situationalBuildings,
				element.buildingBaseCapacity,
				element.depletion,
				element.maxDepletion,
				element.depletesInto);
			tempGeographicalElements.push(newGeoElem);
			if (element.buildings) {
				element.buildings.forEach((b) => {
					initBuilding(b.id, newGeoElem);
				});
			}
		})
	};
	Sectors.push(new Sector(sector.id,
		sector.name,
		tempGeographicalElements));
});

let activeSector = 0;
let activeElement = null;
let lastTimestampSaved = Date.now();

// STORING ARRAYS INIT -------------------------------------------------------
// (only do if Resources or Sectors are empty)

const ShortageTracker = []
for (var key in ResourceTypes) {
	if (!Resources[key]) Resources[key] = 0;
	console.log("No resources loaded!")
	ShortageTracker[key] = false;
}

if (Object.keys(Modifiers).length == 0) {
    Modifiers.additive = {};
    for (var key in ModifierTypes.additive) {
        Modifiers.additive[key] = 0;
    }
    Modifiers.multiplicative = {};
    for (var key in ModifierTypes.multiplicative) {
        Modifiers.multiplicative[key] = 1;
    }
    Modifiers.unlocks = {};
    for (var key in ModifierTypes.unlocks) {
        Modifiers.unlocks[key] = false;
    }
    console.log("No modifiers loaded!", Modifiers)
}

let gah = new GeographicalElement(...GeographicalElementTemplates.element_forest)
gah.buildings = [
	new Building(...BuildingTemplates.building_logging_site, gah.uuid)
]

if (Sectors.length == 0) {
	Sectors.push(new Sector("northwest_boglo", "Northwest Boglo", [
		gah,
		new GeographicalElement(...GeographicalElementTemplates.element_river),
		new GeographicalElement(...GeographicalElementTemplates.element_mountain_rich),
		new GeographicalElement(...GeographicalElementTemplates.element_grassland)
	])
	)
	Sectors.push(new Sector("flumpland", "Flumpland", [
		new GeographicalElement(...GeographicalElementTemplates.element_river),
		new GeographicalElement(...GeographicalElementTemplates.element_river),
		new GeographicalElement(...GeographicalElementTemplates.element_forest)
	])
	)
	Sectors.push(new Sector("gleenvale", "Gleenvale", [
		new GeographicalElement(...GeographicalElementTemplates.element_cracked_earth),
		new GeographicalElement(...GeographicalElementTemplates.element_cracked_earth),
		new GeographicalElement(...GeographicalElementTemplates.element_grassland),
		new GeographicalElement(...GeographicalElementTemplates.element_grassland)
	])
	)
	Sectors.push(new Sector("east_blorvin", "East Blorvin", [
		new GeographicalElement(...GeographicalElementTemplates.element_mountain_rich),
		new GeographicalElement(...GeographicalElementTemplates.element_mountain_rich),
		new GeographicalElement(...GeographicalElementTemplates.element_mountain)
	])
	)
}

let populationMax = 50;
let population = localStorage.getItem('population') || 1;
if (isNaN(population)) population = 1;



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

function convertGeoElementIntoNew(original_element_uuid, becomes_element_id) {
	let newGeoElement = new GeographicalElement(...GeographicalElementTemplates[becomes_element_id])
	let geoElement = getGeographicalElementById(original_element_uuid);
	if (!geoElement) return;

	newGeoElement.buildings = geoElement.buildings;

	newGeoElement.buildings.forEach(building => {
		building.builtOnElement = newGeoElement.uuid;
	})

	for (let sector of Sectors) {
		if (sector.geographicalElements.includes(geoElement)) {
			console.log("Found!");
			sector.geographicalElements.splice(sector.geographicalElements.indexOf(geoElement), 1);

			sector.geographicalElements.push(newGeoElement);
		}
	}

	delete geoElement;

	newGeoElement.checkIfBuildingsCanDoWork();
	updateSectorDisplay();
}

function isThisBuildingInvalidFromMutexGroup(geoElementUUID, building_id) {
	let geoElem = getGeographicalElementById(geoElementUUID);
	if (!geoElem) {
		return true; //building isnt on a valid geoelem so its invalid anyways
	}

	let mutexGroup = geoElem.getMutexGroups().filter((mutexGroup) => mutexGroup.map((typeValuePair) => typeValuePair.type).includes(building_id))[0]
	console.log(mutexGroup);
	if (!mutexGroup) {
		return false; //there is no mutexgroup for this building, its chilling
	}

	let mutexFlag = false;
	mutexGroup.filter(typeValuePair => typeValuePair.type != building_id).forEach(typeValuePair => {
		if (geoElem.buildings.map(building => building.id).includes(typeValuePair.type)) {
			mutexFlag = true;
		}
	})
	return mutexFlag
}

function isThisBuildingInvalidFromIndividualCap(geoElementUUID, building_id) {
	let geoElem = getGeographicalElementById(geoElementUUID);
	if (!geoElem) {
		return true; //building isnt on a valid geoelem so its invalid anyways
	}

	let flag = false;
	geoElem.situationalBuildings.flat().forEach(typeValuePair => {
		if (typeValuePair.type == building_id && geoElem.buildings.filter(building => building.id == building_id).length >= typeValuePair.value) flag = true;
	})

	return flag;

}
//no idea why this exists ngl
function initBuilding(building_id, element) {
	let newBuilding = new Building(...BuildingTemplates[building_id], element.uuid)
	element.buildings.push(newBuilding);
	return newBuilding;

}

function buildBuilding(building_id, element_uuid) { //as null is falsy, returns true when it cannot be built
	for (let typeValueCost of BuildingTemplates[building_id][6]) {
		if (Resources[typeValueCost.type] < typeValueCost.value) return true;
	} //check if has enough resources

	geoElem = getGeographicalElementById(element_uuid);

	if (!geoElem) return true; //check geoelem exists
	if (geoElem.buildingBaseCapacity <= geoElem.buildings.length) return true; //check geoelem has capacity
	if (isThisBuildingInvalidFromMutexGroup(element_uuid, building_id)) return true; //check if geoelem has a chosen mutexgroup for this
	if (isThisBuildingInvalidFromIndividualCap(element_uuid, building_id)) return true; //check if building has reached cap for this geoelem

	for (let typeValueCost of BuildingTemplates[building_id][6]) {
		Resources[typeValueCost.type] -= typeValueCost.value
	}

	let newBuilding = initBuilding(building_id, geoElem);
	newBuilding.checkIfCanDoWork();

	updateSectorDisplay();
}

function deleteBuilding(building_id, element_uuid) {
    geoElem = getGeographicalElementById(element_uuid);

    if (!geoElem) return true; //check geoelem exists
    if (!geoElem.buildings) return true; //check it has buildings

    for(let building of geoElem.buildings) {
        if(building.id == building_id)
        {
            let buildingIndex = geoElem.buildings.indexOf(building);
            if(buildingIndex > -1)
            {
                geoElem.buildings.splice(buildingIndex, 1);
            }
            break;
        }
    }

	for (let typeValueCost of BuildingTemplates[building_id][6]) {
		Resources[typeValueCost.type] += typeValueCost.value * 0.5
	}

	updateSectorDisplay();
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
                if (buildingTemplate[1] == tab_name || tab_name == "All") {
                    buildingInfo.innerHTML = `Build ${buildingTemplate[2]} (Max ${mutexBuilding.value}), Costs ${prettyStringFromGenericTypeValueArray(buildingTemplate[6])} `
                    buildingInfo.classList = ["hud-button"];
                    buildingsNode.appendChild(buildingInfo);
                    buildingInfo.addEventListener('click', e => {
                        if (buildBuilding(buildingTemplate[0], element_uuid)) {
                            buildingInfo.classList.remove('red-flash');
                            void buildingInfo.offsetWidth;
                            buildingInfo.classList.add('red-flash');
                        }
                    })
                }
			})

			buildingsNode.appendChild(document.createElement("hr"));
		} else {//is a normal group

			let buildingTemplate = BuildingTemplates[building.type]
			let buildingInfo = document.createElement("p");
			if (buildingTemplate[1] == tab_name || tab_name == "All") {
				buildingInfo.innerHTML = `Build ${buildingTemplate[2]} (Max ${building.value}), Costs ${prettyStringFromGenericTypeValueArray(buildingTemplate[6])}`
				buildingInfo.classList = ["hud-button"];
				buildingsNode.appendChild(buildingInfo);
				buildingInfo.addEventListener('click', e => {
					if (buildBuilding(buildingTemplate[0], element_uuid)) {
						buildingInfo.classList.remove('red-flash');
						void buildingInfo.offsetWidth;
						buildingInfo.classList.add('red-flash');
					}
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
	// If new regions are unlocked
	// (or if the current sector is Northwest Boglo)

		wipeCurrentSector();
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
		geoElementNode.querySelector('.building_capacity').innerHTML = `Capacity: ${element.buildings.length}/${element.buildingBaseCapacity}`

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
                buildingNode.querySelector('.delete_button').addEventListener("click", () => deleteBuilding(building.id, building.builtOnElement));
				buildingNode.querySelector('.building_name').innerHTML = `${building.name} | ${BuildingTypes[building.type]}`;

				if (building.productionArray && building.productionArray.length != 0) {
					let productionTextDisplay = document.createElement("p");
					productionTextDisplay.innerHTML = "Production:";
					buildingNode.querySelector('.building_production').appendChild(productionTextDisplay);



					building.productionArray.forEach(productionObject => {
						if (productionObject.type == ResourceTypes.PopulationCapacity) return;

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
	displayNewSector(Sectors[activeSector]);
}

function wipeResourceDisplays() {
	document.getElementById("resource_container").replaceChildren();
}

function createResourceDisplays() {
	let container = document.getElementById("resource_container");

	Object.entries(ResourceTypes).forEach(([id, resourceName]) => {
		if (resourceName == ResourceTypes.PopulationCapacity) return;

		let newDisplayNode = document.createElement("p");
		newDisplayNode.innerText = `${resourceName}: ${(Math.round(Resources[id] * 100) / 100).toFixed(2)}`
		newDisplayNode.id = id;
		container.appendChild(newDisplayNode);
	})
}

function updateResourceDisplays() {
	Object.entries(ResourceTypes).forEach(([id, resourceName]) => {
		if (resourceName == ResourceTypes.PopulationCapacity) return;

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


function calculateShortages() {
	for (let key in ResourceTypes) {
		ShortageTracker[key] = Resources[key] < 0;
	}
}

function doPopUpdate() {
	calculatePopMax();
	popUpdate();
}

function calculatePopMax() {
	let maxPop = 50 + Modifiers.additive.populationCap;

	Sectors.forEach(sector => {
		sector.geographicalElements.forEach(geoElem => {
			geoElem.buildings.forEach(building => {
				if (building.type == BuildingTypes.Housing) {
					building.productionArray.forEach(typeValuePair => {
						if (typeValuePair.type == ResourceTypes.PopulationCapacity) {
							maxPop += typeValuePair.value;
						}
					})
				}
			})
		})
	})
	populationMax = maxPop;
}

function popUpdate() {
	if (ShortageTracker["Water"]) {
		population *= 0.9
	} else if (ShortageTracker["Food"]) {
		population *= 0.85
	} else {
		let foodSurplusMultiplier =  + Math.max(Math.min(Math.log(Resources["Food"])/10 || 0,0.1), 0) 
		let waterSurplusMultiplier = Math.max(Math.min(Math.log(Resources["Water"])/10 || 0,0.1), 0)

		if (isNaN(foodSurplusMultiplier)) foodSurplusMultiplier = 0;
		if (isNan(waterSurplusMultiplier)) waterSurplusMultiplier = 0;



		population += (populationMax - population) * (0.01+foodSurplusMultiplier, waterSurplusMultiplier)}

	Resources["Food"] -= population * 0.25;
	Resources["Water"] -= population * 0.25;


	if (population < 1) {
		population = 1;
	}
	if (population > populationMax) {
		population = populationMax;
	}

	localStorage.setItem('population', population) 
}

function updatePopDisplay() {
	document.getElementById("popCount").innerHTML = `${Math.round(population)} thousand people.`;
	document.getElementById("popCap").innerHTML = `${populationMax} thousand capacity.`;
}

// HELPER FUNCTIONS ----------------------------------------------------------


// TICK CONTROL --------------------------------------------------------------
const tickInterval = 1000; //in milliseconds
const fastInterval = 500; //in milliseconds
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

// GAME LOOP -----------------------------------------------------------------
function gameLoop() {
	sectorsTick();
	calculateShortages();
	doPopUpdate();
	
}




// CONSTANT LOOP -------------------------------------------------------------
setInterval(() => {
	updateResourceDisplays();
	updatePopDisplay();
}, 25)

// HTML EVENTS ---------------------------------------------------------------
document.getElementById('cycle_sector').addEventListener("click", e => {

	if ((Modifiers.unlocks &&
		Modifiers.unlocks.newRegions == true)) {

	activeSector += 1;
	if (activeSector >= Sectors.length) {
		activeSector = 0;
	}
	displayNewSector(Sectors[activeSector])}
})

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
			resources: Resources,
            modifiers: Modifiers
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
calculatePopMax();
updatePopDisplay();

window.addEventListener("beforeunload", e => {
	console.log(Date.now() - lastTimestampSaved);
	// If user hasn't saved in the last sixty seconds
	if ((Date.now() - lastTimestampSaved) / 1000 >= 60) {
		e.preventDefault();
	}
});

document.body.addEventListener("click", () => {
	closeBuildMenu();
});

document.getElementById("build_sidebar").addEventListener("click", (e) => {
	e.stopPropagation();
});

// CHEAT FUCNTION FOR DEVELOPMENT ------------------------------------------
function cheat() {
	for (var key in ResourceTypes) {
		Resources[key] += 1000;
	}
	console.log("Nice going, cheater!");
}