import type { Contact, Profile } from '@/config/types';
// Deliberately synthetic, reserved-domain test data; never used by the site.
export const confirmedProfile: Profile = {
  status: 'confirmed',
  name: 'TEST ONLY',
  title: '',
  catchphrase: '',
  intro: '',
  focusAreas: [],
};
export const confirmedContact: Contact = {
  email: { status: 'confirmed', value: 'test@example.invalid' },
  github: { status: 'confirmed', value: 'https://example.invalid/github-test' },
};
