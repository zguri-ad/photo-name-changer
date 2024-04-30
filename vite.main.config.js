const defineConfig = require("vite");

// https://vitejs.dev/config
module.exports = defineConfig({
  resolve: {
    // Some libs that can run in both Web and Node.js, such as `axios`, we need to tell Vite to build them in Node.js.
    browserField: false,
    conditions: ["node"],
    mainFields: ["module", "jsnext:main", "jsnext"],
  },
});