# References

- [Build your own React](https://pomb.us/build-your-own-react/)

# Time

2 days

# Notes

## Compile with Babel

Install Babel tools chain:

```
npm install --save-dev @babel/core @babel/cli @babel/preset-env 
```

Install react preset:

```
npm i --save-dev @babel/preset-react
```

Put this setting in your `babel.config.json`:

```
{
  "presets": ["@babel/preset-react"]
}
```

Add this comment before your JSX code:

```
/** @jsx <yourOwnCreateElementFunction> */
```

For example:

```
/** @jsx MiniReact.createElement */
const element = (
    <div id="foo">
        <p>hello, world</p>
    </div>
)
```

Then run:

```
./node_modules/.bin/babel <your-react.js> --out-dir <out-dir>
```

In `<out-dir>` you can find the compiled files.