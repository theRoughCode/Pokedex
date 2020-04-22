from tensorflow.keras.preprocessing.image import ImageDataGenerator
import tensorflow as tf

# Use transfer learning
def MobileNet(input_shape=None, classes=1000):
    # Create the base model from the pre-trained model MobileNet V2
    base_model = tf.keras.applications.MobileNetV2(input_shape=input_shape,
                                                include_top=False,
                                                layers=tf.keras.layers)
    # Freeze layers before training
    base_model.trainable = False

    # Add classification head
    global_average_layer = tf.keras.layers.GlobalAveragePooling2D()
    prediction_layer = tf.keras.layers.Dense(classes)
    
    model = tf.keras.Sequential([
                base_model,
                global_average_layer,
                prediction_layer
            ])
    base_learning_rate = 0.0001
    model.compile(optimizer=tf.keras.optimizers.RMSprop(lr=base_learning_rate),
                loss=tf.keras.losses.CategoricalCrossentropy(from_logits=True),
                metrics=['accuracy'])
    return model