/*******
* Create function sr_geocode_event
* to have sr_cfs address info geocoded after inserts.
*
* NEED TO ENABLE DBLINK
* psql -d sr_data -f /usr/share/pgsql/contrib/dblink.sql
*
*/

CREATE OR REPLACE FUNCTION sr_cfs_location_event() RETURNS TRIGGER 
AS $sr_cfs_location_trigger$
DECLARE
querystr TEXT;
BEGIN
IF TG_RELNAME='sr_cfs' THEN
	IF NEW.cfs_location IS NOT NULL THEN
		RETURN NEW;
	END IF;
	IF TG_OP='UPDATE' THEN
		RETURN NEW;
	END IF;
	IF NEW.cfs_addr IS NULL THEN
		IF NEW.cfs_cross1 IS NULL AND NEW.cfs_cross2 IS NULL THEN
			/* NO GOOD -> RETURN cfs_location = -1 */
			NEW.cfs_location := -1;
		ELSE
			/* WE DO NOT HAVE A GOOD ADDR STR SO WE ARE USING CROSS STREETS */
			INSERT INTO sr_locations (pct, sector, source, address, cross1, cross2) VALUES ( NEW.cfs_pct, NEW.cfs_sector, 2, NEW.cfs_addr, NEW.cfs_cross1, NEW.cfs_cross2 );
			NEW.cfs_location := currval('sr_locations_id_seq');
		END IF;
	ELSE /* We have a GOOD Address String */
		INSERT INTO sr_locations (pct, sector, source, address, cross1, cross2) VALUES ( NEW.cfs_pct, NEW.cfs_sector, 1, NEW.cfs_addr, NEW.cfs_cross1, NEW.cfs_cross2 );
		NEW.cfs_location := currval('sr_locations_id_seq');
	END IF;
	RETURN NEW;
END IF;
END;
$sr_cfs_location_trigger$
LANGUAGE 'plpgsql';
--- END FUNCTION ---

/* CREATE THE TRIGGER AND RUN ON ALL ROWS.*/

DROP TRIGGER sr_cfs_location_trigger ON sr_cfs;
CREATE TRIGGER sr_cfs_location_trigger
BEFORE INSERT OR UPDATE ON sr_cfs
    FOR EACH ROW EXECUTE PROCEDURE sr_cfs_location_event();


/* CREATE TRIGGER FUNCTION CALLED ON sr_locations INSERT/UPDATE */

CREATE OR REPLACE FUNCTION sr_locations_geocode_event() RETURNS TRIGGER 
AS $sr_locations_geocode_trigger$
DECLARE
querystr TEXT;
BEGIN
IF TG_RELNAME='sr_locations' THEN
	IF NEW.sector IS NOT NULL THEN
		querystr := '"Name":"'||NEW.pct||NEW.sector||'"';
		SELECT ST_Force_3D(sr_geom) INTO NEW.sr_geom FROM sr_layer_static_data WHERE layer_id=3010 AND feature_data ~ querystr; 
		IF NEW.sr_geom IS NOT NULL THEN
			NEW.source := 4;
		END IF;		
	END IF;
	IF NEW.sr_geom IS NULL AND NEW.pct IS NOT NULL THEN
		querystr := '"PctName":"'||NEW.pct||'"';
		SELECT ST_Force_3D(sr_geom) INTO NEW.sr_geom FROM sr_layer_static_data WHERE layer_id=2010 AND feature_data ~ querystr; 
		IF NEW.sr_geom IS NOT NULL THEN
			NEW.source := 5;
		END IF;		
	END IF;
	INSERT INTO sr_locations_workqueue (location_id) VALUES (NEW.id);
	NOTIFY sr_locations_workqueue;
	RETURN NEW;
END IF;
END;
$sr_locations_geocode_trigger$
LANGUAGE 'plpgsql';
--- END FUNCTION ---

/* CREATE THE TRIGGER AND RUN ON ALL ROWS.*/

DROP TRIGGER sr_locations_geocode_trigger ON sr_locations;
CREATE TRIGGER sr_locations_geocode_trigger
BEFORE INSERT OR UPDATE ON sr_locations
    FOR EACH ROW EXECUTE PROCEDURE sr_locations_geocode_event();

/* END CREATE sr_locations_geocode_trigger */




/*  FUNCTION FOR ACTUAL GEOCODING... */

CREATE OR REPLACE FUNCTION sr_geocode_func(location_id integer) RETURNS integer 
AS $sr_geocode_func$
DECLARE
querystr text;
addressstr1 varchar(256);
therating INTEGER;
thegeomout geometry;
loc sr_locations%ROWTYPE;
BEGIN
	SELECT INTO loc * FROM sr_locations WHERE id=location_id;
	IF NOT FOUND THEN
		RETURN -1;
	END IF;
	IF loc.source = 2 THEN
		IF loc.cross1 IS NULL OR loc.cross2 IS NULL THEN
			/* NO GOOD - CROSS STREETS ARE NULL -> SET rating = -10 */
			therating := -10;
			UPDATE sr_locations SET rating = therating WHERE id = location_id;
		ELSE 
			/* PERFORM GEOCODE ON CROSS STREETS */
			querystr := 'SELECT rating, ST_Force_3D( ST_Transform(geomout, 4326)) AS sr_geomout FROM geocode_intersection(''' ||loc.cross1|| ''','''|| loc.cross2 || ''',''New York'', ''NY'',NULL, 1 ) ';
			RAISE NOTICE 'Query String===%===',querystr;
			SELECT INTO therating, thegeomout  g.rating, g.geomout FROM dblink('dbname=sr_geocoder', querystr) AS g(rating int, geomout geometry);
			IF therating IS NULL THEN
				therating := -5;
				UPDATE sr_locations SET rating = therating WHERE id = location_id;
			ELSE 
				UPDATE sr_locations SET rating = therating, sr_geom = thegeomout WHERE id = location_id;
			END IF;
		END IF;
	ELSEIF loc.source = 1 THEN
		IF loc.address IS NULL THEN
			/* NO GOOD - ADDRESS IS NULL -> SET RATING = -11 */
			therating := -11;
			UPDATE sr_locations SET rating = therating WHERE id = location_id;
		ELSE
			/* PERFORM GEOCODE ON ADDRESS */
			addressstr1 := loc.address||', New York NY';
			querystr := 'SELECT rating, ST_Force_3D( ST_Transform( geomout, 4326) ) AS sr_geomout FROM geocode(''' || addressstr1 || ''', 1 )';
			RAISE NOTICE 'FULL ADDR TO GEOCODE===%===',addressstr1;
			RAISE NOTICE 'Query String===%===',querystr;
			SELECT INTO therating, thegeomout  g.rating, g.geomout FROM dblink('dbname=sr_geocoder', querystr) AS g(rating int, geomout geometry);
			IF therating IS NULL THEN
				therating := -5;
				UPDATE sr_locations SET rating = therating WHERE id = location_id;
			ELSE 
				UPDATE sr_locations SET rating = therating, sr_geom = thegeomout WHERE id = location_id;
			END IF;
		END IF;
	END IF;
	RETURN therating;
END;
$sr_geocode_func$
LANGUAGE 'plpgsql';
--- END FUNCTION ---




