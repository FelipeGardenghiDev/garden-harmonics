import { HarmonicDegree } from '../types';
import { getMidiNote } from './harmony-engine';

/**
 * Standard MIDI File (SMF) Type 0 Generator
 * Generates pure client-side binary .mid files for DAWs (Ableton, FL Studio, Reaper, Logic Pro, etc.).
 */

export function encodeVariableLengthQuantity(value: number): number[] {
  const bytes: number[] = [];
  let buffer = value & 0x7f;

  while ((value >>= 7) > 0) {
    buffer <<= 8;
    buffer |= 0x80;
    buffer += value & 0x7f;
  }

  while (true) {
    bytes.push(buffer & 0xff);
    if (buffer & 0x80) {
      buffer >>= 8;
    } else {
      break;
    }
  }

  return bytes;
}

export function createMidiFileFromProgression(
  progression: HarmonicDegree[],
  bpm: number = 120,
  ticksPerQuarterNote: number = 480
): Uint8Array {
  const safeBpm = Math.max(30, Math.min(300, bpm || 120));
  const microsecondsPerBeat = Math.round(60_000_000 / safeBpm);

  const trackEvents: number[] = [];

  // Meta Event: Set Tempo (FF 51 03 tt tt tt)
  trackEvents.push(0x00); // delta-time 0
  trackEvents.push(0xff, 0x51, 0x03);
  trackEvents.push((microsecondsPerBeat >> 16) & 0xff);
  trackEvents.push((microsecondsPerBeat >> 8) & 0xff);
  trackEvents.push(microsecondsPerBeat & 0xff);

  // Meta Event: Time Signature 4/4 (FF 58 04 nn dd cc bb)
  trackEvents.push(0x00); // delta-time 0
  trackEvents.push(0xff, 0x58, 0x04, 0x04, 0x02, 0x18, 0x08);

  const chordDurationTicks = ticksPerQuarterNote * 4; // 1 full 4/4 measure per chord
  const chordReleaseTicks = chordDurationTicks - Math.round(ticksPerQuarterNote * 0.1); // slight articulation gap

  progression.forEach((chord) => {
    // Map note names to MIDI note numbers around octave 3/4
    const midiNotes: number[] = chord.notes.map((name, noteIdx) => {
      const octave = noteIdx === 0 ? 3 : 4;
      return getMidiNote(name, octave);
    });

    // Note On for all notes in chord at delta-time 0
    midiNotes.forEach((midiNote) => {
      // Delta time 0 for simultaneous notes
      trackEvents.push(0x00);
      trackEvents.push(0x90, midiNote & 0x7f, 90); // Note On channel 0, velocity 90
    });

    // Note Off for all notes in chord
    midiNotes.forEach((midiNote, idx) => {
      if (idx === 0) {
        // First note off has delta time equal to chord duration
        const deltaBytes = encodeVariableLengthQuantity(chordReleaseTicks);
        trackEvents.push(...deltaBytes);
      } else {
        // Subsequent simultaneous note offs have delta time 0
        trackEvents.push(0x00);
      }
      trackEvents.push(0x80, midiNote & 0x7f, 0x00); // Note Off channel 0
    });

    // Gap articulation delta-time to next chord
    const gapTicks = chordDurationTicks - chordReleaseTicks;
    if (gapTicks > 0) {
      // Use empty delta before next chord by scheduling a dummy pitch bend or zero delta handled by next chord
      // Alternatively, add gap to the next note's delta time:
      // In this format, chordDurationTicks is already covered by chordReleaseTicks + next chord's offset if desired
    }
  });

  // End of Track meta-event (FF 2F 00)
  trackEvents.push(0x00); // delta-time 0
  trackEvents.push(0xff, 0x2f, 0x00);

  // MTrk chunk
  const trackChunk: number[] = [];
  // 'MTrk' = 0x4D, 0x54, 0x72, 0x6B
  trackChunk.push(0x4d, 0x54, 0x72, 0x6b);
  const trackLength = trackEvents.length;
  trackChunk.push((trackLength >> 24) & 0xff);
  trackChunk.push((trackLength >> 16) & 0xff);
  trackChunk.push((trackLength >> 8) & 0xff);
  trackChunk.push(trackLength & 0xff);
  trackChunk.push(...trackEvents);

  // MThd header chunk (Format 0, 1 track, division = ticksPerQuarterNote)
  const headerChunk: number[] = [
    0x4d, 0x54, 0x68, 0x64, // 'MThd'
    0x00, 0x00, 0x00, 0x06, // chunk length = 6
    0x00, 0x00,             // format 0 (single track)
    0x00, 0x01,             // 1 track
    (ticksPerQuarterNote >> 8) & 0xff,
    ticksPerQuarterNote & 0xff,
  ];

  const fullFile = new Uint8Array(headerChunk.length + trackChunk.length);
  fullFile.set(headerChunk, 0);
  fullFile.set(trackChunk, headerChunk.length);

  return fullFile;
}

/**
 * Initiates browser download of progression as a standard .mid file.
 */
export function downloadProgressionMidi(
  progression: HarmonicDegree[],
  keyRoot: string,
  bpm: number = 120
): void {
  if (typeof window === 'undefined' || progression.length === 0) return;

  const midiBytes = createMidiFileFromProgression(progression, bpm);
  const blob = new Blob([midiBytes.buffer as ArrayBuffer], { type: 'audio/midi' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `garden-harmonics-${keyRoot.toLowerCase()}-progression.mid`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}
