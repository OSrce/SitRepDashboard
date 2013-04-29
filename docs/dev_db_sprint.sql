/*  SQL FILE FOR SETTING UP calls for service table
*
*
*
*
*/

\c sr_data;

CREATE TABLE sr_cfs (
	id BIGSERIAL NOT NULL,
  cfs_date DATE NOT NULL,
	cfs_letter CHAR NOT NULL,
  cfs_num INT  NOT NULL,
  cfs_pct INT NOT NULL,
  cfs_sector CHAR NOT NULL,
	cfs_addr VARCHAR(128),
	cfs_cross1 VARCHAR(128),
	cfs_cross2 VARCHAR(128),
	cfs_location BIGINT references sr_locations(id),
	cfs_code INT NOT NULL,
	cfs_codesup1 VARCHAR(8),
	cfs_codesup2 VARCHAR(128),
	cfs_createdby VARCHAR(16),
	cfs_dispatcherid VARCHAR(8),
	cfs_timecreated TIME,
	cfs_timeassigned TIMESTAMP,
	cfs_assignedunit VARCHAR(16),
	cfs_priority INT,
	cfs_routenotifications BOOL DEFAULT FALSE,
	cfs_finaldis INT,
	cfs_finaldissup1 VARCHAR(32),
	cfs_finaldisdate TIMESTAMP,
	cfs_finaldisunit VARCHAR(16),
	cfs_callback BOOL,
	cfs_dup BOOL,
	cfs_dupletter CHAR,
	cfs_dupnum INT,
	cfs_body TEXT,
	cfs_bodylastline VARCHAR(100),
	cfs_created_on TIMESTAMP,
	cfs_updated_on TIMESTAMP,
	PRIMARY KEY (id)
);



--CREATE TYPE asset_type AS ENUM('DISPATCHER', '',

CREATE TABLE sr_assets ( 
	id SERIAL NOT NULL,
	name VARCHAR(64),
	last_status_id INT NOT NULL,	
	last_location_status_id INT NOT NULL,	
	location_id INT,
	data TEXT,
	created_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	updated_on TIMESTAMP DEFAULT null,
	PRIMARY KEY (id)
);

CREATE TABLE sr_assets_status (
	id SERIAL NOT NULL,
	asset_id INT NOT NULL,
	location_id INT,
	status VARCHAR(128),	
	data TEXT,
	sr_start TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	sr_end TIMESTAMP DEFAULT null,
	updated_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY(id)
);

-- SOURCE 1=GPS, 2=ADDRESS, 3=CROSS ST, 4=SECTOR, 5=PRECINCT.

CREATE TABLE sr_locations (
	id BIGSERIAL NOT NULL,
	pct INT,
	sector CHAR,
	source INT,
	address VARCHAR(128),
	cross1 VARCHAR(128),
	cross2 VARCHAR(128),
	rating INT,
	created_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	last_used TIMESTAMP,
	PRIMARY KEY(id)
);

SELECT AddGeometryColumn('sr_locations','sr_geom',4326,'GEOMETRY',3);


CREATE VIEW sr_cfs_withlocation AS SELECT (cfs.cfs_date||'|'||cfs.cfs_num) as id, cfs.*, ST_AsText(ST_Force_2D(loc.sr_geom)) as geometry FROM sr_cfs cfs, sr_locations loc WHERE cfs.cfs_location = loc.id;

-- DIAGNOSTICS
-- ANALYZE
--  SELECT pg_size_pretty(pg_relation_size('sr_cfs') );
--  SELECT pg_size_pretty(pg_total_relation_size('sr_cfs') );

CREATE VIEW sr_assets_status_byname AS SELECT asset.name, status.* FROM sr_assets asset, sr_assets_status status WHERE asset.id=status.asset_id;



-- CREATE INDEX FOR sr_cfs
CREATE INDEX cfs_finaldisdate_idx ON sr_cfs ( cfs_finaldisdate );
CREATE INDEX cfs_finaldis_idx ON sr_cfs (cfs_finaldis);
CREATE INDEX cfs_timecreated_idx ON sr_cfs ( cfs_timecreated );
--CREATE INDEX cfs_code_idx ON sr_cfs (cfs_code);
--CREATE INDEX cfs_pct_idx ON sr_cfs (cfs_pct);





