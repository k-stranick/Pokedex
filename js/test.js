const qs = (selector) => document.querySelector(selector);

const API_URLS = {
    POKEMON: 'https://pokeapi.co/api/v2/pokemon/',
    POKEMON_SPECIES: 'https://pokeapi.co/api/v2/pokemon-species/',
    POKEMON_IMAGE: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/',
    POKEMON_CRY_LEGACY: 'https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/legacy/',
    POKEMON_CRY_LATEST: 'https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/'
};

const elements = {
    name: qs('#pokemon-name'),
    id: qs('#pokemon-id'),
    image: qs('#pokemon-image'),
    type: qs('#pokemon-type'),
    weight: qs('#pokemon-weight'),
    height: qs('#pokemon-height'),
    move: qs('#pokemon-move'),
    description: qs('#pokemon-description'),
    statsWrapper: qs('#stats-wrapper'),
    leftArrow: qs('#leftArrow'),
    rightArrow: qs('#rightArrow'),
    body: qs('body'),
    playCryBtn: qs('#play-cry-btn')
};

// Pokémon Type Colors for Background Adaptation
const typeColors = {
    normal: '#A8A878', fire: '#F08030', water: '#6890F0', electric: '#F8D030',
    grass: '#78C850', ice: '#98D8D8', fighting: '#C03028', poison: '#A040A0',
    ground: '#E0C068', flying: '#A890F0', psychic: '#F85888', bug: '#A8B820',
    rock: '#B8A038', ghost: '#705898', dragon: '#7038F8', dark: '#705848',
    steel: '#B8B8D0', fairy: '#EE99AC'
};

// Fetch Pokémon Data
async function fetchPokemonData(id) {
    if (!id) return null;

    try {
        const [pokemonRes, speciesRes] = await Promise.all([
            fetch(`${API_URLS.POKEMON}${id}`).then(res => res.json()),
            fetch(`${API_URLS.POKEMON_SPECIES}${id}`).then(res => res.json())
        ]);
        return { pokemonData: pokemonRes, pokemonSpecies: speciesRes };
    } catch (error) {
        console.error(`Failed to fetch Pokémon data: ${error}`);
        return null;
    }
}

// Render Pokémon Details
function renderPokemonDetails({ pokemonData, pokemonSpecies }) {
    const { id, name, height, weight, types, abilities, stats } = pokemonData;

    elements.name.textContent = capitalize(name);
    elements.id.textContent = `#${id.toString().padStart(3, '0')}`;
    elements.image.src = `${API_URLS.POKEMON_IMAGE}${id}.png`;
    elements.image.alt = name;

    elements.type.innerHTML = `Type: ${types.map(t => `<span class="badge bg-danger">${capitalize(t.type.name)}</span>`).join(' ')}`;

    elements.weight.innerHTML = `
        ${convertWeightToKg(weight)} kg / ${convertWeightToLbs(weight)} lbs
    `;
    elements.height.innerHTML = `
        ${convertHeightToMeters(height)} m / ${convertHeightToFeet(height)}
    `;

    elements.move.textContent = abilities.map(a => capitalize(a.ability.name)).join(', ');
    elements.description.textContent = getFlavorText(pokemonSpecies);

    renderStats(stats);
    applyBackgroundColor(types[0].type.name);

    setupArrows(id);
}

// Render Pokémon Stats
function renderStats(stats) {
    elements.statsWrapper.innerHTML = '';

    stats.forEach(({ base_stat, stat }) => {
        const statName = stat.name.replace('special-', 'Sp. ').toUpperCase();
        elements.statsWrapper.innerHTML += `
            <div class="mb-2">
                <p class="mb-1">${statName}: ${base_stat}</p>
                <div class="progress" style="height: 10px;">
                    <div class="progress-bar bg-danger" style="width: ${base_stat}%;"></div>
                </div>
            </div>
        `;
    });
}

// Set Background Color Based on Type
function applyBackgroundColor(type) {
    const color = typeColors[type] || '#A8A878';
    elements.body.style.backgroundColor = color;
}

// Get Pokémon Flavor Text
function getFlavorText(speciesData) {
    const entry = speciesData.flavor_text_entries.find(e => e.language.name === 'en');
    return entry ? entry.flavor_text.replace(/\f/g, ' ') : 'No description available.';
}

// Weight & Height Conversions
const convertWeightToKg = (hectograms) => (hectograms / 10).toFixed(1);
const convertWeightToLbs = (hectograms) => (hectograms / 4.536).toFixed(1);
const convertHeightToMeters = (decimeters) => (decimeters / 10).toFixed(1);
const convertHeightToFeet = (decimeters) => {
    const totalInches = Math.round(decimeters * 3.937);
    const feet = Math.floor(totalInches / 12);
    const inches = totalInches % 12;
    return `${feet}'${inches}"`;
};

// Navigation Arrows
function setupArrows(currentId) {
    elements.leftArrow.style.visibility = currentId > 1 ? 'visible' : 'hidden';
    elements.rightArrow.style.visibility = currentId < 386 ? 'visible' : 'hidden';

    elements.leftArrow.onclick = () => navigatePokemon(currentId - 1);
    elements.rightArrow.onclick = () => navigatePokemon(currentId + 1);
}

async function navigatePokemon(newId) {
    const data = await fetchPokemonData(newId);
    if (data) {
        renderPokemonDetails(data);
        window.history.pushState({}, "", `?id=${newId}`);
    }
}

// Play Pokémon Cry
async function playPokemonSound(id) {
    try {
        const cryUrlLegacy = `${API_URLS.POKEMON_CRY_LEGACY}${id}.ogg`;
        const cryUrlLatest = `${API_URLS.POKEMON_CRY_LATEST}${id}.ogg`;

        let audio = new Audio(cryUrlLegacy);
        audio.volume = 0.5;

        try {
            await audio.play();
        } catch {
            audio = new Audio(cryUrlLatest);
            audio.volume = 0.5;
            await audio.play();
        }
    } catch (error) {
        console.error("Failed to play Pokémon sound:", error);
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
    const id = new URLSearchParams(window.location.search).get('id');
    if (!id) return window.location.href = '../index.html';

    const data = await fetchPokemonData(id);
    if (data) {
        renderPokemonDetails(data);
    }

    elements.playCryBtn.addEventListener('click', () => playPokemonSound(id));
});

// Capitalize Helper
const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);
