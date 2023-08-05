# snappet
> store, manage and switch between your config files easily

## 🔨 Install
You can install `snappet` either through `npm` or `npx`.

```properties
$ npm i snappet
```

```properties
$ npx snappet <command> [options]
```

Please keep in mind that `npm` versions below version 16 are not tested and supported.

## 💡 Usage

`snappet` is based on storing and managing saved "snapshots" of your files. A "snapshot" is a saved state of a file stored locally that can be accessed at any time. This can be particularly useful for configuration files.

### Add
To get started, add a snapshot with the `add` command:
```bash
$ snappet add myOldConfig utils.lua
```
You can add more than one filepath:
```bash
$ snappet add myNewConfig plugins.lua utils.lua
```
`snappet` takes the current state of those files and saves them locally.
### List
In order to see all your saved snapshots, use the `list` command:
```bash
$ snappet list
Saved snapshots:
    - myOldConfig: utils.lua
    - myNewConfig: plugins.lua, utils.lua
```
### Switch
If you want to switch between snapshots, you can use the `switch` command:
```bash
$ snappet switch myOldConfig
Switched to myOldConfig
  Files affected:
    - utils.lua
```
Switching snapshots rewrites files to the saved state of that snapshot.

### Remove
In case you want to remove a snapshot, use the `remove` command:
```bash
$ snappet remove myNewConfig
```
You can also remove all snapshots with the `--all` flag.

```bash
$ snappet remove --all
```

## ❗ Note
Please be aware that `snappet` is not designed for creating backups of important files. All data is saved in the `snapshots.json` file, making it unsuitable for reliable backup purposes.

## 🚧 Contributing

Any contributions to this project are appreciated. If you have any ideas/suggestions/bug fixes, please open an [issue](https://github.com/ad4mx/snappet/issues) or a [pull request](https://github.com/ad4mx/snappet/pulls). If you like the project, mind [starring it](https://github.com/ad4mx/snappet) on Github.

## 📑 License

This package is licensed under the [MIT](./LICENSE) license.

