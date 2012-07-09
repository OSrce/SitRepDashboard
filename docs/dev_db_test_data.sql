



insert into sr_style_rules (name, style_id, symbolizer_id, elsefilter, filter_data) VALUES ( 'Job Unassigned', 5001, 5001, true, '{"type":"==","property":"sr_status", "value":"Open-Unassigned" }' ); 

insert into sr_style_rules (name, style_id, symbolizer_id, elsefilter, filter_data) VALUES ( 'Job Assigned', 5001, 5002, true, '{"type":"==","property":"sr_status", "value":"Open-Assigned" }' );  

insert into sr_style_rules (name, style_id, symbolizer_id, elsefilter, filter_data) VALUES ( 'Job Unit On Scene', 5001, 5003, true, '{"type":"==","property":"sr_status", "value":"Open-Onscene" }' );  

insert into sr_style_rules (name, style_id, symbolizer_id, elsefilter, filter_data) VALUES ( 'Job Closed', 5001, 5004, true, '{"type":"==","property":"sr_status", "value":"Closed" }' );  


 insert into sr_modules ( name ) values ( 'srdata/stylerules/*');
 insert into sr_modules ( name ) values ( 'srdata/stylesymbolizers/*');


insert into sr_acl_permissions ( role_type, role_id, resource_id, permission_create, permission_read, permission_update, permission_delete) VALUES ( 'gid', 553, 75 , 'deny', 'allow', 'deny', 'deny' );








