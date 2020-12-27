2020-12-27 15:39:24 

Finished the layout, now, the app is Typescript + React + Eletron;

To run the react:

```
npm run react-start
```

To run the eletron in dev:

```
npm start
```

In electron app, it would load the localhost url to load the page. So, for test/dev, set the URL to `http://locahost:3000`, and to load the built app, load file: `build/index.html`; Have set the `homepage` in `package.json` to `./build` to make the 'base' URL correct.
