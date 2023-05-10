#!/usr/bin/env node
import { Command } from 'commander';
import fs from 'fs';
import path from 'path';
import { bold, red } from 'colorette';
const cli = new Command();

cli
  .name('snappet')
  .version('0.1.0')
  .description('easily switch between terminal config settings')
  .showSuggestionAfterError(true);

type Config = {
  name: string,
  data: string,
  path: string
};

const SNAPSHOT_FILE = path.resolve(__dirname, '../snapshots.json')

function loadSnapshots(): Config[] {
  try {
    const content = fs.readFileSync(SNAPSHOT_FILE, 'utf-8');
    const snapshots = JSON.parse(content);
    if (snapshots.length > 0) {
      return snapshots;
    } else {
      return [];
    }
  } catch  {
    return [];
  }
}

function saveSnapshots(configs: Config[]): void {
  fs.writeFileSync(SNAPSHOT_FILE, JSON.stringify(configs, null, 2));
}

cli
  .command('add <name> <filepaths...>')
  .description('add new snapshots')
  .action((name: string, filepaths: string[]) => {
    const configs = loadSnapshots();
    if (configs.some((file: Config) => file.name === name)) {
      console.error(red(`A snapshot with the name '${name}' already exists.`));
      return process.exit(1);
    }
    for (let filepath of filepaths) {
      const content = fs.readFileSync(filepath, 'utf-8');
      const newFile: Config = { name, data: content, path: path.resolve(filepath) };
      configs.push(newFile);
    }

    saveSnapshots(configs);
    console.log(bold(`Snapshot ${name} successfully added`));
    return process.exit(0);
  });

cli
  .command('list')
  .description('list all saved snapshots')
  .action(() => {
    const configs = loadSnapshots();

    if (configs.length === 0) {
      console.log(bold("Saved snapshots:"));
      console.log("  You currently have no saved snapshots");
      return process.exit(0);
    }

    console.log(bold("Saved snapshots:"));
    for (let config of configs) {
      console.log(" -" + config.name + `: ${config.path}`)
    }
    return process.exit(0);
  });

cli
  .command('remove <name>')
  .description('remove a snapshot')
  .action((name: string) => {
    const configs = loadSnapshots();
    const matchingConfigs = configs.filter(config => config.name === name);

    if (matchingConfigs.length === 0) {
      console.error(red(`Snapshot "${name}" not found`));
      return process.exit(1);
    }

    const newConfigs = configs.filter(config => config.name !== name);
    saveSnapshots(newConfigs);
    console.log(bold(`Snapshot ${name} was removed`));
    return process.exit(0);
  });

cli
  .command('switch <name>')
  .description('switch between')
  .action((name: string) => {
    const configs = loadSnapshots();
    const matchingConfigs = configs.filter(config => config.name === name);

    if (matchingConfigs.length === 0) {
      console.error(red(`Snapshot "${name}" not found`));
      return process.exit(1);
    }

    for (let config of matchingConfigs) {
      fs.writeFileSync(config.path, config.data);
    }
    console.log(`${bold(`Switched to snapshot ${name}`)}\n${bold('Files affected:')}`);
    for (const config of matchingConfigs) {
        console.log(`  - ${config.path}`);
    }
    console.log('');
    return process.exit(0);

  })

cli.parse()