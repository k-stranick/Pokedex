const MAX_POKEMON = 151; // Number of Pokemon in the first generation (increase after working with the first generation)
const listWrapper = document.querySelector('.list-wrapper');
const searchInput = document.querySelector('#search-input');
const numberFilter = document.querySelector('#number-filter');
const nameFilter = document.querySelector('#name-filter');
const notFoundMessage = document.querySelector('.not-found-message');
let allPokemon = []; // Array to store all Pokemon


const typeFilter = document.querySelector('#type-filter');
const searchButton = document.querySelector('#search-button');
const detailWrapper = document.querySelector('.detail-wrapper');

const POKEMON_API = 'https://pokeapi.co/api/v2/pokemon/';

fetch(`${POKEMON_API}?limit=${MAX_POKEMON}`)
    .then(response => response.json())
    .then(data => {
        allPokemon = data.results;
        displayPokemon(allPokemon);
    });



/**
 * 
 * @param {*} id 
 */
async function fetchPokemonDataBeforeRedirect(id) {
    try {
        const [pokemonData, pokemonSpecies] = await Promise.all([
            fetch(`${POKEMON_API}${id}`).then(response => response.json()),
            fetch(`${POKEMON_API}species/${id}`).then(response => response.json()),
        ]);
        return true;

    } catch (error) {
        console.log(error + 'Failed to fetch Pokemon before redirect');
    }
}

/**
 * 
 * @param {*} pokemonList 
 */
async function displayPokemon(pokemonList) {
    listWrapper.innerHTML = '';
    pokemonList.forEach((pokemon, index) => {
        const listItem = document.createElement('li');
        listItem.textContent = pokemon.name;
        listItem.dataset.index = index;
        listWrapper.appendChild(listItem);
    });
}