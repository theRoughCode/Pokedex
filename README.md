# Who's That Pokémon?

![Who's That Pokémon](https://cdn.bulbagarden.net/upload/archive/e/e8/20110212154018%21Whos_That_Pokemon.png)


This app answers the age-old question that all Trainers have been asking since they were 10. Give it an image and it will give its best guess as to what Pokémon was in the image. 

The model is pretrained in Tensorflow and then converted to a Tensorflow.js model. This model is then downloaded into your browser and loaded via Tensorflow.js. Thus, all predictions are done solely in-browser.

## Uploading An Image
There are 3 ways to upload image:
1. <b>Upload an image</b>: Drag an image or click to upload.
2. <b>Copy an image</b>: Copy an image to your clipboard and paste in the textbox.
3. <b>Draw an image</b>: Flex your artistic muscles and try to draw an Pokémon!

## Training the model
To train the model, I used the Kaggle dataset of 1st generation Pokémon images found [here](https://www.kaggle.com/lantian773030/pokemonclassification). Augmentation was done in preprocessing to reduce overfitting.

I first trained it on ResNet50 with an input size of 224x224. Then, I halved the dimensions which resulted in significantly faster training and evaluation times.
However, ResNet's model size is too large for prediction over the browser so I swapped over to MobileNet with an input size of 128x128.

## Performance
Each model is evaluated over a small test dataset of 1309 images.

| Model         | Total Time    | Time per step  | Loss | Accuracy |
| ------------- |:-------------:| :--------------:| :---: | :-----:|
| ResNet-50 112x112      | 10s | 465ms | 2.6647 | 0.5218 |
| MobileNet 128x128      | 10s | 483ms | 1.6229 | 0.6348 |
| MobileNet 224x224      | 18s | 874ms | 1.3993 | 0.6578 |
| ResNet-50 224x224      | 19s | 914ms | 2.1577 | 0.5569 |

