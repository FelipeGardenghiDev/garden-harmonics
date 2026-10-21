import { HarmonicDegree, KeyContext, ProgressionPreset } from '../types';

export const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
export const FLAT_NOTE_NAMES = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

export const CIRCLE_OF_FIFTHS = [
  { major: 'C', minor: 'Am', accidentals: 0 },
  { major: 'G', minor: 'Em', accidentals: 1 },
  { major: 'D', minor: 'Bm', accidentals: 2 },
  { major: 'A', minor: 'F#m', accidentals: 3 },
  { major: 'E', minor: 'C#m', accidentals: 4 },
  { major: 'B', minor: 'G#m', accidentals: 5 },
  { major: 'F#', minor: 'D#m', accidentals: 6 },
  { major: 'Db', minor: 'Bbm', accidentals: 5 },
  { major: 'Ab', minor: 'Fm', accidentals: 4 },
  { major: 'Eb', minor: 'Cm', accidentals: 3 },
  { major: 'Bb', minor: 'Gm', accidentals: 2 },
  { major: 'F', minor: 'Dm', accidentals: 1 },
];

export function getMidiNote(noteName: string, octave: number): number {
  const index = NOTE_NAMES.indexOf(noteName);
  if (index === -1) return 60; // C4 fallback
  return (octave + 1) * 12 + index;
}

export function midiToFrequency(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

/**
 * Computes diatonic degrees and modal interchange borrowed chords for any key root.
 */
export function computeKeyContext(root: string, scaleType: 'major' | 'minor' = 'major'): KeyContext {
  const rootIndex = NOTE_NAMES.indexOf(root);
  const baseIndex = rootIndex !== -1 ? rootIndex : 0;

  if (scaleType === 'major') {
    const majorIntervals = [0, 2, 4, 5, 7, 9, 11];
    const romanNumerals = ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°'];
    const chordTypes = ['', 'm', 'm', '', '', 'm', 'dim'];
    const functions: ('tonic' | 'subdominant' | 'dominant')[] = [
      'tonic',
      'subdominant',
      'tonic',
      'subdominant',
      'dominant',
      'tonic',
      'dominant',
    ];

    const degrees: HarmonicDegree[] = majorIntervals.map((interval, i) => {
      const noteIdx = (baseIndex + interval) % 12;
      const noteName = NOTE_NAMES[noteIdx];
      const chordName = `${noteName}${chordTypes[i]}`;

      // Compute chord triad notes
      const thirdIdx = (noteIdx + (chordTypes[i] === 'm' || chordTypes[i] === 'dim' ? 3 : 4)) % 12;
      const fifthIdx = (noteIdx + (chordTypes[i] === 'dim' ? 6 : 7)) % 12;

      const notes = [noteName, NOTE_NAMES[thirdIdx], NOTE_NAMES[fifthIdx]];
      const frequencies = [
        midiToFrequency(getMidiNote(noteName, 3)),
        midiToFrequency(getMidiNote(NOTE_NAMES[thirdIdx], 3)),
        midiToFrequency(getMidiNote(NOTE_NAMES[fifthIdx], 3)),
      ];

      return {
        roman: romanNumerals[i],
        chordName,
        functionType: functions[i],
        notes,
        frequencies,
      };
    });

    // Modal Interchange / Borrowed chords from parallel minor (Aeolian)
    const borrowedDefinitions = [
      { roman: 'bIII', semitone: 3, type: '', label: 'Aeolian' },
      { roman: 'iv', semitone: 5, type: 'm', label: 'Aeolian (Subdominante Menor)' },
      { roman: 'bVI', semitone: 8, type: '', label: 'Aeolian (Acorde Épico de Rock)' },
      { roman: 'bVII', semitone: 10, type: '', label: 'Mixolídio / Aeolian' },
    ];

    const borrowedDegrees: HarmonicDegree[] = borrowedDefinitions.map((def) => {
      const noteIdx = (baseIndex + def.semitone) % 12;
      const noteName = FLAT_NOTE_NAMES[noteIdx];
      const chordName = `${noteName}${def.type}`;
      const thirdIdx = (noteIdx + (def.type === 'm' ? 3 : 4)) % 12;
      const fifthIdx = (noteIdx + 7) % 12;

      return {
        roman: def.roman,
        chordName,
        functionType: 'subdominant',
        notes: [noteName, FLAT_NOTE_NAMES[thirdIdx], FLAT_NOTE_NAMES[fifthIdx]],
        frequencies: [
          midiToFrequency(getMidiNote(NOTE_NAMES[noteIdx], 3)),
          midiToFrequency(getMidiNote(NOTE_NAMES[thirdIdx], 3)),
          midiToFrequency(getMidiNote(NOTE_NAMES[fifthIdx], 3)),
        ],
        isBorrowed: true,
        borrowedFrom: def.label,
      };
    });

    return { root, scaleType, degrees, borrowedDegrees };
  }

  // Minor key fallback implementation
  const minorIntervals = [0, 2, 3, 5, 7, 8, 10];
  const minorRomans = ['i', 'ii°', 'bIII', 'iv', 'v', 'bVI', 'bVII'];
  const minorTypes = ['m', 'dim', '', 'm', 'm', '', ''];

  const degrees: HarmonicDegree[] = minorIntervals.map((interval, i) => {
    const noteIdx = (baseIndex + interval) % 12;
    const noteName = NOTE_NAMES[noteIdx];
    const chordName = `${noteName}${minorTypes[i]}`;
    const thirdIdx = (noteIdx + (minorTypes[i] === 'm' || minorTypes[i] === 'dim' ? 3 : 4)) % 12;
    const fifthIdx = (noteIdx + (minorTypes[i] === 'dim' ? 6 : 7)) % 12;

    return {
      roman: minorRomans[i],
      chordName,
      functionType: i === 0 ? 'tonic' : i === 3 ? 'subdominant' : 'dominant',
      notes: [noteName, NOTE_NAMES[thirdIdx], NOTE_NAMES[fifthIdx]],
      frequencies: [
        midiToFrequency(getMidiNote(noteName, 3)),
        midiToFrequency(getMidiNote(NOTE_NAMES[thirdIdx], 3)),
        midiToFrequency(getMidiNote(NOTE_NAMES[fifthIdx], 3)),
      ],
    };
  });

  return { root, scaleType, degrees, borrowedDegrees: [] };
}

/**
 * Polyphonic Web Audio player for synthesized chord auditioning.
 */
export function playChordFrequencies(frequencies: number[]): void {
  if (typeof window === 'undefined') return;
  const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
  if (!AudioCtx) return;

  const ctx = new AudioCtx();
  const now = ctx.currentTime;

  frequencies.forEach((freq) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, now);

    // Natural piano/guitar decay envelope
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 1.2);
  });
}

export const POPULAR_PROGRESSIONS: ProgressionPreset[] = [
  {
    id: 'pop-4-chords',
    name: 'Pop Clássico dos 4 Acordes',
    genre: 'Pop / Rock',
    degrees: ['I', 'V', 'vi', 'IV'],
    description: 'A progressão mais famosa da história do pop (U2, Beatles, Journey).',
  },
  {
    id: 'epic-rock-modal',
    name: 'Rock Épico / Empréstimo Modal',
    genre: 'Rock / Metal',
    degrees: ['I', 'bVII', 'bVI', 'V'],
    description: 'Clássico com cadência andaluza e empréstimo do modo menor.',
  },
  {
    id: 'jazz-cadence',
    name: 'Cadência ii - V - I Jazz',
    genre: 'Jazz / Bossa',
    degrees: ['ii', 'V', 'I'],
    description: 'Resolução fundamental da harmonia funcional ocidental.',
  },
  {
    id: 'emotional-ballad',
    name: 'Balada Emocional',
    genre: 'Indie / Acústico',
    degrees: ['vi', 'IV', 'I', 'V'],
    description: 'Tom menor relativo iniciando a progressão com alta carga emotiva.',
  },
];
