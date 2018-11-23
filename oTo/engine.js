// oTo - Object Transport Object v1 by nypher at github.com/nypher/oTo
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
var oTo = new Proxy( {
	// Set the path to oTo 
	path: '/oTo',
	// Parts folder name
	partsPath: '/parts',
	// Set an alias for the oTo object if set you will be able to use you customNamed object as well as oTo.
	alias: false,
	// List oTo dependencies, if any.
	// For local resource, use the name of the file located under "/oTo/parts/" without the .js extension.
	// For external sources, use the complete path including "http://" or "https://".
	dependencies: [
		'jquery'
	],
	// Will be updated to support nodejs in the future
	js : function(url, callback){
		var h = document.getElementsByTagName("HEAD")[0];
		var s = document.createElement('script');
		s.type = 'text/javascript';
		s.src = url;
		s.async = false;
		h.appendChild(s);
		s.onreadystatechange = s.onload = function() {
			var state = s.readyState;
			if (callback instanceof Function && !callback.done && (!state || /loaded|complete/.test(state))) {
				callback.done = true;
				callback();
			}
		};
	},
	// Load dependencies first and the init.js file that contains the script using oTo.
	engine: function(){
		var obj = oTo.alias?window[oTo.alias]:oTo;
		obj.engine.state = 0;
		for (var i = obj.dependencies.length - 1; i >= 0; i--) {
			var u = ( obj.dependencies[i].indexOf("http://") == 0 || obj.dependencies[i].indexOf("https://") == 0 ) ? obj.dependencies[i] : obj.path + obj.partsPath + '/' + obj.dependencies[i] + '.js';
			obj.js( u, function(){
				obj.engine.state++;
				if(obj.engine.state === obj.dependencies.length){
					// Call obj.start located on the /oTo/parts/start.js file
					obj.start()
				}
			});
		}
	}
},{
	// Proxy that handle all oTo calls.
	get : function(target, prop){
		if(oTo.alias){
			window[oTo.alias] = oTo;
		}
		var timeStampInMs = window.performance && window.performance.now && window.performance.timing && window.performance.timing.navigationStart ? window.performance.now() + window.performance.timing.navigationStart : Date.now();
		if( prop in target ) {
            return target[prop];
		}else{
			return function (args) {
				target.js( target.path + target.partsPath + '/' + prop + '.js', function(){
					var obj = oTo.alias?window[oTo.alias]:oTo;
					if( prop in obj ) {
						if(obj[prop] instanceof Function){
							obj[prop](args);
						}else{
							return obj[prop];
						}
					}else{
						return false;
					}
				});
			}
		}
    }
});
oTo.engine();