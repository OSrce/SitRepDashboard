
COPY sr_style_symbolizers (id, name, label, fillcolor, fillopacity, strokecolor, strokeopacity, strokewidth, pointradius, fontcolor, fontsize, fontfamily, fontweight, fontopacity, labelalign, labelxoffset, labelyoffset, externalgraphic, graphicwidth, graphicheight, graphicopacity, rotation, created_on, updated_on, created_by, updated_by) FROM stdin;
5010	ConEdLow	${CustomersAffected}	#B5E28C	0.9	#B5E28C	0.5	12	10	#ffffff	12	Arial	bold	0.8	cc	0	0		80	40	1	45	\N	\N	\N	\N
5011	ConEdMed	${CustomersAffected}	#F1D357	0.9	#F1D357	0.5	15	12	#ffffff	12	Arial	bold	0.8	cc	0	0		80	40	1	45	\N	\N	\N	\N
5012	ConEdHigh	${CustomersAffected}	#FD9C73	0.9	#FD9C73	0.5	20	12	#ffffff	12	Arial	bold	0.8	cc	0	0		80	40	1	45	\N	\N	\N	\N
\.

COPY sr_style_rules (id, name, style_id, symbolizer_id, elsefilter, filter_data) FROM stdin;
5	ConEdLowRule	2013	5010	t	{"type":"<","property":"CustomersAffected", "value":15 }
6	ConEdMedRule	2013	5011	t	{"type":"><","property":"CustomersAffected", "lowerBoundary":15, "upperBoundary":50 }
7	ConEdHighRule	2013	5012	t	{"type":">","property":"CustomersAffected", "value":50 }
\.





