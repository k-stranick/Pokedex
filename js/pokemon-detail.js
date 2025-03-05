let currentPokemonId = null;

document.addEventListener('DOMContentLoaded', () => {
    const MAX_POKEMON = 1051;
    const pokemonId = new URLSearchParams(window.location.search).get('id');

    const id = parseInt(pokemonId, 10);

    if (id < 1 || id > MAX_POKEMON) {
        window.location.href = '/index.html';
    }

    currentPokemonId = id;
    loadPokemonData(id);

});

async function loadPokemonData(id) {
    const POKEMON_API = 'https://pokeapi.co/api/v2/pokemon/';
    const POKEMON_SPECIES_API = 'https://pokeapi.co/api/v2/pokemon-species/';

    try {
        const responses = await Promise.all([
            fetch(`${POKEMON_API}${id}`),
            fetch(`${POKEMON_SPECIES_API}${id}`)
        ]);

        if (!responses[0].ok || !responses[1].ok) {
            throw new Error(`HTTP error! Status: ${responses[0].status}, ${responses[1].status}`);
        }

        const [pokemonData, pokemonSpecies] = await Promise.all(responses.map(res => res.json()));
        const abilityWrapper = document.querySelector(".pokemon-detail-wrap .pokemon-detail-move");

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

        window.history.pushState({}, "", `pages/pokemon-detail.html?id=${id}`);
        return { pokemonData, pokemonSpecies };

    } catch (error) {
        console.error(`Failed to fetch Pokémon before redirect: ${error.message}`);
        return null;
    }
}