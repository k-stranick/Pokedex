let currentPokemonId = null;

document.addEventListener('DOMContentLoaded', () => {
    const MAX_POKEMON = 1051;
    const pokemonId = new URLSearchParams(window.location.search).get('id');

    const id = parseInt(pokemonId, 10);

    if (id < 1 || id > MAX_POKEMON) {
        window.location.href = '/index.html';
        return;
    }
});