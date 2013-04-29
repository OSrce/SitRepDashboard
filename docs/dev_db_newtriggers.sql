

/*******
* Create function sr_update_row_settime
* to have sr_cfs address info geocoded after inserts.
*
* NEED TO ENABLE DBLINK
* psql -d sr_data -f /usr/share/pgsql/contrib/dblink.sql
*
*/


CREATE OR REPLACE FUNCTION sr_notify() RETURNS TRIGGER 
AS $$
DECLARE
BEGIN
--		SELECT pg_notify( TG_TABLE_NAME, TG_OP || ':' || OLD.group_id || ':' || OLD.id );	
	IF TG_OP='INSERT' THEN
		PERFORM pg_notify( TG_TABLE_NAME, TG_OP || ':' || NEW.id );	
	ELSE	
		PERFORM pg_notify( TG_TABLE_NAME, TG_OP || ':' || OLD.id );	
	END IF;
		RETURN NULL;
END;
$$
LANGUAGE 'plpgsql';
--- END FUNCTION ---





CREATE OR REPLACE FUNCTION sr_update_row_settime() RETURNS TRIGGER 
AS $$
DECLARE
BEGIN
--	IF TG_OP='UPDATE' THEN
		NEW.updated := NOW();
		RETURN NEW;
--	END IF;
--	RETURN NEW;
END;
$$
LANGUAGE 'plpgsql';
--- END FUNCTION ---

CREATE OR REPLACE FUNCTION sr_sanitycheck() RETURNS TRIGGER 
AS $$
DECLARE
BEGIN
		IF NEW.data IS NULL THEN
			NEW.has_data = FALSE;
		ELSE
			NEW.has_data = TRUE;
		END IF;
		NEW.updated := NOW();
		RETURN NEW;
END;
$$
LANGUAGE 'plpgsql';
--- END FUNCTION ---

CREATE OR REPLACE FUNCTION sr_sanitycheck_e() RETURNS TRIGGER 
AS $$
DECLARE
BEGIN
		IF NEW.data IS NULL THEN
			NEW.has_data = FALSE;
		ELSE
			NEW.has_data = TRUE;
		END IF;
		IF NEW.data_begin IS NULL THEN
			NEW.has_begin = FALSE;
		ELSE
			NEW.has_begin = TRUE;
		END IF;
			IF NEW.data_end IS NULL THEN
			NEW.has_end = FALSE;
		ELSE
			NEW.has_end = TRUE;
		END IF;
			IF NEW.location IS NULL THEN
			NEW.has_location = FALSE;
		ELSE
			NEW.has_location = TRUE;
		END IF;
		NEW.updated := NOW();
		RETURN NEW;
END;
$$
LANGUAGE 'plpgsql';
--- END FUNCTION ---


DROP TRIGGER IF EXISTS sr_notify_trigger ON entity;
CREATE TRIGGER sr_notify_trigger
AFTER INSERT OR UPDATE OR DELETE ON entity
    FOR EACH ROW EXECUTE PROCEDURE sr_notify();

DROP TRIGGER IF EXISTS sr_notify_trigger ON entity_status;
CREATE TRIGGER sr_notify_trigger
AFTER INSERT OR UPDATE OR DELETE ON entity_status
    FOR EACH ROW EXECUTE PROCEDURE sr_notify();

DROP TRIGGER IF EXISTS sr_notify_trigger ON event;
CREATE TRIGGER sr_notify_trigger
AFTER INSERT OR UPDATE OR DELETE ON event
    FOR EACH ROW EXECUTE PROCEDURE sr_notify();

DROP TRIGGER IF EXISTS sr_notify_trigger ON srmap;
CREATE TRIGGER sr_notify_trigger
AFTER INSERT OR UPDATE OR DELETE ON srmap
    FOR EACH ROW EXECUTE PROCEDURE sr_notify();









/* CREATE THE TRIGGER AND RUN ON ALL ROWS.*/

DROP TRIGGER IF EXISTS sr_sanitycheck_trigger ON entity;
CREATE TRIGGER sr_sanitycheck_trigger
BEFORE INSERT OR UPDATE ON entity
    FOR EACH ROW EXECUTE PROCEDURE sr_sanitycheck();

DROP TRIGGER IF EXISTS sr_sanitycheck_trigger ON entity_status;
CREATE TRIGGER sr_sanitycheck_trigger
BEFORE INSERT OR UPDATE ON entity_status
    FOR EACH ROW EXECUTE PROCEDURE sr_sanitycheck_e();

DROP TRIGGER IF EXISTS sr_sanitycheck_trigger ON event;
CREATE TRIGGER sr_sanitycheck_trigger
BEFORE INSERT OR UPDATE ON event
    FOR EACH ROW EXECUTE PROCEDURE sr_sanitycheck_e();

DROP TRIGGER IF EXISTS sr_sanitycheck_trigger ON layer;
CREATE TRIGGER sr_sanitycheck_trigger
BEFORE INSERT OR UPDATE ON layer
    FOR EACH ROW EXECUTE PROCEDURE sr_update_row_settime();

DROP TRIGGER IF EXISTS sr_sanitycheck_trigger ON location;
CREATE TRIGGER sr_sanitycheck_trigger
BEFORE INSERT OR UPDATE ON location
    FOR EACH ROW EXECUTE PROCEDURE sr_sanitycheck();

DROP TRIGGER IF EXISTS sr_sanitycheck_trigger ON query;
CREATE TRIGGER sr_sanitycheck_trigger
BEFORE INSERT OR UPDATE ON query
    FOR EACH ROW EXECUTE PROCEDURE sr_update_row_settime();

DROP TRIGGER IF EXISTS sr_sanitycheck_trigger ON srgroup;
CREATE TRIGGER sr_sanitycheck_trigger
BEFORE INSERT OR UPDATE ON srgroup
    FOR EACH ROW EXECUTE PROCEDURE sr_sanitycheck();

DROP TRIGGER IF EXISTS sr_sanitycheck_trigger ON sruser;
CREATE TRIGGER sr_sanitycheck_trigger
BEFORE INSERT OR UPDATE ON sruser
    FOR EACH ROW EXECUTE PROCEDURE sr_sanitycheck();

DROP TRIGGER IF EXISTS sr_sanitycheck_trigger ON lstrategy;
CREATE TRIGGER sr_sanitycheck_trigger
BEFORE INSERT OR UPDATE ON lstrategy
    FOR EACH ROW EXECUTE PROCEDURE sr_sanitycheck();

DROP TRIGGER IF EXISTS sr_sanitycheck_trigger ON style;
CREATE TRIGGER sr_sanitycheck_trigger
BEFORE INSERT OR UPDATE ON style
    FOR EACH ROW EXECUTE PROCEDURE sr_update_row_settime();

DROP TRIGGER IF EXISTS sr_sanitycheck_trigger ON srule;
CREATE TRIGGER sr_sanitycheck_trigger
BEFORE INSERT OR UPDATE ON srule
    FOR EACH ROW EXECUTE PROCEDURE sr_update_row_settime();

DROP TRIGGER IF EXISTS sr_sanitycheck_trigger ON ssymbolizer;
CREATE TRIGGER sr_sanitycheck_trigger
BEFORE INSERT OR UPDATE ON ssymbolizer
    FOR EACH ROW EXECUTE PROCEDURE sr_update_row_settime();






