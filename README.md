# oTo — Object Transport Object v1

## What it is

A ~40-line browser-side lazy module loader built on `Proxy`. It gives you a single global object (`oTo`) where any method call automatically fetches and executes a matching JavaScript file from the server, then runs the function it defines.

It is **not** a bundler, a framework, or a module system like ES modules or CommonJS. It is a thin runtime that turns property access into on-demand `<script>` injection.

## How it works internally

1. `oTo` is a `Proxy` wrapping a config object with `path`, `partsPath`, `alias`, and a `js()` script-loader utility.
2. When you access a property that **exists** on the config (like `oTo.path`), it returns it directly.
3. When you access a property that **doesn't exist** (like `oTo.gallery`), the proxy returns a wrapper function.
4. Calling that function (`oTo.gallery({...})`) triggers `js()` which injects a `<script src="/oTo/parts/gallery.js">` tag into `<head>`.
5. Once the script loads, the callback checks if `oTo.gallery` now exists (because the loaded file should have attached it), and if so, invokes it with the original arguments.

## How to use it

### 1. Include oTo in your page

```html
<script src="/oTo/oTo.js"></script>
```

### 2. Create part files — one per feature

Each file goes in the parts folder and attaches itself to the `oTo` object:

```js
// /oTo/parts/gallery.js
oTo.gallery = function (opts) {
    document.getElementById(opts.target).innerHTML = '<div class="gallery">...</div>';
};
```

```js
// /oTo/parts/analytics.js
oTo.analytics = function (opts) {
    console.log('Page view:', opts.page);
};
```

### 3. Call features from your page — they load automatically

```js
oTo.gallery({ target: 'main', images: ['a.jpg', 'b.jpg'] });
oTo.analytics({ page: '/home' });
```

The first call downloads the file. Subsequent calls hit the already-loaded function directly (no second download).

### 4. Optional: set an alias

```js
oTo.alias = 'app';
// now you can also use:
app.gallery({ target: 'main' });
```

### 5. Optional: change the base path

```js
oTo.path = '/assets/lib';
oTo.partsPath = '/modules';
// parts now load from /assets/lib/modules/{name}.js
```

## Practical use cases

| Use case | How oTo helps |
|---|---|
| **Multi-page site with shared features** | Put common widgets (modals, galleries, forms) as parts. Each page calls only what it needs — no monolithic bundle. |
| **Progressive enhancement** | The base page loads fast. Heavy features (maps, editors, charts) load only when the user triggers them. |
| **Plugin architecture** | Third parties or teammates add features by dropping a file in `/parts/`. No build step, no config change — just name it and call it. |
| **Prototyping / internal tools** | Quick setup with zero tooling. Add a file, refresh, it works. Good for dashboards, admin panels, internal apps where build pipelines are overkill. |
| **Legacy browser environments** | Uses `var`, no arrow functions, no `import` — works in older browsers. The Proxy requirement is the only modern dependency (IE11 excluded). |

## Current limitations

- **Fire-and-forget**: Callers get `undefined` back, not the function's return value. The load is asynchronous but the API looks synchronous — there's no Promise or callback to chain on.
- **No error handling**: If a part file 404s or throws, nothing reports it.
- **No deduplication**: Calling the same unloaded part twice simultaneously injects duplicate `<script>` tags.
- **Single argument**: The wrapper forwards one `args` parameter, so pass an object if you need multiple values.
- **No unloading**: Once a part is loaded, it stays. There's no mechanism to remove or reload parts.

## Summary

oTo is a minimal "call it and it loads" pattern. It's useful when you want on-demand script loading with zero configuration and no build tools — ideal for small-to-medium projects, internal tools, or environments where simplicity and no-dependency setups matter more than production-grade module management.

## License

[EUPL](https://eupl.eu/)
