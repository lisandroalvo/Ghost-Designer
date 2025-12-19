export interface Note {
  id: string;
  transcript: string;
  summary?: string;
  createdAt: number;
  duration: number;
  audioSize: number;
}
