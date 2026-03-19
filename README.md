# oTo — Object Transport Object v2

## What it is

A cross-runtime lazy module loader built on `Proxy`. It gives you a single global object (`oTo`) where any method call automatically fetches and executes a matching JavaScript file, then runs the function it defines.

Works in **Browser**, **Node.js** (CJS), and **Bun**. No promises, no async/await — purely callback-based with automatic call queueing.

It is **not** a bundler, a framework, or a module system like ES modules. It is a thin runtime that turns property access into on-demand module loading.

## How it works internally

1. `oTo` is a `Proxy` wrapping a config object with `path`, `partsPath`, `alias`, `timeout`, lifecycle hooks (`onload`, `onerror`), and utility methods (`unload`, `preload`, `status`).
2. When you access a property that **exists** on the target (like `oTo.path`), it returns it directly.
3. When you access a property that **doesn't exist** (like `oTo.gallery`), the proxy returns a wrapper function.
4. Calling that function (`oTo.gallery({...})`) triggers loading:
   - **Browser**: injects a `<script>` tag into `<head>`.
   - **Node.js / Bun**: calls `require()` to load the file synchronously.
5. Once loaded, the part's function is invoked with the original arguments. Any calls made while loading are queued and flushed in order once the part registers itself.
6. Subsequent calls hit the already-loaded function directly (no second download).
7. Failed loads set an error state. The next call to that part automatically retries.

## How to use it

### Browser

#### 1. Include oTo in your page

```html
<script src="/oTo/oTo.js"></script>
```

#### 2. Create part files — one per feature

Each file goes in the parts folder and attaches itself to the `oTo` object:

```js
// /oTo/parts/gallery.js
oTo.gallery = function (opts) {
    document.getElementById(opts.target).innerHTML = '<div class="gallery">...</div>';
};
```

```js
// /oTo/parts/analytics.js
oTo.analytics = function (event, data) {
    console.log('Event:', event, data);
};
```

#### 3. Call features — they load automatically

```js
oTo.gallery({ target: 'main', images: ['a.jpg', 'b.jpg'] });
oTo.analytics('pageview', { page: '/home' });
```

Multiple arguments are fully supported. The first call downloads the file; subsequent calls execute immediately.

### Node.js / Bun

```js
const oTo = require('./oTo.js');

oTo.path = './lib';
oTo.partsPath = 'modules';

// Parts are loaded via require() — synchronous
oTo.math(2, 3); // requires ./lib/modules/math.js
```

Parts can register themselves the same way (`oTo.math = function(...) {}`) or export via `module.exports`:

```js
// ./lib/modules/math.js
module.exports = function (a, b) {
    return a + b;
};
```

If a module uses `module.exports` or ES module default export, oTo auto-registers it.

## Configuration

| Property | Default | Description |
|---|---|---|
| `path` | `'/oTo'` | Base path for part files |
| `partsPath` | `'/parts'` | Subdirectory within `path` where parts live |
| `alias` | `false` | Creates a global alias (e.g., `oTo.alias = 'app'` → `app.gallery(...)`) |
| `timeout` | `0` | Script load timeout in ms (browser only, `0` = no timeout) |

```js
oTo.path = '/assets/lib';
oTo.partsPath = '/modules';
// parts now load from /assets/lib/modules/{name}.js

oTo.alias = 'app';
app.gallery({ target: 'main' });

oTo.timeout = 5000; // 5s timeout — removes script tag and fires onerror on timeout
```

## Lifecycle hooks

### `onerror(part, err)`

Called when a part fails to load, times out, or doesn't register itself. Also called if `onload` throws.

```js
oTo.onerror = function (part, err) {
    console.error('Failed:', part, err);
    // send to error tracking, show UI fallback, etc.
};
```

Default: logs to `console.error`.

### `onload(part)`

Called after a part successfully loads and registers.

```js
oTo.onload = function (part) {
    console.log('Loaded:', part);
};
```

Default: no-op.

Both hooks are fully guarded — if `onload` throws, the error is forwarded to `onerror`. If `onerror` itself throws, it falls back to `console.error`. Exceptions never break the load/queue pipeline.

## Methods

### `oTo.preload(name)`

Loads a part in the background without calling it. Useful for pre-fetching parts you'll need soon.

```js
oTo.preload('editor');
// later...
oTo.editor({ target: '#main' }); // already loaded, executes immediately
```

Calls made while preloading are queued and flushed once the part registers.

### `oTo.unload(name)`

Removes a loaded part completely — clears the cache, removes the `<script>` tag (browser) or `require.cache` entry (Node), and deletes the property from `oTo`.

```js
oTo.unload('gallery');
oTo.gallery({ target: 'main' }); // re-downloads the file
```

### `oTo.status(name?)`

Returns loading state information.

```js
// Single part
oTo.status('gallery');
// → { status: 'loaded', queued: 0 }
// → { status: 'loading', queued: 3 }
// → { status: 'error', queued: 0 }
// → null (never requested)

// All parts
oTo.status();
// → { gallery: { status: 'loaded', queued: 0 }, editor: { status: 'loading', queued: 1 } }
```

## Call queueing

When a part is still loading, calls are queued and executed in order once the part registers:

```js
// All three calls are made before gallery.js finishes loading
oTo.gallery({ target: 'main' });
oTo.gallery({ target: 'sidebar' });
oTo.gallery({ target: 'footer' });
// → all three execute in order once gallery.js loads
```

If a queued call throws, the error is caught and forwarded to `onerror` without stopping the remaining queued calls.

## Error retry

Failed parts automatically retry on the next call:

```js
oTo.gallery({ target: 'main' }); // fails (404, timeout, etc.)
// onerror fires

oTo.gallery({ target: 'main' }); // retries — new script injection
```

## Part name rules

Part names must match `[a-zA-Z0-9_-]+`. Invalid names are silently ignored. Reserved names (`then`, `toJSON`, `valueOf`, `toString`, `constructor`, `inspect`, `nodeType`, `tagName`, `__proto__`, `__defineGetter__`, `__defineSetter__`, `__lookupGetter__`, `__lookupSetter__`) return `undefined` to prevent conflicts with browser/framework introspection.

Config keys (`path`, `partsPath`, `alias`, `timeout`, `onerror`, `onload`, `unload`, `preload`, `status`) cannot be used as part names and are protected from accidental deletion.

## Practical use cases

| Use case | How oTo helps |
|---|---|
| **Multi-page site with shared features** | Put common widgets (modals, galleries, forms) as parts. Each page calls only what it needs — no monolithic bundle. |
| **Progressive enhancement** | The base page loads fast. Heavy features (maps, editors, charts) load only when the user triggers them. |
| **Plugin architecture** | Third parties or teammates add features by dropping a file in `/parts/`. No build step, no config change — just name it and call it. |
| **Prototyping / internal tools** | Quick setup with zero tooling. Add a file, refresh, it works. Good for dashboards, admin panels, internal apps where build pipelines are overkill. |
| **Server-side feature loading** | Same pattern works in Node.js/Bun for lazy-loading modules on demand. |
| **Legacy browser environments** | Uses `var`, no arrow functions, no `import` — works in older browsers. The Proxy requirement is the only modern dependency (IE11 excluded). |

## Proxy behavior

| Trap | Behavior |
|---|---|
| `get` | Returns config/methods directly. Unknown names return a loader wrapper. Symbols and reserved names return `undefined`. |
| `set` | Updates config or registers a part. Reserved names are silently blocked. Part registration marks it as loaded and flushes its queue. |
| `deleteProperty` | Clears cache and path cache for parts. Config and reserved keys are protected from deletion. |
| `has` | Returns `true` if the property exists on target or is loaded in cache. |

## License

[EUPL](https://eupl.eu/)
