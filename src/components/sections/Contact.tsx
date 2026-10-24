import { CodeXml, Mail, Download } from 'lucide-react';
import { content } from '@/config/content';
import type { Contact as ContactData, Profile } from '@/config/types';
import { buildVCard } from '@/lib/vcard';
import { Section } from '../ui/Section';
import { ButtonLink } from '../ui/ButtonLink';
import { SampleBadge } from '../ui/SampleBadge';
export function Contact({
  contact = content.contact,
  profile = content.profile,
}: {
  contact?: ContactData;
  profile?: Profile;
}) {
  const email =
    contact.email.status === 'confirmed' && contact.email.value.trim()
      ? contact.email.value
      : null;
  const github =
    contact.github.status === 'confirmed' && contact.github.value.trim()
      ? contact.github.value
      : null;
  return (
    <Section id="contact" title="Contact">
      {(!email || !github) && (
        <div className="mb-5">
          <p className="mb-3 text-ink-muted">連絡先は準備中です</p>
          <SampleBadge />
        </div>
      )}
      <div className="flex flex-wrap gap-3">
        {email && (
          <ButtonLink href={'mailto:' + email}>
            <Mail aria-hidden="true" size={20} />
            メール
          </ButtonLink>
        )}
        {github && (
          <ButtonLink href={github} variant="secondary">
            <CodeXml aria-hidden="true" size={20} />
            GitHub
          </ButtonLink>
        )}
        {buildVCard(contact, profile) && (
          <ButtonLink
            href="/contact.vcf"
            variant="secondary"
            download="contact.vcf"
          >
            <Download aria-hidden="true" size={20} />
            vCardを保存
          </ButtonLink>
        )}
      </div>
    </Section>
  );
}
