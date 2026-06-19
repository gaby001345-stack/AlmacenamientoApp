import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';

// Definimos las propiedades (props) que recibirá el componente
interface FileUploaderProps {
  document: DocumentPicker.DocumentPickerResult | null;
  onFileSelected: (file: DocumentPicker.DocumentPickerResult | null) => void;
}

export const FileUploader: React.FC<FileUploaderProps> = ({ document, onFileSelected }) => {
  
  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*', // Permite cualquier formato de archivo (PDF, DOCX, etc.)
        copyToCacheDirectory: true
      });

      if (!result.canceled) {
        onFileSelected(result);
      }
    } catch (error) {
      console.error("Error al seleccionar el archivo: ", error);
    }
  };

  const clearSelection = () => {
    onFileSelected(null);
  };

  const hasFile = document && document.assets && document.assets[0];

  return (
    <View style={styles.card}>
      <TouchableOpacity 
        style={[styles.button, hasFile ? styles.buttonSelected : styles.buttonDefault]} 
        onPress={pickDocument}
      >
        <Text style={styles.buttonText}>
          {hasFile ? 'Cambiar Archivo' : 'Seleccionar Archivo'}
        </Text>
      </TouchableOpacity>

      {hasFile ? (
        <View style={styles.fileInfoContainer}>
          <Text style={styles.fileNameText} numberOfLines={1}>
            {document.assets[0].name}
          </Text>
          <TouchableOpacity onPress={clearSelection} style={styles.clearButton}>
            <Text style={styles.clearButtonText}>Quitar</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <Text style={styles.placeholderText}>Ningún archivo seleccionado (PDF, DOCX...)</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    alignItems: 'center',
    width: '100%',
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
    marginBottom: 12,
  },
  buttonDefault: {
    backgroundColor: '#25788b',
  },
  buttonSelected: {
    backgroundColor: '#1e293b', 
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
  fileInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    backgroundColor: '#f0fdf4',
    padding: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  fileNameText: {
    color: '#166534',
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
    marginRight: 8,
  },
  clearButton: {
    backgroundColor: '#fee2e2',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  clearButtonText: {
    color: '#991b1b',
    fontSize: 12,
    fontWeight: '600',
  },
  placeholderText: {
    color: '#8a94a6',
    fontSize: 14,
    fontStyle: 'italic',
  },
});