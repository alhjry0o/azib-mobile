import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { AVATAR_SIZE, centerSquare, normalizeAvatar, pickAvatar } from '../image-pipeline';

describe('centerSquare', () => {
  it('crops landscape images from the horizontal center', () => {
    expect(centerSquare(1200, 800)).toEqual({ originX: 200, originY: 0, width: 800, height: 800 });
  });

  it('crops portrait images from the vertical center', () => {
    expect(centerSquare(800, 1200)).toEqual({ originX: 0, originY: 200, width: 800, height: 800 });
  });

  it('keeps squares untouched and never returns zero', () => {
    expect(centerSquare(500, 500)).toEqual({ originX: 0, originY: 0, width: 500, height: 500 });
    expect(centerSquare(0, 0).width).toBe(1);
  });
});

describe('pickAvatar', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock).mockResolvedValue({
      granted: true,
    });
    (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({
      canceled: false,
      assets: [{ uri: 'file://picked.jpg', width: 1200, height: 800, fileSize: 1000 }],
    });
  });

  it('returns the picked asset', async () => {
    const result = await pickAvatar();
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value?.uri).toBe('file://picked.jpg');
  });

  it('returns null when the user cancels', async () => {
    (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({
      canceled: true,
      assets: [],
    });
    const result = await pickAvatar();
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value).toBeNull();
  });

  it('fails honestly when permission is denied', async () => {
    (ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock).mockResolvedValue({
      granted: false,
    });
    const result = await pickAvatar();
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.meta.code).toBe('PHOTO_PERMISSION_DENIED');
  });

  it('rejects oversized images', async () => {
    (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({
      canceled: false,
      assets: [{ uri: 'file://big.jpg', width: 4000, height: 4000, fileSize: 20_000_000 }],
    });
    const result = await pickAvatar();
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.meta.code).toBe('AVATAR_TOO_LARGE');
  });
});

describe('normalizeAvatar', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('crops, resizes and re-encodes to JPEG', async () => {
    const result = await normalizeAvatar({ uri: 'file://in.jpg', width: 1200, height: 800 });
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value).toBe('file://azib-avatar.jpg');
    expect(ImageManipulator.manipulate).toHaveBeenCalledWith('file://in.jpg');
  });

  it('never returns the original uri when processing fails', async () => {
    const context = ImageManipulator.manipulate('file://x.jpg');
    (context.renderAsync as jest.Mock).mockRejectedValueOnce(new Error('unsupported'));
    const result = await normalizeAvatar({ uri: 'file://in.jpg', width: AVATAR_SIZE, height: AVATAR_SIZE });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.meta.code).toBe('IMAGE_PROCESSING_FAILED');
  });
});
