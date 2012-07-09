



insert into sr_style_rules (name, style_id, symbolizer_id, elsefilter, filter_data) VALUES ( 'Job Unassigned', 5001, 5001, true, '{"type":"==","property":"sr_status", "value":"Open-Unassigned" }' ); 

insert into sr_style_rules (name, style_id, symbolizer_id, elsefilter, filter_data) VALUES ( 'Job Assigned', 5001, 5002, true, '{"type":"==","property":"sr_status", "value":"Open-Assigned" }' );  

insert into sr_style_rules (name, style_id, symbolizer_id, elsefilter, filter_data) VALUES ( 'Job Unit On Scene', 5001, 5003, true, '{"type":"==","property":"sr_status", "value":"Open-Onscene" }' );  

insert into sr_style_rules (name, style_id, symbolizer_id, elsefilter, filter_data) VALUES ( 'Job Closed', 5001, 5004, true, '{"type":"==","property":"sr_status", "value":"Closed" }' );  





