const { FusesPlugin } = require('@electron-forge/plugin-fuses');
const { FuseV1Options, FuseVersion } = require('@electron/fuses');

module.exports = {
  packagerConfig: {
    asar: true,
  },
  rebuildConfig: {},
  makers: [
    {
      name: '@electron-forge/maker-squirrel',
      config: {
        certificateFile: './cert.pfx',
        certificatePassword: process.env.CERTIFICATE_PASSWORD
      },
    },
    {
      name: '@electron-forge/maker-zip',
      platforms: ['darwin'],
    },
    {
      name: '@electron-forge/maker-deb',
      config: {},
    },
    {
      name: '@electron-forge/maker-rpm',
      config: {},
    },
  ],
  plugins: [
    // {
    //   name: "@electron-forge/plugin-vite",
    //   config: {
    //     authors: "Adrian Zguri",
    //     description: "Photo name changer",
    //     // `build` can specify multiple entry builds, which can be Main process, Preload scripts, Worker process, etc.
    //     // If you are familiar with Vite configuration, it will look really familiar.
    //     build: [
    //       {
    //         // `entry` is just an alias for `build.lib.entry` in the corresponding file of `config`.
    //         entry: "src/main.js",
    //         config: "vite.main.config.js",
    //       },
    //       {
    //         entry: "src/preload.js",
    //         config: "vite.preload.config.js",
    //       },
    //     ],
    //     renderer: [
    //       {
    //         name: "main_window",
    //         config: "vite.renderer.config.js",
    //       },
    //     ],
    //   },
    // }
  ],
};
