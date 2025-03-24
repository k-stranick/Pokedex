const MAX_POKEMON = 386; // Number of Pokemon in the first generation (increase after working with the first generation)
let allPokemon = []; // Array to store all Pokemon

const elements = {
    listWrapper: document.querySelector('.list-container'),
    searchInput: document.querySelector('#search-input'),
    numberFilter: document.querySelector('#number'),
    nameFilter: document.querySelector('#name'),
    typeFilter: document.querySelector('#type'),
    notFoundMessage: document.querySelector('#not-found-message'),
    clearButton: document.querySelector('#search-clear-icon')
};

const API_URLS = {
    POKEMON: 'https://pokeapi.co/api/v2/pokemon',
    POKEMON_SPECIES_API: 'https://pokeapi.co/api/v2/pokemon-species',
    POKEMON_IMAGE: 'https://raw.githubusercontent.com/pokeapi/sprites/master/sprites/pokemon/other/official-artwork'
};


/**
 * Initializes the page by setting up event listeners and fetching Pokémon data.
 */
document.addEventListener("DOMContentLoaded", init);


/**
 * Fetches data for the first generation of Pokémon from the API and stores it in the allPokemon array.
 * Displays the fetched Pokémon on the page.
 * If an error occurs during fetching, displays an error message.
 */
async function fetchPokemonData() {
    try {

        const response = await fetch(`${API_URLS.POKEMON}?limit=${MAX_POKEMON}`);
        if (!response.ok) throw new Error(`Failed to fetch Pokémon: ${response.statusText}`);


        const data = await response.json();


        allPokemon = await Promise.all(data.results.map(async (pokemon) => {
            const detailsResponse = await fetch(pokemon.url);
            if (!detailsResponse.ok) throw new Error(`Failed to fetch details for ${pokemon.name}`);

            const details = await detailsResponse.json();
            return {
                name: details.name,
                id: details.id,
                types: details.types.map(t => t.type.name),
                image: `${API_URLS.POKEMON_IMAGE}/${details.id}.png`
            };
        }));

        displayPokemon(allPokemon);

    } catch (error) {
        console.error('Error fetching Pokémon:', error);
        elements.notFoundMessage.textContent = 'Failed to load Pokémon data';
        elements.notFoundMessage.classList.remove('d-none');
    }
}


/**
 * Fetches data for a specific Pokémon by its ID before redirecting to the details page.
 * @param {number} id - The ID of the Pokémon to fetch data for.
 * @returns {Object|null} The fetched Pokémon data, or null if an error occurs.
 */
async function fetchPokemonDataBeforeRedirect(id) {
    try {
        const response = await fetch(`${API_URLS.POKEMON}/${id}`);
        if (!response.ok) throw new Error(`Failed to fetch data for Pokémon ID ${id}`);
        return await response.json();
    } catch (error) {
        console.error(`Failed to fetch Pokémon data: ${error}`);
        return null;
    }
}


/**
 * Displays a list of Pokémon on the page.
 * @param {Array} pokemonList - The list of Pokémon to display.
 */
function displayPokemon(pokemonList) {
    elements.listWrapper.innerHTML = '';
    const fragment = document.createDocumentFragment();
    const row = document.createElement('div');
    row.className = 'row g-4';


    pokemonList.forEach(pokemon => {
        fragment.appendChild(createPokemonCard(pokemon));
    });

    row.appendChild(fragment);
    elements.listWrapper.appendChild(row);
}


/**
 * Creates a card for a Pokémon.
 * @param {Object} pokemon - The Pokémon data to display.
 * @returns {HTMLDivElement} The Pokémon card element.
 */
function createPokemonCard(pokemon) {
    const col = document.createElement('div');
    col.className = 'col-lg-3 col-md-4 col-sm-6';

    col.innerHTML = `
        <div class="card shadow border-0 text-center">
            <div class="card-header bg-danger text-white fw-bold">
                #${pokemon.id}
            </div>
            <img src='${pokemon.image}' class="card-img-top p-3" alt="${pokemon.name}">
            <div class="card-body">
                <h5 class="card-title text-capitalize">${pokemon.name}</h5>
                <button class="btn btn-danger view-details" data-id="${pokemon.id}">View Details</button>
            </div>
        </div>
    `;

    return col;
}


/**
 * Handles the search functionality for Pokémon.
 * Filters the Pokémon based on the search input and selected filter type (number, name, or type).
 * Displays the filtered Pokémon on the page.
 * If no Pokémon match the search criteria, displays a "not found" message.
 */
async function handleSearch() {
    const searchValue = elements.searchInput.value.toLowerCase().trim();
    if (!searchValue) {
        displayPokemon(allPokemon);
        elements.notFoundMessage.classList.add('d-none');
        return;
    }

    const searchTerms = searchValue.split(',').map(term => term.trim()).filter(term => term !== '');
    let filteredPokemon = [];

    switch (true) {
        case elements.numberFilter.checked:
            filteredPokemon = allPokemon.filter(pokemon =>
                searchTerms.some(term => pokemon.id.toString().startsWith(term))
            );
            break;
        case elements.nameFilter.checked:
            filteredPokemon = allPokemon.filter(pokemon =>
                searchTerms.some(term => pokemon.name.toLowerCase().startsWith(term))
            );
            break;
        case elements.typeFilter.checked:
            filteredPokemon = filterPokemonByType(searchTerms);
            break;
        default:
            filteredPokemon = allPokemon;
    }

    displayPokemon(filteredPokemon);
    elements.notFoundMessage.classList.toggle('d-none', filteredPokemon.length !== 0);
}


// /**
//  * Gets the active filter type (number, name, or type). 
//  * @returns {string} The active filter type (number, name, or type).
//  */
// function getActiveFilter() {
//     if (elements.numberFilter.checked) return 'number';
//     if (elements.nameFilter.checked) return 'name';
//     if (elements.typeFilter.checked) return 'type';
//     return null;
// }

// try and implement later when I can search for multiple filters 
// function getActiveFilters() {
//     return [...document.querySelectorAll('.filter input:checked')].map(input => input.id);
// }

/**
 * Filters the Pokémon by their types based on the search terms.
 * @param {Array} searchTerms - The search terms to filter Pokémon by.
 * @returns {Array} The filtered list of Pokémon.
 */
function filterPokemonByType(searchTerms) {
    return allPokemon.filter(pokemon =>
        searchTerms.some(term => pokemon.types.some(type => type.toLowerCase().includes(term)))
    );
}


/**
 * Clears the search input and displays all Pokémon.
 * Hides the "not found" message.
 */
function clearSearch() {
    elements.searchInput.value = '';
    displayPokemon(allPokemon);
    elements.notFoundMessage.classList.add('d-none');
}


/**
 * Handles clicking the "View Details" button using event delegation.
 * Redirects to the Pokémon details page and fetches the Pokémon data in the background for faster page load.
 * @param {Event} event - The click event.
 */
function handleViewDetails(event) {
    if (event.target.classList.contains('view-details')) {
        const pokemonId = event.target.dataset.id;

        // Redirect first
        window.location.href = `./pages/pokemon-details.html?id=${pokemonId}`;

        // Fetch in background for faster page load
        fetchPokemonDataBeforeRedirect(pokemonId);
    }
}

/**
 * Sets up event listeners for the search input and clear button.
 */
function setupEventListeners() {
    // Event Listeners
    elements.searchInput.addEventListener("keyup", handleSearch);
    elements.clearButton.addEventListener("click", clearSearch);
    elements.listWrapper.addEventListener("click", handleViewDetails);
}

/**
 * Initializes the page by setting up event listeners and fetching Pokémon data.
 */
function init() {
    setupEventListeners();
    fetchPokemonData(); // Initialize Pokémon data

}