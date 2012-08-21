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
	"dojo/domReady!"
	], function( declare, unloader ) {
		return declare( 'srd_rtc', [] , {
		// Pointer to parent srd_document class
		srd_doc : null,
		connected : false,

		// BEGIN CONSTRUCTOR
		constructor : function(parent_srd_doc) {

			console.log("srd_rtc constructor called!");
			this.srd_doc = parent_srd_doc;

	}
		// END handleMessage
	// END dojo.declare srd_rtc CLASS

	}
);


} );









