export type ContentStatus = 'confirmed' | 'placeholder';
export interface Profile {
  status: ContentStatus;
  name: string;
  title: string;
  catchphrase: string;
  intro: string;
  focusAreas: string[];
}
export interface About {
  status: ContentStatus;
  career: string;
  personality: string;
  hobbies: string;
}
export type ServiceIcon = 'CodeXml' | 'BrainCircuit' | 'Cloud' | 'Workflow';
export interface Service {
  status: ContentStatus;
  id: string;
  name: string;
  description: string;
  icon: ServiceIcon;
}
export type SkillCategory = 'Language' | 'Frontend' | 'Cloud・Infra' | 'AI';
export interface Skill {
  status: ContentStatus;
  name: string;
  category: SkillCategory;
}
export interface Project {
  status: ContentStatus;
  name: string;
  summary: string;
  technologies: string[];
  href: string | null;
}
export type ContactValue =
  | { status: 'placeholder'; value: null }
  | { status: 'confirmed'; value: string };
export interface Contact {
  email: ContactValue;
  github: ContactValue;
}
export interface Content {
  site: { name: string };
  profile: Profile;
  about: About;
  services: Service[];
  skills: Skill[];
  projects: Project[];
  process: { title: string; description: string }[];
  contact: Contact;
}
