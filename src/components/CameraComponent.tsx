import React, { useState } from 'react';
import { View, Button, Image, StyleSheet, Text } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';

interface PhotoData {
    uri: string;
    latitude: number;
    longitude: number;
    address: string;
    timestamp: string;
    base64?: string;
}

const CameraComponent: React.FC<{ onPhotoTaken: (photo: PhotoData) => void }> = ({ onPhotoTaken }) => {
    const [photo, setPhoto] = useState<PhotoData | null>(null);
    const takePhoto = async () => {
        const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
        if (cameraStatus !== 'granted') {
            alert('Permissão para acessar a câmera é necessária!');
            return;
        }

        // Solicitar permissão de localização
        const { status: locationStatus } = await Location.requestForegroundPermissionsAsync();
        if (locationStatus !== 'granted') {
            alert('Permissão para acessar a localização é necessária!');
            return;
        }

        const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ['images'],
            allowsEditing: false,
            base64: true,
            legacy: true,
            aspect: [4, 3],
            quality: 0.5,
        });


        if (!result.canceled && result.assets[0].uri) {
            const uri = result.assets[0].uri;
            const base64 = result.assets[0].base64 || '';
            const location = await Location.getCurrentPositionAsync({});
            const { latitude, longitude } = location.coords;
            const address = await getAddressFromCoords(latitude, longitude);
            const timestamp = new Date().toLocaleString();
            const photoData: PhotoData = {
                uri,
                latitude,
                longitude,
                address,
                timestamp,
                base64
            };

            setPhoto(photoData);
            onPhotoTaken(photoData);
        } else {
            alert('A foto não foi tirada.');
        }
    };

    const getAddressFromCoords = async (lat: number, lon: number): Promise<string> => {
        try {
            const response = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lon });
            if (response.length > 0) {
                const { formattedAddress } = response[0];
                return (formattedAddress || 'Endereço não encontrado');
            }
            return 'Endereço não encontrado';
        } catch (error) {
            console.error('Erro ao obter o endereço:', error);
            return 'Erro ao obter o endereço';
        }
    };

    return (
        <View style={styles.container}>
            <Button title="Tirar Foto" onPress={takePhoto} />
            <Text style={styles.text}>{photo ? 'Foto tirada!' : 'Nenhuma foto tirada.'}</Text>
            <Text style={styles.text}>{photo ? 'Endereço: ' + photo.address : ''}</Text>
            <Text style={styles.text}>{photo ? 'Data e hora: ' + photo.timestamp : ''}</Text>
            <Text style={styles.text}>{photo ? 'Latitude: ' + photo.latitude : ''}</Text>
            <Text style={styles.text}>{photo ? 'Longitude: ' + photo.longitude : ''}</Text>

            {photo && <Image source={{ uri: photo.uri }} style={styles.image} />}

        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    image: {
        width: 200,
        height: 200,
        marginTop: 20,
    },
    text: {
        fontSize: 20
    }
});

export default CameraComponent;