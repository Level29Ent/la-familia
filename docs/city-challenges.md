# Garden Market and City Express challenges

## Four new enterable businesses

Garden Heights now extends one block east with Juniper Coffee House, Crown & Comb, Oak & Brass Furnishings, and City Express Couriers. There are 64 enterable buildings and 30 businesses across 16 occupied blocks. All 60 existing addresses, home IDs, property ownership and apartment suites stay in place. The connected roads, minimap, map bounds and navigation include the new block.

Each storefront has an ordinary ownership/upgrade/manager income path. The first coffee-house purchase costs $65; barber $420; furniture $2,200; courier office $8,500. This does not replace the free starting Street Hustle. New saves and old-save migrations initialize all new business counters normally.

Coffee-house, barber and furniture interiors offer hands-on shifts without requiring property ownership. Coffee is free to start and pays $75; barber costs $5 and pays $95; cabinet restoration costs $15 and pays $140. Start at the actual business, wait the disclosed preparation time, then complete three ordered work steps with three active seconds between the new shift steps. The last step pays once. Existing activity cooldowns, custody rules, rank XP and contact experience apply. Existing repair/show activities keep their previous timing. Intermediate buttons now say Next step rather than misleadingly advertising a payout on every step.

New interiors include an espresso machine/cups, barber chair/mirror, cabinet display and parcel sorting office. Colored canopies and shop mottos distinguish the new block. Furnishings stay in the existing blocked side zones; the central aisle and exit remain clear.

## Replayable route challenges

Open **City atlas → Challenges**, or **Challenges & dispatch** inside a building. Challenges are free and separate from ordinary city activities, so they can run alongside a job. Only one route can run at once.

- **Espresso express**: Coffee House → Midnight Diner; 40m actual travel; 180 seconds; $100 base reward.
- **The showroom circuit**: Furniture → Rosa Apartments → Furniture; 50m per leg; 240 seconds; $220 base.
- **Five-district dispatch**: Courier Office → Diner → Volkov Club → Doyle Club → Garage → Grand Central Apartments; 40m per leg; 420 seconds; $420 base.

Enter each building, reopen Challenges, and confirm the checkpoint. The first stop collects the order; subsequent stops require the stated movement since the preceding checkpoint. Walking or driving counts; atlas relocation, interior travel and switching vehicles do not. Gold means finishing within 40% of the total limit (+50% base reward), Silver within 70% (+25%), Bronze before expiry (base reward). Every win adds 35 family XP. Best elapsed time and win counts save per route.

Timeout/cancellation never fines the wallet; dispatch reopens after a 30-second active-play cooldown. Completed checkpoints use expected route ID/index guards, preventing stale clicks and duplicate payouts. Challenge clocks run while menus are open, pause in custody, and do not advance offline. Existing game simulation already continues in menus. Retirement clears route records with the current empire; inherited residence/vault behavior is unchanged.

Active challenges have cyan destination rings/labels, a HUD countdown/stop number, and dispatch notifications. The journal records starts, checkpoints, medals, cancellations and timeouts. Existing Harbor and apartment events now surface through the same city notification system instead of being silent outside their panels. Optional **Reward sounds: Off/On** enables a quiet synthesized chime only after a user gesture; it defaults off and uses no external audio files. Existing music remains independent.

## Fixes and boundaries

- Slow frames previously discarded movement time above 50ms while challenge clocks kept running. Player/car movement now integrates frames up to 250ms in collision-safe steps of at most 50ms. Background-tab resumes remain bounded instead of teleporting the player.
- Low graphics mode previously used `night ? 6 : low ? 3 : 5`, selecting six cars at night even with Low enabled. Population selection now checks Low first (three cars/eight citizens).
- Building and suite interiors now honor Low rendering resolution instead of always using the balanced device-pixel range.
- Activity step buttons disclose whether the next click advances work or pays the final reward.
- Map/catalog labels and world bounds are updated alongside the new storefronts; historical saved addresses remain unchanged.

This update does not claim every possible game issue is fixed. It adds procedural browser-game content, not combat AI, multiplayer or console-scale cinematics. Device frame rates, live Safari and any deployed-preview behavior that cannot be tested must be reported as unverified.

## Checks

`pnpm check` runs the existing suite plus ten new tests covering all new businesses/income/migration, staged shift costs/steps/payout guards, free challenge start/cancellation, checkpoint and actual-distance guards, all routes/medals/records, timeout, offline/custody timing, save sanitization and Low-at-night regression. Existing breadth-first navigation tests cover every one of the 64 entrances, non-overlap, focus and building collision. Root and literal configure-pages builds must pass export/asset validation. Browser checks should exercise a fresh free route with real walking, a new shift and its reward, management of a new business, save/reload, and desktop/mobile map/door controls.
