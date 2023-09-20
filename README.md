# fileson-browser

Simple visualisation tool for [fileson](https://github.com/jokkebk/fileson) `.fson` files.

## Installation

You can `git clone` this repository and install required dependencies with `npm install` (or `pnpm install` or `yarn`).

## Running

Once you've created a project and installed dependencies, start a development server:

```bash
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

To create a production version of your app:

```bash
npm run build
```

Thanks to
[vite-plugin-singlefile](https://github.com/richardtallent/vite-plugin-singlefile),
the build output is a single HTML file with all the JavaScript and CSS inlined.
You can just double-click the `dist/index.html` file to open it in your
browser.