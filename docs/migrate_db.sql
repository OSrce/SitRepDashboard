
\c sr_data_java
ALTER TABLE sr_assets alter column id type bigint;
ALTER TABLE sr_assets alter column last_status_id type bigint REFERENCES sr_assets_status(id);
ALTER TABLE sr_assets alter column last_location_status_id type bigint REFERENCES sr_assets_status(id);
ALTER TABLE sr_assets alter column location_id type bigint REFERENCES sr_locations(id);

ALTER TABLE sr_assets_status alter column id type bigint;
ALTER TABLE sr_assets_status alter column asset_id type bigint;
ALTER TABLE sr_assets_status alter column location_id type bigint;

ALTER TABLE sr_acl_permissions alter column permission_id type bigint;
ALTER TABLE sr_acl_permissions alter column role_id type bigint;

ALTER TABLE sr_layer_dynamic_data alter column id type bigint;

ALTER TABLE sr_layer_static_data alter column id type bigint;

ALTER TABLE sr_layers alter column id type bigint;

ALTER TABLE sr_locations alter column id type bigint;





