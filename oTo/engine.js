// oTo - Object Transport Object v1 by nypher at github.com/nypher/oTo
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
let oTo = new Proxy( {
	// List oTo dependencies, if any.
	// For local resource, use the name of the file located under "/oTo/deps/" without the .js extension.
	// For external sources, use the complete path including "http://" or "https://".
	deps: [
		'jquery'
	],
	// Will be updated to support nodejs in the future
	js : function(url, callback){
		let h = document.getElementsByTagName("HEAD")[0];
		let s = document.createElement('script');
		s.type = 'text/javascript';
		s.src = url;
		s.async = false;
		h.appendChild(s);
		s.onreadystatechange = s.onload = function() {
			let state = s.readyState;
			if (callback instanceof Function && !callback.done && (!state || /loaded|complete/.test(state))) {
				callback.done = true;
				callback();
			}
		};
	},
	// Load dependencies first and the init.js file that contains the script using oTo.
	engine: function(){
		oTo.engine.state = 0;
		for (var i = oTo.deps.length - 1; i >= 0; i--) {
			let u = ( oTo.deps[i].indexOf("http://") == 0 || oTo.deps[i].indexOf("https://") == 0 ) ? oTo.deps[i] : '/oTo/deps/' + oTo.deps[i] + '.js';
			oTo.js( u, function(){
				oTo.engine.state++;
				if(oTo.engine.state === oTo.deps.length){
					// Call oTo.start located on the /oTo/parts/start.js file
					oTo.log('This is a function from another file!')
				}
			});
		}
	}
},{
	// Proxy that handle all oTo calls.
	get : function(target, prop){
		let timeStampInMs = window.performance && window.performance.now && window.performance.timing && window.performance.timing.navigationStart ? window.performance.now() + window.performance.timing.navigationStart : Date.now();
		if( prop in target ) {
            return target[prop];
		}else{
			return function (args) {
				target.js( '/oTo/parts/' + prop + '.js', function(){
					if( prop in oTo ) {
						if(oTo[prop] instanceof Function){
							oTo[prop](args);
						}else{
							return oTo[prop];
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