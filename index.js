let net;

async function app() {
  console.log('Loading pokenet..');

  // Load the model.
  net = await tf.loadLayersModel('https://drive.google.com/uc?export=download&id=1RQOjbRxg4GM8Q98T0JRjbHuC9f9GYHBH');
  console.log('Successfully loaded model');

  // Make a prediction through the model on our image.
  const imgEl = document.getElementById('img');
  const result = await net.classify(imgEl);
  console.log(result);
}

app();
