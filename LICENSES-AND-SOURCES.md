# Licenses and Sources

Last updated: 2026-10-27. Information was taken from the providers' own pages and metadata files. Check each page again just before publishing, because terms and wording can change. This file is a working checklist, not legal advice.

Items in `<<double angle brackets>>` still need to be filled in (see "Open items" at the end).

## 1. Summary

| Dataset | Provider | License | Credit and notices |
|---|---|---|---|
| Fire detections (VIIRS Suomi NPP C2, NOAA-20 C2, MODIS C6.1) | NASA FIRMS (LANCE, ESDIS) | NASA full and open data sharing. Acknowledgement requested. Replicate or link the disclaimer when passing data to a third party. | Section 2.1 |
| Land cover | ESA WorldCover 2021 v200 (VITO / ESA) | CC BY 4.0 | Section 2.2 |
| Elevation | Copernicus DEM GLO-30 | Copernicus WorldDEM-30 licence (free, with notice) | Section 2.3 |
| Roads, buildings, places | OpenStreetMap contributors, via Geofabrik | ODbL 1.0 | Section 2.4 |
| Administrative boundaries | geoBoundaries (gbOpen), Lebanon ADM1 and ADM2 | Public Domain, per each layer's metadata | Section 2.5 |
| Boundaries evaluated, not used | HDX COD-AB (Lebanon) | Not used | None |
| Basemap and SDK | Esri, ArcGIS Maps SDK for JavaScript, ArcGIS Location Platform API key | Esri terms | Section 2.6 |

## 2. Required notices

### 2.1 NASA FIRMS

Acknowledgement (copied from the FIRMS page, https://www.earthdata.nasa.gov/data/tools/firms):

> We acknowledge the use of data and/or imagery from NASA's Fire Information for Resource Management System (FIRMS) (https://earthdata.nasa.gov/firms), part of NASA's Land, Atmosphere Near real-time Capability for Earth observations (LANCE) (https://earthdata.nasa.gov/lance) and NASA's Earth Science Data and Information System (ESDIS).

Disclaimer (copied from the LANCE disclaimer page, https://www.earthdata.nasa.gov/data/projects/lance/disclaimer):

> LANCE is operated by the ESDIS Project. The information presented through LANCE, GIBS, Worldview, and FIRMS are provided “as is” and users bear all responsibility and liability for their use of data, and for any loss of business or profits, or for any indirect, incidental or consequential damages arising out of any use of, or inability to use, the data, even if NASA or ESDIS were previously advised of the possibility of such damages, or for any other claim by you or any other person.
>
> Due to the spatial resolution and other characteristics of these data, their use for tactical decision-making or informing about conditions at a local scale are not advised.
>
> ESDIS makes no representations or warranties of any kind, express or implied, including implied warranties of fitness for a particular purpose or merchantability, or with respect to the accuracy of or the absence or the presence or defects or errors in data, databases of other information.
>
> The designations employed in the data do not imply the expression of any opinion whatsoever on the part of ESDIS concerning the legal or development status of any country, territory, city or area or of its authorities, or concerning the delimitation of its frontiers or boundaries. For more information please contact Earthdata Support.

Data used: Suomi NPP VIIRS C2 archive download, request 828467, Lebanon, 2015-10-01 to 2025-10-01 (comparison files: NOAA-20 VIIRS request 828466, MODIS C6.1 request 828465).

### 2.2 ESA WorldCover 2021 v200

- License: Creative Commons Attribution 4.0 International (CC BY 4.0) © ESA WorldCover project 2021 / Contains modified Copernicus Sentinel data (2021) processed by ESA WorldCover consortium. Page: https://esa-worldcover.org/en/data-access
- Credit line for any published map layer: © ESA WorldCover project 2021 / Contains modified Copernicus Sentinel data (2021) processed by ESA WorldCover consortium
- Citation:
  Zanaga, D., Van De Kerchove, R., Daems, D., De Keersmaecker, W., Brockmann, C., Kirches, G., Wevers, J., Cartus, O., Santoro, M., Fritz, S., Lesiv, M., Herold, M., Tsendbazar, N.E., Xu, P., Ramoino, F., Arino, O., 2022. ESA WorldCover 10 m 2021 v200. https://doi.org/10.5281/zenodo.7254221
- Access note: ESA WorldCover was accessed on `<<DATE you downloaded the tiles>>` from https://registry.opendata.aws/esa-worldcover-vito
- Tiles used: N33E033 and N33E036 (Map layer).

### 2.3 Copernicus DEM GLO-30

Notice, as provided with the licence (the data was reprojected, resampled and used to derive slope, so it counts as modified):

> produced using Copernicus WorldDEM-30 © DLR e.V. 2010-2014 and © Airbus Defence and Space GmbH 2014-2018 provided under COPERNICUS by the European Union and ESA; all rights reserved

Licence document: https://documentation.dataspace.copernicus.eu/APIs/SentinelHub/Data/DEM/resources/license/License-COPDEM-30.pdf

Tiles used (30 m): N33E035, N33E036, N34E035, N34E036, from the public AWS copy (copernicus-dem-30m). The DEM is a surface model, so it includes vegetation and buildings.

### 2.4 OpenStreetMap

- Credit (visible in the app, near the map): `© OpenStreetMap contributors`, linked to https://www.openstreetmap.org/copyright
- License: Open Database License (ODbL) 1.0.
- Source file: Lebanon extract from Geofabrik, downloaded `<<DATE>>`.
- Use in this project: distance to the nearest building footprint (Layer A).
- Share-alike: if OSM data or a derivative database is made available to others, it must stay under the ODbL. The class polygons of Layer A are a model output (a produced work), and no raw OSM extract is published. If the web app publishes simplified OSM roads or buildings as a downloadable file, that file would need ODbL terms and attribution. This is decided in Milestone 3.

### 2.5 geoBoundaries

- Layers used: ADM0 (clipping only), ADM1 (9 governorates) and ADM2 (26 districts).
- ADM1 (boundary year 2017): source "geoBoundaries, Wikimedia Commons", licence Public Domain. The source is a map image, so positional accuracy is limited.
- ADM2 (boundary year 2021): source "geoBoundaries, Wikipedia", licence Public Domain. Credit is also given to Wikimedia Commons user Rarelibra, as requested in the metadata.
- Both layers were built on Dec 12, 2023 (metadata files `geoBoundaries-LBN-ADM1-metaData.json` and `geoBoundaries-LBN-ADM2-metaData.json`).
- Credit (on the web, with a link): `Administrative boundaries: geoBoundaries (www.geoboundaries.org). ADM2 also credits Wikimedia Commons user Rarelibra.`
- Citation: Runfola, D. et al. (2020). geoBoundaries: A global database of political administrative boundaries. PLoS ONE 15(4): e0231866. https://doi.org/10.1371/journal.pone.0231866
- The metadata for ADM0 has not been checked yet (see Open items).

### 2.6 Esri

- Esri and data-provider attribution must remain visible in the application. Do not hide the attribution widget.
- The ArcGIS Location Platform API key must be restricted to the services the app needs. Never commit the key to a public repository without restrictions.

### 2.7 Notices specific to this project

- NASA advises against using these data for tactical decision-making or for conditions at a local scale. This project is exploratory and must not be used for operational or emergency decisions.
- Fire detections are satellite hotspots, not confirmed wildfires.
- Boundaries and place names are used for analysis and display only. They do not express any opinion on the legal status of any territory, area or frontier.

## 3. Derived products in this repository

| Product | Built from | Credits that apply |
|---|---|---|
| Layer A: Historical detection likelihood | Copernicus DEM, OSM building footprints, NASA FIRMS | 2.1, 2.3, 2.4 |
| Layer B: Fuel and terrain susceptibility | ESA WorldCover, Copernicus DEM | 2.2, 2.3 |
| Fire points with attributes | NASA FIRMS, Copernicus DEM, WorldCover, Layers A and B | 2.1, 2.2, 2.3, 2.4 |
| Administrative summaries and boundary GeoJSON | geoBoundaries, FIRMS, Layers A and B | 2.1, 2.5 and those of A and B |
| Slope, hillshade, clipped DEM | Copernicus DEM | 2.3 |

## 4. Data redistribution

- `data/raw/` stays local if files are large or redistribution is restricted.
- Only data that is publicly hosted, appropriately licensed, or packaged for the application is referenced by the web app.

## 5. Open items

1. WorldCover credit line (section 2.2): paste the line from the official page.
2. Dates: WorldCover access date and OSM download date.
3. Copernicus DEM: read the licence PDF once for any further wording required when the data is shown or redistributed, and add it to section 2.3 if there is any.
4. geoBoundaries ADM0: open `geoBoundaries-LBN-ADM0-metaData.json`, check the licence and source, and add them to section 2.5.
5. OSM: decide in Milestone 3 whether the app shows OSM roads as a published layer (ODbL terms) or relies on the basemap.
6. Before publishing: confirm that redistributing each derived file in the repository is allowed under the source terms.
