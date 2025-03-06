let currentPokemonId = null;
const POKEMON_API = 'https://pokeapi.co/api/v2/pokemon';
const POKEMON_SPECIES_API = 'https://pokeapi.co/api/v2/pokemon-species'; //1051 total pokemon

document.addEventListener('DOMContentLoaded', () => {
    const MAX_POKEMON = 151;
    const pokemonId = new URLSearchParams(window.location.search).get('id'); // fixed was passing id when i needed the full name pokemonI

    const id = parseInt(pokemonId, 10);

    if (id < 1 || id > MAX_POKEMON) {
        return (window.location.href = '/index.html');
        //return; //prevent further code execution
    }

    currentPokemonId = id;
    loadPokemonData(id);

});

async function loadPokemonData(id) {


    try {
        // const responses = await Promise.all([
        //     fetch(`${POKEMON_API}${id}`),
        //     fetch(`${POKEMON_SPECIES_API}${id}`)
        // ]);

        // if (!responses[0].ok || !responses[1].ok) {
        //     throw new Error(`HTTP error! Status: ${responses[0].status}, ${responses[1].status}`);
        // }

        // const [pokemonData, pokemonSpecies] = await Promise.all(responses.map(res => res.json()));



        const [pokemon, pokemonSpecies] = await Promise.all([
            fetch(`${POKEMON_API}/${id}`).then(response => response.json()),

            fetch(`${POKEMON_SPECIES_API}/${id}`).then(response => response.json())
        ]);



        const abilityWrapper = document.querySelector(".pokemon-detail-wrap .pokemon-detail.move");

        abilityWrapper.innerHTML = '';

        if (currentPokemonId === id) {
            displayPokemonDetails(pokemon);
            const flavorText = getEnglishFlavorText(pokemonSpecies);
            document.querySelector(".body3-fonts.pokemon-description").textContent = flavorText;


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
            if (id !== 151) {
                rightArrow.addEventListener("click", () => {
                    navigatePokemon(id + 1);
                });
            }

            //pushes the history of changes to the url without reloading the page 
            window.history.pushState({}, "", `/pages/pokemon-details.html?id=${id}`);
        }

        return true;

    } catch (error) {
        console.error(`Failed to fetch Pokémon data: ${error}`);
        return false;
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
    elements.forEach(element => {
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


function setTypeBackgroundColor(pokemon) {
    const mainType = pokemon.types[0].type.name;
    const color = typeColors[mainType];

    if (!color) {
        console.warn(`color not defined for type: ${mainType}`);
        return;
    }

    const detailMainElement = document.querySelector('.detail-main');
    setElementStyles([detailMainElement], "backgroundColor", color);
    setElementStyles([detailMainElement], "borderColor", color);
    setElementStyles(document.querySelectorAll(".power-wrapper > p"), "backgroundColor", color);
    setElementStyles(document.querySelectorAll(".stats-wrapper p.stats"), "backgroundColor", color);
    setElementStyles(document.querySelectorAll(".stats-wrapper .progress-bar"), "backgroundColor", color);

    const rgbaColor = rgbaFontHex(color);
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

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function createAndAppendElement(parent, tag, option = {}) {
    const element = document.createElement(tag);
    Object.keys(option).forEach(key => {
        element[key] = option[key];
    });
    parent.appendChild(element);
    return element;
}

function displayPokemonDetails(pokemon) {
    const { name, id, types, weight, height, abilities, stats } = pokemon;
    const capitalizePokemonName = capitalizeFirstLetter(name);

    document.querySelector('title').textContent = capitalizePokemonName;

    const detailMainElement = document.querySelector('.detail-main');
    detailMainElement.classList.add(name.toLowerCase());

    document.querySelector('.name-wrap .name').textContent = capitalizePokemonName;

    document.querySelector('.pokemon-id-wrap .body2-fonts').textContent = `#${String(id).padStart(3, '0')}`;

    const imageElement = document.querySelector('.detail-img-wrapper img');
    imageElement.src = `https://raw.githubusercontent.com/pokeapi/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;

    const typeWrapper = document.querySelector('.power-wrapper');
    typeWrapper.innerHTML = '';
    types.forEach(({ type }) => {
        const typeElement = createAndAppendElement(typeWrapper, 'p', {
            className: `body3-fonts type ${type.name}`,
            textContent: capitalizeFirstLetter(type.name)
        });
    });

    document.querySelector('.pokemon-detail-wrap .pokemon-detail p.body3-fonts.weight').textContent = `${weight / 10} kg`;
    document.querySelector('.pokemon-detail-wrap .pokemon-detail p.body3-fonts.height').textContent = `${height / 10} m`;

    const abilitiesWrapper = document.querySelector('.pokemon-detail-wrap .pokemon-detail.move');
    pokemon.abilities.forEach(({ ability }) => {
        createAndAppendElement(abilitiesWrapper, 'p', {
            className: 'body3-fonts',
            textContent: capitalizeFirstLetter(ability.name)
        });
    });
    const statsWrapper = document.querySelector('.stats-wrapper');
    statsWrapper.innerHTML = '';

    const statNameMapping = {
        hp: 'HP',
        attack: 'ATK',
        defense: 'DEF',
        special_attack: 'SATK',
        special_defense: 'SDEF',
        speed: 'SPD',
    };
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

    setTypeBackgroundColor(pokemon);
}

function getEnglishFlavorText(pokemonSpecies) {
    for (let entry of pokemonSpecies.flavor_text_entries) {
        if (entry.language.name === 'en') {
            let flavor = entry.flavor_text.replace(/\f/g, ' ');
            return flavor;
        }
    }
    return '';
}

function throttle(func, limit) {
    let lastFunc;
    let lastRan;

    return function () {
        const context = this;
        const args = arguments;
        if (!lastRan) {
            func.apply(context, args);
            lastRan = Date.now();
        } else {
            clearTimeout(lastFunc);
            lastFunc = setTimeout(function () {
                if ((Date.now() - lastRan) >= limit) {
                    func.apply(context, args);
                    lastRan = Date.now();
                }
            }, limit - (Date.now() - lastRan));
        }
    };
}
