class SkillEffects {
    constructor() {
        this.resetModifiers();
    }

    resetModifiers() {
        this.modifiers = {
            resourceProduction: {
                Water: 1.0, Food: 1.0, BuildingMaterials: 1.0,
                Metal: 1.0, Chemicals: 1.0, AdvancedGoods: 1.0, Metamaterials: 1.0
            },
            additive: {
                populationCap: 0, buildingCapacity: 0
            },
            multipliers: {
                buildSpeed: 1.0, researchSpeed: 1.0, productionEfficiency: 1.0,
                diseaseRate: 1.0, environmentalStrain: 1.0, transportPollution: 1.0,
                laborRequirements: 1.0, landUse: 1.0, harvestSpeed: 1.0,
                foodQuality: 1.0, materialEfficiency: 1.0, energyCapacity: 1.0,
                foodSpoilage: 1.0, chemProcessEfficiency: 1.0
            },
            unlocks: {
                newRegions: false, newAreas: false, advancedChemProcesses: false,
                automation: false, verticalFarming: false, waterRecycling: false
            }
        };
    }
}

window.skillEffects = new SkillEffects();