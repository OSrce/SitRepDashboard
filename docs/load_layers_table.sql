INSERT INTO sr_layers ( id, name, type, isbaselayer, projection, visibility, sphericalmercator, url, numzoomlevels, datatable) VALUES (
1001,
'SitRep',
'XYZ',
true,
'EPSG:4326',
true,
true,
'https://wjoc-sr.nypd.finest/sr_tiles/${z}/${x}/${y}.png',
30,
'NONE'
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



