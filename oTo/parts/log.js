// oTo.log - oTo Console Log Styles by nypher at github.com/nypher/oTo
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
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