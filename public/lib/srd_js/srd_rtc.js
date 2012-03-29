// srd_rtc.js
////////////////////////////////
// CLASS FOR srd real time communication
// USING comet (and srrtc cometd server) 
//
//
//
//
//
/////////////////////////////////

dojo.require("dojox.socket");

//srd_rtc class definition using dojo.declare 
dojo.declare( 
	'srd_rtc',
	null,
	{
		// Pointer to parent srd_document class
		srd_doc : null,


		// BEGIN CONSTRUCTOR
		constructor : function( parent_srd_doc) {
			console.log("srd_rtc constructor called!");
			this.srd_doc = parent_srd_doc;
			
			this.initConnection();

		},
		// END CONSTRUCTOR
		initConnection: function() {
			this.socket = dojox.socket("sitrep.local:8080/cometd");
			this.socket.on("connect", function() {
				// send a handshake
				this.send([
					{
						"channel": "/meta/handshake",
						"version": "1.0",
						"minimumVersion": "1.0beta",
						"supportedConnectionTypes": ["long-polling"]
					}
				]).then(function(data) {
					data = dojo.fromJson(data);
					if(data.error){
						throw new Error(error);
					}
					// GET THE CLIENT ID SHOULD BE SAME AS COOKIE FOR PHP SESSIONID.
					this.clientId = data.clientId;
					this.send([
						// send a connect message
						{
							"channel": "/meta/connect",
							"clientId": this.clientId,
							"connectionType": "long-polling",
						},
						// send a subscribe message
						{
							"channel": "/meta/subscribe",
							"clientId": this.clientId,
							"subscription": "/foo/**",
						}
					]);
					this.socket.on("message", function(evt) {
						this.handleMessage(evt);
					}.bind(this) );
				}.bind(this) );
			}.bind(this) );	
		},
		// END initConnection
		send: function(data) {
			return this.socket.send(dojo.toJson(data) );
		},
		// END send
		handleMessage: function(evt) {
			var data = evt.data;
			switch(data.action) {
				case "create":
					//store.notify(data.object);
					break;
				case "update":
					//store.notify(data.object, data.object.id);
					break;
				case "delete":
					//store.notify(undefined, data.object.id);
					break;
				default:
					console.log("We recieved a message, but don't know what to do with it.");
			}
		}
		// END handleMessage
	// END dojo.declare srd_rtc CLASS
	}
);










