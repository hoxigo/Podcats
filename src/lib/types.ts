export type Voice = 'Puck' | 'Charon' | 'Kore' | 'Fenrir' | 'Zephyr';

export interface ApiConfig {
  key: string;
}

export interface Podcast {
  id: string;
  name: string;
  audioBase64: string;
  script: string;
  language: string;
  pdfBase64?: string;
  voice1?: Voice;
  voice2?: Voice;
  speaker1?: string;
  speaker2?: string;
  instructions?: string;
  wordCount?: number;
}

export interface UserPrefs {
  language: string;
  selectedVoices: Voice[];
  instructions: string;
  wordCount: number;
}
