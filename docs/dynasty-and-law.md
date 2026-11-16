# Family dynasty, residence and city life

## Rank and crew

Players begin as **Street Associate**, automatically advancing through **Made Man (100 XP), Capo (300), Underboss (800), Don (1,800), Godfather (4,000)**. Rank score is mission/hire/property XP plus twice the square root of lifetime earnings. The atlas and HUD show rank and the next threshold.

Eight named, clickable NPCs occupy marked sidewalk locations, each with a distinct name, role, hire cost and power. Clicking one opens its highlighted directory card; the same directory can be used from G / City map. A hire is paid once. Assign hired members to collect, guard or stand by. Collectors generate income every 30 active seconds; guards add defense. Roles have different power/payouts. Away/injured members cannot be reassigned or sent twice.

Hit missions are fictional, abstract strategy actions, not real-time combat: Made Man rank, $40 cost, 30-second duration, disclosed attacking/defending power. A win gives $100, 80 XP and reduces the target family's influence by 30. Failure gives 10 XP and 60 seconds of operative recovery. Winning operatives recover for 15 seconds. In-flight mission outcomes are locked at dispatch and survive reload. Active truces, zero enemy influence, heat at 80+, unowned members and custody block new hits.

Sending a hit or challenging a family makes it hostile. Hostile families rotate retaliation every 90 active seconds (unless under truce or at zero influence). Guard power plus property security can stop an attack; otherwise a disclosed wallet loss is capped at the available balance. A successful raid also reduces business income by 20% for 30 seconds; the operations panel shows the remaining disruption. Vault funds and existing properties are never confiscated. Retaliation appears in the city journal.

## Home progression

New games do not receive a free safe house. They can tour the abandoned property, but vault/decor controls unlock only after purchase. The existing starting Street Hustle remains free so players can earn their first $250.

1. Abandoned Trap House — $250, security 1, boarded exterior and worn interior.
2. Renovated Row House — $5,000, security 3, restored facade and materials.
3. Family Brownstone — $75,000, security 7, framed decor and upgraded finishes.
4. Don's Mansion — $650,000, security 12, columns, balcony details and marble-like flooring.
5. Godfather Estate — $3,500,000, security 20, pale stone/gold finishes and chandelier details.

Upgrade prices are sequential purchases, not a cumulative displayed property valuation. All levels use the existing clear navigable floor plan. Vault-capacity upgrades are separate, and existing deposits and decorations are retained. Legacy saves with a safe house but no dynasty state keep it as a Family Brownstone; genuinely fresh saves start unowned. Retirement preserves the purchased residence and vault, but resets members, rank mission-XP, heat and hostilities (lifetime earnings still contribute rank score).

## Law

Manual racket collection adds 2 heat, direct rival confrontations add 20, hit dispatch adds 30. Heat fades slowly outdoors and ten times faster inside. At 60+ heat, 30 exposed seconds lead to a fine (up to $150 from wallet) and 30 seconds of custody. A full-screen custody notice pauses movement, new orders and active earnings/missions until release. Wait for free release or pay $200 bail if affordable. A $100 lawyer reduces heat by 45. Shelter resets the arrest countdown; it does not erase missions or existing hostile families. The police patrol vehicle is a visual indicator; arrest uses the disclosed heat/exposure timer, not hidden proximity rules.

## City and visual life

Garden Heights adds 12 enterable homes and apartment complexes, bringing the city to **15 blocks, 60 enterable buildings, 30 residences, 26 businesses, three rival clubs and one safe house**. Original addresses stay fixed. Building collision protects walls while the connected streets, alleys and front entrances are walkable. The atlas remains an optional travel aid, not the only means of movement.

Twenty-four ambient pedestrians, six moving traffic displays (including police), named recruits, rival patrols, benches, hydrants, bins, traffic signals, facade coursing and apartment balconies add visual life. Ambient traffic loops are scenery, do not run over the player, and do not have traffic-light AI or vehicle theft. Buildings still have stylized shared interior themes, not unique photorealistic floors. The graphics remain lightweight procedural 3D for the browser.

All new timers are active-play simulation timers. Reload resumes persisted missions/cooldowns; offline absence does not simulate hits, police arrests or retaliation. The pre-existing offline business-income system is unchanged.

## Checks

`pnpm check`: ranks, sequential housing costs, old-save migration, invalid state sanitization, unique hires, duties and payouts, mission guards and exactly-once resolution, failures/recovery, rival retaliation/guard/truce behavior, law/fines/bail/release/shelter, new housing count and pedestrian positions. Existing tests cover all 60 connected entrances and vehicle/economy/vault behavior. Build root and Pages (including configure-pages literal rewriting) and check exported assets. Browser checks must cover fresh and legacy players, visible home tiers, mission settlement and retaliation, custody accessibility, housing entrances, recruitment and mobile controls. Safari remains a separate live-device check.
