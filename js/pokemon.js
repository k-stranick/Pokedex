const MAX_POKEMON = 386; // Number of Pokemon in the first generation (increase after working with the first generation)
const listWrapper = document.querySelector('.list-container');
const searchInput = document.querySelector('#search-input');
const numberFilter = document.querySelector('#number');
const nameFilter = document.querySelector('#name');
const notFoundMessage = document.querySelector('#not-found-message');

let allPokemon = []; // Array to store all Pokemon


// const typeFilter = document.querySelector('#type-filter');
// const searchButton = document.querySelector('#search-button');
// const detailWrapper = document.querySelector('.detail-wrapper');

const POKEMON_API = 'https://pokeapi.co/api/v2/pokemon';
const POKEMON_SPECIES_API = 'https://pokeapi.co/api/v2/pokemon-species';
const POKEMON_IMAGE_API = 'https://raw.githubusercontent.com/pokeapi/sprites/master/sprites/pokemon/other/official-artwork';

fetch(`${POKEMON_API}?limit=${MAX_POKEMON}`)
    .then(response => response.json())
    .then(data => {
        allPokemon = data.results;
        displayPokemon(allPokemon);
    });


async function fetchPokemonDataBeforeRedirect(id) {
    try {
        const responses = await Promise.all([
            fetch(`${POKEMON_API}/${id}`).then(response => response.json()),
            fetch(`${POKEMON_API}/${id}`).then(response => response.json()),
        ]);
        return {
            pokemonData: responses[0],
            pokemonSpecies: responses[1],
        };
    } catch (error) {
        console.error(`Failed to fetch Pokémon data: ${error}`);
        return null;
    }
}


async function displayPokemon(pokemon) {
    listWrapper.innerHTML = '';

    // Create a Bootstrap row for responsive layout
    const row = document.createElement('div');
    row.className = 'row g-4'; // g-4 adds spacing between cards

    pokemon.forEach(pokemon => {
        const pokemonId = pokemon.url.split('/')[6];

        const col = document.createElement('div');
        col.className = 'col-lg-3 col-md-4 col-sm-6'; // 4 columns on large screens, 3 on medium, 2 on small

        col.innerHTML = `
            <div class="card shadow border-0 text-center">
                <div class="card-header bg-danger text-white fw-bold">
                    #${pokemonId}
                </div>
                <img src='${POKEMON_IMAGE_API}/${pokemonId}.png' class="card-img-top p-3" alt="${pokemon.name}">
                <div class="card-body">
                    <h5 class="card-title text-capitalize">${pokemon.name}</h5>
                    <button class="btn btn-danger view-details" data-id="${pokemonId}">View Details</button>
                </div>
            </div>
        `;

        // Add event listener for clicking "View Details"
        col.querySelector('.view-details').addEventListener('click', async () => {
            const isFetched = await fetchPokemonDataBeforeRedirect(pokemonId);
            if (isFetched) {
                window.location.href = `./pages/pokemon-details.html?id=${pokemonId}`;
            }
        });

        row.appendChild(col);
    });

    listWrapper.appendChild(row);
}

searchInput.addEventListener("keyup", handleSearch);


function handleSearch() {
    const searchValue = searchInput.value.toLowerCase().trim();
    let filteredPokemon;

    if (!searchValue) {
        displayPokemon(allPokemon);
        notFoundMessage.classList.add('d-none');
        return;
    }

    if (numberFilter.checked) {
        filteredPokemon = allPokemon.filter(pokemon => {
            const pokemonId = pokemon.url.split('/')[6];
            return pokemonId.startsWith(searchValue);
        });
    } else if (nameFilter.checked) {
        filteredPokemon = allPokemon.filter(pokemon => pokemon.name.toLowerCase().startsWith(searchValue));
    } else {
        filteredPokemon = allPokemon;
    }

    displayPokemon(filteredPokemon);

    notFoundMessage.classList.toggle('d-none', filteredPokemon.length !== 0);


}

const clearButton = document.querySelector('#search-clear-icon');
clearButton.addEventListener('click', clearSearch); // Clear search input
function clearSearch() {
    searchInput.value = '';
    displayPokemon(allPokemon);
    notFoundMessage.style.display = 'none';
}