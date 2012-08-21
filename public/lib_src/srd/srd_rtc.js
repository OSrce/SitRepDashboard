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

define("srd/srd_rtc", [
	"dojo/_base/declare",
	"dojo/_base/unload",
	"dojox/cometd/main",
	"dojo/domReady!"
	], function( declare, unloader, cometd ) {
		return declare( 'srd_rtc', [] , {
		// Pointer to parent srd_document class
		srd_doc : null,
		connected : false,

		// BEGIN CONSTRUCTOR
		constructor : function(parent_srd_doc) {

			console.log("srd_rtc constructor called!");
			this.srd_doc = parent_srd_doc;


			unloader.addOnUnload(function() {
				cometd.disconnect(true);
			} );

			this.url = location.protocol+ "//" + location.host + ":8080/sitrep/cometd";
//			cometd.init(this.url);

			cometd.configure( {
				url: this.url,
				logLevel: 'debug'
			} );

			cometd.addListener('/meta/handshake', this._metaHandshake);
			cometd.addListener('/meta/connect', this._metaConnect);
//			this.initConnection();
			cometd.handshake();

		},
		// END CONSTRUCTORi

		_metaHandshake: function(handshake) {
			if(handshake.successful === true) {
				cometd.batch(function() {
					// CALL SUBSCRIBE AND PUBLISH FUNCTIONS HERE
					console.log( "HANDSHAKE SUCCESSFULL! ############################" );


				} );
			}
		},
		// END _metaHandshake
		_metaConnect: function(message) {
			if(cometd.isDisconnected() ) {
				this.connected = false;
				_connectionClosed();
				return;
			}
			var wasConnected = this.connected;
			this.connected = message.successful === true;
			if( !wasConnected && this.connected) {
				this._connectionEstablished();
			} else if ( wasConnected && !this.connected) {
				this._connectionBroken();
			}
		},
		// END _metaConnect
		// BEGIN _connectionEstablished
		_connectionEstablished : function() {
			console.log("@@@@@@@@@@ CONNECTION ESTABLISHED!");

		},
		// END _connectionEstablished
		// BEGIN _connectionBroken
		_connectionBroken : function() {
			console.log("@@@@@@@@@@ CONNECTION BROKEN!");

		},
		// END _connectionBroken
		// BEGIN _connectionClosed
		_connectionClosed : function() {
			console.log("@@@@@@@@@@ CONNECTION CLOSED!");


		},
		// END _connectionClosed
		






		initConnection: function() {
			this.socket = cometd("http://nyc.local:8080/cometd");
			this.socket.configure( "http://nyc.local:8080/cometd");
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
							"connectionType": "long-polling"
						},
						// send a subscribe message
						{
							"channel": "/meta/subscribe",
							"clientId": this.clientId,
							"subscription": "/foo/**"
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


} );









