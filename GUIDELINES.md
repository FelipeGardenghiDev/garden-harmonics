# Diretrizes do Projeto — Garden Harmonics

> Este documento serve como guia técnico e arquitetural para o desenvolvimento contínuo do **Garden Harmonics** em qualquer estação de trabalho.

---

## 1. Visão & Princípios Fundamentais

1. **100% Client-Side & Zero Cloud:** O usuário não deve depender de conexão à internet nem enviar progressões inéditas para servidores. Toda a teoria harmônica e síntese deve ocorrer localmente no navegador ou WebView Android.
2. **Desempenho & Leveza:** Evitar o uso de soundfonts de centenas de megabytes. Para audição harmônica rápida, a síntese aditiva e subtrativa via `Web Audio API` (`AudioContext`, `OscillatorNode`, envelopes de amplitude) é suficiente, instantânea e consome pouquíssima bateria.
3. **Didática sem Pedantismo:** Apresentar termos da harmonia funcional (Tônica, Subdominante, Dominante, Trítonos, Modos Gregos) de forma visual e acionável.

---

## 2. Estrutura de Pastas e Módulos

```text
src/
├── core/
│   └── harmony-engine.ts       # Funções puras de teoria musical, frequências e escalas
├── types/
│   └── index.ts                # Modelos estritos de graus, escalas e progressões
├── components/
│   └── CircleOfFifths.tsx      # Componente SVG com renderização trigonométrica do círculo
├── App.tsx                     # Interface principal e gerenciamento de estado da progressão
└── index.css                   # Estilização utilitária com Tailwind v4
```

---

## 3. Próximos Passos Recomendados no Roadmap

1. **Exportador de Arquivo MIDI (`.mid`):**
   - Criar `src/core/midi-writer.ts` para serializar as notas e durações da progressão em formato padrão MIDI Type 0, permitindo download direto para arrastar no Reaper/Ableton.
2. **Visualizador de Acordes no Braço da Guitarra / Teclado:**
   - Adicionar uma visualização gráfica de onde posicionar os dedos para tocar o acorde selecionado.
3. **Modos Gregos Expandidos:**
   - Adicionar Dórico, Frígio, Lídio, Mixolídio e Lócrio com suas respectivas notas características.
