import type { Content } from './types';
export const content: Content = {
  mascot: {
    status: 'placeholder',
    src: null,
    width: 240,
    height: 240,
    alt: 'ノートPCとレモネードを前にした、ベレー帽とヘッドホンのきつねのマスコット',
  },
  site: {
    name: 'ポートフォリオ（準備中）',
  },
  profile: {
    status: 'placeholder',
    name: '氏名（準備中）',
    title: '肩書き（準備中）',
    catchphrase: 'キャッチコピー（準備中）',
    intro: '自己紹介のサンプルです。公開内容は準備中です。',
    focusAreas: [
      'Web開発（準備中）',
      'AI（準備中）',
      'Cloud（準備中）',
      '自動化（準備中）',
    ],
  },
  about: {
    status: 'placeholder',
    career: '経歴（準備中）',
    personality: '人物紹介（準備中）',
    hobbies: '趣味（準備中）',
  },
  services: [
    {
      status: 'placeholder',
      id: 'web',
      name: 'Web開発',
      description: 'Web開発のサービス紹介（準備中）',
      icon: 'CodeXml',
    },
    {
      status: 'placeholder',
      id: 'ai',
      name: 'AI・画像処理',
      description: 'AI・画像処理のサービス紹介（準備中）',
      icon: 'BrainCircuit',
    },
    {
      status: 'placeholder',
      id: 'cloud',
      name: 'Cloud',
      description: 'Cloudのサービス紹介（準備中）',
      icon: 'Cloud',
    },
    {
      status: 'placeholder',
      id: 'automation',
      name: '自動化',
      description: '自動化のサービス紹介（準備中）',
      icon: 'Workflow',
    },
  ],
  skills: [
    {
      status: 'confirmed',
      name: 'Python',
      category: 'Language',
    },
    {
      status: 'confirmed',
      name: 'React',
      category: 'Frontend',
    },
    {
      status: 'confirmed',
      name: 'Next.js',
      category: 'Frontend',
    },
    {
      status: 'confirmed',
      name: 'TypeScript',
      category: 'Language',
    },
    {
      status: 'confirmed',
      name: 'C++',
      category: 'Language',
    },
    {
      status: 'confirmed',
      name: 'AWS',
      category: 'Cloud・Infra',
    },
    {
      status: 'confirmed',
      name: 'Docker',
      category: 'Cloud・Infra',
    },
    {
      status: 'confirmed',
      name: 'AI',
      category: 'AI',
    },
  ],
  projects: [
    {
      status: 'placeholder',
      name: 'サンプルプロジェクト A',
      summary: '制作実績のサンプルです。公開内容は準備中です。',
      technologies: ['技術タグ（準備中）'],
      href: null,
    },
    {
      status: 'placeholder',
      name: 'サンプルプロジェクト B',
      summary: '制作実績のサンプルです。公開内容は準備中です。',
      technologies: ['技術タグ（準備中）'],
      href: null,
    },
  ],
  process: [
    {
      title: 'ヒアリング',
      description: '目的や課題、ご希望を整理します。',
    },
    {
      title: '設計',
      description: '構成と進め方を検討します。',
    },
    {
      title: '実装',
      description: '設計に沿って機能を形にします。',
    },
    {
      title: 'レビュー',
      description: '動作や使いやすさを確認します。',
    },
    {
      title: '公開・改善',
      description: '公開に向けて確認し、改善を検討します。',
    },
  ],
  contact: {
    email: {
      status: 'placeholder',
      value: null,
    },
    github: {
      status: 'placeholder',
      value: null,
    },
  },
};
