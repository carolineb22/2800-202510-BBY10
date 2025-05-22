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

	this.doTick = function () {
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
	this.doTick = function () {
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

	this.depleteBy = function (value) {
		this.depletion += value;

        if (this.depletion >= this.maxDepletion && this.depletesInto) {
			convertGeoElementIntoNew(this.uuid, this.depletesInto)
		}
    }

    this.checkIfBuildingsCanDoWork = function() {
        this.buildings.forEach(building => {
            building.checkIfCanDoWork();
        })
    }

    this.getMutexGroups = function() {
        return this.situationalBuildings.filter((group) => Array.isArray(group));
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
//     [				-- doesWorkWhenOnIdArray
//         "element_id" -- list of ids that this building works when on, empty array means it works on all elements.
//     ]
//     depletion,   -- the amount of the parent GeographicalElement's resource that this Building
//                  -- depletes per tick (depletion/tick). Can be null, but must be present.
// ]
// builtOnElement is left out of the JSON template since it uses GUIDs that are generated at runtime.
function Building(id, type, name, description, consumptionArray, productionArray, costArray, doesWorkWhenOnIdArray, depletion, builtOnElement) {
	this.uuid = crypto.randomUUID(); //uuid of this element
	this.id = id; //id of this element, is seperate from uuid as multiple of the same building can inhabit an element
	this.type = type; //type of building, used for seperation into categories for build meny
	this.name = name; //display name of this element
	this.description = description;
	this.consumptionArray = consumptionArray; //array of arrays that contain a resource and amount to be used per tick
	this.productionArray = productionArray; //array of arrays that contain a resource and amount to produce per tick
	this.costArray = costArray; //array of arrays that contain what ResourceTypes to use and their amount
	this.doesWorkWhenOnIdArray = doesWorkWhenOnIdArray; //what element id's does this building do work when its on?
	this.builtOnElement = builtOnElement; //which geographical element is this building built on?
	this.active = true;


	this.doesDeplete = false; //this building does not deplete the resource of what its built on
	if (depletion) {
		this.doesDeplete = true; //nvm it does deplete 
		this.depletion = depletion; //amount to deplete by
	}

	this.doTick = function () {

		if (this.active) {
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

	this.checkIfCanDoWork = function () {
		if (!this.doesWorkWhenOnIdArray || this.doesWorkWhenOnIdArray.length == 0) {
			console.log("No specified elements that this works on.")
			this.active = true;
			return;
		}

		let parent = getGeographicalElementById(this.builtOnElement);

		if (!parent || !this.doesWorkWhenOnIdArray.includes(parent.id)) {
			console.log("Missing specified element.")
			this.active = false;
			return
		}

		console.log("Is on correct element.")
		this.active = true;
	}
}
// OBJECTS -------------------------------------------------------------------