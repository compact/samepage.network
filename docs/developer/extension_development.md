---
title: Extension Development
description: In-depth guide on how to create a SamePage-compatible extension
---

Developing a SamePage extension is made far easier by use of the `samepage` NPM package. It helps aid in developer productivity and uniformity across extensions.

At any point in this guide, developers could instead feel free to swap out an individual method with a custom implementation of the protocol. If you choose to do so, we would appreciate a GitHub issue opened on the [monorepo](https://github.com/samepage-network/samepage.network/issues) explaining how the supported packages fell short.

The packages aims for a philosophy of "smart defaults, yet extendable". Most parameters to most methods are optional so that differences within individual tools for thought could override them. The package requires importing methods **directly** so that tree shaking is made possible and we are sending the least amount of code possible to users. For example, instead of:

```typescript
import { setupSamePageClient } from "samepage";
```

we require:

```typescript
import setupSamePageClient from "samepage/protocols/setupSamePageClient";
```

Most extensions should only need the `samepage` NPM package. However, it could be useful to only install a subset of the package, say if you are developing a build tool or a component library for the tool you're targeting. For this case, the `NPM` package is also published as a series of scoped `@samepage` packages which are each individually installable. To use, the same imports as before should work by simply adding the `@` in front of the module name. So for example, instead of:

```typescript
import build from "samepage/scripts/build";
```

we also support:

```typescript
import build from "@samepage/scripts/build";
```

Throughout this guide, we would encourage referencing the extension implementation of existing supported clients as examples on how each application interacts with SamePage.

## Architecture of an extension

All extensions should have the following file structure:

- `.github/workflows` - One action called `main.yaml`, which watches for changes on the `main` branch and publishes the newest version of the extension to SamePage and the relevant tool's extension store. A second called `test.yaml` which runs tests on changes in the `main` branch and on PR branches.
- `src` - The directory containing all of the source code for the extension
- `test` - The directory containing all of the tests for the extension
- `.gitignore` - Standard ignore file
- `LICENSE` - Must be MIT
- `README.md` - Docs for using the extension on the relevant tool
- `package-lock.json` - Auto generated after install
- `package.json` - Should contain scripts for `start` and `test`, as well as have the latest version of `samepage` as a package dependency.
- `tsconfig.json` - Configuration for building the extension. We require our extensions to be in TypeScript.

Extensions are expected to run on the browser or anything that supports browser APIs (e.g. electron).

## Implementing the protocol

A SamePage-compatible extension needs to handle four parts:
- Decide where to store and display user settings
- Setting up the SamePage client
- Setting up all of the _protocols_ the extension wants to support
- Have a way to call all of the unload methods produced from above

These four pieces usually take place at the entry point file of the extension. We will break down what each of these entails below.

### User Settings

Tools for thought typically will designate an area for users to configure their extension's settings. We expose the default list of settings that SamePage extensions are expected to implement:
- `uuid` - The Notebook Universal ID that represents the user's notebook.
- `token` - The Notebook Token that authenticates the notebook to the network.
- `auto-connect` - A flag that automatically connects the user to the SamePage network when they are logged in.
- `granular-changes` - An experimental flag for sending granular changes between clients instead of full page refreshes.

Extensions are free to configure additional settings on top of this set, but these are the base requirement. These settings must be persisted between sessions so that their value is retained when the user reloads the host app. To ease in configuring these settings, look to import the `defaultSettings` object from the `utils` module:

```typescript
import defaultSettings from "samepage/utils/defaultSettings";

const settings = defaultSettings.map((d) => ({
    id: d.id,                   // string
    name: d.name,               // string
    description: d.description, // string
    value: d.default            // boolean or string
    type: d.type                // "boolean" or "string"
}))
```

### Setup Client

The SamePage Client is a `WebSocket` client that connects to SamePage's WebSocket API Gateway. It should register the host app's Notebook properties (the application id and the workspace name), know how to receive user commands, and how to interact with the user settings from above. The `protocols` module exposes a strongly typed `setupSamePageClient` method to help guide developers on all of the pieces needed to setup the client. All fields are optional with some basic defaults, though the developer should overwrite the following fields below:

```typescript
import setupSamePageClient from "samepage/protocols/setupSamePageClient";

const { unload, ...globalAPI } = setupSamePageClient({
  // Notebook properties
  app: "Roam",
  workspace: "dvargas92495",

  // Interact with settings
  getSetting: (s) => localStorage.getItem(s),
  setSetting: (s, v) => localStorage.setItem(s, v),

  // Interact with user
  addCommand: window.roamAlphaAPI.ui.commandPalette.addCommand,
  removeCommand: window.roamAlphaAPI.ui.commandPalette.removeCommand,
});
```

The setup method returns an `unload` prop, and a set of methods that make up the [Global API](./global_api.md). It also accepts a few other properties aimed at smoothing out differences between apps. For those, please consult the full [NPM API](./npm_api.md). This method will also attach some WebSocket listeners so that it's ready to accept data.

### Setup Protocols
Coming soon...

### Cleanup on Unload
Coming soon...

## Dev Environment
Coming soon...

### TypeScript
Coming soon...

### Styling
Coming soon...

### Dev
Coming soon...

### Test
Coming soon...

### Build
Coming soon...

### Publish
Coming soon...