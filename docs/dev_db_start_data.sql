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
\.

--
-- Name: sr_acl_permissions_permission_id_seq; Type: SEQUENCE SET; Schema: public; Owner: sitrepadmin
--

SELECT pg_catalog.setval('sr_acl_permissions_permission_id_seq', 108, true);


--
-- Data for Name: sr_acl_permissions; Type: TABLE DATA; Schema: public; Owner: sitrepadmin
--

COPY sr_acl_permissions (permission_id, role_type, role_id, resource_id, permission_create, permission_read, permission_update, permission_delete) FROM stdin;
2	gid	5000	1	deny	allow	deny	deny
56	uid	942303	61	allow	allow	allow	allow
11	gid	553	3	deny	allow	deny	deny
12	gid	553	4	deny	allow	deny	deny
13	gid	553	17	deny	allow	deny	deny
14	gid	553	18	deny	allow	deny	deny
15	gid	553	19	deny	allow	deny	deny
16	gid	553	20	deny	allow	deny	deny
17	gid	553	21	deny	allow	deny	deny
18	gid	553	22	deny	allow	deny	deny
19	gid	553	23	deny	allow	deny	deny
20	gid	553	24	deny	allow	deny	deny
21	gid	553	25	deny	allow	deny	deny
22	gid	553	26	deny	allow	deny	deny
23	gid	553	27	deny	allow	deny	deny
24	gid	553	28	deny	allow	deny	deny
25	gid	553	29	deny	allow	deny	deny
26	gid	553	30	deny	allow	deny	deny
27	gid	553	31	deny	allow	deny	deny
28	gid	553	32	deny	allow	deny	deny
29	gid	553	33	deny	allow	deny	deny
30	gid	553	34	deny	allow	deny	deny
31	gid	553	35	deny	allow	deny	deny
32	gid	553	36	deny	allow	deny	deny
33	gid	553	37	deny	allow	deny	deny
34	gid	553	38	deny	allow	deny	deny
35	gid	553	39	deny	allow	deny	deny
36	gid	553	40	deny	allow	deny	deny
37	gid	553	41	deny	allow	deny	deny
38	gid	553	42	deny	allow	deny	deny
39	gid	553	43	deny	allow	deny	deny
40	gid	553	44	deny	allow	deny	deny
41	gid	553	45	deny	allow	deny	deny
42	gid	553	46	deny	allow	deny	deny
43	gid	553	47	deny	allow	deny	deny
44	gid	553	48	deny	allow	deny	deny
48	uid	-104	53	allow	allow	allow	allow
49	uid	-104	53	allow	allow	allow	allow
50	uid	942303	55	allow	allow	allow	allow
51	uid	942303	56	allow	allow	allow	allow
52	uid	942303	57	allow	allow	allow	allow
1	gid	527	1	allow	allow	allow	allow
47	uid	-104	52	allow	allow	allow	allow
5




--
-- PostgreSQL database dump complete
--

