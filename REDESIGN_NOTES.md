# CareerPilot X visual redesign

## What changed
- Preserved the existing scroll-synchronized 3D camera journey and stage navigation.
- Removed the human developer and robot GLB characters from the landing scene.
- Replaced the character-led hero with a floating 3D career-intelligence centerpiece: faceted cobalt core, lime orbital rings, animated satellites, and floating skill/roadmap/interview data panels.
- Updated the visual tokens toward the supplied Midnight Black / Electric Cobalt / Acid Lime brand palette.
- Updated the AI Coach copy so it no longer refers to a robot or physical companion.

## Run locally
1. Open a terminal in `client`.
2. Run `npm install`.
3. Run `npm run dev`.

The project requires the normal npm dependency installation on your operating system. The uploaded archive's `node_modules` folder was not included in this ZIP so platform-specific binaries are installed correctly on the target machine.

## Verification
The TypeScript compiler completed without reporting errors. The Vite production build could not be completed in this environment because the uploaded Windows `node_modules` did not contain Rollup's Linux optional native package. Run `npm install` followed by `npm run build` locally to rebuild with platform-matched dependencies.
