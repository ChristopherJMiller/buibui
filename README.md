<div align="center">
    <img src="src-tauri/icons/32x32.png">
    <span style="font-size: 32"><b>Bui Bui</b></span>
</div>
<p align="center" style="text-align: center">A Cross Platform Super Mario World Hack Manager</p>
<div align="center" style="justify-content: center; width: 100%; display: flex; align-items: center; gap: 10px;">
<img alt="GitHub release (with filter)" src="https://img.shields.io/github/v/release/ChristopherJMiller/buibui">
<img alt="GitHub issues" src="https://img.shields.io/github/issues/ChristopherJMiller/buibui">

</div>

# Features

- Infinite Scroll Super Mario World Central Gallery Browsing
- One-Click Hack Patching via "Add to Collection"
- Launch hacks right from Bui Bui!
- Cross Platform (thanks to [Tauri](https://tauri.app/))

<div style="height: 300px; display: flex; justify-content: center;">
    <img src=".github/assets/screenshot.png" style="box-shadow: 4px 2px 4px #000000;" />
</div>

# Roadmap

See [our task board](https://github.com/users/ChristopherJMiller/projects/1) and [filed issues](https://github.com/ChristopherJMiller/buibui/issues) to see what's on the horizon.

# Contributing

Thank you for your interest in contributing!

**Set Up**

1. Install [Node](https://nodejs.org/en), [Yarn](https://classic.yarnpkg.com/lang/en/docs/install), and [Rustup](https://rustup.rs/).
2. Install Node dependencies with `yarn install`
3. Run Bui Bui in dev mode with `yarn tauri dev`

**Organization**

- `src-tauri` contains the Rust backend
- `src` contains the React Typescript frontend
  - The frontend uses Redux for all of it's state management
