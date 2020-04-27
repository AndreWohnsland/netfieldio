#!/usr/bin/env node

const { program } = require('commander');
const netfieldio = require('./netfieldHelper')


program
  .version('0.0.1');

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
  .requiredOption('-oc, --config-container <path>', 'path to the config.JSON for the container, identical to the create one')
  .option('-od, --config-device <path>', 'path to the config.JSON for the device, can be empty')
  .option('-v, --verbose', 'activate rich output/debugging')
  .action((options) => {
    netfieldio.createAndDeployContainer(options.key, options.tag, options.configContainer, options.configDevice, options.device, options.verbose);
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
  .option('-od, --config-device <path>', 'path to the config.JSON, only if other parameters than default container options')
  .option('-v, --verbose', 'activate rich output/debugging')
  .action((options) => {
    netfieldio.deployContainer(options.key, options.device, options.container, options.configDevice, options.verbose);
  })
  .on('--help', () => {
    console.log('\nNeed the apikey, id of the container and the device.');
    console.log('Please refer to the docs or the official netfieldio API for the structure of the JSON.');
    console.log('Only contains values wich differ from standard container config.\n');
  });

program
  .command('updateAndRedeployContainer')
  .alias('udc')
  .description('Update an existing container, delete and redeploy it to a given device')
  .requiredOption('-k, --key <key>', 'api key from netfieldio')
  .requiredOption('-t, --tag <string>', 'version tag of the image')
  .requiredOption('-c, --container <id>', 'container id of the container to update')
  .requiredOption('-d, --device <id>', 'device id of the device to redeploy to')
  .requiredOption('-oc, --config-container <path>', 'path to the config.JSON for the container, identical to the create one')
  .option('-od, --config-device <path>', 'path to the config.JSON for the device, can be empty')
  .option('-v, --verbose', 'activate rich output/debugging')
  .action((options) => {
    netfieldio.updateAndRedeployContainer(options.key, options.device, options.container, options.tag, options.configContainer, options.configDevice, options.verbose);
  })
  .on('--help', () => {
    console.log('\nNeed the apikey, url and tag of the image, id of the container and the device.');
    console.log('Please refer to the docs or the official netfieldio API for the structure of the JSON.');
    console.log('Not needed values should left blank and must not be deleted in the containerconfig!');
    console.log('The device config only contains values wich differ from standard container config.\n');
  });

program.parse(process.argv);
