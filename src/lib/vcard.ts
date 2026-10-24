import type { Contact, Profile } from '../config/types';
function escapeText(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/\r\n|\r|\n/g, '\\n')
    .replace(/,/g, '\\,')
    .replace(/;/g, '\\;');
}
// RFC 6350: fold at 75 UTF-8 octets without splitting a code point.
function foldLine(line: string): string {
  let result = '';
  let length = 0;
  for (const character of line) {
    const size = new TextEncoder().encode(character).length;
    if (length + size > 75) {
      result += '\r\n ';
      length = 1;
    }
    result += character;
    length += size;
  }
  return result;
}
export function buildVCard(contact: Contact, profile: Profile): string | null {
  if (
    profile.status !== 'confirmed' ||
    !profile.name.trim() ||
    contact.email.status !== 'confirmed' ||
    contact.github.status !== 'confirmed' ||
    !contact.email.value.trim() ||
    !contact.github.value.trim()
  )
    return null;
  return (
    [
      'BEGIN:VCARD',
      'VERSION:4.0',
      `FN:${escapeText(profile.name)}`,
      `EMAIL:${escapeText(contact.email.value)}`,
      `URL:${escapeText(contact.github.value)}`,
      'END:VCARD',
    ]
      .map(foldLine)
      .join('\r\n') + '\r\n'
  );
}
