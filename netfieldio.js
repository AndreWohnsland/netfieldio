#!/usr/bin/env node

const { program } = require('commander');
const netfieldio = require('./netfieldHelper');
const { deployContainer, deployContainerOnGroup } = require('./netfieldHelper');

program.version('1.2.1');

function myParseInt(value, dummyPrevious) {
  return parseInt(value);
}

program
  .command('createContainer')
  .alias('cc')
  .description('Create a container on the gateway')
  .requiredOption('-k, --key <key>', 'api key from netfieldio')
  .requiredOption('-t, --tag <string>', 'version tag of the image')
  .requiredOption('-oc, --config-container <path>', 'path to the config.JSON file')
  .option('-v, --verbose', 'activate rich output/debugging')
  .action((options) => {
    netfieldio.createContainer(options.key, options.tag, options.configContainer, options.verbose);
  })
  .on('--help', () => {
    console.log('\nNeed the apikey, tag of the image, and a JSON file with all the container options.');
    console.log('Please refer to the docs or the official netfieldio API for the structure of the JSON.');
    console.log('Not needed values should left blank and must not be deleted!\n');
  });

program
  .command('createAndDeployContainer')
  .alias('cdc')
  .description('Create a container on the gateway and deploy it to the given device')
  .requiredOption('-k, --key <key>', 'api key from netfieldio')
  .requiredOption('-t, --tag <string>', 'version tag of the image')
  .requiredOption('-d, --device <id>', 'device id of the device to deploy to')
  .requiredOption(
    '-oc, --config-container <path>',
    'path to the config.JSON for the container, identical to the create one'
  )
  .option('-od, --config-device <path>', 'path to the config.JSON for the device, can be empty')
  .option('-f --force', 'enforcing deployment of container (deletes existing one)')
  .option('-v, --verbose', 'activate rich output/debugging')
  .action((options) => {
    netfieldio.createAndDeployContainer(
      options.key,
      options.tag,
      options.configContainer,
      options.configDevice,
      options.device,
      options.force,
      options.verbose
    );
  })
  .on('--help', () => {
    console.log('\nNeed the apikey, the device id, tag of the image, and a JSON file with all the container options.');
    console.log('Please refer to the docs or the official netfieldio API for the structure of the JSON.');
    console.log('Not needed values should left blank and must not be deleted!');
    console.log('The device config only contains values wich differ from standard container config.\n');
  });

program
  .command('deployContainer')
  .alias('dc')
  .description('Deploy an existing container to a given device')
  .requiredOption('-k, --key <key>', 'api key from netfieldio')
  .requiredOption('-c, --container <id>', 'container id of the container to update')
  .requiredOption('-d, --device <id>', 'device id of the device to redeploy to')
  .option(
    '-od, --config-device <path>',
    'path to the config.JSON, only if other parameters than default container options'
  )
  .option('-f --force', 'enforcing deployment of container (deletes existing one)')
  .option('-v, --verbose', 'activate rich output/debugging')
  .action((options) => {
    netfieldio.deployContainer(
      options.key,
      options.device,
      options.container,
      options.configDevice,
      options.force,
      options.verbose
    );
  })
  .on('--help', () => {
    console.log('\nNeed the apikey, id of the container and the device.');
    console.log('Please refer to the docs or the official netfieldio API for the structure of the JSON.');
    console.log('Only contains values wich differ from standard container config.\n');
  });

program
  .command('deployContainerOnGroup')
  .alias('dcog')
  .description('Deploy an existing container to every device in a group')
  .requiredOption('-k, --key <key>', 'api key from netfieldio')
  .requiredOption('-c, --container <string>', 'name of the container')
  .requiredOption('-g, --group <id>', 'group id of the group to deploy to')
  .option(
    '-od, --config-device <path>',
    'path to the config.JSON, only if other parameters than default container options'
  )
  .option('-f --force', 'enforcing deployment of container (deletes existing one)')
  .option('-v, --verbose', 'activate rich output/debugging')
  .action((options) => {
    netfieldio.deployContainerOnGroup(
      options.key,
      options.group,
      options.container,
      options.configDevice,
      options.force,
      options.verbose
    );
  })
  .on('--help', () => {
    console.log('\nNeed the apikey, id of the group, name of the container.');
    console.log('Please refer to the docs or the official netfieldio API for the structure of the JSON.');
    console.log('Only contains values wich differ from standard container config.\n');
  });

program
  .command('postMethod')
  .alias('pm')
  .description('Post a Method to a given container at a device')
  .requiredOption('-k, --key <key>', 'api key from netfieldio')
  .requiredOption('-c, --container <string>', 'name of the container')
  .requiredOption('-m, --method <string>', 'name of the method to call')
  .requiredOption('-d, --device <id>', 'device id of the device to redeploy to')
  .option('-p, --payload <string>', 'object like string of the argument payload for the method')
  .option('-v, --verbose', 'activate rich output/debugging')
  .option('-mr, --maxretries <int>', 'amount of retries in case of 404', myParseInt)
  .option('-si, --sleepinterval <int>', 'time between each retry', myParseInt)
  .action((options) => {
    netfieldio.postMethod(
      options.key,
      options.device,
      options.container,
      options.method,
      options.payload,
      options.maxretries,
      options.sleepinterval,
      options.verbose
    );
  })
  .on('--help', () => {
    console.log('\nNeed the apikey, id of the device, name of the container and a method.');
    console.log('The payload is dependent from the method and may or may not be required.');
    console.log('Retries and sleepintervall is for the case the request returns a 404 response.\n');
  });

program.parse(process.argv);
