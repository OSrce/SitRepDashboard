
\c sr_data

CREATE TABLE sr_event_type (
	id SERIAL NOT NULL,

);	

CREATE TABLE sr_event (
	id SERIAL NOT NULL,
	event_type INT REFERENCES sr_event_type(id),
	sr_start TIMESTAMP NOT NULL,
	sr_end TIMESTAMP,
	location	INT REFERENCES sr_locations(id),
	data TEXT,
	updated_by INT REFERENCES sr_users(uid),
	updated_on TIMESTAMP, 
	PRIMARY KEY (id)
);

CREATE TABLE sr_event_audits (
	revision SERIAL NOT NULL,
	LIKE sr_events,
	PRIMARY KEY (revision),
);

CREATE OR REPLACE FUNCTION event_update() RETURNS TRIGGER AS $event_update$
	BEGIN
		INSERT INTO sr_event_audit SELECT NEW.*;
		RETURN NEW;
	END;
$event_update$ LANGUAGE plpgsql;

/*
CREATE TRIGGER event_update
AFTER INSERT OR UPDATE ON sr_events
	FOR EACH ROW EXECUTE PROCEDURE event_update();
*/






