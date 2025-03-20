const MAX_POKEMON = 386; // Number of Pokemon in the first generation (increase after working with the first generation)

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

let allPokemon = []; // Array to store all Pokemon


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


function displayPokemon(pokemonList) {
    elements.listWrapper.innerHTML = '';

    const row = document.createElement('div');
    row.className = 'row g-4';

    const fragment = document.createDocumentFragment();

    pokemonList.forEach(pokemon => {
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

        fragment.appendChild(col);
    });

    row.appendChild(fragment);
    elements.listWrapper.appendChild(row);
}


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

function filterPokemonByType(searchTerms) {
    return allPokemon.filter(pokemon =>
        searchTerms.some(term => pokemon.types.some(type => type.toLowerCase().includes(term)))
    );
}

function clearSearch() {
    elements.searchInput.value = '';
    displayPokemon(allPokemon);
    elements.notFoundMessage.classList.add('d-none');
}

/**
 * Handles clicking the "View Details" button using event delegation
 */
function handleViewDetails(event) {
    if (event.target.classList.contains('view-details')) {
        const pokemonId = event.target.dataset.id;

        // Redirect first
        window.location.href = `./pages/test.html?id=${pokemonId}`;

        // Fetch in background for faster page load
        fetchPokemonDataBeforeRedirect(pokemonId);
    }
}

// Event Listeners
elements.searchInput.addEventListener("keyup", handleSearch);
elements.clearButton.addEventListener("click", clearSearch);
elements.listWrapper.addEventListener("click", handleViewDetails);

// Initialize Pokémon data
fetchPokemonData();