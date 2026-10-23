export type ContentStatus = 'confirmed' | 'placeholder';

export interface Profile {
  status: ContentStatus;
  name: string;
  title: string;
  description: string;
}

export interface Service {
  status: ContentStatus;
  name: string;
  description: string;
}

export interface Skill {
  status: ContentStatus;
  name: string;
  description: string;
}

export interface Project {
  status: ContentStatus;
  name: string;
  description: string;
  technologies: string[];
}

export type ContactLink = { label: string } & (
  { status: 'placeholder'; href: null } | { status: 'confirmed'; href: string }
);

export interface Content {
  profile: Profile;
  services: Service[];
  skills: Skill[];
  projects: Project[];
  contactLinks: ContactLink[];
}
