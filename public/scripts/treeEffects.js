class SkillEffects {
    constructor() {
        this.resetModifiers();
    }

    resetModifiers() {
        this.modifiers = {
            additive: {
                populationCap: 0
            },
            multipliers: {
                buildSpeed: 1.0,
                researchSpeed: 1.0,
                productionEfficiency: 1.0,
                diseaseRate: 1.0,
                environmentalStrain: 1.0,
                transportPollution: 1.0,
                laborRequirements: 1.0,
                landUse: 1.0,
                harvestSpeed: 1.0,
                foodQuality: 1.0,
                materialEfficiency: 1.0,
                energyCapacity: 1.0,
                foodSpoilage: 1.0,
                foodYield: 1.0,
                waterOutput: 1.0
            },
            unlocks: {
                newRegions: false,
                newAreas: false
            }
        };
        console.log("Reset all skill modifiers to default values");
    }

    parseEffectDescription(description) {
        const effectText = description.split('<b>Effect:</b>')[1] || '';
        const effects = effectText.split('</br>')
            .filter(line => line.trim())
            .flatMap(line => this.parseEffectLine(line.trim()));
        
        console.log(`Parsed effects from description:`, effects);
        return effects;
    }

    parseEffectLine(line) {
        const effects = [];
        if (!line || line.includes('NO EFFECT')) {
            console.log("Skipping line with NO EFFECT");
            return effects;
        }

        // Percentage modifiers
        const percentageMatch = line.match(/([+-]?\d+)%/);
        if (percentageMatch) {
            const value = parseFloat(percentageMatch[1]) / 100;
            console.log(`Found percentage effect: ${value * 100}%`);
            effects.push(...this.handlePercentageEffect(line, value));
        }

        // Additive values
        const additiveMatch = line.match(/\+(\d+)\s/);
        if (additiveMatch) {
            const value = parseInt(additiveMatch[1]);
            console.log(`Found additive effect: +${value}`);
            effects.push(...this.handleAdditiveEffect(line, value));
        }

        // Unlocks
        const unlockEffects = this.handleUnlockEffects(line);
        if (unlockEffects.length > 0) {
            console.log(`Found unlock effects:`, unlockEffects);
        }
        effects.push(...unlockEffects);

        return effects;
    }

    handlePercentageEffect(line, value) {
        const effects = [];
        const effectMap = [
            { keywords: ['food yield'], effect: { type: 'multiplier', stat: 'foodYield' } },
            { keywords: ['build speed'], effect: { type: 'multiplier', stat: 'buildSpeed' } },
            { keywords: ['research speed'], effect: { type: 'multiplier', stat: 'researchSpeed' } },
            { keywords: ['disease rate'], effect: { type: 'multiplier', stat: 'diseaseRate' } },
            { keywords: ['environmental strain'], effect: { type: 'multiplier', stat: 'environmentalStrain' } },
            { keywords: ['transport pollution'], effect: { type: 'multiplier', stat: 'transportPollution' } },
            { keywords: ['labor', 'worker requirements'], effect: { type: 'multiplier', stat: 'laborRequirements' } },
            { keywords: ['land use'], effect: { type: 'multiplier', stat: 'landUse' } },
            { keywords: ['harvest speed'], effect: { type: 'multiplier', stat: 'harvestSpeed' } },
            { keywords: ['food quality'], effect: { type: 'multiplier', stat: 'foodQuality' } },
            { keywords: ['material efficiency'], effect: { type: 'multiplier', stat: 'materialEfficiency' } },
            { keywords: ['energy capacity'], effect: { type: 'multiplier', stat: 'energyCapacity' } },
            { keywords: ['food spoilage'], effect: { type: 'multiplier', stat: 'foodSpoilage' } },
            { keywords: ['water output'], effect: { type: 'multiplier', stat: 'waterOutput' } }
        ];

        effectMap.forEach(({ keywords, effect }) => {
            if (keywords.some(kw => line.includes(kw))) {
                const finalValue = 1 + value;
                console.log(`Applying percentage modifier to ${effect.stat}: ${finalValue}x`);
                effects.push({ ...effect, value: finalValue });
            }
        });

        return effects;
    }

    handleAdditiveEffect(line, value) {
        const effects = [];
        if (line.includes('population cap')) {
            console.log(`Adding ${value} to population cap`);
            effects.push({ type: 'additive', stat: 'populationCap', value });
        }
        return effects;
    }

    handleUnlockEffects(line) {
        const effects = [];
        if (line.includes('Unlocks new regions')) {
            console.log("Unlocking new regions");
            effects.push({ type: 'unlock', feature: 'newRegions' });
        }
        if (line.includes('Unlocks new areas')) {
            console.log("Unlocking new areas");
            effects.push({ type: 'unlock', feature: 'newAreas' });
        }
        return effects;
    }

    applySkillEffects(skillId) {
        console.log(`Applying effects for skill: ${skillId}`);
        const skill = document.getElementById(skillId);
        if (!skill) {
            console.error(`Skill ${skillId} not found!`);
            return;
        }

        const effects = this.parseEffectDescription(skill.dataset.description);
        console.log(`Found ${effects.length} effects to apply`);

        effects.forEach(effect => {
            switch (effect.type) {
                case 'additive':
                    console.log(`Adding ${effect.value} to ${effect.stat}`);
                    this.modifiers.additive[effect.stat] += effect.value;
                    break;
                case 'multiplier':
                    console.log(`Multiplying ${effect.stat} by ${effect.value}`);
                    this.modifiers.multipliers[effect.stat] *= effect.value;
                    break;
                case 'unlock':
                    console.log(`Unlocking ${effect.feature}`);
                    this.modifiers.unlocks[effect.feature] = true;
                    break;
            }
        });

        this.updateGameSystems();
        console.log(`Current modifiers after applying ${skillId}:`, this.modifiers);
    }

    updateGameSystems() {
        console.log("Updating game systems with new modifiers");
        // Implementation would connect to your game systems
    }

    // Helper methods
    getPopulationCapBonus() {
        console.log(`Getting population cap bonus: ${this.modifiers.additive.populationCap}`);
        return this.modifiers.additive.populationCap;
    }

    getFoodYieldMultiplier() {
        console.log(`Getting food yield multiplier: ${this.modifiers.multipliers.foodYield}`);
        return this.modifiers.multipliers.foodYield;
    }

    isUnlocked(feature) {
        const unlocked = this.modifiers.unlocks[feature] || false;
        console.log(`Checking if ${feature} is unlocked: ${unlocked}`);
        return unlocked;
    }
}

// Initialize globally with console message
console.log("Initializing SkillEffects system");
window.skillEffects = new SkillEffects();