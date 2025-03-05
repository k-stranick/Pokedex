let currentPokemonId = null;
const POKEMON_API = 'https://pokeapi.co/api/v2/pokemon/';
const POKEMON_SPECIES_API = 'https://pokeapi.co/api/v2/pokemon-species/';

document.addEventListener('DOMContentLoaded', () => {
    const MAX_POKEMON = 1051;
    const pokemonId = new URLSearchParams(window.location.search).get('pokemonId'); // fixed was passing id when i needed the full name 

    const id = parseInt(pokemonId, 10);

    if (id < 1 || id > MAX_POKEMON) {
        window.location.href = '/index.html';
        return; //prevent further code execution
    }

    currentPokemonId = id;
    loadPokemonData(id);

});

async function loadPokemonData(id) {

    try {
        const responses = await Promise.all([
            fetch(`${POKEMON_API}${id}`),
            fetch(`${POKEMON_SPECIES_API}${id}`)
        ]);

        if (!responses[0].ok || !responses[1].ok) {
            throw new Error(`HTTP error! Status: ${responses[0].status}, ${responses[1].status}`);
        }

        const [pokemonData, pokemonSpecies] = await Promise.all(responses.map(res => res.json()));
        const abilityWrapper = document.querySelector(".pokemon-detail-wrap .pokemon-detail.move");

        abilityWrapper.innerHTML = '';

        if (currentPokemonId === id) {
            displayPokemonDetails(pokemon);
            const flavorText = getEnglishFlavorText(pokemonSpecies);
            document.querySelector('.body3-fonts.pokemon-description').textContent = flavorText;
        };

        const [leftArrow, rightArrow] = ["#leftArrow", "#rightArrow"].map((sel) =>
            document.querySelector(sel)
        );
        leftArrow.removeEventListener("click", navigatePokemon);
        rightArrow.removeEventListener("click", navigatePokemon);

        if (id !== 1) {
            leftArrow.addEventListener("click", () => {
                navigatePokemon(id - 1);
            });
        }
        if (id !== 1051) {
            rightArrow.addEventListener("click", () => {
                navigatePokemon(id + 1);
            });
        }

        //pushes the history of changes to the url without reloading the page 
        window.history.pushState({}, "", `pages/pokemon-detail.html?pokemonId=${id}`);
        return { pokemonData, pokemonSpecies };

    } catch (error) {
        console.error(`Failed to fetch Pokémon before redirect: ${error.message}`);
        return null;
    }
}


async function navigatePokemon(id) {
    currentPokemonId = id;
    await loadPokemonData(id);
}

const typeColors = {
    normal: "#A8A878",
    fire: "#F08030",
    water: "#6890F0",
    electric: "#F8D030",
    grass: "#78C850",
    ice: "#98D8D8",
    fighting: "#C03028",
    poison: "#A040A0",
    ground: "#E0C068",
    flying: "#A890F0",
    psychic: "#F85888",
    bug: "#A8B820",
    rock: "#B8A038",
    ghost: "#705898",
    dragon: "#7038F8",
    dark: "#705848",
    steel: "#B8B8D0",
    dark: "#EE99AC"
}


function setElementStyles(elements, cssProperty, value) {
    elements.array.forEach(element => {
        element.style[cssProperty] = value;
    });
}


function rgbaFontHex(hexColor) {
    return [
        parseInt(hexColor.slice(1, 3), 16),
        parseInt(hexColor.slice(3, 5), 16),
        parseInt(hexColor.slice(5, 7), 16),
    ].join(',');
}


function setTypeBackgroundColo(pokemon) {
    const mainType = pokemon.types[0].type.name;
    const color = typeColors[mainType];

    if (!color) {
        console.warn(`color notdefined for type: ${mainType}`);
        return;
    }

    const detailMainElement = document.querySelector('.detail-main');
    setElementStyles([detailMainElement], "backgroundColor", color);
    setElementStyles([detailMainElement], "borderColor", color);
    setElementStyles(document.querySelectorAll)

}