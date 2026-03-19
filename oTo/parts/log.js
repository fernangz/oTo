// oTo.log - Object Transport Object Log function to serve as an example of how to extend oTo by fernangz under license EUPL [https://eupl.eu/]
oTo.log = function(content, style) {
	var e = 'background: #fdd001; color: #c00000; line-height: 14px; font-size: 12px; padding: 8px; font-weight: 600;';
	var a = 'background: #000; color: #fdd001; line-height: 14px; font-size: 12px; padding: 8px; font-weight: 600;';
	var c = 'background: #c00000; color: #000; line-height: 14px; font-size: 12px; padding: 8px; font-weight: 600;';
	var d = 'background: #fdd001; color: #000; line-height: 14px; font-size: 12px; padding: 8px; font-weight: 600;';
	switch (style) {
		case 'error':
			console.log('%c' + JSON.stringify(content, null, "\t"), e);
			break;
		case 'alert':
			console.log('%c' + JSON.stringify(content, null, "\t"), a);
			break;
		case 'confirm':
			console.log('%c' + JSON.stringify(content, null, "\t"), c);
			break;
		default:
			console.log('%c' + JSON.stringify(content, null, "\t"), d);
	};
};
