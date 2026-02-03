import React, { useState } from 'react';
import { View, Text, Button, Image, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { recognizeImage } from '../../lib/ocr';

export default function OCRTest() {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    if (Platform.OS === 'web') {
      // use input element for web
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = async () => {
        const file = input.files && input.files[0];
        if (file) {
          const url = URL.createObjectURL(file);
          setImageUri(url);
          await doOCR(file);
        }
      };
      input.click();
      return;
    }

    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
      base64: false
    });

    if (!res.cancelled && res.assets && res.assets[0]) {
      const uri = res.assets[0].uri;
      setImageUri(uri);
      await doOCR(uri);
    } else if ((res as any).uri) {
      setImageUri((res as any).uri);
      await doOCR((res as any).uri);
    }
  };

  const doOCR = async (input: any) => {
    setLoading(true);
    setResult('');
    try {
      const text = await recognizeImage(input);
      setResult(text || '(no text found)');
    } catch (e) {
      setResult('OCR error: ' + (e as any).message || String(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ padding: 16 }}>
      <Text style={{ fontSize: 18, marginBottom: 8 }}>OCR Test</Text>
      <Button title="Pick image" onPress={pickImage} />
      {imageUri ? (
        <Image source={{ uri: imageUri }} style={{ width: 200, height: 200, marginTop: 12 }} />
      ) : null}
      <Text style={{ marginTop: 12, fontWeight: 'bold' }}>Result:</Text>
      <Text>{loading ? 'Processing...' : result}</Text>
    </View>
  );
}
