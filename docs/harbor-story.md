# Trouble at the Harbor

Open **Harbor story** from the persistent objective card or the City atlas. Five two-stop missions use existing, enterable buildings. Travel goes to the entrance: enter, reopen Harbor story, and interact. Each action checks chapter, step, location, crew availability and custody. Rewards are one-time; stale double-clicks cannot advance the next step.

1. Orchard Grocers → Midnight Diner, $150.
2. Eastside Motor Works → Riverside Warehouse, $350. Hire an associate first (Joey costs $60). Choose support before inspecting the truck: collectors add $75, guards remove 15 heat, hitmen add 75 family XP. Support is not an exclusive assignment: existing duties continue, but away/recovering associates cannot help at either stop.
3. Warehouse → Bellini Hotel, $500. Load first, then walk 90m **or** drive 60m in an owned selected vehicle. Map travel, interior travel, offline time and waiting do not add meters. Walking is always available; no vehicle purchase is required.
4. Blue Note Jazz Club → Doyle Social Club, $250. Back workers for +15 loyalty to known contacts, or demand a cut for $200 immediately, −10 loyalty and +15 heat. Backing workers grants 50 Harbor influence in an alliance rather than 25.
5. Doyle Social Club → Warehouse, $1,000. Choose an alliance or takeover, then open the operation at the warehouse. Alliance permanently prevents Doyle raids, Harbor takebacks, and player attacks against Doyle for the current empire. Takeover grants 100 Harbor control, removes Doyle's current influence and adds 20 heat; normal recovery and retaliation remain enabled.

No real-time combat, cinematics, multiplayer or console-quality asset pipeline is added. This remains a lightweight procedural browser game.

## Family council and street life

Promote a named hire to Capo using the existing Family & law controls. An available capo can sponsor one $300 district investment; each district and capo may be used once per empire. This grants 25 influence and reduces rival takebacks by five influence. Controlled or invested neighborhoods display market stalls, a vendor and a customer. These are ambient visual displays, not additional businesses or collision obstacles.

Citizens pause along their sidewalk routes and move faster at high heat. Ambient cars obey a shared 24-second traffic-light cycle and stop before intersections; delta-clamped movement prevents resuming a paused game from teleporting cars through the scene. Traffic is scenery, not a physics vehicle or chase AI. Night alone no longer switches police to high-heat behavior. Low graphics continues to reduce ambient population.

The objective has a gold world marker at the destination entrance. The compact objective card remains available inside buildings and at phone widths. The city atlas is scrollable, keyboard-dismissable and uses native selects/buttons.

## Persistence and verification

Old saves initialize a new campaign without changing money or property. Chapter, step, support, travel meters, decisions, council sponsorship and journal persist with the existing local save. Story time does not progress offline. Retirement resets the campaign and investments with the next empire; inherited home/vault behavior is unchanged.

`node --test tests/harbor.test.cjs` covers order/location/stale action guards, free opening and early hiring affordability, all crew bonuses, custody, real travel requirements, both endings on foot/in a car, worker decisions, permanent alliance constraints, council eligibility/payment/takeback effects, migration and traffic signal behavior. `pnpm check` runs the full suite. Build root and Pages base paths. Browser checks should cover starting the game, opening Harbor story, visiting/entering the first two stops, collecting the first reward, opening council and narrow-screen controls. Full campaign browser playthrough and live mobile/Safari performance remain separate checks unless explicitly recorded in the PR.
