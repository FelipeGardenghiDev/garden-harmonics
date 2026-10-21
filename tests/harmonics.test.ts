import { describe, it, expect } from 'vitest';
import { computeKeyContext, midiToFrequency } from '../src/core/harmony-engine';

describe('Garden Harmonics - Functional Harmony Engine', () => {
  it('computes diatonic degrees for C Major accurately', () => {
    const context = computeKeyContext('C', 'major');
    expect(context.degrees.length).toBe(7);

    // I, ii, iii, IV, V, vi, vii°
    expect(context.degrees[0].chordName).toBe('C');
    expect(context.degrees[1].chordName).toBe('Dm');
    expect(context.degrees[2].chordName).toBe('Em');
    expect(context.degrees[3].chordName).toBe('F');
    expect(context.degrees[4].chordName).toBe('G');
    expect(context.degrees[5].chordName).toBe('Am');
    expect(context.degrees[6].chordName).toBe('Bdim');
  });

  it('computes modal interchange borrowed chords for C Major', () => {
    const context = computeKeyContext('C', 'major');
    expect(context.borrowedDegrees.length).toBe(4);

    const bVI = context.borrowedDegrees.find((d) => d.roman === 'bVI');
    expect(bVI).toBeDefined();
    expect(bVI?.chordName).toBe('Ab');

    const bVII = context.borrowedDegrees.find((d) => d.roman === 'bVII');
    expect(bVII).toBeDefined();
    expect(bVII?.chordName).toBe('Bb');
  });

  it('calculates correct MIDI frequencies', () => {
    // A4 is 440 Hz (MIDI 69)
    const freq = midiToFrequency(69);
    expect(Math.round(freq)).toBe(440);
  });
});
