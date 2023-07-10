# Monocosme

![frog](frog.jpeg)

**Monocosme** is a _TypeScript_ based live coding platform. It offers infinite amount of 2D universes on which you can lay down ideas using ASCII symbols before turning them into music by scripting them. **Monocosme** is work in progress. We are still in the alpha stage of implementation. You can test it by visiting [https://monocosme.raphaelforment.fr](https://monocosme.raphaelforment.fr).

## Design goals

I love the [Teletype](https://monome.org/docs/teletype/) which has recently been discontinued (although still maintained as an open-source/open-hardware project). I also like [ORCA](https://github.com/hundredrabbits/Orca) but for various reasons, I don't see myself making music with it. In the past years, I encountered people doing interesting art by manipulating ASCII characters and the web browser as a creative medium. This application is an attempt at creating a similar tool, inspired by all of these but with a personal twist. This application is meant to stay simple and to embrace the minimalism of similar interfaces. There is no real plan for the development of this software but here are some design principles:

- [ ] **Web-based**
  - no installation process, easily accessible. Click and boom.
  - storing state directly in the browser. Sharing using links.
  - Browser-based DSP: WebAudio, FAUST, etc... Modern stuff.
- [ ] **Fun, small, easy to grasp**
  - Limited set of features but everything is easily scriptable.
  - Robust I/O (MIDI, OSC?) for interaction with other tools.
  - Embedded documentation, everything in the same page/app.

I am not a web developer and I kinda want to learn to love the web despite all its flaws. This project is also thought as a way to teach myself some TypeScript and some of the modern dev tooling (`node`, etc..).

## Running the software

### Running the dev server

This project is a [NodeJS](https://nodejs.org/en) based application developed using [Vite](https://vitejs.dev/). You can install it on your computer rather easily:
- clone the project using [Git](https://git-scm.com/): `git clone https://github.com/Bubobubobubobubo/Monoscome`
- install using `npm install`
- run using `npm run dev`

### Running in the browser

Just visit: [https://monocosme.raphaelforment.fr](https://monocosme.raphaelforment.fr).