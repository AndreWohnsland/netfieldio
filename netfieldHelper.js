const pino = require('pino');
const netfieldio = require('.');

const logger = pino({ level: process.env.LOG_LEVEL || 'info' });

// Helper Function
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

// CLI Function
module.exports = {
  async createContainer(apiKey, tagName, containerConfigFile, verbose) {
    if (verbose) {
      logger.info('- Release:'.padEnd(20) + tagName);
      logger.info('- Config Container:'.padEnd(20) + containerConfigFile);
    }

    const configData = await getContainerConfig(containerConfigFile, tagName);

    const responseCreate = await netfieldio.createContainer(apiKey, configData, verbose);
    return responseCreate;
  },

  async createAndDeployContainer(apiKey, tagName, containerConfigFile, deviceConfigFile, deviceId, verbose) {
    if (verbose) {
      logger.info('- Release:'.padEnd(20) + tagName);
      logger.info('- Device:'.padEnd(20) + deviceId);
      logger.info('- Config Container:'.padEnd(20) + containerConfigFile);
      logger.info('- Config Device:'.padEnd(20) + deviceConfigFile);
    };

    const configData = await getContainerConfig(containerConfigFile, tagName);
    const containerOption = await getDeviceConfig(deviceConfigFile);

    let responseCreate = await netfieldio.createContainer(apiKey, configData, verbose);
    responseCreate = JSON.parse(responseCreate);
    const containerId = responseCreate.id;
    const responseCreateDevice = await netfieldio.createDeviceContainer(apiKey, deviceId, containerId, containerOption, verbose);

    return responseCreateDevice;
  },

  async deployContainer(apiKey, deviceId, containerId, deviceConfigFile, verbose) {
    if (verbose) {
      logger.info('- Device:'.padEnd(20) + deviceId);
      logger.info('- Container:'.padEnd(20) + containerId);
      logger.info('- Config Path:'.padEnd(20) + deviceConfigFile);
    };

    const containerOption = await getDeviceConfig(deviceConfigFile);

    const responseCreate = await netfieldio.createDeviceContainer(apiKey, deviceId, containerId, containerOption, verbose);

    return responseCreate;
  },

  async updateAndRedeployContainer(apiKey, deviceId, containerId, tagName, containerConfigFile, deviceConfigFile, verbose) {
    if (verbose) {
      logger.info('- Release:'.padEnd(20) + tagName);
      logger.info('- Device:'.padEnd(20) + deviceId);
      logger.info('- Container:'.padEnd(20) + containerId);
      logger.info('- Config Container:'.padEnd(20) + containerConfigFile);
      logger.info('- Config Device:'.padEnd(20) + deviceConfigFile);
    };

    const containerOption = await getDeviceConfig(deviceConfigFile);
    const configData = await getContainerConfig(containerConfigFile, tagName);

    const responseUpdate = await netfieldio.updateContainer(apiKey, containerId, configData, verbose);
    const responseDelete = await netfieldio.deleteDeviceContainer(apiKey, deviceId, containerId, verbose);
    const responseCreate = await netfieldio.createDeviceContainer(apiKey, deviceId, containerId, containerOption, verbose);

    return [responseUpdate, responseDelete, responseCreate];
  }
}