# STL Wand Editor

A fully browser-based 3D STL file editor with no server required — runs entirely in your browser.

🔗 ---

## Features

### Segmentation
- **CONNECT mode** — splits physically separate bodies (no shared vertices)
- **ANGLE mode** — splits at sharp edges using a configurable angle threshold
- **AI Advisor** — analyzes geometry and recommends the optimal segmentation strategy

### Selection Tools
- **Wand Tool** — click to select triangles; Shift+drag to paint selections; flood-fill by surface normal angle
- **Box Select** — drag a rectangle to select all triangles inside it
- **Multi-select** — select/deselect parts in the parts panel with checkboxes, range select, and sort

### Editing
- **Delete** — remove selected parts or individual triangles
- **Undo** — undo the last deletion
- **Triangle Color** — paint selected triangles with custom colors

### Orientation & Movement
- **Re-Orient** — rotate the model or selection on X/Y/Z axes; auto-bakes on release
- **Move Tool** — drag model or selected parts on the ground plane (Shift+drag = vertical); RGB axis gizmo handles
- **Move to Ground** — snap any selection to Y=0 in one click
- **Explode View** — spread parts radially for easier wand access

### View
- **View Cube** — shows current orientation; click faces or drag to orbit; snap buttons (Front/Back/Left/Right/Top/Bottom)
- **Draggable HUD** — hints bar and status badges are repositionable
- **Orbit Settings** — choose from Default, Fusion 360, Tinkercad, FreeCAD, Blender, or Maya orbit controls

### Export
- **Export All / Selected** — binary STL per part, bundled in a `.zip`
- **Coordinate origin** — keep local position or center each part

---

## Usage

1. Open the tool in any modern browser (Chrome, Edge, Firefox, Safari)
2. Drag and drop an `.stl` file onto the viewport, or click **Browse File**
3. Use the **SEG** panel on the left to segment the model into parts
4. Use the **WAND**, **BOX SEL**, or **MOVE** tools to select and edit parts
5. Export individual parts or the full model

**No installation. No upload. Everything runs locally in your browser.**

---

## Technology

- [Three.js r128](https://threejs.org/) — 3D rendering
- [JSZip 3.10.1](https://stuk.github.io/jszip/) — ZIP export
- [Google Fonts](https://fonts.google.com/) — Rajdhani + Share Tech Mono
- Vanilla HTML/CSS/JS — zero build step, single file

---

## Browser Support

| Browser | Support |
|---------|---------|
| Chrome 90+ | ✅ Full |
| Edge 90+ | ✅ Full |
| Firefox 88+ | ✅ Full |
| Safari 15+ | ✅ Full |

---

## License

MIT — free to use, modify, and distribute.