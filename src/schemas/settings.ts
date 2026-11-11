import { z } from 'zod';

export const SettingsValueSchema = z.record(z.string(), z.unknown());
