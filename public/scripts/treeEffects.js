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

    parseEffectDescription(description) {
        const effectText = description.split('<b>Effect:</b>')[1] || '';
        return effectText.split('</br>')
            .filter(line => line.trim())
            .flatMap(line => this.parseEffectLine(line.trim()));
    }

    parseEffectLine(line) {
        const effects = [];
        if (!line || line.includes('NO EFFECT')) return effects;

        // Percentage modifiers
        const percentageMatch = line.match(/([+-]?\d+)%/);
        if (percentageMatch) {
            const value = parseFloat(percentageMatch[1]) / 100;
            effects.push(...this.handlePercentageEffect(line, value));
        }

        // Additive values
        const additiveMatch = line.match(/\+(\d+)\s/);
        if (additiveMatch) {
            effects.push(...this.handleAdditiveEffect(line, parseInt(additiveMatch[1])));
        }

        // Unlocks
        const unlockEffects = this.handleUnlockEffects(line);
        effects.push(...unlockEffects);

        return effects;
    }

    handlePercentageEffect(line, value) {
        const effects = [];
        const effectMap = [
            { keywords: ['food yield'], effect: { type: 'resource', resource: 'Food' } },
            { keywords: ['build speed', 'gather speed'], effect: { type: 'multiplier', stat: 'buildSpeed' } },
            { keywords: ['research speed'], effect: { type: 'multiplier', stat: 'researchSpeed' } },
            { keywords: ['disease rate'], effect: { type: 'multiplier', stat: 'diseaseRate' } },
            {
                keywords: ['environmental strain', 'environment quality'],
                effect: { type: 'multiplier', stat: 'environmentalStrain', invert: true }
            },
            { keywords: ['transport pollution'], effect: { type: 'multiplier', stat: 'transportPollution' } },
            { keywords: ['labor', 'worker requirements'], effect: { type: 'multiplier', stat: 'laborRequirements' } },
            { keywords: ['land use'], effect: { type: 'multiplier', stat: 'landUse' } },
            { keywords: ['harvest speed'], effect: { type: 'multiplier', stat: 'harvestSpeed' } },
            { keywords: ['food quality'], effect: { type: 'multiplier', stat: 'foodQuality' } },
            { keywords: ['material efficiency'], effect: { type: 'multiplier', stat: 'materialEfficiency' } },
            { keywords: ['energy capacity'], effect: { type: 'multiplier', stat: 'energyCapacity' } },
            { keywords: ['food spoilage'], effect: { type: 'multiplier', stat: 'foodSpoilage' } },
            { keywords: ['water output'], effect: { type: 'resource', resource: 'Water' } },
            { keywords: ['output', 'chemical', 'chem'], effect: { type: 'multiplier', stat: 'chemProcessEfficiency' } }
        ];

        effectMap.forEach(({ keywords, effect }) => {
            if (keywords.some(kw => line.includes(kw))) {
                const val = effect.invert ? 1 - Math.abs(value) : 1 + value;
                effects.push({ ...effect, value: val });
            }
        });

        return effects;
    }

    handleAdditiveEffect(line, value) {
        const effects = [];
        if (line.includes('population cap')) {
            effects.push({ type: 'additive', stat: 'populationCap', value });
        }
        if (line.includes('building capacity')) {
            effects.push({ type: 'additive', stat: 'buildingCapacity', value });
        }
        return effects;
    }

    handleUnlockEffects(line) {
        const effects = [];
        const unlockMap = {
            'Unlocks new regions': 'newRegions',
            'Unlocks new areas': 'newAreas',
            'advanced chem': 'advancedChemProcesses',
            'automation': 'automation',
            'vertical farm': 'verticalFarming',
            'water recycling': 'waterRecycling'
        };

        Object.entries(unlockMap).forEach(([keyword, feature]) => {
            if (line.includes(keyword)) {
                effects.push({ type: 'unlock', feature });
            }
        });

        return effects;
    }

    applySkillEffects(skillId) {
        const skill = document.getElementById(skillId);
        if (!skill) return;

        this.parseEffectDescription(skill.dataset.description).forEach(effect => {
            switch (effect.type) {
                case 'resource':
                    this.modifiers.resourceProduction[effect.resource] *= effect.value;
                    break;
                case 'additive':
                    this.modifiers.additive[effect.stat] += effect.value;
                    break;
                case 'multiplier':
                    this.modifiers.multipliers[effect.stat] *= effect.value;
                    break;
                case 'unlock':
                    this.modifiers.unlocks[effect.feature] = true;
                    break;
            }
        });

        this.updateGameSystems();
        console.log(`Applied effects for ${skillId}`, this.modifiers);
    }

    updateGameSystems() {
        // Updates happen through the modifier system
    }

    // Methods
    getResourceMultiplier(resource) {
        return this.modifiers.resourceProduction[resource] || 1.0;
    }

    getPopulationCapBonus() {
        return this.modifiers.additive.populationCap;
    }

    getBuildSpeedMultiplier() {
        return this.modifiers.multipliers.buildSpeed;
    }

    isUnlocked(feature) {
        return this.modifiers.unlocks[feature] || false;
    }
}

// Initialize globally
window.skillEffects = new SkillEffects();
