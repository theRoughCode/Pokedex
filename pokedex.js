
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

const getEvolutionChain = async (chain) => {
    const pokemonName = capitalize(chain.species.name);
    if (chain.evolves_to.length === 0) return [pokemonName];
    const nextChain = await getEvolutionChain(chain.evolves_to[0]);
    return [pokemonName].concat(nextChain);
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
        return `<div class="tooltip">
                    <span class="poke-ability">${ability}</span>
                    <span class="tooltiptext">${desc}</span>
                </div>`;
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

const parseTypes = (types) => {
    return types.map(({ type }) => capitalize(type.name));
};

const getPokeInfo = async (pokemon) => {
    pokemon = pokemon.toLowerCase();
    // Get general info
    let resp = await fetch(`http://pokeapi.co/api/v2/pokemon/${pokemon}`);
    let {
        id,
        height,
        weight,
        abilities,
        stats,
        types
    } = await resp.json();
    // Convert from hectograms to pounds and round to 1 decimal
    weight = Math.round((weight / 4.536) * 10) / 10;
    abilities = await parseAbilities(abilities);
    stats = parseStats(stats);
    types = parseTypes(types);

    // Get specific info
    resp = await fetch(`http://pokeapi.co/api/v2/pokemon-species/${pokemon}`);
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
    const { chain } = await resp.json();
    evolution_chain = await getEvolutionChain(chain);

    return {
        'name': capitalize(pokemon),
        id: `#${id}`,
        'image': `${image_url}/${id}.png`,
        height,
        weight,
        abilities,
        stats,
        types,
        colour: color,
        shape,
        evolution_chain,
        habitat,
        description
    };
}   
