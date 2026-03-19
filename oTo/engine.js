// oTo - Object Transport Object v1 by fernangz under license EUPL [https://eupl.eu/]
var oTo = new Proxy( {
	// Set the path to oTo 
	path: '/oTo',
	// Parts folder name
	partsPath: '/parts',
	// Set an alias for the oTo object if set you will be able to use you customNamed object as well as oTo.
	alias: false,
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
