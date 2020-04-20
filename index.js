let net;

async function app() {
  console.log('Loading pokenet..');

  // Load the model.
  net = await tf.loadLayersModel('https://raw.githubusercontent.com/theRoughCode/Pokedex/master/js_models/res50_112x112/model.json');
  console.log('Successfully loaded model');

  // Make a prediction through the model on our image.
  const imgEl = document.getElementById('img');
  const result = await net.classify(imgEl);
  console.log(result);
}

app();
