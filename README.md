# Terrible App

## TODO

## Graphics 

- [ ] Fixing remaining grid glitches
- [ ] Adding an optional tertiary color for every CSS theme
- [ ]

## Input

- [ ] Copy and Paste are shared with the system (copy and paste ASCII art from browser)
- [ ] Fix bug when the ² key is entered in the command-line prompt

## Design / Architecture

- [ ] Why can't we import any module? ESBuild not working + Vite unable to resolve dependencies
- [ ] Serve multiple running environments
  - [ ] Web Browser (with node modules)
  - [ ] Desktop Env (with Tauri / Electron)

- [ ] **TAB** key should switch to a script editor for the current universe.
  - controls and appearance should be similar, the script is executed every tick.
  - determine a suitable scripting language for that environment. 
  - Scripts are supposed to be minimal. They should fit in x lines of y characters each.
  - the script is tied to a universe and will activate stuff in that universe.

- [ ] **Adding more commands**
  - [ ] **Beware of redundancies between script mode and command-line operations**
  - [ ] Universe merging