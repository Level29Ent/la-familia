# Good Life preview fixture

On a Vercel **preview** deployment, open `/preview/good-life` (the current Next.js configuration has no basePath).

This fixture is compiled only when `VERCEL_ENV=preview`. Production and ordinary local exports return 404. It does not mount the save provider or read/write localStorage, alter a real game balance, or grant player purchases.

- Start with all six Good Life items owned in an isolated in-memory scene.
- Switch between the street and safe house; remove/restore test ownership to check visibility gates.
- Drive test sedan exercises the same player/car controller and physics as the real game. W/S accelerate/reverse, A/D steer, Space brakes. Park & exit returns to the player.
- Street: inspect the owned sedan and penthouse, and the yacht beside City Hall at the far end of the street.
- Safe house: inspect the wardrobe, desk watch/yacht model, framed penthouse deed, paintings, and player watch/pin.
- Use the ordinary game route to check wallet purchases and saved ownership. The fixture is not a substitute for engine purchase/save tests (`node scripts/check-game.cjs`).

The fixture includes sustained driving-input checkboxes and read-only car position/speed telemetry. These feed the shared input/controller, not a second physics implementation. Clear the checkboxes before switching views. They are not present in the player game.
