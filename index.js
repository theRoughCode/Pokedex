let model;

const modelURL = 'https://raw.githubusercontent.com/theRoughCode/Pokedex/master/js_models/res50_112x112/model.json';
const modelIndexDbUrl = 'indexeddb://pokeresnet-model';
const weightsURLPrefix = 'https://github.com/theRoughCode/Pokedex/raw/master/js_models/res50_112x112';

const pokemonNames = ['Abra', 'Aerodactyl', 'Alakazam', 'Alolan Sandslash', 'Arbok', 'Arcanine',
'Articuno', 'Beedrill', 'Bellsprout', 'Blastoise', 'Bulbasaur', 'Butterfree',
'Caterpie', 'Chansey', 'Charizard', 'Charmander', 'Charmeleon', 'Clefable',
'Clefairy', 'Cloyster', 'Cubone', 'Dewgong', 'Diglett', 'Ditto', 'Dodrio',
'Doduo', 'Dragonair', 'Dragonite', 'Dratini', 'Drowzee', 'Dugtrio', 'Eevee',
'Ekans', 'Electabuzz', 'Electrode', 'Exeggcute', 'Exeggutor', 'Farfetchd',
'Fearow', 'Flareon', 'Gastly', 'Gengar', 'Geodude', 'Gloom', 'Golbat', 'Goldeen',
'Golduck', 'Golem', 'Graveler', 'Grimer', 'Growlithe', 'Gyarados', 'Haunter',
'Hitmonchan', 'Hitmonlee', 'Horsea', 'Hypno', 'Ivysaur', 'Jigglypuff',
'Jolteon', 'Jynx', 'Kabuto', 'Kabutops', 'Kadabra', 'Kakuna', 'Kangaskhan',
'Kingler', 'Koffing', 'Krabby', 'Lapras', 'Lickitung', 'Machamp', 'Machoke',
'Machop', 'Magikarp', 'Magmar', 'Magnemite', 'Magneton', 'Mankey', 'Marowak',
'Meowth', 'Metapod', 'Mew', 'Mewtwo', 'Moltres', 'MrMime', 'Muk', 'Nidoking',
'Nidoqueen', 'Nidorina', 'Nidorino', 'Ninetales', 'Oddish', 'Omanyte',
'Omastar', 'Onix', 'Paras', 'Parasect', 'Persian', 'Pidgeot', 'Pidgeotto',
'Pidgey', 'Pikachu', 'Pinsir', 'Poliwag', 'Poliwhirl', 'Poliwrath', 'Ponyta',
'Porygon', 'Primeape', 'Psyduck', 'Raichu', 'Rapidash', 'Raticate', 'Rattata',
'Rhydon', 'Rhyhorn', 'Sandshrew', 'Sandslash', 'Scyther', 'Seadra', 'Seaking',
'Seel', 'Shellder', 'Slowbro', 'Slowpoke', 'Snorlax', 'Spearow', 'Squirtle',
'Starmie', 'Staryu', 'Tangela', 'Tauros', 'Tentacool', 'Tentacruel', 'Vaporeon',
'Venomoth', 'Venonat', 'Venusaur', 'Victreebel', 'Vileplume', 'Voltorb',
'Vulpix', 'Wartortle', 'Weedle', 'Weepinbell', 'Weezing', 'Wigglytuff',
'Zapdos', 'Zubat'];

async function fetchModel() {
  console.log('Loading pokemonresnet..');
  try {
        // Try loading locally saved model
        const model = await tf.loadLayersModel(modelIndexDbUrl);
        console.log('Model loaded from IndexedDB');

        return model;
    } catch (error) {
        console.log(error)
        // If local load fails, get it from the server
        try {
            const model = await tf.loadLayersModel(modelURL, { strict: true });
            console.log('Model loaded from HTTP.');

            // Store the downloaded model locally for future use
            await model.save(modelIndexDbUrl);
            console.log('Model saved to IndexedDB.');

            return model;
        } catch (error) {
            console.error(error);
        }
    }
}

async function app() {
  // Load the model.

  const model = await fetchModel();

  // Make a prediction through the model on our image.
  const imgEl = document.getElementById('img');
  const img = tf.browser.fromPixels(imgEl).div(255).expandDims(0);
 
  const result = model.predict(img);
  const pred = result.argMax(1).dataSync();
  console.log(result.argMax(0), result.argMax(1))
  console.log(pokemonNames[pred[0]])
}
app();