
const image_url = 'https://pokeres.bastionbot.org/images/pokemon';

const capitalize = (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

const getPokemonDesc = (flavour_texts) => {
    for (let i = 0; i < flavour_texts.length; i++) {
        const { flavor_text, language, version } = flavour_texts[i];
        if (language.name === 'en' && version.name === 'red') {
            return flavor_text;
        }
    }
}

const getEvolutionChain = (chain) => {
    const name = capitalize(chain.species.name);
    if (chain.evolves_to.length === 0) return [name];
    const nextChain = getEvolutionChain(chain.evolves_to[0]);
    return [name].concat(nextChain);
};

const getSprites = async (pokemonArr) => {
    const reqs = pokemonArr.map(async (name) => {
        const resp = await fetch(`https://pokeapi.co/api/v2/pokemon/${name.toLowerCase()}`);
        const { sprites } = await resp.json();
        return { name, spriteUrl: sprites['front_default'] };
    })
    return await Promise.all(reqs);
}

const formatEvolution = (evo_chain) => {
    evo_chain = evo_chain.map(({ name, spriteUrl }) => `
        <div class="poke-evo-container">
            <img class="poke-evo-img" src="${spriteUrl}">
            <span class="poke-evo-name">${name}</span>
        </div>
    `);
    return evo_chain.join('<span class="poke-evo-arrow">→</span>');
};

const getAbilityDesc = async (url) => {
    const resp = await fetch(url);
    const { effect_entries } = await resp.json();
    for (let i = 0; i < effect_entries.length; i++) {
        const { short_effect, language} = effect_entries[i];
        if (language.name === 'en') return short_effect;
    }
}

const parseAbilities = async (abilities) => {
    abilities = await Promise.all(abilities.map(async ({ ability, is_hidden }) => {
        const desc = await getAbilityDesc(ability.url);
        ability = ability.name.split('-').map(x => capitalize(x)).join(' ');
        if (is_hidden) ability = `${ability} (hidden)`;
        return `<li class="tooltip">
                    <span class="poke-ability">${ability}</span>
                    <span class="tooltiptext">${desc}</span>
                </li><br>`;
    }));
    return `<ul>${abilities.join('')}</ul>`;
};

const parseStats = (stats) => {
   return stats.map(({ base_stat, stat }) => {
       stat = stat.name;
       if (stat === 'special-attack') stat = 'Sp. Atk';
       else if (stat === 'special-defense') stat = 'Sp. Def';
       else if (stat === 'hp') stat = 'HP';
       else stat = capitalize(stat);
        return {
            stat,
            'base': base_stat
        };
   });
};

const formatTypes = (types) => {
    types = types.map(({ type }) => `<img class="poke-type" src="assets/types/${type.name.toLowerCase()}.png">`);
    return types;
};

const getPokeInfo = async (pokemon) => {
    pokemon = pokemon.toLowerCase();
    // Get general info
    let resp = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemon}`);
    let {
        id,
        height,
        weight,
        abilities,
        stats,
        types
    } = await resp.json();
    // Convert from decimetres to metres
    height /= 10;
    height = `${height} m`;
    // Convert from hectograms to pounds and round to 1 decimal
    weight = Math.round((weight / 4.536) * 10) / 10;
    weight = `${weight} lbs`
    abilities = await parseAbilities(abilities);
    stats = parseStats(stats);
    types = formatTypes(types);

    // Get specific info
    resp = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${pokemon}`);
    let {
        color,
        shape,
        evolution_chain,
        habitat,
        flavor_text_entries
    } = await resp.json();
    color = capitalize(color.name);
    shape = capitalize(shape.name);
    habitat = capitalize(habitat.name);
    const description = getPokemonDesc(flavor_text_entries);
    
    // Get evolution info
    resp = await fetch(evolution_chain.url);
    let { chain } = await resp.json();
    chain = getEvolutionChain(chain);
    chain = await getSprites(chain);
    const evolution = formatEvolution(chain);

    return {
        'name': capitalize(pokemon),
        id: `#${id.toString().padStart(3, '0')}`,
        'image': `${image_url}/${id}.png`,
        height,
        weight,
        abilities,
        stats,
        types,
        colour: color,
        shape,
        evolution,
        habitat,
        description
    };
}   
