# Origen, el método

A React/Vite learning app for fast Spanish drills inspired by the question-answer rhythm of direct-method lessons.

## Run

```bash
npm install
npm run dev
```

The dev command starts both Vite and the local TTS API.

## Build

```bash
npm run build
```

## Content Model

The app keeps lesson content in `src/data/lessons.js` and generates drills in `src/engine/generateDrills.js`.

The scalable idea is to add vocabulary, verb forms, and sentence patterns once, then generate many controlled drills from those pieces. Curated drills can still be added manually in `finalGym` when a sentence needs a specific teaching sequence.

## Local Piper TTS

On CachyOS/Arch, install Piper:

```bash
sudo pacman -S piper-tts-git
```

Download the default Spanish model:

```bash
npm run tts:download-es
```

Then run the app:

```bash
npm run dev
```

The TTS API uses `piper-tts` or `piper` automatically, and uses `models/piper/es_ES-davefx-medium.onnx` by default. You can override either path with:

```bash
PIPER_BIN=/usr/bin/piper-tts PIPER_MODEL=/absolute/path/to/model.onnx npm run dev
```
