import {
  buildMapsUrl,
  buildTelUrl,
  buildWhatsAppUrl,
  isAllowedExternalUrl,
  requiresConfirmation,
} from '../external-links';

describe('external link allowlist', () => {
  it('allows only the declared prefixes', () => {
    expect(isAllowedExternalUrl('tel:+967771234567')).toBe(true);
    expect(isAllowedExternalUrl('https://wa.me/967771234567')).toBe(true);
    expect(isAllowedExternalUrl('geo:0,0?q=sanaa')).toBe(true);
    expect(isAllowedExternalUrl('maps:?q=sanaa')).toBe(true);
    expect(isAllowedExternalUrl('https://maps.google.com/?q=sanaa')).toBe(true);
  });

  it('rejects look-alike hosts and dangerous schemes', () => {
    for (const url of [
      'javascript:alert(1)',
      'http://evil.example',
      'https://wa.me.evil.example/967771234567',
      'https://maps.google.com.evil.example/',
      'file:///etc/passwd',
      '',
    ]) {
      expect(isAllowedExternalUrl(url)).toBe(false);
    }
  });

  it('requires confirmation before leaving via WhatsApp or Maps only', () => {
    expect(requiresConfirmation('whatsapp')).toBe(true);
    expect(requiresConfirmation('maps')).toBe(true);
    expect(requiresConfirmation('tel')).toBe(false);
  });
});

describe('link builders', () => {
  it('builds tel and wa.me from a cleaned number', () => {
    const tel = buildTelUrl('0771234567');
    expect(tel.ok).toBe(true);
    if (tel.ok) expect(tel.value).toBe('tel:+967771234567');

    const wa = buildWhatsAppUrl('0771234567', 'Hello there');
    expect(wa.ok).toBe(true);
    if (wa.ok) expect(wa.value).toBe('https://wa.me/967771234567?text=Hello%20there');
  });

  it('propagates phone validation failures', () => {
    expect(buildTelUrl('123').ok).toBe(false);
    expect(buildWhatsAppUrl('').ok).toBe(false);
  });

  it('builds platform-specific maps URLs and requires a target', () => {
    const coords = { latitude: 15.35, longitude: 44.2 };
    const android = buildMapsUrl(coords, 'android');
    const ios = buildMapsUrl(coords, 'ios');
    const web = buildMapsUrl(coords, 'web');
    expect(android.ok && android.value.startsWith('geo:')).toBe(true);
    expect(ios.ok && ios.value.startsWith('maps:')).toBe(true);
    expect(web.ok && web.value.startsWith('https://maps.google.com/')).toBe(true);
    expect(buildMapsUrl({ query: 'Sanaa' }, 'web').ok).toBe(true);
    expect(buildMapsUrl({}, 'web').ok).toBe(false);
  });

  it('every built URL passes the allowlist', () => {
    const tel = buildTelUrl('0771234567');
    const wa = buildWhatsAppUrl('0771234567');
    const maps = buildMapsUrl({ query: 'Sanaa' }, 'web');
    for (const result of [tel, wa, maps]) {
      expect(result.ok).toBe(true);
      if (result.ok) expect(isAllowedExternalUrl(result.value)).toBe(true);
    }
  });
});
