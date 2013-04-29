

CREATE DATABASE sr_data WITH TEMPLATE template_postgis;
\c sr_data;

CREATE TABLE sr_session ( 
	id CHAR(32),
	modified INT,
	lifetime INT,
	data TEXT,
	PRIMARY KEY (id)
);

CREATE TABLE sr_users ( 
	uid int NOT NULL,
	gid int NOT NULL,
	username VARCHAR(128) NOT NULL,
	firstname VARCHAR(40),
	lastname VARCHAR(40),
	title VARCHAR(40),
	titlecode INT,
	email VARCHAR(128),
	dn VARCHAR(256),
	wlayout INT NOT NULL DEFAULT 1,
	last_login TIMESTAMP DEFAULT null,
	PRIMARY KEY (uid)
);

CREATE TABLE sr_groups (
	gid int NOT NULL,
	groupname VARCHAR(40),
	parent_gid int,
	PRIMARY KEY (gid)
);

CREATE TYPE roleType AS ENUM ('uid','gid');
CREATE TYPE permitType AS ENUM ('deny', 'allow');

CREATE TABLE sr_acl_permissions (
	permission_id SERIAL NOT NULL,
	role_type roleType NOT NULL,
	role_id INT NOT NULL,
	resource_id INT NOT NULL,
	permission_create permitType NOT NULL DEFAULT 'deny',
	permission_read permitType NOT NULL DEFAULT 'deny',
	permission_update permitType NOT NULL DEFAULT 'deny',
	permission_delete permitType NOT NULL DEFAULT 'deny',
	PRIMARY KEY (permission_id)
);

create TABLE sr_modules (
	id SERIAL NOT NULL,
	name VARCHAR(128) NOT NULL,
	PRIMARY KEY(id)
);

-- FUTURE USE --
-- CREATE VIEW sr_acl AS SELECT module.name, acl.* FROM sr_modules module, sr_acl_permissions acl WHERE module.id=acl.resource_id;

CREATE TYPE layer_type AS ENUM ('XYZ','Vector','WFS','GeoRSS','WMS');
CREATE TYPE layer_format AS ENUM ('GML','WFST','WKT','GeoJSON','SRJSON');
CREATE TABLE sr_layers (
	id SERIAL NOT NULL,
	name VARCHAR(128) NOT NULL,
	type LAYER_TYPE,
	format LAYER_FORMAT,
	isBaseLayer BOOLEAN NOT NULL DEFAULT FALSE,
	projection VARCHAR(16),
	visibility BOOLEAN NOT NULL DEFAULT TRUE,
	sphericalMercator BOOLEAN NOT NULL DEFAULT FALSE,
	url VARCHAR(128),
	numZoomLevels INT,
	minZoomLevel INT,
	maxZoomLevel INT,
	attribution VARCHAR(128),
	defaultStyle int,
	bgcolor VARCHAR(8) default '0x000000',
	opacity REAL default 1,
	created_on TIMESTAMP,
	updated_on TIMESTAMP,
	created_by INT,
	updated_by INT,
	PRIMARY KEY(id)
);

-- TABLE sr_styles 
-- Should be list of symbolizers.

CREATE TABLE sr_style_symbolizers (
	id SERIAL NOT NULL,
	name VARCHAR(128) NOT NULL,
	label VARCHAR(128),
	fillColor VARCHAR(32),
	fillOpacity REAL,
	strokeColor VARCHAR(32),
	strokeOpacity REAL,
	strokeWidth INT,
	pointRadius INT,
	fontColor VARCHAR(32),
	fontSize INT,
	fontFamily VARCHAR(64),
	fontWeight VARCHAR(32),
	fontOpacity REAL,
	labelAlign VARCHAR(32),
	labelXOffset INT,
	labelYOffset INT,	
	externalGraphic VARCHAR(128),
	graphicWidth INT,
	graphicHeight INT,
	graphicOpacity REAL,
	rotation INT,
	created_on TIMESTAMP,
	updated_on TIMESTAMP,
	created_by INT,
	updated_by INT,
	PRIMARY KEY(id)
);

-- TABLE sr_style_rules is used to build
-- both OpenLayers.Rule and OpenLayers.Filter
CREATE TABLE sr_style_rules (
	id SERIAL NOT NULL,
	name VARCHAR(128) NOT NULL DEFAULT '',
	style_id INT NOT NULL,
	symbolizer_id INT NOT NULL,
	elsefilter bool DEFAULT false,
	filter_data text, 
	PRIMARY KEY(id)
);

CREATE INDEX sr_style_rules_idx2 ON sr_style_rules (style_id);


-- TABLE sr_styles corresponds to OpenLayers.Style
-- SitRep should create StyleMap based on all rows
-- that match style_id and then make the render intents
-- based on render_type
-- id <- used internally
-- stylemap_id the stylemap_id
-- render_type :
--   'default' : sitrep_bw
--   'default_dark' : sitrep_bw_dark
-- defaultsymbolizer_id : the row from style_symbolizers that should be used
-- 	as the 'default' object for the OpenLayers.Style 
-- NOTE: every Style regardless of Render Intent has a default object.

CREATE TABLE sr_styles (
	id SERIAL NOT NULL,
	name VARCHAR(128) NOT NULL DEFAULT '',
	stylemap_id int NOT NULL,
	render_type VARCHAR(128) NOT NULL DEFAULT 'default',
	defaultsymbolizer_id INT,
	PRIMARY KEY(id)
);

CREATE INDEX sr_styles_idx2 ON sr_styles (stylemap_id);

-- TABLE sr_style_presets 
-- List of styles that should be included in presets list
-- when editing a layer.
CREATE TABLE sr_style_presets (
	id SERIAL NOT NULL,
	name VARCHAR(128) NOT NULL DEFAULT '',
	style_id int NOT NULL,
	layer_id int NOT NULL DEFAULT 0,
--	group_id int NOT NULL DEFAULT 0,
--	user_id int NOT NULL DEFAULT 0,
	created_on TIMESTAMP,
	updated_on TIMESTAMP,
	created_by INT,
	updated_by INT,
	PRIMARY KEY(id)
);

CREATE TABLE sr_layer_static_data (
	id SERIAL NOT NULL,
	layer_id INT NOT NULL,
	feature_style INT,	
	feature_data TEXT,
	PRIMARY KEY ( id ) 
);

SELECT AddGeometryColumn('sr_layer_static_data','sr_geom',4326,'GEOMETRY',2);
CREATE INDEX sr_layer_static_data_idx2 on sr_layer_static_data ( layer_id, id);


CREATE TABLE sr_layer_dynamic_data (
	id SERIAL NOT NULL,
	layer_id INT NOT NULL,
	feature_data TEXT,
	feature_start TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	feature_end TIMESTAMP DEFAULT null,
	PRIMARY KEY ( id ) 
);

SELECT AddGeometryColumn('sr_layer_dynamic_data','sr_geom',4326,'GEOMETRY',3);
CREATE INDEX sr_layer_dynamic_data_idx2 on sr_layer_dynamic_data ( layer_id, id);

CREATE TABLE sr_window_layout ( 
	id SERIAL NOT NULL,
	name VARCHAR(128) NOT NULL DEFAULT '',
	showname INT NOT NULL DEFAULT -1,
	theme INT NOT NULL DEFAULT 0,
	view_x	INT NOT NULL DEFAULT 1,
	view_y	INT NOT NULL DEFAULT 1,
	view_data TEXT,
	PRIMARY KEY ( id ) 
);

CREATE TABLE sr_locations_workqueue ( 
	id SERIAL NOT NULL,
	location_id INT,
	PRIMARY KEY (id )
);

CREATE TABLE sr_queries (
	id SERIAL NOT NULL,
	parent BIGINT NOT NULL DEFAULT 0,
	children BOOL NOT NULL DEFAULT FALSE,
	name VARCHAR(128) NOT NULL DEFAULT '',
	notes TEXT,
	data TEXT,
	PRIMARY KEY (id)
);



CREATE TABLE sr_cfs_updatequeue ( 
	cfs_date DATE NOT NULL,
	cfs_num INT NOT NULL,
	PRIMARY KEY (cfs_date, cfs_num )
);

CREATE TABLE sr_query_monitor (
	id BIGSERIAL NOT NULL,
	queryid INT NOT NULL REFERENCES sr_queries(id),
	PRIMARY KEY (id)
);


CREATE TABLE sr_query_monitor_results (
	id BIGSERIAL NOT NULL,
	monitorid BIGINT NOT NULL REFERENCES sr_query_monitor(id),
	resultid BIGINT NOT NULL REFERENCES sr_cfs(id),
  updatedon TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY (id)
);















