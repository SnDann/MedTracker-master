import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Image,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Camera, CameraType } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { ImageIcon, FlipHorizontal, X } from 'lucide-react-native';
import { useAuth } from '@/components/AuthProvider';
import { uploadPrescriptionImage, uploadPrescription } from '@/lib/prescriptions';
import * as TextRecognition from 'expo-text-recognition';

export default function CameraScreen() {
  const { user } = useAuth();
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [type, setType] = useState<CameraType>(CameraType.back);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [extractedText, setExtractedText] = useState<string | null>(null);
  const cameraRef = useRef<Camera>(null);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  if (hasPermission === null) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.permissionContainer}>
          <ImageIcon size={48} color="#ccc" />
          <Text style={styles.permissionText}>Carregando permissões da câmera...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!hasPermission) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.permissionContainer}>
          <ImageIcon size={48} color="#ccc" />
          <Text style={styles.permissionTitle}>Acesso à Câmera</Text>
          <Text style={styles.permissionText}>
            O aplicativo precisa de permissão para acessar a câmera.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const takePicture = async () => {
    if (!cameraRef.current) return;

    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: false,
      });
      
      if (photo) {
        setCapturedImage(photo.uri);
      }
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível tirar a foto');
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setCapturedImage(result.assets[0].uri);
    }
  };

  const processPrescription = async () => {
    if (!capturedImage || !user) return;

    setProcessing(true);
    try {
      // OCR: reconhecer texto da imagem
      const ocrResult = await TextRecognition.recognize(capturedImage);
      const ocrText = ocrResult?.lines?.map(l => l.text).join('\n') || '';
      setExtractedText(ocrText);

      // Upload da imagem
      const fileName = `prescription_${user.id}_${Date.now()}.jpg`;
      const { data: uploadData, error: uploadError } = await uploadPrescriptionImage(
        capturedImage, 
        fileName
      );

      if (uploadError) {
        throw new Error('Erro ao fazer upload da imagem');
      }

      // Salvar prescrição no banco
      const { error: saveError } = await uploadPrescription({
        user_id: user.id,
        image_url: uploadData!.publicUrl,
        extracted_text: ocrText,
        medications_identified: null, // Futuro: IA
      });

      if (saveError) {
        throw new Error('Erro ao salvar prescrição');
      }

      Alert.alert(
        'Sucesso',
        'Receita salva com sucesso! Texto extraído disponível.',
        [{ text: 'OK', onPress: () => { setCapturedImage(null); setExtractedText(null); } }]
      );
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível processar a receita');
    } finally {
      setProcessing(false);
    }
  };

  const toggleCameraType = () => {
    setType(current => (current === CameraType.back ? CameraType.front : CameraType.back));
  };

  const retakePicture = () => {
    setCapturedImage(null);
  };

  if (capturedImage) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.previewContainer}>
          <View style={styles.previewHeader}>
            <TouchableOpacity onPress={retakePicture} style={styles.headerButton}>
              <X size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.previewTitle}>Receita Capturada</Text>
            <View style={styles.headerButton} />
          </View>
          
          <ScrollView style={styles.previewContent} showsVerticalScrollIndicator={false}>
            <Image source={{ uri: capturedImage }} style={styles.previewImage} />
            {extractedText && (
              <View style={styles.previewInfo}>
                <Text style={styles.infoTitle}>Texto extraído da receita</Text>
                <Text style={styles.infoText}>{extractedText}</Text>
              </View>
            )}
            
            <View style={styles.previewInfo}>
              <Text style={styles.infoTitle}>Análise da Receita</Text>
              <Text style={styles.infoText}>
                Em breve, nossa IA irá analisar automaticamente sua receita e extrair:
              </Text>
              <View style={styles.featureList}>
                <Text style={styles.featureItem}>• Nomes dos medicamentos</Text>
                <Text style={styles.featureItem}>• Dosagens prescritas</Text>
                <Text style={styles.featureItem}>• Frequência de uso</Text>
                <Text style={styles.featureItem}>• Instruções especiais</Text>
              </View>
            </View>
          </ScrollView>
          
          <View style={styles.previewActions}>
            <TouchableOpacity style={styles.retakeButton} onPress={retakePicture}>
              <Text style={styles.retakeButtonText}>Tirar Novamente</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.processButton, processing && styles.processButtonDisabled]} 
              onPress={processPrescription}
              disabled={processing}
            >
              <Text style={styles.processButtonText}>
                {processing ? 'Salvando...' : 'Salvar Receita'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.cameraContainer}>
        <Camera style={styles.camera} type={type} ref={cameraRef}>
          <View style={styles.cameraOverlay}>
            <View style={styles.cameraHeader}>
              <Text style={styles.cameraTitle}>Fotografar Receita</Text>
              <Text style={styles.cameraSubtitle}>
                Posicione a receita dentro do quadro
              </Text>
            </View>
            
            <View style={styles.cameraFrame} />
            
            <View style={styles.cameraControls}>
              <TouchableOpacity style={styles.galleryButton} onPress={pickImage}>
                <ImageIcon size={24} color="#fff" />
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.captureButton} onPress={takePicture}>
                <View style={styles.captureButtonInner} />
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.flipButton} onPress={toggleCameraType}>
                <FlipHorizontal size={24} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        </Camera>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#f8f9fa',
  },
  permissionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a1a',
    marginTop: 16,
    marginBottom: 8,
  },
  permissionText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  cameraContainer: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'space-between',
    padding: 24,
  },
  cameraHeader: {
    alignItems: 'center',
    paddingTop: 20,
  },
  cameraTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  cameraSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  cameraFrame: {
    alignSelf: 'center',
    width: 280,
    height: 200,
    borderWidth: 2,
    borderColor: '#fff',
    borderRadius: 12,
    backgroundColor: 'transparent',
  },
  cameraControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 20,
  },
  galleryButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#fff',
  },
  flipButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  previewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  headerButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  previewContent: {
    flex: 1,
  },
  previewImage: {
    width: '100%',
    height: 300,
    resizeMode: 'contain',
  },
  previewInfo: {
    backgroundColor: '#fff',
    padding: 24,
    margin: 20,
    borderRadius: 12,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 16,
  },
  featureList: {
    gap: 8,
  },
  featureItem: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  previewActions: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  retakeButton: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  retakeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  processButton: {
    flex: 2,
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  processButtonDisabled: {
    opacity: 0.6,
  },
  processButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});