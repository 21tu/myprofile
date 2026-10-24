import { describe, expect, it } from 'vitest';
import { buildVCard } from '@/lib/vcard';
import { content } from '@/config/content';
import { confirmedContact, confirmedProfile } from './fixtures';
describe('RFC 6350 / FR-006', () => {
  it('generates required fields with CRLF endings', () => {
    expect(buildVCard(confirmedContact, confirmedProfile)).toBe(
      'BEGIN:VCARD\r\nVERSION:4.0\r\nFN:TEST ONLY\r\nEMAIL:test@example.invalid\r\nURL:https://example.invalid/github-test\r\nEND:VCARD\r\n',
    );
  });
  it('escapes backslashes, commas, semicolons and every newline form', () => {
    const name = 'TEST\\NAME,;\r\nNEXT\rLINE\nEND';
    expect(
      buildVCard(confirmedContact, { ...confirmedProfile, name }),
    ).toContain('FN:TEST\\\\NAME\\,\\;\\nNEXT\\nLINE\\nEND\r\n');
  });
  it('returns null for placeholder name or either contact', () => {
    expect(buildVCard(confirmedContact, content.profile)).toBeNull();
    expect(
      buildVCard(
        { ...confirmedContact, email: content.contact.email },
        confirmedProfile,
      ),
    ).toBeNull();
    expect(
      buildVCard(
        { ...confirmedContact, github: content.contact.github },
        confirmedProfile,
      ),
    ).toBeNull();
    expect(buildVCard(content.contact, content.profile)).toBeNull();
  });
  it('rejects empty confirmed values', () => {
    expect(
      buildVCard(confirmedContact, { ...confirmedProfile, name: ' ' }),
    ).toBeNull();
    expect(
      buildVCard(
        { ...confirmedContact, email: { status: 'confirmed', value: '' } },
        confirmedProfile,
      ),
    ).toBeNull();
  });
  it('folds long UTF-8 lines without losing content', () => {
    const name = '試験'.repeat(40);
    const card = buildVCard(confirmedContact, { ...confirmedProfile, name })!;
    for (const line of card.split('\r\n'))
      expect(new TextEncoder().encode(line).length).toBeLessThanOrEqual(75);
    expect(card.replace(/\r\n /g, '')).toContain('FN:' + name + '\r\n');
  });
});
