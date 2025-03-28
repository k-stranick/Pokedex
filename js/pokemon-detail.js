/**
 * @fileoverview
 * This module manages fetching data from the PokeAPI and rendering a detailed view
 * of a single Pokémon. It handles appearance, stats, navigation, and audio playback:
 * 
 * - **Data Fetching**: Retrieves Pokémon details (basic stats, types, abilities) and
 *   species data (flavor text).
 * 
 * - **Rendering**: Updates DOM elements such as Pokémon name, types, stats, height,
 *   weight, and flavor text. Dynamically applies coloring based on main Pokémon type.
 * 
 * - **Navigation**: Provides arrow-based navigation (left/right) to move between
 *   different Pokémon using their IDs.
 * 
 * - **Audio Playback**: Fetches and plays a Pokémon's cry via the provided legacy or
 *   latest cry URLs, handling any playback errors.
 * 
 * - **Helpers**: Converts units (meters, feet, kilograms, pounds) and capitalizes
 *   text. Injects custom styles for progress bars.
 * - **Initialization**: On DOMContentLoaded, checks Pokémon ID validity, fetches and
 *   renders data, sets up arrow navigation, and plays the Pokémon sound.
 * 
 * The code assumes the presence of specific DOM elements with known selectors,
 * inserts them into the document, and modifies style attributes as needed.
 * 
 * For more granular usage, each function includes a JSDoc comment detailing its
 * parameters, return values, and side effects.
 */


/**
 * Returns the first element within the document that matches the specified selector.
 * @param {string} selector - The CSS selector to match.
 * @param {ParentNode} [parent=document] - The parent element to query within.
 * @returns {Element} The first matching element.
 */
const qs = (selector, parent = document) => parent.querySelector(selector);

/**
 * Returns all elements within the document that match the specified selector.
 * @param {string} selector - The CSS selector to match.
 * @param {ParentNode} [parent=document] - The parent element to query within.
 * @returns {NodeList} A NodeList of matching elements.
 */
const qsa = (selector, parent = document) => parent.querySelectorAll(selector);

//APIs
const POKEMON_API = 'https://pokeapi.co/api/v2/pokemon/';
const POKEMON_SPECIES_API = 'https://pokeapi.co/api/v2/pokemon-species/'; //1051 total pokemon
const POKEMON_ARTWORK_API = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/';
const POKEMON_CRY_LEGACY = 'https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/legacy/';
const POKEMON_CRY_LATEST = 'https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/';

const MAX_POKEMON = 386;
const BASE_URL = '/pages/pokemon-details.html';

/**
 * Object mapping Pokémon types to their respective colors
 */
const typeColors = {
    normal: '#A8A878',
    fire: '#F08030',
    water: '#6890F0',
    electric: '#F8D030',
    grass: '#78C850',
    ice: '#98D8D8',
    fighting: '#C03028',
    poison: '#A040A0',
    ground: '#E0C068',
    flying: '#A890F0',
    psychic: '#F85888',
    bug: '#A8B820',
    rock: '#B8A038',
    ghost: '#705898',
    dragon: '#7038F8',
    dark: '#705848',
    steel: '#B8B8D0',
    fairy: '#EE99AC'
};


/**
 * Object mapping Pokémon stat names to their abbreviated form
 */
const statNameMapping = {
    hp: "HP",
    attack: "ATK",
    defense: "DEF",
    "special-attack": "SATK",
    "special-defense": "SDEF",
    speed: 'SPD',
};


/**
 * Returns the RGB color values from a given hex color.
 * @param {string} hexColor - The hex color code.
 * @returns {string} The RGB color values.
 */
function rgbFromHex(hexColor) {
    const r = parseInt(hexColor.slice(1, 3), 16);
    const g = parseInt(hexColor.slice(3, 5), 16);
    const b = parseInt(hexColor.slice(5, 7), 16);

    return `${r}, ${g}, ${b}`;
}


/**
 * Fetches JSON from a given URL, with error handling.
 * @param {string} url - The endpoint to fetch data from.
 * @returns {Promise<Object>} The JSON response.
 */
async function fetchJSON(url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Fetch failed: ${url} (${res.status})`);
    return await res.json();
}


/**
 * Fetches data for a specific Pokémon by its ID.
 * @param {number} id - The ID of the Pokémon to fetch.
 * @returns {Promise<{pokemonData: Object, pokemonSpeciesData: Object} | null>}
 */
async function fetchPokemonData(id) {
    if (!id) return null;

    try {
        const [pokemonData, pokemonSpeciesData] = await Promise.all([
            fetchJSON(`${POKEMON_API}${id}`),
            fetchJSON(`${POKEMON_SPECIES_API}${id}`)
        ]);

        return { pokemonData, pokemonSpeciesData };
    } catch (error) {
        console.error(`Failed to fetch Pokémon data for ID ${id}:`, error);
        return null;
    }
}


/**
 * Updates the Pokémon name and ID in the DOM.
 * @param {Object} pokemonData - The data object containing Pokémon details.
 */
function updatePokemonNameAndId(pokemonData) {
    const { name, id } = pokemonData;

    //update document title
    document.title = capitalizeFirstLetter(name);

    // pokemon name
    qs('.name-wrap .name').textContent = capitalizeFirstLetter(name);

    // pokemon id
    qs('.pokemon-id-wrap .twelve-pt-fonts').textContent = `#${String(id).padStart(3, '0')}`;
}


/**
 * Updates the Pokémon image in the DOM.
 * @param {Object} pokemonData - The data object containing Pokémon details.
 */
function updatePokemonImage(pokemonData) {
    const { id } = pokemonData;

    //Official Artwork from PokeAPI
    const imageElement = qs('.pokemon-image');
    imageElement.src = `${POKEMON_ARTWORK_API}${id}.png`;
}


/**
 * Updates the Pokémon type in the DOM.
 * @param {Object} pokemonData - The data object containing Pokémon details.
 */
function updatePokemonType(pokemonData) {
    const { types } = pokemonData;
    //Type of pokemon
    const typeWrapper = qs('.type-wrapper')
    typeWrapper.innerHTML = '';
    types.forEach(({ type }) => {
        createAndAppendElement(typeWrapper, 'p', {
            className: `body3-fonts type ${type.name}`,
            textContent: capitalizeFirstLetter(type.name)
        });
    });
}


/**
 * Converts decimeters to meters.
 * @param {number} decimeters - The height in decimeters.
 * @returns {number} The height in meters.
 */
function convertDecimetersToMeters(decimeters) {
    return decimeters / 10;
}


/**
 * Converts decimeters to feet.
 * @param {number} decimeters - The height in decimeters.
 * @returns {number} The height in feet.
 */
function convertDecimeterToFeet(decimeters) {
    return decimeters * 0.328084;
}


/**
 * Returns the feet part from the converted decimeters.
 * @param {number} convertedDecimeters - The height in feet.
 * @returns {number} The feet part.
 */
function getFeetFromConversion(convertedDecimeters) {
    return Math.floor(convertedDecimeters);
}


/**
 * Returns the inches part from the converted decimeters.
 * @param {number} convertedDecimeters - The height in feet.
 * @returns {number} The inches part.
 */
function getInchesFromConversion(convertedDecimeters) {
    return Math.round((convertedDecimeters % 1) * 12);
}


/**
 * Updates the height of a given Pokémon in the DOM.
 * @param {Object} pokemonData - The data object containing Pokémon details.
 */
function updatePokemonHeight(pokemonData) {
    const { height } = pokemonData;
    const decimeterToMeter = convertDecimetersToMeters(height);
    const convertedDecimeters = convertDecimeterToFeet(height);
    const feet = getFeetFromConversion(convertedDecimeters);
    const inches = getInchesFromConversion(convertedDecimeters);

    //height in meters
    qs('.pokemon-detail-wrap .pokemon-detail p.height-meter').textContent = `${decimeterToMeter} m`;

    //height in feet
    qs('.pokemon-detail-wrap .pokemon-detail p.height-feet').textContent = `${feet}' ${inches}"`;
}


/**
 * Converts hectograms to kilograms.
 * @param {number} hectograms - The weight in hectograms.
 * @returns {number} The weight in kilograms.
 */
function convertHectogramToKilograms(hectograms) {
    return hectograms / 10;
}


/**
 * Converts hectograms to pounds.
 * @param {number} hectograms - The weight in hectograms.
 * @returns {number} The weight in pounds.
 */
function convertHectogramsToPounds(hectograms) {
    return (hectograms / 4.536).toFixed(1);
}


/**
 * Updates the weight of a given pokemon in the DOM
 * This function converts the weight from hectograms to both kilograms and pounds, 
 * and updates the corresponding elements in the DOM with the converted values
 * 
 * @param {Object} pokemonData - The data object of a given pokemon returned from the API
 * @param {number} pokemonData.weight - The weight of the pokemon in hectograms
 */
function updatePokemonWeight(pokemonData) {
    const { weight } = pokemonData;
    const hectogramToKilogram = convertHectogramToKilograms(weight);
    const hectogramToPound = convertHectogramsToPounds(weight);

    // weight in kilograms
    qs('.pokemon-detail-wrap .pokemon-detail p.weight-kg').textContent = `${hectogramToKilogram} kg`;
    //weight in #
    qs('.pokemon-detail-wrap .pokemon-detail p.weight-pounds').textContent = `${hectogramToPound} lbs`;
}


/**
 * Updates the abilities of a given Pokémon in the DOM.
 * This function updates the abilities section in the DOM by clearing any existing abilities
 * and appending the new abilities from the provided Pokémon data.
 * @param {Object} pokemonData - The data object containing Pokémon details.
 * @param {Array} pokemonData.abilities - An array of ability objects for the Pokémon.
 */
function updatePokemonAbilities(pokemonData) {
    const { abilities } = pokemonData;

    //abilities
    const abilitiesWrapper = qs('.pokemon-detail-wrap .pokemon-detail.abilities');
    abilitiesWrapper.innerHTML = ''; // Clear old
    abilities.forEach(({ ability }) => {
        createAndAppendElement(abilitiesWrapper, 'p', {
            className: 'body3-fonts',
            textContent: capitalizeFirstLetter(ability.name)
        });
    });

}


/**
 * Updates the stats of a given Pokémon in the DOM.
 * This function updates the stats section in the DOM by clearing any existing stats
 * and appending the new stats from the provided Pokémon data.
 * @param {Object} pokemonData - The data object containing Pokémon details.
 * @param {Array} pokemonData.stats - An array of stat objects for the Pokémon.
 */
function updatePokemonStats(pokemonData) {
    const { stats } = pokemonData;

    //stats
    const statsWrapper = qs('.stats-wrapper');
    statsWrapper.innerHTML = '';
    stats.forEach(({ base_stat, stat }) => {
        const statDiv = document.createElement('div');
        statDiv.className = 'stats-wrap';
        statsWrapper.appendChild(statDiv);

        createAndAppendElement(statDiv, 'p', {
            className: 'body3-fonts stats',
            textContent: statNameMapping[stat.name]
        });
        createAndAppendElement(statDiv, 'p', {
            className: 'body3-fonts',
            textContent: String(base_stat).padStart(3, '0'),
        });
        createAndAppendElement(statDiv, 'progress', {
            className: 'progress-bar',
            value: base_stat,
            max: 100,
        });
    });
}


/**
 * Renders the details of a given Pokémon in the DOM.
 * This function updates various sections in the DOM with the provided Pokémon data,
 * including name, image, type, height, weight, abilities, stats, and flavor text.
 * @param {Object} pokemonData - The data object containing Pokémon details.
 * @param {Object} pokemonSpecies - The data object containing Pokémon species details.
 */
function renderPokemonDetails(pokemonData, pokemonSpecies) {
    if (!pokemonData || !pokemonSpecies) {
        console.error("Missing data to render Pokémon details");
        return;
    }

    updatePokemonNameAndId(pokemonData);
    updatePokemonImage(pokemonData);
    updatePokemonType(pokemonData);
    updatePokemonHeight(pokemonData);
    updatePokemonWeight(pokemonData);
    updatePokemonAbilities(pokemonData);
    updatePokemonStats(pokemonData);

    //flavor text ?? should this go here?
    qs('.body3-fonts.pokemon-description').textContent = getEnglishFlavorText(pokemonSpecies);

    //Type-Based Background Color
    applyTypeBackgroundColor(pokemonData);
}


/**
 * Creates and appends a new element to the specified parent element.
 * @param {Element} parent - The parent element to append the new element to.
 * @param {string} tag - The tag name of the new element.
 * @param {Object} [option={}] - An object containing properties to set on the new element.
 * @returns {Element} The created element.
 */
function createAndAppendElement(parent, tag, option = {}) {
    const element = document.createElement(tag);
    Object.keys(option).forEach(key => {
        element[key] = option[key];
    });
    parent.appendChild(element);
    return element;
}


/**
 * Retrieves the English flavor text from the Pokémon species data.
 * @param {Object} pokemonSpeciesData - The data object containing Pokémon species details.
 * @returns {string} The English flavor text.
 */
function getEnglishFlavorText(pokemonSpeciesData) {
    const entry = pokemonSpeciesData.flavor_text_entries.find(entry => entry.language.name === 'en');
    return entry ? entry.flavor_text.replace(/\f/g, ' ') : '';
}


/**
 * Applies the background color based on the Pokémon's main type.
 * @param {Object} pokemonData - The data object containing Pokémon details.
 */
function applyTypeBackgroundColor(pokemonData) {
    const mainType = pokemonData.types[0].type.name;
    const color = typeColors[mainType];

    if (!color) {
        console.warn(`color not defined for type: ${mainType}`);
        return;
    }

    //.detail-main 
    const detailMainElement = qs('.detail-main');
    detailMainElement.style.backgroundColor = color;
    detailMainElement.style.borderColor = color;

    // type background color
    qsa('.type-wrapper > p').forEach(element => {
        element.style.backgroundColor = color;
    });

    // stats headings 
    qsa('.stats-wrapper p.stats').forEach(element => {
        element.style.color = color;
    });

    // progress bars
    qsa('.stats-wrapper .progress-bar').forEach(element => {
        element.style.color = color;
    });

    // Inject style for the progress bar
    const rgbaColor = rgbFromHex(color);
    injectProgressBarStyles(rgbaColor);
}


/**
 * Injects custom styles for the progress bars in the stats section.
 * This function creates a style tag with custom styles for the progress bars
 * and appends it to the document head. The styles are based on the provided
 * RGBA color values.
 * @param {string} rgbaColor - The RGBA color values to be used for the progress bar styles.
 */
function injectProgressBarStyles(rgbaColor) {
    if (document.getElementById('progress-style')) return; // Skip if already injected

    const styleTag = document.createElement('style');
    styleTag.innerHTML = `
    .stats-wrap .progress-bar::-webkit-progress-bar {
        background-color:rgba(${rgbaColor}, 0.5);
    }
    .stats-wrap .progress-bar::-webkit-progress-value {
        background-color:rgba(${rgbaColor}, 1);
    }
    `;

    document.head.appendChild(styleTag);
} 


/**
 * Sets up the navigation arrows for moving between Pokémon.
 * @param {number} currentId - The current Pokémon ID.
 */
function setupArrows(currentId) {
    const leftArrow = document.querySelector('#leftArrow');
    const rightArrow = document.querySelector('#rightArrow');

    // remove any existing event listeners
    leftArrow.replaceWith(leftArrow.cloneNode(true));
    rightArrow.replaceWith(rightArrow.cloneNode(true));

    const newLeftArrow = document.querySelector('#leftArrow');
    const newRightArrow = document.querySelector('#rightArrow');

    //conditionally add event listeners
    if (currentId > 1) {
        newLeftArrow.addEventListener('click', () => {
            navigatePokemon(currentId - 1)
        });
    }
    if (currentId < MAX_POKEMON) {
        newRightArrow.addEventListener('click', () => {
            navigatePokemon(currentId + 1)
        });
    }
}


/**
 * Navigates to a new Pokémon by its ID.
 * @param {number} newId - The new Pokémon ID to navigate to.
 */
async function navigatePokemon(newId) {
    currentPokemonId = newId;
    const data = await fetchPokemonData(newId);

    if (data) {
        renderPokemonDetails(data.pokemonData, data.pokemonSpeciesData);
        setupArrows(newId);
        updateHistoryUrl(newId);
        playPokemonSound(newId);
    }
}


/**
 * Updates the URL with the new Pokémon ID.
 * @param {number} id - The new Pokémon ID.
 */
function updateHistoryUrl(id) {
    window.location.hash = `id=${id}`;

    // window.history.pushState({}, "", `${BASE_URL}?id=${id}`); // for use with server
}


let currentCry = null; // Store reference to the active audio

/**
 * Plays the Pokémon sound (cry) for a given Pokémon ID.
 * @param {number} id - The Pokémon ID.
 */
async function playPokemonSound(id) {
    try {
        const cryUrlLegacy = `${POKEMON_CRY_LEGACY}${id}.ogg`;
        const cryUrlLatest = `${POKEMON_CRY_LATEST}${id}.ogg`;

        // Stop and reset any previous sound
        if (currentCry) {
            currentCry.pause();
            currentCry.currentTime = 0; // Reset to the start
            currentCry.src = "";  // Ensure the audio source is cleared
            currentCry = null;    // Release the reference
        }

        // Create new audio and play
        currentCry = new Audio(cryUrlLegacy);
        currentCry.volume = 0.5; 

        try {
            await currentCry.play();
            if(id === 5) { //This is for charmeleon since the legacy sound is broken for some reason
                currentCry = new Audio(cryUrlLatest);
                currentCry.volume = 0.5; 
                await currentCry.play();
            }
        } catch (error) {
            console.error("Error playing cry from legacy URL, trying latest URL:", error);
            currentCry = new Audio(cryUrlLatest);
            currentCry.volume = 0.5; 
            await currentCry.play();
        }

        // Clear reference when audio ends
        currentCry.onended = () => currentCry = null;

    } catch (error) {
        console.error("Failed to play Pokémon sound:", error);
    }
}

let currentPokemonId = null;

document.addEventListener('DOMContentLoaded', init);

/**
 * Initializes the Pokémon details page.
 * This function is called when the DOM content is loaded. It checks the Pokémon ID validity,
 * fetches and renders the Pokémon data, sets up arrow navigation, and plays the Pokémon sound.
 */
function init() {
    const pokemonId = getPokemonIdFromURL();

    if (!isValidPokemonId(pokemonId)) {
        redirectHome();
        return;
    }

    currentPokemonId = pokemonId;
    fetchPokemonData(pokemonId).then((data) => {
        if (!data) return;
        renderPokemonDetails(data.pokemonData, data.pokemonSpeciesData);
        setupArrows(pokemonId);
        playPokemonSound(pokemonId);
    });
}


/**
 * Retrieves the Pokémon ID from the URL.
 * @returns {number} The Pokémon ID.
 */
function getPokemonIdFromURL() {
    const currentId = new URLSearchParams(window.location.search).get('id');
    return parseInt(currentId, 10);
}

/**
 * Checks if the given Pokémon ID is valid.
 * @param {number} id - The Pokémon ID to check.
 * @returns {boolean} True if the ID is valid, false otherwise.
 */
function isValidPokemonId(id) {
    return Number.isInteger(id) && id >= 1 && id <= MAX_POKEMON;
}


/**
 * Redirects the user to the home page.
 */
function redirectHome() {
    window.location.href = '../index.html';
}


/**
 * Capitalizes the first letter of a string.
 * @param {string} string - The string to capitalize.
 * @returns {string} The capitalized string.
 */
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}



/**
 * TEST FUNCTION FOR CHARMELEON SOUND
 */
// function playCharSound() {
//     const cryUrl = "https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/5.ogg";

//     const audio = new Audio(cryUrl);
//     audio.volume = 0.5;
//     audio.play().catch(error => console.error("Error playing cry:", error));
// }

//function playPokemonSound(id) {
    //     let currentCry = null; // Store reference to the active audio
    
    //     try {
    //         const cryUrl = `https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/legacy/${id}.ogg`;
    
    //         // Stop and reset any previous sound
    //         if (currentCry) {
    //             currentCry.pause();
    //             currentCry.currentTime = 0; // Reset to start
    //         }
    
    //         // Create new audio and play
    //         currentCry = new Audio(cryUrl);
    //         currentCry.volume = 0.5; // Adjust volume if needed
    //         currentCry.play().catch(error => console.error("Error playing cry:", error));
    
    //     } catch (error) {
    //         console.error("Failed to play Pokémon sound:", error);
    //     }
    // }
