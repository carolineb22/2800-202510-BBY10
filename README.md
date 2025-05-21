# Our Tomorrow

## About Us

Team Name: BBY-10
Team Members:

- Darion Delorme Set 2C
- Marcy Ordinario Set 2B
- Alex Hidalgo Set 2A
- Glenn Dossot Set 2C
- Caroline (Cyrus) Bastiaanssen Set 2A

## How to run locally with node

Code blocks are run in console in the root of the project directory.

### Setup project locally

Make sure you have your `.env` file set up properly with the necessary GUIDs, MongoDB connection parameters, and [OpenWeatherMap](https://openweathermap.org/api) API key.

- GUIDs can be generated from your browser.
- MongoDB database info can be given upon request.
- [OpenWeatherMap.org](https://openweathermap.org/api) key can be created through signing up for their free or student tier.

To run the project using `node`, run the following commands in the root of the project directory:

```bash
npm i
node index.js
```

If you prefer to use `nodemon`, use the following commands instead:

```bash
npm i
nodemon index.js
```

### TroubleShooting

If you encounter any issues not listed here, god help you.

#### Unable to access location data

If you encounter this issue, your browser may be blocking the site from accessing your location.
Tweak your indivudual browser's settings to fix this.

#### Unable to use OpenWeatherMap API key

If you have issues with the above, you'll have issues with the weather API as well.
You may also have been rate-limited from calling the API.
On the free plan for OpenWeatherMap you have a monthly limit of 1,000,000 calls per month, with an additional limit of 60 calls per minute.

#### Unable to call PuterAI

This is not a mainstream AI, your browser or network may be blocking this API for security reasons.
Again, tweak your browser's settings.

## About the Project

Our Tomorrow is an incremental game where your goal is to run a planet’s economy in a sustainable way. Your goal is to take advantage of your planet’s resources without leading the planet to its demise.

The Earth has fallen, and you are humanity's last hope. Frozen in cryogenic pods in a ramshackle vessel, the last of humanity arrives on Kepler-22b. Anxious, mourning, uneasy– the tense emotions resounding in every colonial's spirit eventually made way for hope.

### Gameplay Elements

Resources
Water
Humans consume it. Also heavily used by farms.
Made passively, or actively by buildings.

#### Water acquisition methods

Stage 1/2:
Passively | Needs geographical element
Aquifer pumps | Needs geographical element
Dams | Needs geographical element
Desalination plants
Reclamation center | Scales with population
Stage 3/4:
Largely the same, mainly efficiency upgrades
Food
Humans consume it. Increases in demand as the population grows.
Made by buildings, perishes.

#### Food acquisition methods

Stage 1/2:
Traditional farms
Greenhouses

Stage 3/4:
Vertical hydroponics farms.
Integrated into arcologies.
Meat-printing labs
Algae farms
Electricity
Every building needs it. Consumption will be a problem in later stages.

#### Electricity acquisition methods

Stage 1:
Fossil fuels
Hydro
Wind
Solar
Stage 2:
Fision
Tidal
Geothermal
Stage 3:
Advanced reactors (SMR/breeder)
Fusion
Stage 4:
END GAME: Dyson swarm
Building Materials
Generic material that represents everything from timber to concrete.
Metal
Generic metals that are used for pretty much everything.
Chemicals
Important for production of advanced goods. Dangerous to the environment if mismanaged, but extremely needed.
Advanced Goods
Represents electronics, chemicals, alloys, and anything highly artificial and complex. This is used in high amounts for researching and building more advanced things.
Metamaterials
End game material (stage 4) used for dyson swarms, asteroid mining, and hyper-advanced buildings.
Sector
A sector is an arbitrary division of land for the purposes of this game. Likely continents, to keep this simple we’ll keep this at 5 sectors.

A sector is composed of geographical elements. Geographical elements are as simply put as possible, biomes or unique locations. These are like floodplains where dams can be build, plains with high capacity, mines, etc.) These elements also have a depletion bar depending on what type they are. E.g. a floodplain could deplete due to global warming etc.

Example:
Sector A has:
3x floodplain | +3 building slots, +1 dam site, +2 farm site
6x dense forest | +2 building slots, +1 logging site (will passively deplete)
2x mineral rich mountain | +1 building slot, +2 mines

This means sector A has::
23 building slots
x/3 Dams
x/6 Farms
x/6 Logging sites
x/2 Mines

Building
A building to be built in a sector. These are called buildings but in a general nebulous sense could be a single building, or a large collection of them. For example, you could build “Single homes”, as one building.

These are the crux of the game. Unlocking new ones and building them is how you improve the incremental aspect of this game, e.g. a better mine. After they are built, they can either be replaced (building another thing on its spot) or demolished. Technologies may buff buildings, e.g. “Smart water usage metering” reduces water consumption by housing by 5%.

Building types:
Housing | Holds people
Single homes
Apartments
Highrises
Floating homes (on ocean :D)
Arcologies
Geographical element extraction | e.g. coal power plants for a coal mine
Processing | Makes more complex stuff with simple stuff
Factories (Turns  
Research labs (Needed to progress)

Stages
Stage 1: City-state (Single sector)
Introduction
As the flickering engines of the colony ship died down and landfall was made, the verdant landscape once more reminded that this was a second chance. Not to repeat the mistakes of your forefathers on Mother Earth, a more thoughtful approach is needed.

This is the starting point, using existing technology to start off expansion.

Stage 2: Expansion (Single -> Multi sector)
Introduction
Having grown from a city to a continent, the need for resources was rapidly felt. Survey teams have already charted the globe, but now resources were to be funneled to new frontier cities. In a bid to expand, will humanity once again overexploit?
Stage 3: Planetary
Introduction
Kepler-22b is no longer a replacement for a dead planet– it is home. Every part inhabitable is now walked upon by humans. Building upon the innovations of old, technology has promised and delivered ways to live without draining the life of Kepler. However, this peace is metastable. Metal, concrete, advanced goods, more and more are needed to keep this peace alive. Where will you turn?
Stage 4: Interplanetary
Introduction
Resource extraction could no longer come from within. One cannot build a house by digging its foundation, thus the answer was found in the stars. Once the first asteroids were hauled back to Keplerite orbit, it seemed the ground sighed in relief as the last mines were closed. Resources abundant, the last shortages humanity had tackled on the ground could alas be answered.
