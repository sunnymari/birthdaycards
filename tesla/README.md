# Thank you to the Tesla team

A standalone thank-you card for Chris Haener and Mahika Dubey, from Marissa. Open the envelope to read the note and start Starbot's dance. Existing cards remain at their original paths.

Published through the repository's existing GitHub Pages configuration at:
https://sunnymari.github.io/birthdaycards/tesla/

Preview from the repository root with `python3 -m http.server 4180 --bind 127.0.0.1`, then visit `/tesla/`. No build or package installation is required.

The original Starbot GLB is reused from Marissa's actuator diagnostics project. Its static mesh is gently deformed at the shoulders, with a bounce and sway, for the dance. Three.js 0.160.1 is vendored with its MIT license. All rendering/model dependencies are local. Google Fonts is optional; system fonts are fallbacks.

The robot loads only after opening. Pause/play, fold/reopen, reduced-motion preferences, background-tab suspension, and an animated SVG fallback are supported. No audio, analytics, form submission, or external messages are sent by the card.
