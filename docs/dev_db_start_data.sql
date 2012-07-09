--
-- PostgreSQL database dump
--

SET statement_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = off;
SET check_function_bodies = false;
SET client_min_messages = warning;
SET escape_string_warning = off;

SET search_path = public, pg_catalog;

----------------------------------------

--
-- Data for Name: sr_users; Type: TABLE DATA; Schema: public; Owner: sitrepadmin
--

COPY sr_users (uid, gid, username, firstname, lastname, title, titlecode, email, dn, last_login, wlayout) FROM stdin;
1001	11	sitrepadmin	SitRepFirstName	AdminLastName	The Admin	0	none@null.com	C	\N	1
1002	12	sitrepuser	SitRepFirstName	UserLastName	A Typical User	0	none@null.com	C	\N	1
\.

--
-- Data for Name: sr_groups; Type: TABLE DATA; Schema: public; Owner: sitrepadmin
--

COPY sr_groups (gid, groupname, parent_gid) FROM stdin;
11	Admin Group	0
12	Regular User Group	0
\.


--
-- Name: sr_modules_id_seq; Type: SEQUENCE SET; Schema: public; Owner: sitrepadmin
--

SELECT pg_catalog.setval('sr_modules_id_seq', 20, true);


--
-- Data for Name: sr_modules; Type: TABLE DATA; Schema: public; Owner: sitrepadmin
--

COPY sr_modules (id, name) FROM stdin;
1	*/*/*
2	srdata/*/*
3	srsearch/*/*
4	home/*/*
5	srdata/users/*
6	srdata/groups/*
7	srdata/layers/*
8	srdata/modules/*
9	srdata/permissions/*
10	srdata/features/*
11	srdata/featuresstatic/*
12	srdata/geojson/*
13	srdata/geojsonstatic/*
14	srdata/styles/*
15	srdata/stylepresets/*
16	srdata/sessions/*
17	srdata/cfs/*
18	srdata/wlayout/*
19	srdata/queries/*
20	srdata/stylerules/*
21	srdata/stylesymbolizers/*
\.

--
-- Name: sr_acl_permissions_permission_id_seq; Type: SEQUENCE SET; Schema: public; Owner: sitrepadmin
--

SELECT pg_catalog.setval('sr_acl_permissions_permission_id_seq', 20, true);


--
-- Data for Name: sr_acl_permissions; Type: TABLE DATA; Schema: public; Owner: sitrepadmin
--

COPY sr_acl_permissions (permission_id, role_type, role_id, resource_id, permission_create, permission_read, permission_update, permission_delete) FROM stdin;
1	gid	11	1	allow	allow	allow	allow
2	gid	10	2	deny	allow	deny	deny
3	gid	10	3	deny	allow	deny	deny
4	gid	10	4	deny	allow	deny	deny
5	gid	10	5	deny	allow	deny	deny
6	gid	10	6	deny	allow	deny	deny
7	gid	10	7	deny	allow	deny	deny
8	gid	10	8	deny	allow	deny	deny
9	gid	10	9	deny	allow	deny	deny
10	gid	10	10	deny	allow	deny	deny
11	gid	10	11	deny	allow	deny	deny
12	gid	10	12	deny	allow	deny	deny
13	gid	10	13	deny	allow	deny	deny
14	gid	10	14	deny	allow	deny	deny
15	gid	10	15	deny	allow	deny	deny
16	gid	10	16	deny	allow	deny	deny
17	gid	10	17	deny	allow	deny	deny
18	gid	10	18	deny	allow	deny	deny
19	gid	10	19	deny	allow	deny	deny
20	gid	10	20	deny	allow	deny	deny
21	gid	10	21	deny	allow	deny	deny
\.


--
-- Name: sr_window_layout_id_seq; Type: SEQUENCE SET; Schema: public; Owner: sitrepadmin
--

SELECT pg_catalog.setval('sr_window_layout_id_seq', 4, true);


--
-- Data for Name: sr_window_layout; Type: TABLE DATA; Schema: public; Owner: sitrepadmin
--

COPY sr_window_layout (id, name, showname, theme, view_x, view_y, view_data) FROM stdin;
1	Main Layout	0	0	2	1	[[{"type":"opstrack","id":1,"linkViewIdArr":[2],"autoRefresh":true,"mapData":true,"querysort":{"cfs_finaldisdate":"desc","cfs_timecreated":"desc"},"srd_queryid":12 }], [{"type":"map","id":2,"linkViewIdArr":[1],"start_lat":40.713,"start_lon":-73.996,"start_zoom":12,"start_base_layer":1002}] ]
2	CFS Only Layout	0	0	1	1	[[{"type":"opstrack","id":1,"autoRefresh":true,"querysort":{"cfs_finaldisdate":"desc","cfs_timecreated":"desc"},"srd_queryid":1 }] ]
3	Map Only Layout	0	0	1	1	[ [{"type":"map","id":2,"linkViewIdArr":[1],"start_lat":40.713,"start_lon":-73.996,"start_zoom":12,"start_base_layer":1002}] ]
4	Main Layout Dark	1	0	2	1	[[{"type":"opstrack","id":1,"linkViewIdArr":[2],"autoRefresh":true,"mapData":true,"querysort":{"cfs_finaldisdate":"desc","cfs_timecreated":"desc"},"srd_queryid":12 }], [{"type":"map","id":2,"linkViewIdArr":[1],"start_lat":40.713,"start_lon":-73.996,"start_zoom":12,"start_base_layer":1003}] ]
\.


--
-- Name: sr_layers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: sitrepadmin
--

SELECT pg_catalog.setval('sr_layers_id_seq', 2000, true);


--
-- Data for Name: sr_layers; Type: TABLE DATA; Schema: public; Owner: sitrepadmin
--

COPY sr_layers (id, name, type, format, isbaselayer, projection, visibility, sphericalmercator, url, numzoomlevels, minzoomlevel, maxzoomlevel, attribution, defaultstyle, created_on, updated_on, created_by, updated_by) FROM stdin;
1001	SitRep	XYZ	\N	t	EPSG:900913	t	t	https://sitrep.local/sr_tiles/${z}/${x}/${y}.png	30	\N	\N		\N	\N	2012-02-22 12:39:26.877309	\N	\N
1002	SitRep BW	XYZ	\N	t	EPSG:900913	t	t	https://sitrep.local/sr_tiles_bw/${z}/${x}/${y}.png	30	\N	\N	\N	\N	\N	2012-02-22 12:39:26.92042	\N	\N
1003	SitRep BW Dark	XYZ	\N	t	EPSG:900913	t	t	https://sitrep.local/sr_tiles_bw_dark/${z}/${x}/${y}.png	30	\N	\N	\N	\N	\N	2012-02-22 12:39:26.970325	\N	\N
\.




--
-- PostgreSQL database dump complete
--

