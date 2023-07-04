# Terrible App

Once again, working on that grid. To make it work:
- install TypeScript `npm install typescript --save-dev`
- run the TypeScript compiler in watch mode `npx tsc -w`
- run a local server

Compiled _JavaScript_ files will be stored in the `dist` folder.

## TODO

- Restore zone cursor and copy/paste/cut mechanism
- Pressing tab should switch to the script editor for the current universe
  - the script is called every X ticks (currently no clock)
  - the script is tied to that universe and will not be able to play with data from other universes
- Fix InputHandling to prevent a key from running multiple handlers (how?)