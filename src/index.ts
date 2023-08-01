#!/usr/bin/env node
import { Command } from "commander";
import fs from "fs";
import path from "path";
import { bold, red, underline } from "colorette";

const cli = new Command();
const SNAPSHOT_FILE = path.resolve(__dirname, "../snapshots.json");

interface Config {
  name: string;
  data: string;
  path: string;
  active: boolean;
}

function loadSnapshots(): Config[] {
  try {
    const content = fs.readFileSync(SNAPSHOT_FILE, "utf-8");
    return JSON.parse(content) || [];
  } catch {
    return [];
  }
}

function saveSnapshots(configs: Config[]) {
  fs.writeFileSync(SNAPSHOT_FILE, JSON.stringify(configs, null, 2));
}

function findSnapshotByName(name: string, configs: Config[]): Config | undefined {
  return configs.find((config) => config.name === name);
}

cli
  .name("snappet")
  .version("0.1.0")
  .description("store, manage and switch between your config files easily")
  .showSuggestionAfterError(true);

cli
  .command("add <name> <filepaths...>")
  .description("add new snapshots")
  .action(async (name: string, filepaths: string[]) => {
    const configs = loadSnapshots();
    if (findSnapshotByName(name, configs)) {
      console.error(red(`A snapshot with the name '${name}' already exists.`));
      return process.exit(1);
    }
    const newConfigs: Config[] = [];
    for (const filepath of filepaths) {
      try {
        const content = fs.readFileSync(filepath, "utf-8");
        const newFile: Config = {name, data: content, path: path.resolve(filepath), active: true};
        newConfigs.push(newFile);
      } catch {
        console.error(
          red("A file couldn't be found - check if your filepath is valid")
        );
        return process.exit(1);
      }
    }
    configs.forEach((config) => (config.active = false));
    configs.push(...newConfigs);
    saveSnapshots(configs);

    console.log(bold(`Snapshot ${name} successfully added`));
    return process.exit(0);
  });

cli
  .command("list")
  .description("list all saved snapshots")
  .action(() => {
    const configs = loadSnapshots();
    if (configs.length === 0) {
      console.log(bold("Saved snapshots:"));
      console.log("  You currently have no saved snapshots");
    } else {
      console.log(bold("Saved snapshots:"));
      const groupedConfigs = configs.reduce((groups: any, config) => {
        if (groups[config.name]) {
          groups[config.name].push(config.path);
        } else {
          groups[config.name] = [config.path];
        }
        return groups;
      }, {});
      for (const name in groupedConfigs) {
        console.log(
          ` - ${underline(name)}: ${groupedConfigs[name].join(", ")}`
        );
      }
    }
    return process.exit(0);
  });

cli
  .command("remove [name]")
  .description("remove a snapshot")
  .option("-a, --all", "remove all snapshots")
  .action((name: string, options?: { all?: boolean }) => {
    const configs = loadSnapshots();
    if (options?.all) {
      saveSnapshots([]);
      console.log(bold("All snapshots were removed"));
    } else {
      const matchingConfigs = configs.filter((config) => config.name === name);
      if (matchingConfigs.length === 0) {
        console.error(red(`Snapshot "${name}" not found`));
        return process.exit(1);
      }
      const newConfigs = configs.filter((config) => config.name !== name);
      saveSnapshots(newConfigs);
      console.log(bold(`Snapshot ${name} was removed`));
    }
    return process.exit(0);
  });

cli
  .command("switch <name>")
  .description("switch between snapshots")
  .action((name: string) => {
    const configs = loadSnapshots();
    let hasActiveSnapshot = false;

    const matchingConfigs = configs.filter((config) => {
      if (config.name === name) {
        hasActiveSnapshot = config.active;
        return true;
      }
      return false;
    });
    if (matchingConfigs.length === 0) {
      console.error(red(`Snapshot "${name}" not found`));
      return process.exit(1);
    }
    if (hasActiveSnapshot) {
      console.log(bold(`Snapshot "${name}" is already in use`));
      return process.exit(0);
    }
    for (const config of configs) {
      config.active = config.name === name;
      fs.writeFileSync(config.path, config.data);
    }
    saveSnapshots(configs);
    console.log(
      `${bold(`Switched to snapshot ${name}`)}\n${bold("Files affected:")}`
    );
    for (const config of matchingConfigs) {
      console.log(`  - ${config.path}`);
    }
    console.log(bold("For changes to take effect, restart the terminal"));
    return process.exit(0);
  });

cli.parse();
