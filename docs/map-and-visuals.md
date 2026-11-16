# Map menu and visual pass

## Finding your position

- Use **Tab**, **G**, the **Open city map menu** minimap button, or the indoor **Map menu** button.
- **Map**, **Family & law**, and **Garage** are separate menu tabs. A named-NPC encounter opens Family & law and highlights their hire/order card. Tab navigates controls normally while the menu is open; Escape closes it.
- The street minimap updates position and heading from the walking/driving controller. The full map shows your district, nearest address and world X/Z coordinates. Indoors it identifies the current building and displays its exterior entrance position.
- Search names/districts and filter businesses, homes, rival clubs or the safe house. Click a building or use Track to select a destination. Distance and a dashed bearing appear on the full map and minimap. This is a straight-line bearing, **not pathfinding** through buildings.
- Travel moves to the entrance and safely leaves any open interior. Clearing a destination removes its bearing. Tracking lasts for the current play session; it is not new save data.

## People

Ambient pedestrians, recruitable named NPCs and rival patrols now share an articulated human crowd model: tapered torso and limbs, shoes and hands, neck/jaw/cheeks/ears, eyes/irises/pupils/brows, nose/lips, varied hair and clothing, and walking arm/leg motion. Full player/customizer and interior characters retain the detailed parametric character model with added facial shaping.

A deterministic appearance palette spans all six existing skin tones, varied hair colors/styles, face/jaw/nose proportions, heights/builds, clothing and men/women. Appearance does not affect allegiance, job, hire price, combat power or income. The art represents a varied population without assigning racial labels or stereotypes. The models remain procedural stylized humans, not scanned or photorealistic people. Named hires have forgiving click targets. Drag-to-look no longer automatically locks/recenters the cursor before NPC clicks. Crowd models use a 65-world-unit draw distance to limit rendering cost; detailed player settings and old saves remain unchanged.

## Environment

- Buildings: locally generated brick/grain maps, doorway reveals and handles, numbered plaques, side windows, framing and roof cornices. Existing entrances/collision remain unchanged.
- Interiors: procedural wood/tile floor grain, paneling/baseboards, inset windows, hanging fixtures and plants, retaining themed business fittings and clear central paths.
- Vehicles: side glazing, chrome strips and bumpers, handles/mirrors, wheel hubs, grilles, rear lights, plates, running boards and exhaust. The five existing vehicle silhouettes and handling are unchanged.

Surface textures are deterministic local DataTextures, not remote image loads. No dependencies, external models, network resources, gameplay balance or save-schema changes were added.

## Verification

Unit checks cover map bounds/nearest address/search/filter counts and stable valid NPC palettes. Existing tests cover city paths, missions/law, housing, vehicles and saves. Build root and Pages (including literal configure-pages rewriting). Browser checks should verify live minimap movement/heading, search/filter/track/clear/travel, indoor labels and travel, keyboard focus, family/garage tabs, NPC hiring clicks, character editing, representative interiors and driving, plus narrow-screen controls. Local Chromium validation does not establish live Safari performance or photorealistic quality.
