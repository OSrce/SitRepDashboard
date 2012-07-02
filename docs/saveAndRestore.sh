# SCRIPT TO SAVE TABLE VIA pg_dump and RESTORE EVEN IF TABLE IS DIFFERENT 

TABLE_NAME='sr_window_layout'

pg_dump -a -b -f /tmp/${TABLE_NAME}_dump.sql -t ${TABLE_NAME} sr_data;

psql -d sr_data -c "DROP TABLE ${TABLE_NAME};";

psql -d sr_data -f dev_db_setup.sql;

psql -d sr_data -f /tmp/${TABLE_NAME}_dump.sql;


