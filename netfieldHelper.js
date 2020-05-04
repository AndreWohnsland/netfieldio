const pino = require('pino');
const netfieldio = require('.');

const logger = pino({ level: process.env.LOG_LEVEL || 'info' });

// regex for viable container id:
const regex = RegExp('([a-z0-9]{8}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{12})');

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

// to avoid duplicate code in the exported function
async function createContainerHelper(apiKey, tagName, containerConfigFile, verbose) {
  let configData = await getContainerConfig(containerConfigFile, tagName);
  let containerId = await netfieldio.getContainerId(apiKey, configData.displayName, verbose);
  let responseCreate = '';

  if (containerId !== null) {
    if (verbose) logger.info('Updating container ...');
    responseCreate = await netfieldio.updateContainer(apiKey, containerId, configData, verbose);
  } else {
    if (verbose) logger.info('Creating container ...');
    responseCreate = await netfieldio.createContainer(apiKey, configData, verbose);
  }
  return responseCreate;
}

async function deployContainerHelper(apiKey, deviceId, containerId, deviceConfigFile, forceRedeploy, verbose) {
  var containerOption = await getDeviceConfig(deviceConfigFile);
  if (forceRedeploy) {
    if (verbose) logger.info('Force enabled, trying to delete existing container');
    let responseDelete = await netfieldio.deleteDeviceContainer(apiKey, deviceId, containerId, verbose);
  }
  let responseCreateDevice = await netfieldio.createDeviceContainer(
    apiKey,
    deviceId,
    containerId,
    containerOption,
    verbose
  );
  return responseCreateDevice;
}

// CLI Function
module.exports = {
  async createContainer(apiKey, tagName, containerConfigFile, verbose) {
    if (verbose) {
      logger.info('- Release:'.padEnd(20) + tagName);
      logger.info('- Config Container:'.padEnd(20) + containerConfigFile);
    }

    responseCreate = await createContainerHelper(apiKey, tagName, containerConfigFile, verbose);
    return responseCreate;
  },

  async createAndDeployContainer(
    apiKey,
    tagName,
    containerConfigFile,
    deviceConfigFile,
    deviceId,
    forceRedeploy,
    verbose
  ) {
    if (verbose) {
      logger.info('- Release:'.padEnd(20) + tagName);
      logger.info('- Device:'.padEnd(20) + deviceId);
      logger.info('- Config Container:'.padEnd(20) + containerConfigFile);
      logger.info('- Config Device:'.padEnd(20) + deviceConfigFile);
      logger.info('- Force Redeploy:'.padEnd(20) + (forceRedeploy ? 'enabled' : 'disabled'));
    }

    responseCreate = await createContainerHelper(apiKey, tagName, containerConfigFile, verbose);
    responseCreate = JSON.parse(responseCreate);
    let containerId = responseCreate.id;
    let responseCreateDevice = await deployContainerHelper(
      apiKey,
      deviceId,
      containerId,
      deviceConfigFile,
      forceRedeploy,
      verbose
    );
    return responseCreateDevice;
  },

  async deployContainer(apiKey, deviceId, containerId, deviceConfigFile, forceRedeploy, verbose) {
    if (verbose) {
      logger.info('- Device:'.padEnd(20) + deviceId);
      logger.info('- Container:'.padEnd(20) + containerId);
      logger.info('- Config Path:'.padEnd(20) + deviceConfigFile);
      logger.info('- Force Redeploy:'.padEnd(20) + (forceRedeploy ? 'enabled' : 'disabled'));
    }
    if (regex.test(containerId)) {
      deploymentContainerId = containerId;
    } else {
      logger.info(`Not a valid id: ${containerId}, trying to find id by its name ...`);
      deploymentContainerId = await netfieldio.getContainerId(apiKey, containerId, verbose);
    }

    let responseCreate = await deployContainerHelper(
      apiKey,
      deviceId,
      deploymentContainerId,
      deviceConfigFile,
      forceRedeploy,
      verbose
    );
    return responseCreate;
  },

  // deprecated -> createAndDeployContainer with forceRedeploy will do the same will removed with v1.2
  async updateAndRedeployContainer(
    apiKey,
    deviceId,
    containerId,
    tagName,
    containerConfigFile,
    deviceConfigFile,
    verbose
  ) {
    if (verbose) {
      logger.info('- Release:'.padEnd(20) + tagName);
      logger.info('- Device:'.padEnd(20) + deviceId);
      logger.info('- Container:'.padEnd(20) + containerId);
      logger.info('- Config Container:'.padEnd(20) + containerConfigFile);
      logger.info('- Config Device:'.padEnd(20) + deviceConfigFile);
    }

    let containerOption = await getDeviceConfig(deviceConfigFile);
    let configData = await getContainerConfig(containerConfigFile, tagName);

    let responseUpdate = await netfieldio.updateContainer(apiKey, containerId, configData, verbose);
    let responseDelete = await netfieldio.deleteDeviceContainer(apiKey, deviceId, containerId, verbose);
    let responseCreate = await netfieldio.createDeviceContainer(
      apiKey,
      deviceId,
      containerId,
      containerOption,
      verbose
    );

    return [responseUpdate, responseDelete, responseCreate];
  },
};
