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

        const percentageMatch = line.match(/([+-]?\d+)%/);
        if (percentageMatch) {
            const value = parseFloat(percentageMatch[1]) / 100;
            effects.push(...this.handlePercentageEffect(line, value));
        }
        const additiveMatch = line.match(/\+(\d+)\s/);
        if (additiveMatch) {
            effects.push(...this.handleAdditiveEffect(line, parseInt(additiveMatch[1])));
        }

        effects.push(...this.handleUnlockEffects(line));
        
        return effects;
    }

    handlePercentageEffect(line, value) {
        const effects = [];
        const effectMap = [
            { keywords: ['food yield'], effect: { type: 'resource', resource: 'Food' } },
            // ... (other effect mappings)
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
            // ... (other unlock mappings)
        };

        Object.entries(unlockMap).forEach(([keyword, feature]) => {
            if (line.includes(keyword)) {
                effects.push({ type: 'unlock', feature });
            }
        });
        return effects;
    }
}

window.skillEffects = new SkillEffects();