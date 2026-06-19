import React, { useState } from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, ActivityIndicator, Alert, ScrollView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { supabase } from '../lib/storageClient';

import { FileUploader } from '../components/FileUploader'; 

export default function HomeScreen() {
  const [imageUri, setImageUri] = useState<string | null>(null);
  
  // Este estado se compartirá con nuestro componente FileUploader
  const [document, setDocument] = useState<DocumentPicker.DocumentPickerResult | null>(null);
  const [uploading, setUploading] = useState(false);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });
    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const uploadFileToSupabase = async (fileUri: string, originalName: string, bucketName: string) => {
    const fileExt = originalName.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    
    const base64 = await FileSystem.readAsStringAsync(fileUri, { encoding: FileSystem.EncodingType.Base64 });
    const buffer = Uint8Array.from(atob(base64), c => c.charCodeAt(0)).buffer;

    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(fileName, buffer, {
        contentType: fileExt === 'pdf' ? 'application/pdf' : 'image/jpeg',
      });

    if (error) throw error;
    return data;
  };

  const handleUpload = async () => {
    if (!imageUri && !document) {
      Alert.alert('Atención', 'Por favor selecciona al menos una imagen o un archivo.');
      return;
    }

    setUploading(true);

    try {
      const bucketName = 'uploads'; 

      if (imageUri) {
        await uploadFileToSupabase(imageUri, 'imagen.jpg', bucketName);
      }

      if (document && document.assets && document.assets[0]) {
        const docAsset = document.assets[0];
        await uploadFileToSupabase(docAsset.uri, docAsset.name, bucketName);
      }

      Alert.alert('¡Éxito!', 'Contenido subido correctamente a Supabase.');
      setImageUri(null);
      setDocument(null); // Limpia también el FileUploader de forma automática
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Hubo un problema al subir.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Almacenamiento en la Nube</Text>
      <View style={styles.divider} />

      <View style={styles.imageCard}>
        <TouchableOpacity style={styles.imageButton} onPress={pickImage}>
          <Text style={styles.buttonText}>📸 Seleccionar Imagen</Text>
        </TouchableOpacity>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.thumbnail} />
        ) : (
          <Text style={styles.placeholderText}>Ninguna imagen seleccionada</Text>
        )}
      </View>

      <FileUploader document={document} onFileSelected={setDocument} />

      <View style={styles.uploadSection}>
        {uploading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#10b981" />
            <Text style={styles.loadingText}>Subiendo recursos...</Text>
          </View>
        ) : (
          <TouchableOpacity style={styles.submitButton} onPress={handleUpload}>
            <Text style={styles.submitButtonText}>Subir Todo al Servicio</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flexGrow: 1, 
    backgroundColor: '#f5f7fa', 
    padding: 24, 
    justifyContent: 'center' 
},
  title: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    textAlign: 'center', 
    color: '#1a1d20', 
    marginBottom: 8 
},
  divider: { 
    height: 2, 
    backgroundColor: '#e1e4e8', 
    marginBottom: 24 
},
  imageCard: { 
    backgroundColor: '#ffffff', 
    borderRadius: 12, 
    padding: 16, 
    marginBottom: 20, 
    alignItems: 'center' 
},
  imageButton: { 
    backgroundColor: '#0070f3', 
    paddingVertical: 12, 
    paddingHorizontal: 24, 
    borderRadius: 8, 
    width: '100%', 
    alignItems: 'center', 
    marginBottom: 12 
},
  buttonText: { 
    color: '#ffffff', 
    fontSize: 15, 
    fontWeight: '600' 
},
  thumbnail: { 
    width: 120, 
    height: 120, 
    borderRadius: 8,
    marginTop: 8 
},
  placeholderText: { 
    color: '#8a94a6', 
    fontSize: 14, 
    fontStyle: 'italic' 
},
  uploadSection: { 
    marginTop: 10 
},
  submitButton: { 
    backgroundColor: '#10b981', 
    paddingVertical: 16, 
    borderRadius: 8, 
    alignItems: 'center' 
},
  submitButtonText: { 
    color: '#ffffff', 
    fontSize: 16, 
    fontWeight: 'bold' 
},
  loadingContainer: { 
    alignItems: 'center' 
},
  loadingText: { 
    marginTop: 8, 
    color: '#4b5563' 
}
});