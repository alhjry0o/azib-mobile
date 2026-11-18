// ALL expo-file-system / expo-sharing calls live here.
// Native: write the JSON into the app document directory, then open the share
// sheet when available. Web: Blob download (no native module needed).
import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { AppError, toAppError } from '@/core/errors';
import type { Result } from '@/core/result';

export interface SavedExport {
  readonly uri: string;
  readonly shared: boolean;
}

function downloadOnWeb(fileName: string, json: string): Result<SavedExport> {
  try {
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = fileName;
    anchor.click();
    URL.revokeObjectURL(url);
    return { ok: true, value: { uri: fileName, shared: true } };
  } catch (caught) {
    return { ok: false, error: toAppError(caught) };
  }
}

export async function saveAndShareExport(
  fileName: string,
  json: string,
): Promise<Result<SavedExport>> {
  if (Platform.OS === 'web') return downloadOnWeb(fileName, json);
  try {
    const directory = FileSystem.documentDirectory;
    if (!directory) {
      return { ok: false, error: AppError.unknown({ code: 'NO_DOCUMENT_DIRECTORY' }) };
    }
    const uri = `${directory}${fileName}`;
    await FileSystem.writeAsStringAsync(uri, json, {
      encoding: FileSystem.EncodingType.UTF8,
    });
    const available = await Sharing.isAvailableAsync();
    if (!available) return { ok: true, value: { uri, shared: false } };
    await Sharing.shareAsync(uri, {
      mimeType: 'application/json',
      dialogTitle: fileName,
      UTI: 'public.json',
    });
    return { ok: true, value: { uri, shared: true } };
  } catch (caught) {
    return { ok: false, error: toAppError(caught) };
  }
}
