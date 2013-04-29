

-- INSERT INTO entity example
INSERT INTO entity (name, has_data, data) VALUES ( 'Test Entity 4', TRUE, hstore(ARRAY[['SomeVariableName1','SomeValue1'],['SomeVariableName2','4']]) );


--INSERT INTO location example
INSERT INTO location (source, has_data, data, geometry) VALUES ( 6, TRUE, hstore(ARRAY[['pct','5'],['sector','a'],['address','123 Main St'],['cross1','Bob Ave'],['cross2','Sally Ave'],['rating','0']  ]), ST_SetSRID( 'POINT Z (-73.9406723318197 40.8192709501512 0)',4326)  ); 


--INSERT INTO entity_status example
INSERT INTO entity_status (entity, location, has_data, data) VALUES ( 1, 1, TRUE, hstore(ARRAY[['train_line','A'],['direction','180']]) );





