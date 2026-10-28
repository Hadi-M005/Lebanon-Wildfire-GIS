# Methodology

Lebanon Wildfire Risk & Response Planning: an exploratory susceptibility and response-planning explorer.

This project documents a GIS analysis and an interactive web map. It is **not** an operational fire prediction or emergency dispatch system, and no layer here is a validated wildfire prediction. See `limitations.md`.

## 1. Questions

1. Where have satellite-observed fire detections occurred in Lebanon (2015 to 2025)?
2. Which terrain and land-cover characteristics are associated with those detections?
3. Which settlements, roads and other mapped assets lie near areas of interest?
4. How can users explore the results and understand their limits?

## 2. Data

| Dataset | Source | Version / details | Use |
|---|---|---|---|
| Fire detections | NASA FIRMS archive, Suomi NPP VIIRS C2 (375 m), request 828467 | Lebanon, 2015-10-01 to 2025-10-01, buffer 0 | Primary fire dataset |
| Fire detections (comparison only) | NASA FIRMS NOAA-20 VIIRS C2 (request 828466), MODIS C6.1 (request 828465) | Same request settings | Audited, not used in the analysis |
| Land cover | ESA WorldCover 2021 v200, tiles N33E033 and N33E036 | 10 m, CC BY 4.0 | Fuel and land-cover analysis |
| Elevation | Copernicus DEM GLO-30, four 1-degree tiles (N33/N34, E035/E036) | 30 m surface model | Elevation, slope, hillshade |
| Roads, buildings, places | OpenStreetMap via Geofabrik (Lebanon extract) | ODbL | Distance to buildings, response-planning context |
| Boundaries | geoBoundaries (gbOpen) ADM0, ADM1 (9, boundary year 2017), ADM2 (26, boundary year 2021) | Public Domain per each layer's metadata | Clipping, summaries |

The HDX COD-AB boundaries were also evaluated. geoBoundaries was chosen because of its clear licence (Public Domain, per its metadata) and better coverage of the fire points. Its ADM1 layer has 9 governorates because Keserwan-Jbeil is separate from Mont-Liban, whereas the HDX layer has 8.

## 3. Fire data preparation

1. Suomi NPP VIIRS was chosen as the primary sensor: longest consistent record, one sensor, no mixed-sensor effects.
2. Raw file: 7,021 detections, 15 fields, no missing values, no exact duplicates.
3. Filtered to `type = 0` (presumed vegetation fire): 6,348 detections. Types 2 (static land sources, 620) and 3 (offshore, 53) were excluded.
4. Clipped to the Lebanon boundary (geoBoundaries ADM0): **6,264 detections**.
5. Added a `period` field: `before_oct2023` (4,480) and `oct2023_onward` (1,784). The later period shows a marked shift of detections toward southern Lebanon. It is kept in the data, filterable in the app, and analysed with and without.
6. 2015 (October to December) and 2025 (January to September) are partial years.

Detection counts are counts of satellite hotspots. They are not counts of distinct fires.

## 4. Terrain and land cover

- DEM tiles were mosaicked, reprojected to EPSG:32636 (UTM 36N) with bilinear resampling at 30 m, and clipped to Lebanon. Slope (degrees) and hillshade were derived from the reprojected DEM before clipping.
- WorldCover tiles were mosaicked and clipped to Lebanon. The area of each class was computed with latitude-corrected pixel areas.
- Each detection was assigned its elevation, slope and land-cover class. Because a VIIRS pixel is about 375 m wide, land cover was taken as the **dominant class within 190 m** of the detection, not the single 10 m pixel.

## 5. Exploratory analysis

To tell whether a factor is over-represented, detections were compared with a baseline of the whole country, using the same method:

- **Elevation and slope:** share of detections in each band versus share of Lebanon's area in that band.
- **Land cover:** share of detections in each class (dominant class within 190 m) versus 9,000 random points across Lebanon classified the same way.

Main results (ratio of detection share to area share; 1 means proportional):

- Slope: ratios between about 0.9 and 1.1 in all bands. No relationship.
- Elevation: about 2.5 below 200 m, about 2.0 at 200 to 500 m, about 0.5 at 1,100 to 1,500 m and about 0.1 above 1,500 m.
- Land cover: built-up 1.87, shrubland 1.40, tree cover 1.09, cropland 0.99, grassland 0.87, bare/sparse 0.13.
- Seasonality: June to October. Peak years among full years: 2024, then 2021.

Detections from one fire are not independent, so ratios and any ranges around them are descriptive only.

## 6. Layer A: Historical detection likelihood (data-driven)

- **Grid:** 100 m, EPSG:32636, about 10,225 km².
- **Factors tested:** elevation (9 bands), slope (6), land cover (dominant class per cell), distance to the nearest OSM building (7 bands, from building centroids), distance to the nearest OSM place.
- **Weights:** frequency ratios (share of detections in a band divided by share of area), shrunk slightly toward the area share (prior of 5 detections), calibrated on 2016 to 2021 detections only (3,481).
- **Score:** sum of the natural logs of the weights, split into five equal-area classes (quintiles).
- **Validation:** held-out detections, January 2022 to September 2023 (920), and October 2023 onward (1,784), scored with AUC.

| Factors | Calibration | Held-out | Oct 2023 onward |
|---|---|---|---|
| Slope only | 0.51 | 0.54 | 0.49 |
| Land cover only | 0.55 | 0.60 | 0.56 |
| Elevation only | 0.72 | 0.73 | 0.71 |
| **Elevation + distance to buildings (used)** | 0.73 | 0.74 | 0.72 |
| Elevation + land cover + slope | 0.71 | 0.73 | 0.70 |

Slope and land cover were left out because they did not improve held-out performance. In the held-out years, the top class (20% of the area) held 47% of detections.

**Interpretation:** the layer shows where detections have historically been more frequent. This is driven by low elevation and nearness to buildings, so it reflects human presence as much as vegetation.

## 7. Layer B: Fuel and terrain susceptibility (expert-scored, exploratory)

- **Fuel score by land cover (0 to 5):** shrubland 5, grassland 4, tree cover 4, cropland 2, bare/sparse 1, built-up, water and wetland 0.
- **Slope score:** 0 to 5 degrees = 1, 5 to 10 = 2, 10 to 20 = 3, 20 to 30 = 4, above 30 = 5.
- **Combination:** 60% fuel and 40% slope on the 100 m grid. Cells with fuel score 0 are classed Very low. Fixed thresholds at 1.5, 2.5, 3.5 and 4.3 give five classes.
- **The scores are assumptions based on general fire-behaviour reasoning and were not fitted to the detections.**
- **Agreement with detections:** AUC about 0.50 (calibration years), 0.47 (held-out), 0.50 (October 2023 onward), so no better than chance.
- **Sensitivity:** changing the weights to 70/30 changes the class of 3% of cells, but 50/50 changes 51%. Shifting all fuel scores by one point changes 32% to 72% of cells, and the "Very high" area ranges between 40 and 1,955 km². The ranking is more stable than the class areas.

**Interpretation:** a plausible fuel and terrain map, but detections do not follow fuel and terrain in Lebanon. Layer B was deliberately not tuned to the detections.

## 8. Comparison of Layers A and B

The two layers fall in the same class on 19% of the area (within one class on 53%). The correlation between their scores is -0.15. They answer different questions and are presented as separate layers.

## 9. Administrative summaries

Detections, density (per 100 km² per year) and class areas of both layers were calculated per governorate (ADM1) and district (ADM2). The "before" period is 8 years and the October 2023 onward period is 2 years. Small units (Beirut, Tripoli) show extreme densities because of their small area.

## 10. Web-application data

- `fire_points.geojson`: 6,264 detections with attributes for filtering and pop-ups.
- `layerA_likelihood_classes.geojson`, `layerB_fuel_terrain_classes.geojson`: generalized polygons (3x3 median filter, 60 m simplification). Layer B's rarest classes lose area in this version (about -26% and -31%), so area statistics come from the rasters.
- `admin_governorates.geojson`, `admin_districts.geojson`, `admin_summary.json`, `dashboard_stats.json`: statistics computed from the data, not hard-coded.

## 11. Tools

QGIS (data preparation, raster processing, visual checks) and Python (rasterio, geopandas, scipy, pandas) for the weights, validation and exports. The ArcGIS Maps SDK for JavaScript is used for the web application.

## 12. Reproducibility

The Python scripts for sections 4 to 10 are to be added to an `analysis/` folder. QGIS steps are recorded in `data/metadata/dataset-inventory.md`.
