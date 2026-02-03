import { Platform } from 'react-native';

export async function recognizeImage(uri: string | File | Buffer): Promise<string> {
  // Try native (expo-text-recognition) on native platforms first
  if (Platform.OS !== 'web') {
    try {
      const TR = await import('expo-text-recognition');
      // Try common API shapes
      if (typeof (TR as any).recognize === 'function') {
        const res = await (TR as any).recognize(uri);
        return (res && (res.text || res)) || '';
      }
      if (typeof (TR as any).recognizeText === 'function') {
        const res = await (TR as any).recognizeText(uri);
        return (res && (res.text || res)) || '';
      }
      if ((TR as any).default && typeof (TR as any).default.recognize === 'function') {
        const res = await (TR as any).default.recognize(uri);
        return (res && (res.text || res)) || '';
      }
    } catch (e) {
      // no native recognizer available, fallback to tesseract
      // console.warn('expo-text-recognition not available, falling back to tesseract.js');
    }
  }

  // Fallback to tesseract.js (works in web/node)
  try {
    const { createWorker } = await import('tesseract.js');
    const worker = await createWorker({});
    await worker.load();
    await worker.loadLanguage('eng');
    await worker.initialize('eng');

    // worker.recognize accepts URL, Buffer, or File
    const { data } = await worker.recognize(uri as any);
    await worker.terminate();
    return data?.text || '';
  } catch (err) {
    throw new Error('OCR failed: ' + (err && (err as any).message ? (err as any).message : String(err)));
  }
}

export default { recognizeImage };
