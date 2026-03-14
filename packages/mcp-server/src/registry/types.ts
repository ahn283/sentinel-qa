export interface AppEntry {
  id: string;
  type: 'flutter' | 'web';
  repo?: string;
  url?: string;
  prd?: string;
  context?: {
    selectors?: string;
  };
}

export interface AppsConfig {
  apps: AppEntry[];
}

export type SelectorMap = Record<string, string>;
