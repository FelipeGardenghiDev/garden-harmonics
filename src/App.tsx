import React, { useState, useMemo } from 'react';
import {
  computeKeyContext,
  playChordFrequencies,
  POPULAR_PROGRESSIONS,
} from './core/harmony-engine';
import { CircleOfFifths } from './components/CircleOfFifths';
import { HarmonicDegree } from './types';
import {
  Play,
  Volume2,
  Plus,
  Trash2,
  Sparkles,
  Music,
  Download,
} from 'lucide-react';
import { downloadProgressionMidi } from './core/midi-writer';

export const App: React.FC = () => {
  const [currentRoot, setCurrentRoot] = useState('C');
  const [progression, setProgression] = useState<HarmonicDegree[]>([]);
  const [isPlayingProgression, setIsPlayingProgression] = useState(false);

  const keyContext = useMemo(() => {
    return computeKeyContext(currentRoot, 'major');
  }, [currentRoot]);

  const handleAddChord = (deg: HarmonicDegree) => {
    setProgression((prev) => [...prev, deg]);
    playChordFrequencies(deg.frequencies);
  };

  const handlePlayProgression = () => {
    if (progression.length === 0 || isPlayingProgression) return;
    setIsPlayingProgression(true);

    progression.forEach((chord, idx) => {
      setTimeout(() => {
        playChordFrequencies(chord.frequencies);
        if (idx === progression.length - 1) {
          setTimeout(() => setIsPlayingProgression(false), 1200);
        }
      }, idx * 1000);
    });
  };

  const handleLoadPreset = (degrees: string[]) => {
    const matched: HarmonicDegree[] = [];
    degrees.forEach((roman) => {
      const foundDiatonic = keyContext.degrees.find((d) => d.roman === roman);
      if (foundDiatonic) {
        matched.push(foundDiatonic);
      } else {
        const foundBorrowed = keyContext.borrowedDegrees.find((d) => d.roman === roman);
        if (foundBorrowed) matched.push(foundBorrowed);
      }
    });
    setProgression(matched);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans select-none">
      {/* Header */}
      <header className="h-16 border-b border-zinc-800 bg-zinc-900/90 backdrop-blur px-6 flex items-center justify-between z-20">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🎼</span>
          <div className="flex items-center gap-2">
            <h1 className="font-bold text-base tracking-tight text-white">Garden Harmonics</h1>
            <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              Functional Harmony Lab
            </span>
          </div>
        </div>

        {/* Selected key badge */}
        <div className="flex items-center gap-2 bg-zinc-950 border border-zinc-800 px-4 py-1.5 rounded-xl font-mono text-xs">
          <span className="text-zinc-500">TONALIDADE:</span>
          <span className="font-bold text-emerald-400 text-sm">{currentRoot} Maior</span>
        </div>
      </header>

      {/* Main Grid */}
      <main className="flex-1 grid grid-cols-12 gap-6 p-6 overflow-y-auto max-w-7xl mx-auto w-full">
        {/* Left Column: Circle of Fifths */}
        <div className="col-span-12 lg:col-span-5 flex flex-col gap-6 items-center">
          <CircleOfFifths currentKey={currentRoot} onSelectKey={setCurrentRoot} />

          {/* Preset Progressions */}
          <div className="w-full bg-zinc-900/50 border border-zinc-800 rounded-3xl p-5">
            <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Modelos Harmônicos Famosos
            </div>
            <div className="grid grid-cols-1 gap-2">
              {POPULAR_PROGRESSIONS.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => handleLoadPreset(preset.degrees)}
                  className="text-left p-3 rounded-xl bg-zinc-950/60 border border-zinc-800/80 hover:border-emerald-500/50 hover:bg-zinc-900 transition flex flex-col gap-1 group"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-zinc-200 group-hover:text-emerald-400">
                      {preset.name}
                    </span>
                    <span className="text-[10px] font-mono text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded">
                      {preset.genre}
                    </span>
                  </div>
                  <div className="text-[11px] font-mono text-emerald-400">
                    {preset.degrees.join(' ➔ ')}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Diatonic Degrees & Progression Builder */}
        <div className="col-span-12 lg:col-span-7 flex flex-col gap-6">
          {/* Diatonic Chords Grid */}
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-6">
            <h2 className="text-xs font-semibold uppercase text-zinc-400 mb-4 tracking-wider">
              Graus Diatônicos de {currentRoot} Maior
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
              {keyContext.degrees.map((deg) => (
                <div
                  key={deg.roman}
                  className="p-3 rounded-2xl bg-zinc-950 border border-zinc-800 flex flex-col items-center gap-1 hover:border-zinc-700 transition relative group"
                >
                  <span className="font-mono text-xs font-bold text-zinc-500">{deg.roman}</span>
                  <span className="text-xl font-black text-white">{deg.chordName}</span>
                  <span
                    className={`text-[9px] uppercase font-mono px-1.5 py-0.5 rounded-full mt-1 ${
                      deg.functionType === 'tonic'
                        ? 'bg-blue-500/10 text-blue-400'
                        : deg.functionType === 'subdominant'
                        ? 'bg-amber-500/10 text-amber-400'
                        : 'bg-rose-500/10 text-rose-400'
                    }`}
                  >
                    {deg.functionType === 'tonic'
                      ? 'Tônica'
                      : deg.functionType === 'subdominant'
                      ? 'Subdom.'
                      : 'Domin.'}
                  </span>

                  <div className="flex items-center gap-1 mt-2 w-full">
                    <button
                      onClick={() => playChordFrequencies(deg.frequencies)}
                      className="flex-1 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 flex justify-center"
                      title="Ouvir acorde"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleAddChord(deg)}
                      className="flex-1 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white flex justify-center"
                      title="Adicionar à progressão"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Modal Interchange / Borrowed Chords */}
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-6">
            <h2 className="text-xs font-semibold uppercase text-zinc-400 mb-4 tracking-wider flex items-center gap-1.5">
              <span>Empréstimo Modal (Paralelo Menor / Rock Épico)</span>
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {keyContext.borrowedDegrees.map((deg) => (
                <div
                  key={deg.roman}
                  className="p-3 rounded-2xl bg-zinc-950 border border-purple-900/30 flex flex-col items-center gap-1 hover:border-purple-500/50 transition"
                >
                  <span className="font-mono text-xs font-bold text-purple-400">{deg.roman}</span>
                  <span className="text-xl font-black text-white">{deg.chordName}</span>
                  <span className="text-[9px] text-zinc-500 font-mono">{deg.borrowedFrom}</span>

                  <div className="flex items-center gap-1 mt-2 w-full">
                    <button
                      onClick={() => playChordFrequencies(deg.frequencies)}
                      className="flex-1 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 flex justify-center"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleAddChord(deg)}
                      className="flex-1 py-1 rounded-lg bg-purple-600 hover:bg-purple-500 text-white flex justify-center"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Active Progression Timeline */}
          <div className="bg-zinc-900/70 border border-zinc-800 rounded-3xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs font-semibold uppercase text-zinc-400 tracking-wider flex items-center gap-2">
                <Music className="w-4 h-4 text-emerald-400" />
                Linha da Progressão ({progression.length} acordes)
              </h2>

              <div className="flex items-center gap-2">
                <button
                  onClick={handlePlayProgression}
                  disabled={progression.length === 0 || isPlayingProgression}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white text-xs font-bold transition shadow-lg shadow-emerald-600/30"
                >
                  <Play className="w-3.5 h-3.5" /> {isPlayingProgression ? 'Tocando...' : 'Tocar Progressão'}
                </button>
                <button
                  onClick={() => downloadProgressionMidi(progression, currentRoot, 120)}
                  disabled={progression.length === 0}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600/30 border border-purple-500/40 hover:bg-purple-600/40 disabled:opacity-40 text-purple-300 text-xs font-bold transition"
                  title="Exportar arquivo MIDI (.mid) para Ableton, FL Studio, Reaper, etc."
                >
                  <Download className="w-3.5 h-3.5" /> Exportar MIDI
                </button>
                <button
                  onClick={() => setProgression([])}
                  disabled={progression.length === 0}
                  className="p-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 text-zinc-400 hover:text-rose-400 transition"
                  title="Limpar progressão"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {progression.length === 0 ? (
              <div className="h-28 border border-dashed border-zinc-800 rounded-2xl flex items-center justify-center text-xs text-zinc-500">
                Clique nos botões [+] dos acordes acima para montar a progressão musical da sua música.
              </div>
            ) : (
              <div className="flex flex-wrap items-center gap-2">
                {progression.map((chord, idx) => (
                  <div
                    key={idx}
                    className="px-4 py-2 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center gap-2 shadow-md animate-in zoom-in-95"
                  >
                    <span className="font-mono text-xs text-zinc-500">{chord.roman}</span>
                    <span className="font-black text-sm text-emerald-400">{chord.chordName}</span>
                    <button
                      onClick={() => setProgression((prev) => prev.filter((_, i) => i !== idx))}
                      className="text-zinc-600 hover:text-rose-400 text-xs ml-1"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
