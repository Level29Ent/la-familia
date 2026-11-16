# Good Life preview fixture

On a Vercel **preview** deployment, open `/preview/good-life` (Vercel and local builds default to no basePath).

This fixture is compiled only when `VERCEL_ENV=preview`. Production and ordinary local exports return 404. It does not mount the save provider or read/write localStorage, alter a real game balance, or grant player purchases.

- Start with all six Good Life items owned in an isolated in-memory scene.
- Switch between the street and safe house; remove/restore test ownership to check visibility gates.
- Drive test sedan exercises the same player/car controller and physics as the real game. W/S accelerate/reverse, A/D steer, Space brakes. Park & exit returns to the player.
- Street: inspect the owned sedan and penthouse, and the yacht beside City Hall at the far end of the street.
- Safe house: inspect the wardrobe, desk watch/yacht model, framed penthouse deed, paintings, and player watch/pin.
- Use the ordinary game route to check wallet purchases and saved ownership. The fixture is not a substitute for engine purchase/save tests (`node scripts/check-game.cjs`).

The fixture includes sustained driving-input checkboxes and read-only car position/speed telemetry. These feed the shared input/controller, not a second physics implementation. Clear the checkboxes before switching views. They are not present in the player game.

## Static hosting regression checks

- Run `pnpm check` for types, game economy/navigation/save regressions, and asset-path/font-suspension tests.
- Run `pnpm build` for a root-hosted build (Vercel). This runs checks, builds, and validates the exported asset URLs.
- Run `NEXT_PUBLIC_BASE_PATH=/la-familia pnpm build` to simulate GitHub Pages. The existing Pages workflow injects its actual base path into the Next config with `actions/configure-pages`; the config then publishes that final path to client-side assets. No workflow edit is needed.
- On each host, start a new game, check that the city, player, signs and skyline appear, walk to the first racket and collect income, then enter/exit the safe house and open the character creator. Reload to check save persistence. Check Safari as well as Chromium.
- Font labels have their own Suspense boundaries: a slow font must not hide buildings, player controls or the safe house. Scene startup/WebGL failures show a reload message instead of a blank world.
