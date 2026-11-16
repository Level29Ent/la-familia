# City depth and polish

## A guided opening, not an endless first-dollar grind

The HUD and the atlas's **Goals & settings** tab offer the First Fifteen Minutes chapter. It is a suggested opening sequence, not a timed deadline. Goals reward actual actions, in order and once only: earn income ($25), finish a city activity ($150), hire a named associate ($100), buy the first safe house ($150), contest a district ($100). Travel buttons identify where to go; goals can be hidden/restored. Existing empire objectives remain in the Ledger.

Balance reproduction: run the free Street Hustle once, claim the first goal, deliver one parcel and claim the activity goal, hire Joey for $60, then claim the hire goal. Optional personal tasks are not required to fund the house. This funds the $250 abandoned home without hundreds of repetitive runs. Goals are optional and old empires can claim eligible steps in order.

## Five actual activities

Activities are additional to owning/running businesses. Entry and core business income never close.

| Activity | Start / finish | Interaction | Cost / payout | Side-job hours |
|---|---|---|---|---|
| Parcel delivery | Orchard Grocers / Midnight Diner | Pick up, prepare 20s, visit destination and complete | $0 / $45 | 06–22 |
| Taxi fare | Yellow Cab Depot / Bellini Hotel | Selected owned Yellow Cab; drive at least 30 world meters, prepare 30s, visit hotel and complete | $0 / $120 | Always |
| Tune-up | Eastside Motor Works | Prepare 25s; inspect engine, fit part, test engine | $10 / $80 | 07–21 |
| Rent round | Rosa Apartments / Grand Central Apartments | Collect ledger, prepare 20s, visit second building and complete | $0 / $65 | 08–20 |
| Evening show | Blue Note Jazz Club | Prepare 25s; arrange set list, check stage, open show | $15 / $100 | 18–06 |

Only one activity can be active. Completion checks destination, preparation, taxi ownership/distance and work steps. A 10-second cooldown prevents duplicate/repeated payouts. Cancelling does not refund material costs. Active jobs, steps, timers and taxi distance persist across reload; offline absence does not finish them. Other delivery/rent travel may use the atlas; taxi distance requires actual driving. Quality controls do not change job rewards.

## Territory and rental investment

The atlas has a **Territory** tab and colored map overlays. Every district starts rival-controlled. Contesting costs $35, 15 stamina and adds 10 heat. Disclosed strength decides the result; a win adds 25 influence. Bellini control begins at 75; 1–74 is contested. Controlled districts pay $40 per active minute each. World banners change with ownership.

Rivals reclaim 15 influence every two active minutes. Every available named guard prevents 5 loss; active truces stop the corresponding family's takebacks. Territory pressure never deletes business ownership or saves. Family affiliation maps Moretti/Volkov/Doyle across the five districts. Existing direct hit/retaliation systems remain alongside this contest loop.

Any ordinary residence can be bought as a rental ($300 plus $150 per directory index), earning $25 per active minute. Rental ownership is separate from the safe house and does not block visits or create new free furnishings. Rent/protection payout timers and ownership save. They do not generate extra offline payouts.

## People, loyalty and promotions

Named contacts offer respectful, work-related or threatening dialogue. Respect increases loyalty; threats reduce it. A 30-second conversation cooldown prevents spamming. Asking about personal work accepts a simple task: finish a city activity after accepting the task, then return to claim $50, 15 loyalty and 50 member XP once for that person. Ordinary activities give known contacts 10 member XP.

Hired, available members can be promoted to Made Man (60 loyalty, 50 member XP, $150) then Capo (60 loyalty, 150 member XP, $600). Promotions improve guard/mission/territory strength and street labels. Loyalty above 50 adds a small mission-power bonus. Member promotions do not replace the player's existing family rank system. Away or recovering members cannot be promoted. Relationships and completion flags save and reset on retirement.

## Clock, schedules, feedback and visuals

An active-play city day lasts 24 real minutes, starting at 08:00 (one real second per city minute). Day/night lighting blends sky, fog and key lights. Nights show fewer ambient pedestrians, more traffic/patrol activity and more lit windows. Named hires and core services remain available; side-job schedules are disclosed. Homes/safe houses can wait to 06:00 or 18:00: **this changes only the clock**, not rents, missions or cooldowns. Custody pauses the new active-play simulation.

The HUD shows clock and active-work progress, optional goals and notifications. Jobs, rewards, conversations, promotions, captures/takebacks and rent payments appear in the activity journal; mission/law/rank events also surface as short notifications. Income event notices are deliberate rather than a toast on every business tick.

Interiors add different visual identities: apartment mail lobbies, home art, bakery/diner counters, gaming tables, tailor rails, cinema posters and filing offices. Existing themed Eastside interiors remain. The central walkable route and collision layout remain clear. Crowd limb animation eases between poses; third-person camera tracking is smoothed and driving changes have a short visual transition. This does not add motion-captured interaction cinematics or physics traffic AI.

**Graphics quality** in Goals & settings switches Balanced / Low. Low reduces city rendering resolution and ambient crowd/traffic counts; it does not reduce game rewards or alter saves. Device-specific frame rates and live Safari/phone testing remain separate from desktop software-rendered local browser checks.

## Save compatibility and tests

Old saves receive new PlayState defaults without changing cash, businesses, home, fleet, vault, crew or character. Validate and deduplicate saved contacts/rentals, clamp invalid timers/control, drop unknown jobs/IDs and retain in-flight jobs. Retirement resets city activities, rentals, goals, contacts and territory with the next empire; purchased safe house inheritance is unchanged.

`pnpm check` covers sequence/reward guards, every activity's requirements, workshop stages, taxi movement checks, schedules, territory capture/takeback/guard/truce, rent, conversations/loyalty/promotion/task guards, migration/sanitization/round trip, jail pauses, waiting and the first-home funding path. Build both root and Pages paths including literal configure-pages rewriting. Browser tests should exercise the guided opening, actual pickup/destination work, promotions, territory and rental UI, clock/night transition, mobile map menus, quality settings, saved jobs and current missions. Local WebKit is not equivalent to Safari on real iOS/macOS hardware.
