const qs = (selector, parent = document) => parent.querySelector(selector);
const qsa = (selector, parent = document) => parent.querySelectorAll(selector);


const POKEMON_API = 'https://pokeapi.co/api/v2/pokemon/';
const POKEMON_SPECIES_API = 'https://pokeapi.co/api/v2/pokemon-species/'; //1051 total pokemon
const POKEMON_ARTWORK_API = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/';
const POKEMON_CRY = `https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/legacy/`;
const MAX_POKEMON = 1051;


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
    // dark: '#EE99AC'
};


const statNameMapping = {
    hp: "HP",
    attack: "ATK",
    defense: "DEF",
    "special-attack": "SATK",
    "special-defense": "SDEF",
    speed: 'SPD',
};


function rgbFromHex(hexColor) {
    const r = parseInt(hexColor.slice(1, 3), 16);
    const g = parseInt(hexColor.slice(3, 5), 16);
    const b = parseInt(hexColor.slice(5, 7), 16);

    return `${r}, ${g}, ${b}`;
}


async function fetchPokemonData(id) {
    try {
        const [pokemonResponse, speciesResponse] = await Promise.all([
            fetch(`${POKEMON_API}${id}`),
            fetch(`${POKEMON_SPECIES_API}${id}`)
        ]);

        if (!pokemonResponse.ok || !speciesResponse.ok) {
            throw new Error(`HTTP error! Status: ${pokemonResponse.status}, ${speciesResponse.status}`
            );
        }

        const [pokemonData, pokemonSpeciesData] = await Promise.all([
            pokemonResponse.json(),
            speciesResponse.json()
        ]);

        return { pokemonData, pokemonSpeciesData };

    } catch (error) {
        console.error(`Failed to fetch Pokémon data: ${error}`);
        return null;
    }
}


function renderPokemonDetails(pokemonData, pokemonSpecies) {
    if (!pokemonData || !pokemonSpecies) {
        console.error("Missing data to render Pokémon details");
        return;
    }

    const { name, id, types, weight, height, abilities, stats } = pokemonData;

    //update document title
    document.title = capitalizeFirstLetter(name);

    //name and id
    qs('.name-wrap .name').textContent = capitalizeFirstLetter(name);
    qs('.pokemon-id-wrap .body2-fonts').textContent = `#${String(id).padStart(3, '0')}`;

    //Official Artwork
    const imageElement = qs('.detail-img-wrapper img');
    imageElement.src = `${POKEMON_ARTWORK_API}${id}.png`;

    //Type of pokemon
    const typeWrapper = qs('.power-wrapper')
    typeWrapper.innerHTML = '';
    types.forEach(({ type }) => {
        createAndAppendElement(typeWrapper, 'p', {
            className: `body3-fonts type ${type.name}`,
            textContent: capitalizeFirstLetter(type.name)
        });
    });

    //weight and height TODO: convert to imperial units
    qs('.pokemon-detail-wrap .pokemon-detail p.body3-fonts.weight').textContent = `${weight / 10} kg`;
    qs('.pokemon-detail-wrap .pokemon-detail p.body3-fonts.height').textContent = `${height / 10} m`;

    //abilities
    const abilitiesWrapper = qs('.pokemon-detail-wrap .pokemon-detail.move');
    abilitiesWrapper.innerHTML = ''; // Clear old
    abilities.forEach(({ ability }) => {
        createAndAppendElement(abilitiesWrapper, 'p', {
            className: 'body3-fonts',
            textContent: capitalizeFirstLetter(ability.name)
        });
    });

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

    //flavor text ?? should this go here?
    qs('.body3-fonts.pokemon-description').textContent = getEnglishFlavorText(pokemonSpecies);

    //Type-Based Background Color
    applyTypeBackgroundColor(pokemonData);
}


function createAndAppendElement(parent, tag, option = {}) {
    const element = document.createElement(tag);
    Object.keys(option).forEach(key => {
        element[key] = option[key];
    });
    parent.appendChild(element);
    return element;
}


function getEnglishFlavorText(pokemonSpeciesData) {
    // for (let entry of pokemonSpecies.flavor_text_entries) {
    //     if (entry.language.name === 'en') {
    //         let flavor = entry.flavor_text.replace(/\f/g, ' ');
    //         return flavor;
    //     }
    // }
    // return '';
    const entry = pokemonSpeciesData.flavor_text_entries.find(entry => entry.language.name === 'en');
    return entry ? entry.flavor_text.replace(/\f/g, ' ') : '';
}


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
    qsa('.power-wrapper > p').forEach(element => {
        element.style.backgroundColor = color;
    });

    // stats headings 
    qsa('.stats-wrapper p.stats').forEach(element => {
        element.style.backgroundColor = color;
    });

    // progress bars
    qsa('.stats-wrapper .progress-bar').forEach(element => {
        element.style.backgroundColor = color;
    });

    // Inject style for the progress bar
    const rgbaColor = rgbFromHex(color);
    injectProgressBarStyles(rgbaColor, color);
}


function injectProgressBarStyles(rgbaColor, color) {
    const styleTag = document.createElement('style');
    styleTag.innerHTML = `
    .stats-wrap .progressbar::-webkit-progress-bar {
        background-color:(${rgbaColor}, 0.5);
    }
    .stats-wrap .progressbar::-webkit-progress-value {
        background-color:(${color}, 0.5);
    }
    `;

    document.head.appendChild(styleTag);

}


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


function updateHistoryUrl(id) {
    window.history.pushState({}, "", `pages/pokemon-details.html?id=${id}`);
}


let currentCry = null; // Store reference to the active audio

async function playPokemonSound(id) {
    try {
        const cryUrl = `${POKEMON_CRY}${id}.ogg`;

        // Stop and reset any previous sound
        if (currentCry) {
            currentCry.pause();
            currentCry.currentTime = 0; // Reset to the start
            currentCry.src = "";  // Ensure the audio source is cleared
            currentCry = null;    // Release the reference
        }

        // Create new audio and play
        currentCry = new Audio(cryUrl);
        currentCry.volume = 0.5; // Adjust volume if needed

        await currentCry.play(); //.catch(error => console.error("Error playing cry:", error));

        // Clear reference when audio ends
        currentCry.onended = () => currentCry = null;

    } catch (error) {
        console.error("Failed to play Pokémon sound:", error);
    }
}


let currentPokemonId = null;

document.addEventListener('DOMContentLoaded', init);

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


function getPokemonIdFromURL() {
    const currentId = new URLSearchParams(window.location.search).get('id');
    return parseInt(currentId, 10);
}


function isValidPokemonId(id) {
    return Number.isInteger(id) && id >= 1 && id <= MAX_POKEMON;
}


function redirectHome() {
    window.location.href = '/index.html';
}


function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}