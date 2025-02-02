import React from 'react';
import { Button, Image, View } from 'react-native';
import * as ImagePicker from 'react-native-image-picker';

const ImageUploader = ({ onImageSelected }) => {
  const pickImage = () => {
    ImagePicker.launchImageLibrary({}, (response) => {
      if (!response.didCancel && response.assets) {
        onImageSelected(response.assets[0]);
      }
    });
  };

  return (
    <View>
      <Button title="Choisir une image" onPress={pickImage} />
    </View>
  );
};

export default ImageUploader;
