export type HarmonicFunction = 'tonic' | 'subdominant' | 'dominant';

export interface HarmonicDegree {
  roman: string;
  chordName: string;
  functionType: HarmonicFunction;
  notes: string[];
  frequencies: number[];
  isBorrowed?: boolean;
  borrowedFrom?: string;
}

export interface KeyContext {
  root: string;
  scaleType: 'major' | 'minor';
  degrees: HarmonicDegree[];
  borrowedDegrees: HarmonicDegree[];
}

export interface ProgressionPreset {
  id: string;
  name: string;
  genre: string;
  degrees: string[];
  description: string;
}
