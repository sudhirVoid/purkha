# Design Guidelines

## Theme & Visual Style
- **UI Framework Base:** `shadcn/ui` using the "new-york" style.
- **Base Color:** `slate`
- **CSS Variables:** The project uses CSS variables (`--background`, `--primary`, `--foreground`, etc.) defined in `src/styles.css` to allow for seamless light/dark mode transitions and consistent theming.

## Typography
- The global font family is **Kalam** (Google Fonts) for a more organic, handwritten feel suitable for a family tree.
- Weights: 400 (regular) and 700 (bold).

## Graph Node Aesthetics
Nodes in the `FamilyFlow` graph rely on subtle, clean aesthetics with semantic colors:
- **Male Nodes:** Blue tinted (`hsl(210_90%_96%)`) with `♂` icon.
- **Female Nodes:** Pink tinted (`hsl(330_90%_97%)`) with `♀` icon.
- **Other/Unspecified:** Muted card background with `⚧` icon.
- **Bond Nodes:** Subtle, smaller nodes connecting spouses.

## General UI Principles
- **Clean Toolbars:** Node toolbars should float cleanly above the nodes, using slight shadows (`shadow-lg`) and rounded corners (`rounded-xl`).
- **Interactive Feedback:** Buttons and inputs must have hover states (`hover:bg-accent`) and clear disabled states (`disabled:opacity-40`).
- **Responsive:** While the graph is pan/zoom, overlay UI (like menus) must remain accessible on smaller screens.
