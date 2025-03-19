async function fetchPokemonData() {
    try {
        const response = await fetch(`${API_URLS.POKEMON}?limit=${MAX_POKEMON}`);
        if (!response.ok) throw new Error(`Failed to fetch Pokémon: ${response.statusText}`);

        const data = await response.json();

        allPokemon = await Promise.all(data.results.map(async (pokemon) => {
            const detailsResponse = await fetch(pokemon.url);
            if (!detailsResponse.ok) throw new Error(`Failed to fetch details for ${pokemon.name}`);
            const details = await detailsResponse.json();

            // Pre-fetch species data and store it
            const speciesResponse = await fetch(`${API_URLS.POKEMON_SPECIES_API}/${details.id}`);
            const speciesData = speciesResponse.ok ? await speciesResponse.json() : null;

            return {
                name: details.name,
                id: details.id,
                types: details.types.map(t => t.type.name),
                image: `${API_URLS.POKEMON_IMAGE}/${details.id}.png`,
                species: speciesData // Store species data
            };
        }));

        // Store in localStorage for faster access
        localStorage.setItem('pokemonData', JSON.stringify(allPokemon));

        displayPokemon(allPokemon);

    } catch (error) {
        console.error('Error fetching Pokémon:', error);
        elements.notFoundMessage.textContent = 'Failed to load Pokémon data';
        elements.notFoundMessage.classList.remove('d-none');
    }
}


async function fetchPokemonData(id) {
    if (!id) return;

    // Try retrieving from localStorage
    const cachedData = JSON.parse(localStorage.getItem('pokemonData')) || [];
    const pokemon = cachedData.find(p => p.id == id);

    if (pokemon) {
        console.log("Loaded from localStorage:", pokemon);
        return { pokemonData: pokemon, pokemonSpeciesData: pokemon.species };
    }

    // If not in localStorage, fetch from API
    try {
        const [pokemonResponse, speciesResponse] = await Promise.all([
            fetch(`${POKEMON_API}${id}`),
            fetch(`${POKEMON_SPECIES_API}${id}`)
        ]);

        if (!pokemonResponse.ok || !speciesResponse.ok) {
            throw new Error(`HTTP error! Status: ${pokemonResponse.status}, ${speciesResponse.status}`);
        }

        const [pokemonData, pokemonSpeciesData] = await Promise.all([
            pokemonResponse.json(),
            speciesResponse.json()
        ]);

        return { pokemonData, pokemonSpeciesData };

    } catch (error) {
        console.error(`Failed to fetch Pokémon data: ${error}`);
        return null;
    }
}

async function fetchPokemonData() {
    try {
        // Check if data already exists in IndexedDB
        const storedData = await getFromIndexedDB('pokemonData');
        if (storedData.length > 0) {
            allPokemon = storedData;
            displayPokemon(allPokemon);
            return;
        }

        // Fetch Pokémon list
        const response = await fetch(`${API_URLS.POKEMON}?limit=${MAX_POKEMON}`);
        if (!response.ok) throw new Error(`Failed to fetch Pokémon: ${response.statusText}`);
        const data = await response.json();

        allPokemon = await Promise.all(data.results.map(async (pokemon) => {
            const detailsResponse = await fetch(pokemon.url);
            if (!detailsResponse.ok) throw new Error(`Failed to fetch details for ${pokemon.name}`);
            const details = await detailsResponse.json();

            // Fetch species data
            const speciesResponse = await fetch(`${API_URLS.POKEMON_SPECIES_API}/${details.id}`);
            const speciesData = speciesResponse.ok ? await speciesResponse.json() : null;

            return {
                name: details.name,
                id: details.id,
                types: details.types.map(t => t.type.name),
                image: `${API_URLS.POKEMON_IMAGE}/${details.id}.png`,
                species: speciesData
            };
        }));

        // Save Pokémon data to IndexedDB
        await saveToIndexedDB('pokemonData', allPokemon);

        displayPokemon(allPokemon);

    } catch (error) {
        console.error('Error fetching Pokémon:', error);
        elements.notFoundMessage.textContent = 'Failed to load Pokémon data';
        elements.notFoundMessage.classList.remove('d-none');
    }
}