import { describe, it, expect } from 'vitest';
import { computeKeyContext, midiToFrequency } from '../src/core/harmony-engine';
import {
  createMidiFileFromProgression,
  encodeVariableLengthQuantity,
} from '../src/core/midi-writer';

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

  it('encodes variable length quantities according to MIDI spec', () => {
    // 0 -> 0x00
    expect(encodeVariableLengthQuantity(0)).toEqual([0x00]);
    // 127 (0x7F) -> 0x7F
    expect(encodeVariableLengthQuantity(127)).toEqual([0x7f]);
    // 128 (0x80) -> 0x81, 0x00
    expect(encodeVariableLengthQuantity(128)).toEqual([0x81, 0x00]);
    // 1920 (4 beats at 480 ticks) -> 0x8F, 0x00
    expect(encodeVariableLengthQuantity(1920)).toEqual([0x8f, 0x00]);
  });

  it('generates a valid Standard MIDI File Type 0 for chord progression', () => {
    const context = computeKeyContext('C', 'major');
    const progression = [context.degrees[0], context.degrees[4], context.degrees[5], context.degrees[3]]; // I - V - vi - IV

    const midiBytes = createMidiFileFromProgression(progression, 120);

    // SMF Header Chunk: 'MThd' (0x4D, 0x54, 0x68, 0x64)
    expect(midiBytes[0]).toBe(0x4d);
    expect(midiBytes[1]).toBe(0x54);
    expect(midiBytes[2]).toBe(0x68);
    expect(midiBytes[3]).toBe(0x64);

    // Format 0
    expect(midiBytes[8]).toBe(0x00);
    expect(midiBytes[9]).toBe(0x00);

    // Track chunk 'MTrk' exists
    const trackHeader = [0x4d, 0x54, 0x72, 0x6b];
    let foundTrack = false;
    for (let i = 0; i < midiBytes.length - 4; i++) {
      if (
        midiBytes[i] === trackHeader[0] &&
        midiBytes[i + 1] === trackHeader[1] &&
        midiBytes[i + 2] === trackHeader[2] &&
        midiBytes[i + 3] === trackHeader[3]
      ) {
        foundTrack = true;
        break;
      }
    }
    expect(foundTrack).toBe(true);

    // Check End of Track meta-event at end of file (FF 2F 00)
    const len = midiBytes.length;
    expect(midiBytes[len - 3]).toBe(0xff);
    expect(midiBytes[len - 2]).toBe(0x2f);
    expect(midiBytes[len - 1]).toBe(0x00);
  });
});
