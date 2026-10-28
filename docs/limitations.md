# Limitations

This project is exploratory. Please read these limits before using any result.

## What the project is not

- It is not an operational fire prediction, early-warning or emergency-dispatch system.
- No layer here is a validated wildfire prediction. There is no independent ground-truth data, such as official incident records or burned-area perimeters, against which the layers were validated.

## Fire detection data

- **Hotspots are not fires.** A VIIRS detection marks a roughly 375 m pixel that was hot at the satellite's overpass. One fire can produce many detections, and not every fire is detected. Counts must not be read as the number of wildfires.
- **Detection location is approximate.** The point stands for a 375 m pixel, so the true fire may be in a neighbouring cell. For this reason land cover is taken as the dominant class within 190 m.
- **Not all detections are vegetation fires.** Static sources (industrial heat) and offshore detections were removed using the FIRMS `type` field, but waste burning, agricultural burning and other non-wildland sources remain. Built-up land is over-represented among detections (about 1.9 times its share of the area).
- **Partial years.** 2015 (October to December) and 2025 (January to September) are incomplete, so yearly comparisons should use 2016 to 2024.
- **October 2023 onward.** Detections shift markedly toward southern Lebanon from October 2023 and peak in 2024. The timing coincides with the escalation of conflict in the south. The satellite data cannot show what caused any individual hotspot, and some of these detections may not be vegetation fires. The data is kept and can be filtered in the app, and the analysis was run with and without this period.
- **Not for operational use.** NASA advises against using these data for tactical decision-making or for conditions at a local scale. This project is exploratory and must not be used for operational or emergency decisions.
- **Sensor choice.** The analysis uses Suomi NPP VIIRS only. NOAA-20 and MODIS were audited and not combined, to avoid mixed-sensor coverage changes and double counting.

## Layer A: Historical detection likelihood

- It reflects where detections have occurred, which is driven mostly by low elevation and nearness to buildings. That is human presence as much as vegetation, so it should not be read as "where wildfires will start".
- Held-out accuracy is moderate (AUC about 0.74 for January 2022 to September 2023, about 0.72 from October 2023 onward).
- Detections from one fire are not independent, so statistical ranges around the ratios understate uncertainty.
- Building footprints come from OpenStreetMap, whose completeness varies across the country. Distance to buildings may partly reflect mapping effort.
- The layer is tied to the 2015 to 2025 period. It does not model weather, drought, vegetation moisture, wind or fuel connectivity.

## Layer B: Fuel and terrain susceptibility

- The scores and weights are assumptions based on general fire-behaviour reasoning. They were not derived from, and are not supported by, the detection data (AUC about 0.47 to 0.50, no better than chance).
- The class areas are very sensitive to the assumptions: shifting the fuel scores by one point changes the class of 32% to 72% of cells. Only the relative ranking is somewhat stable.
- WorldCover does not distinguish forest types (for example pine from broadleaf), tree density or fuel moisture. Irrigated and rain-fed cropland are not separated.
- The Copernicus DEM is a surface model that includes vegetation and buildings, so slope in forests and urban areas is not bare-ground slope.
- It does not include weather, climate, aspect, vegetation moisture or human ignition.

## Both layers

- The two layers disagree on most of the area (same class on 19%, correlation about -0.15). Detections follow human presence and elevation, not fuel or slope. This is a finding about the data, and neither layer should be presented as "risk".
- The analysis grid is 100 m. The data underneath ranges from 10 m (land cover) to 375 m (fire detections).
- The polygon versions used by the web app are generalized. Layer B's rarest classes lose area (about -26% and -31%). Use the rasters or the class-summary tables for areas.

## Boundaries and summaries

- The geoBoundaries layers are digitized from map images (ADM1 from a Wikimedia Commons image, boundary year 2017; ADM2 from Wikipedia and Wikimedia Commons, boundary year 2021), so their positional accuracy is limited, especially along the coast and borders. The two layers also have different vintages and do not match exactly.
- The geoBoundaries ADM1 layer has 9 governorates (Keserwan-Jbeil is separate from Mont-Liban). Other sources show 8. Summaries by governorate depend on this choice.
- District areas sum to about 10,249 km² and governorate areas to about 10,186 km², because the layers do not match exactly. 79 detections fell in thin gaps between district polygons and were matched to the nearest district.
- Density figures for very small units (Beirut, Tripoli) are driven by a handful of detections and are not directly comparable with large units.

## Data and licensing

- OpenStreetMap data is under the ODbL and requires attribution. Derived products may carry share-alike conditions. Check before redistributing derived layers.
- Esri and data-provider attribution must remain visible in the application. See `LICENSES-AND-SOURCES.md`.

## Possible future work

- Validate against independent data (burned-area products, official fire incident records).
- Add weather and drought indicators, aspect, and vegetation-type detail.
- Group detections into approximate fire events (by time and distance) so that counts are closer to numbers of fires.
- Test other sensors and longer records.
