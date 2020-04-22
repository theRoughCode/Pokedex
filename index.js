let model;

const modelURL = 'https://raw.githubusercontent.com/theRoughCode/Pokedex/master/js_models/mobilenet_128x128/model.json';
const modelIndexDbUrl = 'indexeddb://pokenet-model';
const weightsURLPrefix = 'https://github.com/theRoughCode/Pokedex/raw/master/js_models/mobilenet_128x128';

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

const loadingTextArr = [
    'Catching wild Pidgeys',
    'Talking to Professor Oak',
    'Fighting Team Rocket',
    'Fishing up Magikarp',
    'Training with Machoke',
    'Running from the Squirtle Squad',
    'Saying goodbye to Butterfree',
    'Getting ignored by Charmeleon',
    'Choosing a starter Pokémon'
];

async function fetchModel() {
  console.log('Loading pokenet..');
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

async function predict(input, model) {
    const k = 20;
    const IMG_SIZE = 128;

    // Preprocess image
    let img = tf.browser.fromPixels(input).expandDims(0);
    img = tf.image.resizeBilinear(img, [IMG_SIZE, IMG_SIZE]).div(255);
    
    // Get predictions
    const result = model.predict(img).flatten();
    const preds = result.softmax();
    const pred = preds.argMax().dataSync();

    // Get top k predictions
    const  { values, indices } = tf.topk(preds, k, true);
    const topkIdx = indices.dataSync();
    const confidence = values.dataSync();
    const topKPreds = [];

    for (let i = 0; i < k; i++) {
        if (confidence[i] < 0.0001) break;
        topKPreds.push({
            conf: confidence[i],
            pred: pokemonNames[topkIdx[i]]
        });
    }
    return {
        'pred': pokemonNames[pred[0]],
        topk: topKPreds
    };
}

const loadInfo = async (pokemon) => {
    // info = { 
    //     name, id, image, height, weight, abilities, stats,
    //     types, colour, shape, evolution_chain, habitat, description
    // }
    const info = await getPokeInfo(pokemon);
    for (const key in info) {
        const el = $(`#poke-${key}`);
        if (el == null) continue;
        if (key === 'image') {
            $(el).attr('src', info[key]);
            continue;
        }
        $(el).html(info[key]);
    }
    $('#pokedex').removeClass('hidden');
};

// Format top k predictions as unordered list
const formatTopk = (topk) => {
    topk = topk.map(({ conf, pred }) => `<li>${pred} (${(conf * 100).toFixed(3)}% confidence)</li>`);
    return `<ul id="poke-topk">${topk.join('')}</ul>`;
};

// Run prediction on input and load information onto UI
const runPrediction = async (input) => {
    try {
        const { pred, topk } = await predict(input, model);
        const topkContent = formatTopk(topk);
        $('#prediction-label').removeClass('hidden');
        $('#predictions-tab').removeClass('hidden');
        $('#predictions-list').html(topkContent);
        $('#predictions-tab').trigger('click');
        $('#predict-button').html('Predict');
        loadInfo(pred);
    } catch (error) {
        alert('Oops, a voltorb shocked our servers!');
        console.error(error);
    }
}

// Listen for click on predict button
$('#predict-button').on('click', function() {
    let openTabId, input;
    // Get open tab
    const tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
        if (tabcontent[i].style.display === "block") openTabId = tabcontent[i].id;
    }
    if (openTabId === 'upload') {
        input = document.getElementById('img-preview');
        if (input == null) {
            alert('Please upload an image!');
            return;
        }
    } else if (openTabId === 'draw') {
        input = document.getElementById("paint-canvas").getContext('2d').canvas;
    } else return;
    $('#pokedex').addClass('hidden');
    $(this).html('Predicting...');
    setTimeout(() => runPrediction(input), 2000)
});

// Load model
async function load() {
    const minWaitTime = 400;
    const loadingText = loadingTextArr[Math.floor(Math.random() * loadingTextArr.length)];
    $('#loading-text').html(`${loadingText}&hellip;`);
    try {
        const startTime = new Date().getTime();
        model = await fetchModel();
        while (new Date().getTime() - startTime < minWaitTime) {}
        $('#loading').fadeOut(500);
        setTimeout(() => {
            $('html').css('background-color', 'transparent');
            $('body').css('background-color', 'transparent');
            $('body').css('background-image', 'url("assets/background.jpg")');
            $('html').css('height', 'auto');
            $('body').css('height', 'auto');
            $('body').css('padding', '20px');
            $('#main').fadeIn(100);
        }, 400);
    } catch (error) {
        console.log(error);
    }
}

function selectTab(evt, tabName) {
    // Declare all variables
    let i, tabcontent, tablinks;

    // Get all elements with class="tabcontent" and hide them
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }

    // Get all elements with class="tablinks" and remove the class "active"
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }

    // Show the current tab, and add an "active" class to the button that opened the tab
    document.getElementById(tabName).style.display = "block";
    const target = evt.currentTarget || evt.target;
    target.className += " active";
}

load();
        
// Get the element with id="defaultOpen" and click on it
document.getElementById("defaultOpen").click();