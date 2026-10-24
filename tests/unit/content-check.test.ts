import { describe, expect, it } from 'vitest';
import { content } from '@/config/content';
import { findPlaceholders } from '@/lib/content-check';

describe('findPlaceholders (ADR-004 / FR-005)', () => {
  // This pre-publish gate runs only via `npm run check:content` (npm sets npm_lifecycle_event).
  // It is intentionally skipped in `npm test` and must run and pass before any production deploy (ADR-004).
  it.skipIf(process.env.npm_lifecycle_event !== 'check:content')(
    'requires all content to be confirmed before publishing',
    () => {
      const placeholders = findPlaceholders(content);
      if (placeholders.length > 0) {
        throw new Error(
          `Placeholder content remains:\n${placeholders.join('\n')}`,
        );
      }
      expect(placeholders).toEqual([]);
    },
  );

  it('reports placeholder item paths', () => {
    const placeholders = {
      profile: { status: 'placeholder' },
      services: [{ status: 'placeholder' }],
      skills: [{ status: 'placeholder' }],
      projects: [{ status: 'placeholder' }],
      contactLinks: [{ status: 'placeholder' }],
    };
    expect(findPlaceholders(placeholders)).toEqual([
      'profile',
      'services[0]',
      'skills[0]',
      'projects[0]',
      'contactLinks[0]',
    ]);
  });

  it('returns no paths when all items are confirmed', () => {
    expect(
      findPlaceholders({
        profile: { status: 'confirmed' },
        services: [{ status: 'confirmed' }],
        skills: [{ status: 'confirmed' }],
        projects: [{ status: 'confirmed' }],
        contactLinks: [{ status: 'confirmed' }],
      }),
    ).toEqual([]);
  });

  it('finds nested placeholders without mutating the input', () => {
    const nested = Object.freeze({
      items: Object.freeze([
        { status: 'confirmed', child: { status: 'placeholder' } },
      ]),
    });
    expect(findPlaceholders(nested)).toEqual(['items[0].child']);
    expect(findPlaceholders(null)).toEqual([]);
  });
});
