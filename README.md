# 🎼 Garden Harmonics

> **Functional Harmony Lab, Interactive Circle of Fifths & Chord Progression Engine.**
> Laboratório de harmonia funcional e composição musical: explore o Círculo de Quintas interativo, graus harmônicos diatônicos, empréstimos modais do paralelo menor (acordes de rock épico como $\text{bVI}$ e $\text{bVII}$), modelos de progressão populares e audição em tempo real de acordes via Web Audio API.

Parte da **Garden Suite** — ferramentas de código aberto de nível Senior/Staff, 100% gratuitas, offline-first e orientadas à criação independente.

---

## ✨ Recursos

- 🎡 **Círculo de Quintas Interativo em SVG**: Navegue pelas 12 tonalidades maiores e seus relativos menores de forma visual e intuitiva.
- 🎹 **Matriz de Graus Diatônicos**: Exibe os 7 graus fundamentais com identificação precisa de função harmônica (Tônica, Subdominante, Dominante).
- 🎸 **Empréstimo Modal (Modal Interchange)**: Sugestões automáticas de acordes do modo homônimo menor ($\text{bIII, iv, bVI, bVII}$) para colorir composições de rock, pop e baladas.
- 🔊 **Audição Polifônica Sintetizada (Web Audio API)**: Clique em qualquer acorde para ouvir suas frequências fundamentais sem necessidade de carregar samplers pesados.
- 🎼 **Construtor de Progressões**: Monte sequências harmônicas, escute o encadeamento contínuo e estude variações para sua música.
- 📱 **PWA & APK Android Nativo**: Empacotado via Capacitor (`@capacitor/android`) para compor no violão ou no estúdio direto pelo celular.

---

## 🛠️ Stack Tecnológica

- **Frontend**: React 19 + TypeScript
- **Estilização**: Tailwind CSS v4 + Lucide Icons
- **Music Theory Core**: Diatonic intervals, Circle of Fifths calculator & Web Audio synthesizer
- **Mobile Engine**: Capacitor 8 (Android)
- **Testes & CI**: Vitest + GitHub Actions

---

## 🚀 Como Executar

### 1. Requisitos
- Node.js 20+
- npm 10+

### 2. Instalação e Desenvolvimento Web
```bash
git clone https://github.com/FelipeGardenghiDev/garden-harmonics.git
cd garden-harmonics
npm install
npm run dev
```

### 3. Testes Unitários
```bash
npm test
```

### 4. Build para Produção
```bash
npm run build
```

### 5. Executar no Android (APK / Emulador)
```bash
npm run mobile:sync
npm run mobile:open # Abre o projeto no Android Studio
```

---

## 📜 Licença

MIT License © 2026 Felipe Gardenghi. Feito para compositores e mentes criativas.
