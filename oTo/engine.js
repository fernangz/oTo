// oTo - Object Transport Object v2 by fernangz under license EUPL [https://eupl.eu/]
(function (root) {
	var _isBrowser = typeof window !== 'undefined' && typeof document !== 'undefined';
	var _cache = Object.create(null);
	var _currentAlias = false;
	var _require = (!_isBrowser && typeof require === 'function') ? require : null;
	var _pathMod = null;
	var _oTo = null;
	if (_require) {
		try { _pathMod = _require('path'); } catch (e) {}
	}
	var _reserved = Object.create(null);
	_reserved.then = 1;
	_reserved.toJSON = 1;
	_reserved.valueOf = 1;
	_reserved.toString = 1;
	_reserved.constructor = 1;
	_reserved.inspect = 1;
	_reserved.nodeType = 1;
	_reserved.tagName = 1;
	_reserved.__proto__ = 1;
	_reserved.__defineGetter__ = 1;
	_reserved.__defineSetter__ = 1;
	_reserved.__lookupGetter__ = 1;
	_reserved.__lookupSetter__ = 1;
	var _head = null;
	function _getHead() {
		if (!_head && _isBrowser) {
			_head = document.getElementsByTagName("HEAD")[0] || document.head || document.documentElement;
		}
		return _head;
	}
	var _pathCache = Object.create(null);
	var _normPath = '/oTo';
	var _normPartsPath = '/parts';
	var _configKeys = Object.create(null);
	_configKeys.path = 1;
	_configKeys.partsPath = 1;
	_configKeys.alias = 1;
	_configKeys.timeout = 1;
	_configKeys.onerror = 1;
	_configKeys.onload = 1;
	_configKeys.unload = 1;
	_configKeys.preload = 1;
	_configKeys.status = 1;
	function _joinUrl(base, sub, file) {
		return base.replace(/\/+$/, '') + '/' + sub.replace(/^\/+|\/$+/g, '') + '/' + file.replace(/^\/+/, '');
	}
	function _partPath(name) {
		if (_pathCache[name]) return _pathCache[name];
		var result;
		if (_isBrowser) {
			result = _joinUrl(_normPath, _normPartsPath, name + '.js');
		} else if (_pathMod) {
			result = _pathMod.resolve(
				process.cwd(),
				_normPath.replace(/^\/+/, ''),
				_normPartsPath.replace(/^\/+/, ''),
				name + '.js'
			);
		} else {
			result = _joinUrl(
				_normPath.replace(/^\/+/, ''),
				_normPartsPath.replace(/^\/+/, ''),
				name + '.js'
			);
		}
		_pathCache[name] = result;
		return result;
	}
	function _clearPathCache() {
		_pathCache = Object.create(null);
	}
	function _loadScript(url, timeout, onSuccess, onError) {
		var head = _getHead();
		if (!head) {
			if (typeof onError === 'function') onError(new Error('No <head> element available'));
			return;
		}
		var s = document.createElement('script');
		var done = false;
		var timer = null;
		function finish(err) {
			if (done) return;
			done = true;
			if (timer) clearTimeout(timer);
			s.onload = s.onerror = null;
			if (err) {
				if (typeof onError === 'function') onError(err);
			} else {
				if (typeof onSuccess === 'function') onSuccess();
			}
		}
		s.src = url;
		s.async = false;
		s.onload = function () { finish(null); };
		s.onerror = function () { finish(new Error('Script load failed: ' + url)); };
		head.appendChild(s);
		if (timeout > 0) {
			timer = setTimeout(function () {
				s.onload = s.onerror = null;
				if (s.parentNode) s.parentNode.removeChild(s);
				finish(new Error('Script load timed out after ' + timeout + 'ms: ' + url));
			}, timeout);
		}
	}
	function _requirePart(name) {
		try {
			var result = _require(_partPath(name));
			if (result != null && !(name in target)) {
				target[name] = (result.__esModule && result.default !== undefined)
					? result.default : result;
			}
			if (!(name in target)) {
				return { ok: false, error: new Error('Part "' + name + '" loaded but did not register itself') };
			}
			return { ok: true };
		} catch (e) {
			return { ok: false, error: e };
		}
	}
	function _safeCall(fn, ctx, args) {
		try { return fn.apply(ctx, args); }
		catch (e) {
			try { target.onerror('_call', e); }
			catch (e2) { console.error('oTo: onerror threw', e2); }
		}
	}
	function _flushQueue(name) {
		var cached = _cache[name];
		if (!cached || !cached.queue || !cached.queue.length) return;
		var queue = cached.queue;
		cached.queue = [];
		var fn = target[name];
		if (typeof fn === 'function') {
			for (var i = 0; i < queue.length; i++) {
				_safeCall(fn, _oTo, queue[i]);
			}
		}
	}
	var target = {
		path: '/oTo',
		partsPath: '/parts',
		alias: false,
		timeout: 0,
		onerror: function (part, err) {
			console.error('oTo: failed to load part "' + part + '"', err);
		},
		onload: function (part) {},
		unload: function (name) {
			if (typeof name !== 'string' || (name in _reserved) || (name in _configKeys)) return;
			if (!_cache[name] && !(name in target)) return;
			var cached = _cache[name];
			var originalUrl = cached && cached.url ? cached.url : _partPath(name);
			delete target[name];
			delete _cache[name];
			delete _pathCache[name];
			if (_isBrowser) {
				var scripts = document.getElementsByTagName('script');
				for (var i = scripts.length - 1; i >= 0; i--) {
					if (scripts[i].src && scripts[i].src.indexOf(originalUrl) !== -1) {
						scripts[i].parentNode.removeChild(scripts[i]);
					}
				}
			} else if (_require) {
				try {
					var resolved = _require.resolve(originalUrl);
					if (typeof _require.cache === 'object' && _require.cache[resolved]) {
						delete _require.cache[resolved];
					}
				} catch (e) {}
			}
		},
		preload: function (name) {
			if (typeof name !== 'string' || !/^[a-zA-Z0-9_-]+$/.test(name)) return;
			if (name in _reserved || name in _configKeys) return;
			if (_cache[name] && (_cache[name].status === 'loaded' || _cache[name].status === 'loading')) return;
			var url = _partPath(name);
			_cache[name] = { status: 'loading', queue: [], url: url };
			if (_isBrowser) {
				_loadScript(url, target.timeout,
					function () {
						var cached = _cache[name];
						if (!cached) return;
						if (!(name in target)) {
							cached.status = 'error';
							cached.queue = [];
							try { target.onerror(name, new Error('Part "' + name + '" loaded but did not register itself')); } catch (e) { console.error('oTo: onerror threw', e); }
							return;
						}
						cached.status = 'loaded';
						try { target.onload(name); } catch (e) { try { target.onerror(name, e); } catch (e2) { console.error('oTo: onerror threw', e2); } }
						_flushQueue(name);
					},
					function (err) {
						var cached = _cache[name];
						if (!cached) return;
						cached.status = 'error';
						cached.queue = [];
						try { target.onerror(name, err); } catch (e) { console.error('oTo: onerror threw', e); }
					}
				);
			} else if (_require) {
				var r = _requirePart(name);
				if (!r.ok) {
					_cache[name] = { status: 'error', queue: [], url: url };
					try { target.onerror(name, r.error); } catch (e) { console.error('oTo: onerror threw', e); }
					return;
				}
				_cache[name] = { status: 'loaded', queue: [], url: url };
				try { target.onload(name); } catch (e) { try { target.onerror(name, e); } catch (e2) { console.error('oTo: onerror threw', e2); } }
			}
		},
		status: function (name) {
			if (name) {
				var entry = _cache[name];
				return entry ? { status: entry.status, queued: entry.queue.length } : null;
			}
			var result = {};
			for (var k in _cache) {
				result[k] = { status: _cache[k].status, queued: _cache[k].queue.length };
			}
			return result;
		}
	};
	var oTo = new Proxy(target, {
		get: function (tgt, prop) {
			if (tgt.alias && tgt.alias !== _currentAlias) {
				root[tgt.alias] = oTo;
				_currentAlias = tgt.alias;
			}
			if (prop in tgt) {
				return tgt[prop];
			}
			if (typeof prop === 'symbol' || prop in _reserved) {
				return undefined;
			}
			var entry = _cache[prop];
			if (!entry && !/^[a-zA-Z0-9_-]+$/.test(prop)) {
				return undefined;
			}
			return function () {
				var entry = _cache[prop];
				if (entry && entry.status === 'loaded') {
					var fn = tgt[prop];
					if (typeof fn === 'function') {
						return fn.apply(oTo, arguments);
					}
					return fn;
				}
				var args = Array.prototype.slice.call(arguments);
				if (entry && entry.status === 'error') {
					delete _cache[prop];
					entry = null;
				}
				if (_isBrowser) {
					if (entry && entry.status === 'loading') {
						entry.queue.push(args);
						return;
					}
					var url = _partPath(prop);
					_cache[prop] = { status: 'loading', queue: [], url: url };
					_loadScript(
						url,
						tgt.timeout,
						function () {
							var cached = _cache[prop];
							if (!cached) return;
							if (!(prop in tgt)) {
								cached.status = 'error';
								cached.queue = [];
								try { tgt.onerror(prop, new Error('Part "' + prop + '" loaded but did not register itself')); } catch (e) { console.error('oTo: onerror threw', e); }
								return;
							}
							cached.status = 'loaded';
						try { tgt.onload(prop); } catch (e) { try { tgt.onerror(prop, e); } catch (e2) { console.error('oTo: onerror threw', e2); } }
						_safeCall(tgt[prop], oTo, args);
						_flushQueue(prop);
					},
					function (err) {
						var cached = _cache[prop];
						if (!cached) return;
						cached.status = 'error';
						cached.queue = [];
						try { tgt.onerror(prop, err); } catch (e) { console.error('oTo: onerror threw', e); }
					}
					);
				} else if (_require) {
					var url = _partPath(prop);
					var r = _requirePart(prop);
					if (!r.ok) {
						_cache[prop] = { status: 'error', queue: [], url: url };
						try { tgt.onerror(prop, r.error); } catch (e) { console.error('oTo: onerror threw', e); }
						return;
					}
					_cache[prop] = { status: 'loaded', queue: [], url: url };
					try { tgt.onload(prop); } catch (e) { try { tgt.onerror(prop, e); } catch (e2) { console.error('oTo: onerror threw', e2); } }
					if (typeof tgt[prop] === 'function') {
						return tgt[prop].apply(oTo, args);
					}
					return tgt[prop];
				}
			};
		},
		set: function (tgt, prop, value) {
			if (prop in _reserved) return true;
			tgt[prop] = value;
			if (prop === 'path') {
				_normPath = value;
				_clearPathCache();
			} else if (prop === 'partsPath') {
				_normPartsPath = value;
				_clearPathCache();
			} else if (prop === 'alias') {
				// Clean up old alias global before wiring new one
				if (_currentAlias && _currentAlias !== value && root[_currentAlias] === oTo) {
					delete root[_currentAlias];
				}
				_currentAlias = value || false;
				if (value) {
					root[value] = oTo;
				}
			}
			if (!(prop in _configKeys)) {
				if (!_cache[prop]) {
					_cache[prop] = { status: 'loaded', queue: [], url: _partPath(prop) };
				} else {
					if (_cache[prop].status === 'loading') {
						_cache[prop].status = 'loaded';
					}
					_flushQueue(prop);
				}
			}
			return true;
		},
		deleteProperty: function (tgt, prop) {
			if (prop in _reserved || prop in _configKeys) return true;
			delete tgt[prop];
			delete _cache[prop];
			delete _pathCache[prop];
			return true;
		},
		has: function (tgt, prop) {
			if (prop in tgt) return true;
			var entry = _cache[prop];
			return !!(entry && entry.status === 'loaded');
		}
	});
	_oTo = oTo;
	root.oTo = oTo;
	if (typeof module !== 'undefined' && module.exports) {
		module.exports = oTo;
	}
})(typeof globalThis !== 'undefined' ? globalThis : (typeof window !== 'undefined' ? window : (typeof global !== 'undefined' ? global : this)));
