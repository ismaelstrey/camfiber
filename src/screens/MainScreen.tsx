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
            margin: 0;
            padding: 0;
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
          }
          .page {
            width: 100vw;
            height: 100vh;
            page-break-after: always;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            background-color: #fff;
          }
          .content {
            text-align: center;
            width: 90%;
            max-width: 800px;
            margin: 0 auto;
          }
          .photo {
            width: 100%;
            max-height: 80vh;
            object-fit: contain;
            padding: 10px;
            background-color: #fff;
            round: 10px;
            margin-bottom: 20px;
          }
          h2 {
            color: #333;
            margin: 10px 0;
            font-size: 24px;
          }
          h3 {
            color: #555;
            margin: 5px 0;
            font-size: 18px;
          }
          h4 {
            color: #777;
            margin: 5px 0;
            font-size: 16px;
          }
        </style>
      </head>
      <body>
        ${photos
        .map(
          (photo) => `
              <div class="page">
                <div class="content">
                  <h2>Data: ${photo.timestamp}</h2>
                  <h3>Localização: ${photo.address}</h3>
                  <h4>Coordenadas: ${photo.latitude}, ${photo.longitude}</h4>
                  <img class="photo" src="data:image/png;base64,${photo.base64}" alt="Foto" />
                </div>
              </div>
            `
        )
        .join('')}
      </body>
    </html>
  `;


    const { uri: generatedUri } = await Print.printToFileAsync({ html });

    // Verifica e solicita permissão para acessar a galeria
    const { status } = await MediaLibrary.requestPermissionsAsync();

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
        <CameraComponent onPhotoTaken={(photo,) => {
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