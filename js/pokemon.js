const MAX_POKEMON = 1051; // Number of Pokemon in the first generation (increase after working with the first generation)
const listWrapper = document.querySelector('.list-wrapper');
const searchInput = document.querySelector('#search-input');
const numberFilter = document.querySelector('#number');
const nameFilter = document.querySelector('#name');
const notFoundMessage = document.querySelector('#not-found-message');

let allPokemon = []; // Array to store all Pokemon


const typeFilter = document.querySelector('#type-filter');
const searchButton = document.querySelector('#search-button');
const detailWrapper = document.querySelector('.detail-wrapper');

const POKEMON_API = 'https://pokeapi.co/api/v2/pokemon/';
const POKEMON_SPECIES_API = 'https://pokeapi.co/api/v2/pokemon-species/';

fetch(`${POKEMON_API}?limit=${MAX_POKEMON}`)
    .then(response => response.json())
    .then(data => {
        allPokemon = data.results;
        displayPokemon(allPokemon);
    });



/**
 * Fetch Pokémon data before redirecting to the details page
 * @param {number} id - Pokémon ID
 * @returns {Object|null} - Pokémon data if fetched successfully, null otherwise
 */
async function fetchPokemonDataBeforeRedirect(id) {
    try {
        const responses = await Promise.all([
            fetch(`${POKEMON_API}${id}`),
            fetch(`${POKEMON_SPECIES_API}${id}`)
        ]);

        if (!responses[0].ok || !responses[1].ok) {
            throw new Error(`HTTP error! Status: ${responses[0].status}, ${responses[1].status}`);
        }

        const [pokemonData, pokemonSpecies] = await Promise.all(responses.map(res => res.json()));

        return { pokemonData, pokemonSpecies };

    } catch (error) {
        console.error(`Failed to fetch Pokémon before redirect: ${error.message}`);
        return null;
    }
}


// async function fetchPokemonData(id) {
//     try {
//         const responses = await Promise.all([
//             fetch(`${POKEMON_API}${id}`).then(response => response.json()),
//             fetch(`${POKEMON_API}species/${id}`).then(response => response.json()),
//         ]);
//         return {
//             pokemonData: responses[0],
//             pokemonSpecies: responses[1],
//         };
//     } catch (error) {
//         console.error(`Failed to fetch Pokémon data: ${error}`);
//         return null;
//     }
// }

// /**
//  * 
//  * @param {*} pokemonList 
//  */
// async function displayPokemon(pokemonList) {
//     listWrapper.innerHTML = '';
//     pokemonList.forEach((pokemon, index) => {
//         const listItem = document.createElement('li');
//         listItem.textContent = pokemon.name;
//         listItem.dataset.index = index;
//         listWrapper.appendChild(listItem);
//     });
// }

async function displayPokemon(pokemon) {
    listWrapper.innerHTML = '';

    pokemon.forEach(pokemon => {
        const pokemonId = pokemon.url.split('/')[6];
        const listItem = document.createElement('div');
        listItem.className = 'list-item';
        listItem.innerHTML = `
        <div class='number-wrap'>
            <p class="caption-fonts">#${pokemonId}</p>
        </div>      
        <div class='img-wrap'>
            <img src="https://raw.githubusercontent.com/pokeapi/sprites/master/sprites/pokemon/other/official-artwork/${pokemonId}.png" alt="${pokemon.name}" />
        </div>
        <div class='name-wrap'>
            <p class="body3-fonts">#${pokemon.name}</p>
        </div> 
        `;

        listItem.addEventListener('click', async () => {
            const isFetched = await fetchPokemonDataBeforeRedirect(pokemonId);
            if (isFetched) {
                window.location.href = `/pages/pokemon-details.html?pokemonId=${pokemonId}`;
            }
        });
        listWrapper.appendChild(listItem);
    });
}


searchInput.addEventListener("keyup", handleSearch);


function handleSearch() {
    const searchValue = searchInput.value.toLowerCase().trim();
    let filteredPokemon;

    if (!searchValue) {
        displayPokemon(allPokemon);
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

    notFoundMessage.style.display = filteredPokemon.length === 0 ? 'block' : 'none';


}

const clearButton = document.querySelector('#search-clear-icon');
clearButton.addEventListener('click', clearSearch); // Clear search input
function clearSearch() {
    searchInput.value = '';
    displayPokemon(allPokemon);
    notFoundMessage.style.display = 'none';
}