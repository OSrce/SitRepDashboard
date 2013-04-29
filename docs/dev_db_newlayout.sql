
CREATE DATABASE sitrep WITH TEMPLATE template_postgis;
\c sitrep;
CREATE EXTENSION IF NOT EXISTS hstore;


CREATE TABLE sruser ( 
	id BIGSERIAL NOT NULL,
	group_id BIGINT NOT NULL,
	name VARCHAR(128) NOT NULL,
	has_data BOOL NOT NULL DEFAULT FALSE,
	created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	updated TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	data	hstore,
	PRIMARY KEY (id)
);

CREATE TABLE srgroup (
	id BIGSERIAL NOT NULL,
	group_id BIGINT NOT NULL,
	parent BIGINT,
	name VARCHAR(128) NOT NULL,
	has_data BOOL NOT NULL DEFAULT FALSE,
	created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	updated TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	data	hstore,
	PRIMARY KEY (id),
	FOREIGN KEY (parent) REFERENCES srgroup(id)
);
CREATE INDEX srgroup_idx on srgroup (group_id);

CREATE SEQUENCE group_id_seq START WITH 2050;


-- SOURCE 0=UNKNWOWN, 1=GPS, 2=ADDRESS, 3=CROSS ST, 4=SECTOR, 5=PRECINCT, 6=SIMULATOR.

CREATE TABLE location (
  id BIGSERIAL NOT NULL,
  source INT NOT NULL DEFAULT 0,
	has_data BOOL NOT NULL DEFAULT FALSE,
	created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	updated TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	data hstore,
 	PRIMARY KEY(id)
);
SELECT AddGeometryColumn('location','geometry',4326,'GEOMETRY',3);


CREATE TABLE entity ( 
	id BIGSERIAL NOT NULL,  --ID COLUMN
	group_id BIGINT NOT NULL DEFAULT 0, -- GROUP THAT entity belongs to, see srgroups
	name VARCHAR(128) NOT NULL,	-- STRING NAME OF ENTITY
	has_data BOOL NOT NULL DEFAULT FALSE, -- WHETHER THE data column below has a value.
	created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	updated TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	data hstore,	-- hstore  DATA TO DESCRIBE THE ENITY IN GREATER DETAIL, INFORMATION THAT
							-- IS NEVER GOING TO CHANGE; CHANGING INFO SHOULD BE A entity_status row.
	PRIMARY KEY (id)
);
CREATE INDEX entity_idx2 on entity (group_id, id);


CREATE TABLE entity_status (
	id BIGSERIAL NOT NULL, --ID COLUMN
	entity BIGINT NOT NULL references entity(id), --ID OF RELEVANT entity
	location BIGINT references location(id), -- ID of location row
	has_location BOOL NOT NULL DEFAULT FALSE,
	has_data BOOL NOT NULL DEFAULT FALSE,
	has_begin BOOL NOT NULL DEFAULT TRUE,
	has_end BOOL NOT NULL DEFAULT FALSE,
	created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	updated TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	data_begin TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- start time for status
	data_end TIMESTAMP DEFAULT null,  --end time for status
	data hstore, -- hstore FORMATED DATA TO DESCRIBE THE STATUS IN GREATER DETAIL, INFORMATION THAT
	PRIMARY KEY(id)
);
CREATE INDEX entity_status_idx2 ON entity_status(entity)
CREATE INDEX entity_status_idx3 ON entity_status(location)


-- CREATE VIEW entity_status_byname AS SELECT entity.name, entity_status.* FROM entity, entity_status  WHERE entity.id=entity_status.entity_id;

--FOR DEBUGING PERPOSES
-- CREATE VIEW entity_status_byname AS SELECT entity.name, entity_status.* FROM entity, entity_status  WHERE entity.id=entity_status.entity_id;

CREATE TABLE event (
	id BIGSERIAL NOT NULL, --ID COLUMN
	group_id BIGINT NOT NULL DEFAULT 0, -- GROUP THAT event belongs to, see srgroups
	location BIGINT references location(id), -- ID of location row
	has_location BOOL NOT NULL DEFAULT FALSE,
	has_data BOOL NOT NULL DEFAULT FALSE,
	has_begin BOOL NOT NULL DEFAULT TRUE,
	has_end BOOL NOT NULL DEFAULT FALSE,
	created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	updated TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	data_begin TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- start time for status
	data_end TIMESTAMP DEFAULT null,  --end time for status
	data hstore, -- hstore FORMATED DATA TO DESCRIBE THE STATUS IN GREATER DETAIL, INFORMATION THAT
	PRIMARY KEY(id)
);
CREATE INDEX event_idx2 on event (group_id, id);
CREATE INDEX event_idx3 ON event(location);

CREATE TABLE srmap (
	id BIGSERIAL NOT NULL, --ID COLUMN
	group_id BIGINT NOT NULL DEFAULT 0, -- GROUP THAT srmap belongs to, see srgroups
	has_data BOOL NOT NULL DEFAULT FALSE,
	data hstore, 
	PRIMARY KEY(id)
);
SELECT AddGeometryColumn('srmap','geometry',4326,'GEOMETRY',3);
CREATE INDEX srmap_idx2 on srmap (group_id, id);


----------- OLD TABLES RENAMED layer, style, ssymbolizer, srule :

--CREATE TYPE layer_type AS ENUM ('XYZ','Vector','WFS','GeoRSS','WMS');
--CREATE TYPE layer_format AS ENUM ('GML','WFST','WKT','GeoJSON','SRJSON');
CREATE TABLE layer (
	id BIGSERIAL NOT NULL,
	name VARCHAR(128) NOT NULL,
	ltype VARCHAR(16) NOT NULL,
	lformat VARCHAR(16),
	isBaseLayer BOOLEAN NOT NULL DEFAULT FALSE,
	projection VARCHAR(16),
	visibility BOOLEAN NOT NULL DEFAULT TRUE,
	sphericalMercator BOOLEAN NOT NULL DEFAULT FALSE,
	url VARCHAR(128),
	urlparams hstore,
	numZoomLevels INT,
	minZoomLevel INT,
	maxZoomLevel INT,
	attribution VARCHAR(128),
	defaultStyle int,
	bgcolor VARCHAR(8) default '0x000000',
	opacity REAL default 1,
	created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	updated TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY(id)
);

CREATE TABLE lstrategy (
	id BIGSERIAL NOT NULL,
	layer_id BIGINT NOT NULL references layer(id),
	stype VARCHAR(32) NOT NULL,
	has_data	BOOLEAN NOT NULL DEFAULT false,
	data hstore,
	created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY(id)
);


-- TABLE sr_styles 
-- Should be list of symbolizers.

CREATE TABLE ssymbolizer (
	id BIGSERIAL NOT NULL,
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
	created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	updated TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY(id)
);

-- TABLE sr_style_rules is used to build
-- both OpenLayers.Rule and OpenLayers.Filter
CREATE TABLE srule (
	id BIGSERIAL NOT NULL,
	name VARCHAR(128) NOT NULL DEFAULT '',
	style_id BIGINT NOT NULL,
	symbolizer_id BIGINT NOT NULL,
	elsefilter bool DEFAULT false,
	filter_data text, 
	created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	updated TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY(id)
);

CREATE INDEX srule_idx2 ON srule (style_id);


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

CREATE TABLE style (
	id BIGSERIAL NOT NULL,
	name VARCHAR(128) NOT NULL DEFAULT '',
	stylemap_id BIGINT NOT NULL,
	render_type VARCHAR(128) NOT NULL DEFAULT 'default',
	defaultsymbolizer_id BIGINT,
	created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	updated TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY(id)
);

CREATE INDEX style_idx2 ON style (stylemap_id);



CREATE TABLE query (
	id BIGSERIAL NOT NULL,
	name VARCHAR(128) NOT NULL DEFAULT '',
	notes TEXT,
	data TEXT,
	created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	updated TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY (id)
);

--- TEMP for spring peristent logins

CREATE TABLE persistent_logins(
	username VARCHAR(64) NOT NULL,
	series VARCHAR(64) NOT NULL,
	token VARCHAR(64) NOT NULL,
	last_used TIMESTAMP NOT NULL
);







