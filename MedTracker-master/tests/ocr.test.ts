import { recognizeImage } from '../lib/ocr';

jest.mock('tesseract.js', () => ({
  createWorker: () => ({
    load: jest.fn(async () => {}),
    loadLanguage: jest.fn(async () => {}),
    initialize: jest.fn(async () => {}),
    recognize: jest.fn(async () => ({ data: { text: 'hello from tesseract' } })),
    terminate: jest.fn(async () => {})
  })
}));

describe('OCR wrapper', () => {
  it('uses tesseract fallback and returns text', async () => {
    const text = await recognizeImage('fake-path');
    expect(text).toContain('hello from tesseract');
  });
});
