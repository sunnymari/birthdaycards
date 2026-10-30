<div align="center">
  <h1>💌 Birthday Cards & Little Thank-Yous</h1>
  <p><em>Happy mail, made with code and a little sparkle. ♡</em></p>
</div>

I love sending birthday cards and thank-you cards. There’s something special about making someone feel remembered and appreciated.

Sometimes snail mail is a little too slow, so I make my cards digitally—with the same care, a personal note, and a few extra things that don’t quite fit inside an envelope. Think dancing robots, tiny hearts, shooting stars, and the occasional dragon. ✨

Each card is made for a particular person or moment. This is my little collection of celebrations, gratitude, and creative coding experiments.

## 🎀 Open a little happy mail

| Card | A peek inside |
| --- | --- |
| [🐉 A dragon-guarded birthday card](https://sunnymari.github.io/birthdaycards/) | A folding card with a dragon, glowing embers, and a fantasy-book feel. |
| [🤖 A Starbot thank-you card](https://sunnymari.github.io/birthdaycards/tesla/) | Handwritten pink lettering, cloud-shaped paper, a dancing 3D robot, and a sparkly shooting star. |

## 🧵 What I make them with

| Piece | Tech stack |
| --- | --- |
| The cards | **HTML5** for the notes, structure, and interactive controls |
| The stationery | **CSS** for responsive layouts, paper details, custom properties, and animations |
| The little surprises | **Vanilla JavaScript** and **ES modules** for opening, replaying, and coordinating effects |
| Doodles & effects | **SVG** and **Canvas 2D** for illustrations, sparkles, embers, and trails |
| The 3D guest | **Three.js**, **GLTFLoader**, and a **GLB/glTF** Starbot model |
| The lettering | **Google Fonts**, including **Patrick Hand**, with fallback fonts |
| The delivery | **GitHub Pages**, with source managed in **Git** |

These are static pages, so there’s no build step or package installation needed to preview them.

## ✨ Small details, lots of care

- Personal notes and a different visual theme for each occasion.
- Layouts that work on phones as well as bigger screens.
- Playful motion with pause/replay controls and reduced-motion support in the Starbot card.
- A model that starts loading while the cover is visible, plus a kawaii **“Starbot is coming…”** welcome and a retry if it needs a little help arriving.

Three.js is included locally with its [MIT license](tesla/vendor/LICENSE-three.txt).

## 🛠️ Peek behind the envelope

```bash
git clone https://github.com/sunnymari/birthdaycards.git
cd birthdaycards
python3 -m http.server 4180 --bind 127.0.0.1
```

Then open:

- Birthday card: <http://127.0.0.1:4180/>
- Starbot card: <http://127.0.0.1:4180/tesla/>

The birthday card lives in `index.html`; the Starbot card and its assets live in `tesla/`.

---

Made with care by [**Marissa Curry**](https://marissacodes.com). Wishing you a very lovely day. ♡
