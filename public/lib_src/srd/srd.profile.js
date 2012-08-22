
function copyOnly(mid) {
    return mid in {
        // There are no modules right now in dojo boilerplate that are copy-only. If you have some, though, just add
        // them here like this:
        // 'app/module': 1
    };
}




var profile = {
//	releaseDir: "srdRelease",
	basePath: "..",
	action: 'release',
	cssOptimize: 'comments',
	mini: false,
//	optimize: 'closure',
//	layerOptimize: 'closure',
//	stripConsole: 'all',
	layers: {
/*		"dojo/dojo": {
			include: [ "dojo/dojo", 'dojo/_base/loader', 'dojo/i18n', "dojo/domReady" ],
			customBase: true,
			boot: true
		}
*/
		"srd/edit_include" : {
			include: [ 
				"dijit/form/Form",
				"dijit/form/Textarea",
				"dijit/ColorPalette",
				"dijit/form/HorizontalSlider",
				"dijit/form/NumberSpinner",
				"dojox/layout/ExpandoPane"
			]
		},
		"srd/doc_include" : {
			include: [
				"srd/doc_include"
			]
		},
		"srd/view_include": { 
			include: [ 
				"dojo/_base/declare",
				"dijit/layout/BorderContainer",
				"dijit/Menu",
				"dijit/PopupMenuItem",
				"dojox/grid/EnhancedGrid",
				"dojox/grid/enhanced/plugins/NestedSorting",
				"dojox/grid/enhanced/plugins/Pagination"
			 ]
		},
		"srd/srd_view": {
			include: [ "srd/srd_view" ],
			exclude: [ "srd/view_include" ]
		},
		"srd/srd_editPalette": {
			include: [ "srd/srd_editPalette" ],
			exclude: [ "srd/doc_include" ]
		},
		

		"srd/srd_document": {
			include: [ "srd/srd_document" ],
			exclude: [ "srd/doc_include" ]
		}



	},



    staticHasFeatures: {
        // The trace & log APIs are used for debugging the loader, so we don’t need them in the build
        'dojo-trace-api':0,
        'dojo-log-api':0,

        // This causes normally private loader data to be exposed for debugging, so we don’t need that either
        'dojo-publish-privates':1,

        // We’re fully async, so get rid of the legacy loader
        'dojo-sync-loader':1,
        
        // dojo-xhr-factory relies on dojo-sync-loader
        'dojo-xhr-factory':0,

        // We aren’t loading tests in production
        'dojo-test-sniff':0
    },

    // Resource tags are functions that provide hints to the compiler about a given file. The first argument is the
    // filename of the file, and the second argument is the module ID for the file.
    resourceTags: {
        // Files that contain test code.
        test: function (filename, mid) {
            return false;
        },

        // Files that should be copied as-is without being modified by the build system.
        copyOnly: function (filename, mid) {
            return copyOnly(mid);
        },

        // Files that are AMD modules.
        amd: function (filename, mid) {
            return !copyOnly(mid) && /\.js$/.test(filename);
        },

        // Files that should not be copied when the “mini” compiler flag is set to true.
        miniExclude: function (filename, mid) {
            return mid in {
                'srd/profile': 1
            };
        }
    }
};








