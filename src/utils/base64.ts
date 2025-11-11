export function base64UrlEncode(str: string): string {
  // Convert string to bytes
  const bytes = new TextEncoder().encode(str);

  // Convert bytes to regular base64
  let base64 = '';
  if (typeof Buffer !== 'undefined') {
    // Node.js environment
    base64 = Buffer.from(bytes).toString('base64');
  } else {
    // Browser environment
    const binaryString = Array.from(bytes, byte =>
      String.fromCharCode(byte)
    ).join('');
    base64 = btoa(binaryString);
  }

  // Convert to base64url format (replace characters and remove padding)
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

export function base64UrlDecode(str: string): string {
  // Convert base64url to regular base64
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');

  // Add padding if needed
  const padding = base64.length % 4;
  if (padding > 0) {
    base64 += '='.repeat(4 - padding);
  }

  // Decode base64 to bytes
  let bytes: Uint8Array;
  if (typeof Buffer !== 'undefined') {
    // Node.js environment
    bytes = new Uint8Array(Buffer.from(base64, 'base64'));
  } else {
    // Browser environment
    const binaryString = atob(base64);
    bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
  }

  // Convert bytes to string
  return new TextDecoder().decode(bytes);
}
