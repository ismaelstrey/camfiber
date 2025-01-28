import React, { useState } from 'react';
import { View, Button, ScrollView, StyleSheet } from 'react-native';
import CameraComponent from '../components/CameraComponent';
import * as Print from 'expo-print';
import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing';

interface PhotoData {
  uri: string;
  latitude: number;
  longitude: number;
  address: string;
  timestamp: string;
  base64?: string;
}

const MainScreen: React.FC = () => {
  const [photos, setPhotos] = useState<PhotoData[]>([]);



  const generatePdf = async (photoData: PhotoData) => {
    const { uri, base64 } = photoData;
    if (!uri) {
      console.error('URI da foto não está disponível');
      return;
    }

    const html = `
      <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 20px;
              background-color: #f4f4f4;
            }
            h1 {
              color: #333;
              font-size: 24px;
            }
            h2 {
              color: #666;
              font-size: 20px;
            }
            h3 {
              color: #999;
              font-size: 16px;
            }
            .photo-container {
              margin-bottom: 20px;
              padding: 10px;
              background-color: #fff;
              border-radius: 8px;
              box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
            }
            img {
              width: 50%;
              height: auto;
              border-radius: 8px;
            }
            hr {
              border: 1px solid #ccc;
              margin: 20px 0;
            }
          </style>
        </head>
        <body>
          ${photos
        .map(
          (photo) => `
            <div class="photo-container">
              <h1>Data: ${photo.timestamp}</h1>
              <h2>Localização: ${photo.address}</h2>
              <h3>Coordenadas: ${photo.latitude}, ${photo.longitude}</h3>
              <img src="data:image/png;base64,${photo.base64}" alt="Foto" />
            </div>
            <hr />
          `
        )
        .join('')}
        </body>
      </html>
    `;

    const { uri: generatedUri } = await Print.printToFileAsync({ html });

    // Verifica e solicita permissão para acessar a galeria
    const { status } = await MediaLibrary.requestPermissionsAsync();
    console.log(status);
    if (status === 'granted') {
      // Solicita ao usuário onde deseja salvar o PDF
      await Sharing.shareAsync(generatedUri);
    } else {
      alert('Permissão para acessar a galeria negada.');
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView>
        <CameraComponent onPhotoTaken={(photo) => {
          setPhotos((prevPhotos) => [...prevPhotos, photo]);
        }} />
        <Button title="Gerar PDF" onPress={() => generatePdf(photos[photos.length - 1])} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
});

export default MainScreen;