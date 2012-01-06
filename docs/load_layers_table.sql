INSERT INTO sr_layers ( id, name, type, isbaselayer, projection, visibility, sphericalmercator, url, numzoomlevels, datatable, attribution) VALUES (
1001,
'SitRep',
'XYZ',
true,
'EPSG:4326',
true,
true,
'https://wjoc-sr.nypd.finest/sr_tiles/${z}/${x}/${y}.png',
30,
'NONE',
''
);



INSERT INTO sr_layers ( id, name, type, format, isbaselayer, projection, visibility, sphericalmercator,url, numzoomlevels, minzoomlevel, maxzoomlevel, attribution, defaultstyle, datatable) VALUES (
2001,
'NYPD Precincts',
'Vector',
'GeoJSON',
false,
'EPSG:4326',
false,
false,
'/srdata/feature',
30,
1,
30,
'',
0,
'sr_layer_static_data'
);

INSERT INTO sr_layers ( id, name, type, format, isbaselayer, projection, visibility, sphericalmercator,url, numzoomlevels, minzoomlevel, maxzoomlevel, attribution, defaultstyle, datatable) VALUES (
2002,
'MTA Subway Routes',
'Vector',
'GeoJSON',
false,
'EPSG:4326',
false,
false,
'/srdata/feature',
30,
1,
30,
'',
2002,
'sr_layer_static_data'
);

INSERT INTO sr_layers ( id, name, type, format, isbaselayer, projection, visibility, sphericalmercator,url, numzoomlevels, minzoomlevel, maxzoomlevel, attribution, defaultstyle, datatable) VALUES (
2003,
'MTA Subway Stations',
'Vector',
'GeoJSON',
false,
'EPSG:4326',
false,
false,
'/srdata/feature',
30,
1,
30,
'',
2003,
'sr_layer_static_data'
);

INSERT INTO sr_layers ( id, name, type, format, isbaselayer, projection, visibility, sphericalmercator,url, numzoomlevels, minzoomlevel, maxzoomlevel, attribution, defaultstyle, datatable) VALUES (
2004,
'NYC DOT Cameras',
'Vector',
'GeoJSON',
false,
'EPSG:4326',
false,
false,
'/srdata/feature',
30,
1,
30,
'',
2004,
'sr_layer_static_data'
);

INSERT INTO sr_layers ( id, name, type, format, isbaselayer, projection, visibility, sphericalmercator,url, numzoomlevels, minzoomlevel, maxzoomlevel, attribution, defaultstyle, datatable) VALUES (
2005,
'LIRR Routes',
'Vector',
'GeoJSON',
false,
'EPSG:4326',
false,
false,
'/srdata/feature',
30,
1,
30,
'',
2005,
'sr_layer_static_data'
);

INSERT INTO sr_layers ( id, name, type, format, isbaselayer, projection, visibility, sphericalmercator,url, numzoomlevels, minzoomlevel, maxzoomlevel, attribution, defaultstyle, datatable) VALUES (
2006,
'NY County Boundaries',
'Vector',
'GeoJSON',
false,
'EPSG:4326',
false,
false,
'/srdata/feature',
30,
1,
30,
'',
2006,
'sr_layer_static_data'
);

INSERT INTO sr_layers ( id, name, type, format, isbaselayer, projection, visibility, sphericalmercator,url, numzoomlevels, minzoomlevel, maxzoomlevel, attribution, defaultstyle, datatable) VALUES (
3001,
'NYPD Sector Boundaries',
'Vector',
'GeoJSON',
false,
'EPSG:4326',
false,
false,
'/srdata/feature',
30,
1,
30,
'',
3001,
'sr_layer_static_data'
);

INSERT INTO sr_layers ( id, name, type, format, isbaselayer, projection, visibility, sphericalmercator,url, numzoomlevels, minzoomlevel, maxzoomlevel, attribution, defaultstyle, datatable) VALUES (
3002,
'DAS Cameras',
'Vector',
'GeoJSON',
false,
'EPSG:4326',
false,
false,
'/srdata/feature',
30,
1,
30,
'',
3002,
'sr_layer_static_data'
);































