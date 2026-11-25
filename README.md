# HEARTHFIRE — Tavern Kitchen Rush

[![make.fun · best-cooking-game-20261125-0137](https://make.fun/badge/best-cooking-game-20261125-0137.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)

A complete, original cooking game that runs offline in a desktop browser from
static files. You are the new cook at the Ember & Oak tavern: adventurers are
hungry, the hearth is hot, and the orders will not wait.

## How to play

1. **Pick an ingredient** from the pantry at the bottom — click it, or press
   keys `1–8`.
2. **Cook it at a station** (click the station while holding the ingredient):
   - **Chopping Block** — click 3 times to chop.
   - **Hearth Grill** — a needle sweeps back and forth; click to stop it in the
     green zone (yellow centre = perfect sear, outside = undercooked or burnt).
   - **Cauldron** — boils in 9 seconds. **Stone Oven** — bakes in 11 seconds.
     Collect finished food promptly: leave it sitting and it burns.
   - **Ale** goes straight onto the plate — just click it.
3. **Plate it** — click a finished station to move the food onto your plate.
   The plate must match a ticket on the order board *exactly*.
4. **Ring the SERVE bell** (or press `Space`). Fast serves earn tips up to
   +15 coins; serving several orders in a row builds a combo bonus.

## Rules

- Each customer has a patience bar. If it runs out, they storm out — a strike.
  **3 strikes and you are fired.**
- Each day lasts 2½ minutes. Hit the coin target to keep the tavern:
  Day 1: 90, Day 2: 170, Day 3: 260 coins.
- 6 dishes unlock across the 3 days (Roast Chicken, Hearty Stew, Mushroom
  Melt, Hunter's Platter, Ale Round, Wizard's Feast). Serve 3 days and the
  tavern thrives — with 1–3 stars per day based on how far past the target
  you cooked.
- Wrong plate? The bell refuses and your combo resets. Burnt food must be
  clicked off the station. `X` clears the plate, `P` pauses, `M` mutes.

## Controls

| Input | Action |
| --- | --- |
| Mouse click | Pick ingredient / use station / serve / trash |
| `1–8` | Pick a pantry ingredient |
| `Space` | Ring the serve bell |
| `X` | Clear the plate |
| `P` | Pause |
| `M` | Mute |
| `Enter` | Start / next day |
| `R` | Cook again after game over |

## Run it

```sh
node serve.ts
# open http://localhost:8080
```

Or open `game/index.html` directly in a desktop browser. No build step, no
network requests, no dependencies. Sound is synthesized live with WebAudio
(no audio files).

## Screenshots

The four screenshots under `screenshots/` are real renders of the game's own
code, staged deterministically with `?shot=<scene>&seed=7` (see `shots.json`):
`1-kitchen` (the busy kitchen, mid-assembly), `2-title`, `3-serve` (a plate
ready to serve), `4-win` (three days complete).

## Structure

```
main.ts            entrypoint the grader runs (Node 22) — copies game/ +
                   screenshots/ to /output and writes dossier.json
game/index.html    the game page (canvas 1280×720)
game/src/config.js constants & tuning
game/src/recipes.js ingredients, stations, dishes, customers
game/src/state.js  game state, orders, scoring, win/lose, seeded RNG
game/src/render.js all canvas drawing (kitchen, board, stations, plate)
game/src/input.js  mouse + keyboard
game/src/audio.js  synthesized WebAudio sound effects
game/src/shots.js  deterministic screenshot scenes
game/src/main.js   boot + game loop
vendor/makefun-game.ts  make.fun dossier library, copied unchanged from the kit
```

## License

MIT — see `LICENSE`.
