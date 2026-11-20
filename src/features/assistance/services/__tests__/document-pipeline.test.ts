import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { RULES_V1 } from '../../engine/rules.v1';
import {
  PDF_MIME_TYPE,
  pickImageDocument,
  pickPdfDocument,
  prepareDocument,
  validateDocument,
} from '../document-pipeline';

jest.mock('expo-document-picker', () => ({
  getDocumentAsync: jest.fn(async () => ({
    canceled: false,
    assets: [{ uri: 'file://doc.pdf', name: 'doc.pdf', size: 500_000, mimeType: 'application/pdf' }],
  })),
}));

jest.mock('expo-crypto', () => ({
  CryptoDigestAlgorithm: { SHA256: 'SHA-256' },
  digestStringAsync: jest.fn(async (_a: string, data: string) => `sha256:${data}`),
}));

const limits = RULES_V1.documentLimits;
const image = { uri: 'file://a.jpg', name: 'a.jpg', size: 1000, mimeType: 'image/jpeg' };

describe('validateDocument', () => {
  it('accepts allowed images and PDFs', () => {
    expect(validateDocument(image, limits).ok).toBe(true);
    expect(
      validateDocument({ ...image, mimeType: PDF_MIME_TYPE, size: 9_000_000 }, limits).ok,
    ).toBe(true);
  });

  it('rejects unsupported types', () => {
    const result = validateDocument({ ...image, mimeType: 'application/zip' }, limits);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.meta.code).toBe('UNSUPPORTED_DOCUMENT_TYPE');
  });

  it('enforces separate image and PDF size limits', () => {
    const bigImage = validateDocument({ ...image, size: limits.imageMaxBytes + 1 }, limits);
    expect(bigImage.ok).toBe(false);
    if (!bigImage.ok) expect(bigImage.error.meta.code).toBe('DOCUMENT_TOO_LARGE');
    const smallPdf = validateDocument(
      { ...image, mimeType: PDF_MIME_TYPE, size: limits.imageMaxBytes + 1 },
      limits,
    );
    expect(smallPdf.ok).toBe(true);
    const bigPdf = validateDocument(
      { ...image, mimeType: PDF_MIME_TYPE, size: limits.pdfMaxBytes + 1 },
      limits,
    );
    expect(bigPdf.ok).toBe(false);
  });
});

describe('pickers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock).mockResolvedValue({ granted: true });
    (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({
      canceled: false,
      assets: [{ uri: 'file://a.jpg', fileName: 'a.jpg', fileSize: 1000, mimeType: 'image/jpeg' }],
    });
  });

  it('returns the picked image', async () => {
    const result = await pickImageDocument();
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value?.name).toBe('a.jpg');
  });

  it('returns null when cancelled', async () => {
    (DocumentPicker.getDocumentAsync as jest.Mock).mockResolvedValue({ canceled: true, assets: [] });
    const result = await pickPdfDocument();
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value).toBeNull();
  });

  it('fails honestly when permission is denied', async () => {
    (ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock).mockResolvedValue({ granted: false });
    const result = await pickImageDocument();
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.meta.code).toBe('PHOTO_PERMISSION_DENIED');
  });
});

describe('prepareDocument', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('re-encodes images and produces a stable fingerprint', async () => {
    const first = await prepareDocument(image, limits);
    const second = await prepareDocument(image, limits);
    expect(first.ok && second.ok).toBe(true);
    if (first.ok && second.ok) {
      expect(first.value.sha256).toBe(second.value.sha256);
      expect(first.value.mimeType).toBe('image/jpeg');
    }
    expect(ImageManipulator.manipulateAsync).toHaveBeenCalled();
  });

  it('never processes a PDF', async () => {
    const result = await prepareDocument({ ...image, mimeType: PDF_MIME_TYPE }, limits);
    expect(result.ok).toBe(true);
    expect(ImageManipulator.manipulateAsync).not.toHaveBeenCalled();
  });

  it('returns an error and no upload when processing fails', async () => {
    (ImageManipulator.manipulateAsync as jest.Mock).mockRejectedValueOnce(new Error('boom'));
    const result = await prepareDocument(image, limits);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.meta.code).toBe('DOCUMENT_PROCESSING_FAILED');
  });
});
