from tensorflow.keras.preprocessing.image import ImageDataGenerator
from resnet import ResNet50
import os
import numpy as np
import matplotlib.pyplot as plt
import pathlib

batch_size = 64
epochs = 150
img_height = 128
img_width = 128

dataset_path = 'PokemonData'
pokemon_id = {}
pokemon_names = np.array(os.listdir(dataset_path))
for i, pokemon in enumerate(pokemon_names):
    pokemon_id[pokemon] = i
num_cls = len(pokemon_names)

# Get number of images
data_dir =  pathlib.Path(dataset_path)
file_types = ['jpg', 'png', 'jpeg']
image_count = 0
for file_type in file_types:
    image_count += len(list(data_dir.glob('*/*.{}'.format(file_type))))
steps_per_epoch = image_count // batch_size

# The 1./255 is to convert from uint8 to float32 in range [0,1].
image_generator = ImageDataGenerator(rescale=1./255, 
                                    rotation_range=45,
                                    width_shift_range=.15,
                                    height_shift_range=.15,
                                    horizontal_flip=True,
                                    zoom_range=0.5,
                                    validation_split=0.2)

train_data_gen = image_generator.flow_from_directory(directory=str(data_dir),
                                                     batch_size=batch_size,
                                                     shuffle=True,
                                                     subset='training',
                                                     target_size=(img_height, img_width))
test_data_gen = image_generator.flow_from_directory(directory=str(data_dir),
                                                     batch_size=batch_size,
                                                     shuffle=True,
                                                     subset='validation',
                                                     target_size=(img_height, img_width))

model = ResNet50((img_height, img_width, 3), num_cls)
history = model.fit(train_data_gen, epochs=epochs, steps_per_epoch=steps_per_epoch,
                    validation_data=test_data_gen, validation_steps=steps_per_epoch // 5)
# Plot results
acc = history.history['accuracy']
val_acc = history.history['val_accuracy']

loss=history.history['loss']
val_loss=history.history['val_loss']

epochs_range = range(epochs)

plt.figure(figsize=(8, 8))
plt.subplot(1, 2, 1)
plt.plot(epochs_range, acc, label='Training Accuracy')
plt.plot(epochs_range, val_acc, label='Validation Accuracy')
plt.legend(loc='lower right')
plt.title('Training and Validation Accuracy')

plt.subplot(1, 2, 2)
plt.plot(epochs_range, loss, label='Training Loss')
plt.plot(epochs_range, val_loss, label='Validation Loss')
plt.legend(loc='upper right')
plt.title('Training and Validation Loss')
plt.savefig("plot.png")
