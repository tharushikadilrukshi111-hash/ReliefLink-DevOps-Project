# CrisisBridge — Figma to React Frontend

React/Vite implementation of the supplied Figma **CrisisBridge - Operator Dashboard** frame.

## Run in VS Code

```bash
npm install
npm run dev
```

Open the URL printed by Vite (normally `http://localhost:5173`).

## Production build

```bash
npm run build
npm run preview
```

## Included interactions

- Sidebar module navigation
- EN / Sinhala toggle
- SOS confirmation modal and active state
- Live tidal-surge countdown
- Siren broadcast toggle
- SOS feed filters (All / Critical / Medical)
- Dispatch buttons and acknowledgement toasts
- Responsive tablet/mobile layout

## Notes

The layout, dimensions, colors, hierarchy and visible dashboard copy are implemented from the connected Figma file. The mini map previews and live camera scene are local vector/CSS reconstructions so the project is self-contained and does not depend on temporary Figma asset URLs.
