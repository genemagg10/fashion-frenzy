# Fashion Frenzy

A boutique game by Ella. Customers walk in with a wish, you pick a sketch, choose cloth, sew it on the dress form, and send them out the door wearing it. Some nights the shop puts on a fashion show.

Play it at [genemagg10.github.io/fashion-frenzy](https://genemagg10.github.io/fashion-frenzy/).

## How to play

Tap and drag only. No typing.

1. **Open the shop.** A customer arrives with a short wish and a favorite color. The first visit walks you through one order.
2. **Sketchbook.** Flip the pages and choose a silhouette. It becomes a paper pattern on the dress form.
3. **Cloth.** Pick a color and a pattern. The dress form shows the cloth right away.
4. **Sew.** Tap the pins, drag along the pink thread, then tap the loose threads. If you get stuck, Pip will sew it for you. There is no way to fail. Careful sewing and a good match just add more stars.
5. **Trim.** Bows, buttons, sequins, a belt, a beret, a bag, shoes. Add any, or none.
6. **The customer.** They twirl, leave hearts and coins, and walk out wearing your look. Keep favorites in the lookbook. **Save a picture** downloads a card, or opens the share sheet when your browser allows it.

After two happy customers, Jules books a **fashion show**. Design three looks for the theme. Models walk them beside looks from Maison Lumi, Atelier Pip, and House of Nia. Everyone gets applause. Ella’s looks get the awards.

Spend coins on **the shelf** for new sketches, cloth, trims, and boutique decorations. Everything stays on this device (local storage). There are no accounts, ads, or chat.

## Secrets

- Tap the cat in the window. Five taps, and it unrolls a rainbow cloth.
- Tap the light seven times.
- Press and hold the dress form during cloth or trims.

## Develop

```bash
npm install
npm run dev
```

Then open the local address Vite prints. `npm run build` writes static files to `dist/` with relative asset paths so the game works under `/fashion-frenzy/` on GitHub Pages.

`#gallery` opens a pattern library of every silhouette. `#cover` is the poster layout used for the arcade image.

## Deploy

Pushes to `main` run [`.github/workflows/pages.yml`](.github/workflows/pages.yml), which builds the site and deploys it with `actions/deploy-pages`. In the repository settings, set **Pages → Build and deployment → Source** to **GitHub Actions**.

## Credits

All clothing, characters, the boutique, and the sound are original and drawn or synthesized in this project.

Fonts, bundled from [Fontsource](https://fontsource.org/) under the SIL Open Font License:

- [Fraunces](https://fonts.google.com/specimen/Fraunces) by Undercase Type
- [Nunito](https://fonts.google.com/specimen/Nunito) by Vernon Adams
- [Patrick Hand](https://fonts.google.com/specimen/Patrick+Hand) by Patrick Wagesreiter
