const { program } = require('commander');
const pino = require('pino');
const netfieldio = require('.');

const logger = pino({ level: process.env.LOG_LEVEL || 'info' });

async function getDeviceConfig(configFile) {
  let containerOption = '{}';
  if (configFile !== undefined) {
    containerOption = await netfieldio.getConfigDataFromJson(configFile);
  }
  return containerOption;
}

async function getContainerConfig(configFile, tagName) {
  let configData = await netfieldio.getConfigDataFromJson(configFile);
  configData = JSON.parse(configData);
  configData.tagName = tagName;
  return configData;
}


async function createContainer(apiKey, tagName, containerConfigFile) {
  logger.info('- Release:'.padEnd(20), tagName);
  logger.info('- Config Container:'.padEnd(20), containerConfigFile);

  const configData = await getContainerConfig(containerConfigFile, tagName);

  const responseCreate = await netfieldio.createContainer(apiKey, configData);
  return responseCreate;
}

async function createAndDeployContainer(apiKey, tagName, containerConfigFile, deviceConfigFile, deviceId) {
  logger.info('- Release:'.padEnd(20), tagName);
  logger.info('- Device:'.padEnd(20), deviceId);
  logger.info('- Config Container:'.padEnd(20), containerConfigFile);
  logger.info('- Config Device:'.padEnd(20), deviceConfigFile);

  const configData = await getContainerConfig(containerConfigFile, tagName);
  const containerOption = await getDeviceConfig(deviceConfigFile);

  let responseCreate = await netfieldio.createContainer(apiKey, configData);
  responseCreate = JSON.parse(responseCreate);
  const containerId = responseCreate.id;
  const responseCreateDevice = await netfieldio.createDeviceContainer(apiKey, deviceId, containerId, containerOption);

  return responseCreateDevice;
}

async function deployContainer(apiKey, deviceId, containerId, deviceConfigFile) {
  logger.info('- Device:'.padEnd(20), deviceId);
  logger.info('- Container:'.padEnd(20), containerId);
  logger.info('- Config Path:'.padEnd(20), deviceConfigFile);

  const containerOption = await getDeviceConfig(deviceConfigFile);

  const responseCreate = await netfieldio.createDeviceContainer(apiKey, deviceId, containerId, containerOption);

  return responseCreate;
}

async function updateAndRedeployContainer(apiKey, deviceId, containerId, tagName, containerConfigFile, deviceConfigFile) {
  logger.info('- Release:'.padEnd(20), tagName);
  logger.info('- Device:'.padEnd(20), deviceId);
  logger.info('- Container:'.padEnd(20), containerId);
  logger.info('- Config Container:'.padEnd(20), containerConfigFile);
  logger.info('- Config Device:'.padEnd(20), deviceConfigFile);

  const containerOption = await getDeviceConfig(deviceConfigFile);
  const configData = await getContainerConfig(containerConfigFile, tagName);

  const responseUpdate = await netfieldio.updateContainer(apiKey, containerId, configData);
  const responseDelete = await netfieldio.deleteDeviceContainer(apiKey, deviceId, containerId);
  const responseCreate = await netfieldio.createDeviceContainer(apiKey, deviceId, containerId, containerOption);

  return [responseUpdate, responseDelete, responseCreate];
}

program
  .version('0.0.1');

program
  .command('createContainer')
  .alias('cc')
  .description('Create a container on the gateway')
  .requiredOption('-k, --key <key>', 'api key from netfieldio')
  .requiredOption('-t, --tag <string>', 'version tag of the image')
  .requiredOption('-o, --config <path>', 'path to the config.JSON file')
  .action((options) => {
    // logger.info(options);
    createContainer(options.key, options.tag, options.config);
  })
  .on('--help', () => {
    logger.info('\nNeed the apikey, tag of the image, and a JSON file with all the container options.');
    logger.info('Please refer to the docs or the official netfieldio API for the structure of the JSON.');
    logger.info('Not needed values should left blank and must not be deleted!\n');
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
  .action((options) => {
    // logger.info(options);
    createAndDeployContainer(options.key, options.tag, options.configContainer, options.configDevice, options.device);
  })
  .on('--help', () => {
    logger.info('\nNeed the apikey, the device id, tag of the image, and a JSON file with all the container options.');
    logger.info('Please refer to the docs or the official netfieldio API for the structure of the JSON.');
    logger.info('Not needed values should left blank and must not be deleted!');
    logger.info('The device config only contains values wich differ from standard container config.\n');
  });

program
  .command('deployContainer')
  .alias('dc')
  .description('Deploy an existing container to a given device')
  .requiredOption('-k, --key <key>', 'api key from netfieldio')
  .requiredOption('-c, --container <id>', 'container id of the container to update')
  .requiredOption('-d, --device <id>', 'device id of the device to redeploy to')
  .option('-o, --config <path>', 'path to the config.JSON, only if other parameters than default container options')
  .action((options) => {
    // logger.info(options);
    deployContainer(options.key, options.device, options.container, options.config);
  })
  .on('--help', () => {
    logger.info('\nNeed the apikey, id of the container and the device.');
    logger.info('Please refer to the docs or the official netfieldio API for the structure of the JSON. Only contains values wich differ from standard container config.\n');
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
  .action((options) => {
    // logger.info(options);
    updateAndRedeployContainer(options.key, options.device, options.container, options.tag, options.configContainer, options.configDevice);
  })
  .on('--help', () => {
    logger.info('\nNeed the apikey, url and tag of the image, id of the container and the device.');
    logger.info('Please refer to the docs or the official netfieldio API for the structure of the JSON.');
    logger.info('Not needed values should left blank and must not be deleted in the containerconfig!');
    logger.info('The device config only contains values wich differ from standard container config.\n');
  });

program.parse(process.argv);
