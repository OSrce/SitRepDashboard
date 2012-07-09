

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











