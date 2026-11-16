# The city and rival families

## Explore

The old single street is now a connected three-by-three block city. There are 36 enterable buildings: 18 businesses, 14 residences, three rival social clubs and the existing safe house. Exterior footprints block the player and sedan. Every entrance has a clear return point connected to the street grid.

- WASD/arrows: walk; Shift: sprint; drag to turn; scroll to zoom.
- **G / City map & families** opens the atlas, directory and rivalry board. Travel takes you to the selected entrance (not inside); walking between neighborhoods is unrestricted.
- **E** enters the building you face. A visible Enter button also works on touch devices. All properties may be visited before purchase; business actions still require ownership/cash.
- **R** collects from an owned business; **F** buys; **Q** hires its manager. Buttons remain available in the ledger and interior activity panel.
- Interiors have a walkable central aisle, furnishing collision, a proprietor/resident, and a visible exit. Walk to the exit and press E, press Esc, or use Exit building to return to the same entrance.
- Homes have living/sleeping furniture and free crew rest. Shops, bars, workshops and offices have different furniture arrangements. The safe house retains its vault, upgrades, decor and purchased displays.
- The four new income businesses are Midnight Diner, Canal Laundry, Pearl Pharmacy and Union Printing Works. The Bellini penthouse perk now marks the enterable Harbor View residence instead of adding a non-enterable tower.

## Rival families

Moretti, Volkov and Doyle have colored patrol crews and social clubs in Little Italy, Market Ward and Harbor Quarter. Click a patrol, visit a social club, or open the atlas to issue family orders. Patrols walk sidewalks; this is a strategic confrontation system, not real-time gun combat.

- Start with one associate. Recruiting costs `15 × crew size²`, capped at 50 associates.
- Your power is three per associate, two per hired business manager, plus the square root of Respect (rounded down).
- Opposing power is each family's base strength plus one per 15 influence. The UI discloses both powers and whether a challenge can win; there are no hidden dice.
- A challenge spends 25 stamina and has a 30-second regroup timer. Winning pays a fixed reward, reduces that family's influence by 20, and counts a victory. Losing consumes stamina but never takes wallet or vault funds. A family at zero influence cannot be farmed for repeat rewards.
- Every active minute, rivals recover five influence (up to 100); a paid two-minute truce blocks their recovery and challenges. Timers and stamina advance only while the game is running, not during offline earnings.
- Stamina regenerates by one per five seconds. Resting in a residence refills it.
- Rivalry and crew progression save alongside existing cash, property, avatar and vault data. Old saves initialize the new fields. Retirement resets city rivalry for the next empire; hard reset resets everything as before.

## Verification

`pnpm check` covers all 36 connected entrances, non-overlapping footprints, doorway focus after travel/exit, furniture/vehicle collision, patrol positions, old-save migration, recruiting costs, deterministic wins/losses, cooldown/double-reward guards, truces, AI influence recovery, stamina, and save round trips, in addition to the existing economy/vault/vehicle/avatar checks.

`pnpm build` runs those checks, builds the static site, and checks exported asset URLs. Also test the literal base-path rewriting performed by configure-pages before building; do not test only an environment variable.

Browser checks: walk to and enter a business, collect income inside, travel to a residence and rest, enter a rival club and recruit/challenge/negotiate, return to the correct entrance, and reload saved progress. Test city atlas/exit/interaction controls on a narrow viewport as well. Live Safari verification is separate from local Chromium tests.
