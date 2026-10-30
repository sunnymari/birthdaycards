# Thank you to the Tesla team

A standalone thank-you card for Chris Haener and Mahika Dubey, from Marissa Curry. Open the envelope to read the note and start Starbot's dance. Existing cards remain at their original paths.

Published through the repository's existing GitHub Pages configuration at:
https://sunnymari.github.io/birthdaycards/tesla/

Preview from the repository root with `python3 -m http.server 4180 --bind 127.0.0.1`, then visit `/tesla/`. No build or package installation is required.

The original Starbot GLB is reused from Marissa's actuator diagnostics project. Its static mesh keeps its original geometry and normals. The dance animates the complete robot with rigid hops, side steps, swivels, and bows; uniform scaling preserves its proportions. Independent joint motion would require an authored rigged model. An orthographic camera fits the whole dance on narrow and wide screens, with tone-mapped studio lighting and a soft contact shadow. Three.js 0.160.1 is vendored with its MIT license. All rendering/model dependencies are local. Google Fonts is optional; system fonts are fallbacks.

The robot loads only after opening. Pause/play, fold/reopen, reduced-motion preferences, background-tab suspension, and an animated SVG fallback are supported. No audio, analytics, form submission, or external messages are sent by the card.

The celebration includes bouncing pink handwritten thank-you letters, floating heart stickers, mixed heart/star confetti, and an Encore button. Starbot cycles through a hop, side step, swivel, and bow. The animation pause control covers the robot and the surrounding looping effects; reduced motion keeps a full-size static pose.

The card uses Patrick Hand lettering, pink ink, cocoa outlines, scalloped cloud-paper edges, and a heart-patterned bow inspired by the supplied stationery reference. The original 3D Starbot and all dance controls are retained.

Opening the card or tapping Encore launches a smiling gold shooting star with a pink-and-gold trail and twinkling sparkles. The effect cleans itself up, pauses with the other animations, and is hidden for reduced-motion preferences.

The letter is signed Marissa Curry and links to the updated Starbot project, noting that Mahika’s interview question prompted her to extend her thinking and update the project.
