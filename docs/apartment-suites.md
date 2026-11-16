# Apartment suites and landlord gameplay

Open **City atlas → Apartments** to browse individual deeds or filter your citywide portfolio. Eligible apartment, flats, rooms and tower buildings each offer three separate units: Courtyard studio (101), Family one-bedroom (202), and Skyline penthouse (303). The first studio costs $450; later addresses and larger units cost more. Buying a deed does not automatically create a tenant or an income stream. Existing residence-rental deeds and their income remain unchanged and separate from this new suite portfolio.

## Leasing and management

- Choose a Local professional (100% rent, 8 condition wear/payment), Neighborhood family (85%, 5 wear), or Visiting executive (160%, 12 wear; requires renovation level 1).
- Every lease lasts five **active-play minutes**, paying once per active minute. The final payment is paid before the lease expires if due at exactly the same instant. There is no income or timer progression offline or in custody. Open menus do not pause the existing game simulation.
- New leases require at least 60 condition and no repairs in progress. An occupied unit cannot be renovated or leased again. You cannot evict or stack leases; choose again when the current tenant leaves.
- Rent pauses below 30 condition or while repairs are running. Condition wear is charged only when rent is actually paid. Repair price is $20 plus $1.20 per missing condition point (rounded up). Repairs take 15 active seconds, restore 100 condition, and pause rent but **not** the lease clock. Partial rent progress resumes afterward; unpaid partial minutes are not refunded or paid out at expiry.
- Vacant suites have two renovation upgrades ($200 then $400), each adding 40% of base rent and restoring condition. Renovation is immediate and changes the visible furniture/finishes. Maximum level is Luxury.
- Once per lease, after condition falls to 85 or lower, a tenant requests window seals. **Visit tenant** opens that specific suite in 3D. Open **Manage suites & tenants**, then **Help tenant · $10** to restore 15 condition. This is an optional on-site alternative to a full repair, not an infinitely repeatable reward.
- Wallet spending, earned-rent totals, rent/lease/repair timers, condition, renovation, tenant choice and completed visits persist in the existing local browser save. Legacy saves gain an empty portfolio without losing cash, buildings, home, vehicles or Harbor progress. Retirement resets suites with the rest of the current empire; existing safe-house/vault inheritance is unchanged.

## Visuals and tours

Tour any listed suite before or after purchase. Tours use the building's existing connected entrance and walkable floor plan. The HUD identifies the selected unit. Leave through the normal exit or Esc; this returns to the same building entrance.

- Each suite type has its own upholstery palette, bed and lounge, rug, framed skyline view and curtains.
- Renovated suites add plants, artwork, shelving and books. Luxury adds a brass ceiling fixture, light bedding, upgraded headboard and pale counter finish.
- Occupied suites show a tenant at the rear counter and a tenant-in-residence label. Low condition adds worn floor patches; repairs show a maintenance notice.
- Owned apartment buildings gain a Bellini Suites plaque with the leased count, entrance planters, warm occupied windows and balconies for renovated units. Windows and balconies fit within the existing minimum building height; no new ground-level collision obstacle blocks the entrance.
- Portfolio cards include unit illustrations, occupancy badges, condition meters, tenant terms, per-unit collected income and a property event ledger. A citywide summary shows owned/occupied units and current full-minute rent before future wear/lease expiry.

These are procedural browser-game visuals, not photorealistic apartment assets or separate multi-floor physics interiors. Existing ambient pedestrians, markets, traffic and Harbor gameplay remain intact.

## Verification

`node --test tests/apartments.test.cjs` covers deed conservation/uniqueness, building/unit catalog, lease expiry and exact payouts, tenant eligibility/wear, renovation caps, repair costs/timers, suspended rent, once-per-lease on-site requests, frame-size-independent settlement, custody/offline behavior, migration/sanitization/round trips and retirement. `pnpm check` adds existing regression checks; build both root and literal configure-pages-rewritten `/la-familia` base paths and validate exported assets.

Deployed desktop/mobile gameplay must be verified on the PR head's READY preview. If the account restriction still prevents previews, report that explicitly; local tests and static exports do not prove live deployment or real-device rendering/performance.
