export interface HashMapNode {
  key: string;
  value: string;
  hash: number;
}

export interface Bucket {
  index: number;
  nodes: HashMapNode[];
}

export interface LogEntry {
  id: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: number;
}

export enum Tab {
  VISUALIZER = 'VISUALIZER',
  INTERVIEW = 'INTERVIEW',
  ART = 'ART',
}

export enum AspectRatio {
  SQUARE = '1:1',
  PORTRAIT_3_4 = '3:4',
  PORTRAIT_9_16 = '9:16',
  LANDSCAPE_4_3 = '4:3',
  LANDSCAPE_16_9 = '16:9',
  LANDSCAPE_21_9 = '21:9',
  STANDARD_2_3 = '2:3',
  STANDARD_3_2 = '3:2',
}

export enum ImageSize {
  SIZE_1K = '1K',
  SIZE_2K = '2K',
  SIZE_4K = '4K',
}

export interface SearchResult {
  title: string;
  uri: string;
}
