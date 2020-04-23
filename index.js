const request = require('request');
const path = require('path');
const fs = require('fs');
const pino = require('pino');

const apiBaseUrl = 'https://api.netfield.io';
const apiVersion = 'v1';
const logger = pino({ level: process.env.LOG_LEVEL || 'info' });

function checkForRightResponse(response) {
  if (response.statusCode >= 400) {
    // throw new Error(`Connection Error. Status Code ${response.statusCode}`);
    // Best practise seems to be 1) use process.exitCode = 1, 2) throw uncaught error
    logger.info(`An Error occured with the Status Code: ${response.statusCode}`);
    process.exit(1);
  }
}


function createFormdataObject(ContainerCreateOptions) {
  return {
    // mqttTopics not included because it needs to be a list with at least 1
    // items and cannot be empty
    displayName: ContainerCreateOptions.displayName,
    containerName: ContainerCreateOptions.displayName.toLowerCase().replace(/ /g, '-'),
    version: ContainerCreateOptions.version,
    restartPolicy: ContainerCreateOptions.restartPolicy,
    type: ContainerCreateOptions.type,
    desiredStatus: ContainerCreateOptions.desiredStatus,
    imageUri: `${ContainerCreateOptions.imageUri}:${ContainerCreateOptions.tagName}`,
    category: ContainerCreateOptions.category,
    processorArchitecture: ContainerCreateOptions.processorArchitecture,
    shortDescription: ContainerCreateOptions.shortDescription,
    description: ContainerCreateOptions.description,
    containerCreateOptions: JSON.stringify(ContainerCreateOptions.containerCreateOptions),
    containerTwinDesiredOptions: JSON.stringify(ContainerCreateOptions.containerTwinDesiredOptions),
    environmentVariables: JSON.stringify(ContainerCreateOptions.environmentVariables),
    containerType: ContainerCreateOptions.containerType,
    organisationId: ContainerCreateOptions.organisationId,
    registryType: ContainerCreateOptions.registryType,
    credentials: JSON.stringify(ContainerCreateOptions.credentials),
  };
}

module.exports = {
  updateContainer(apiKey, containerId, ContainerCreateOptions) {
    return new Promise(((resolve, reject) => {
      const options = {
        method: 'PUT',
        url: `${apiBaseUrl}/${apiVersion}/containers/${containerId}`,
        headers: {
          Authorization: apiKey,
        },
        formData: createFormdataObject(ContainerCreateOptions),
      };
      // logger.info(options);
      request(options, (error, response) => {
        if (error) throw reject(new Error(error));
        logger.info('Updated Container Body:');
        logger.info(response.body);
        checkForRightResponse(response);
        resolve(response.body);
      });
    }));
  },

  deleteDeviceContainer(apiKey, deviceId, containerId) {
    return new Promise(((resolve, reject) => {
      const options = {
        method: 'DELETE',
        url: `${apiBaseUrl}/${apiVersion}/devices/${deviceId}/containers/${containerId}`,
        headers: {
          Authorization: apiKey,
          'Content-Type': 'application/json',
        },
      };
      request(options, (error, response) => {
        if (error) throw reject(new Error(error));
        logger.info('Delete Device Container Body:');
        logger.info(response.body);
        resolve(response.body);
      });
    }));
  },

  createDeviceContainer(apiKey, deviceId, containerId, containerOption = '{}') {
    return new Promise(((resolve, reject) => {
      const options = {
        method: 'POST',
        url: `${apiBaseUrl}/${apiVersion}/devices/${deviceId}/containers/${containerId}`,
        headers: {
          'Content-Type': 'application/json',
          Authorization: apiKey,
        },
        body: containerOption,

      };
      request(options, (error, response) => {
        if (error) throw reject(new Error(error));
        logger.info('Create Device Container Body:');
        logger.info(response.body);
        checkForRightResponse(response);
        resolve(response.body);
      });
    }));
  },

  createContainer(apiKey, ContainerCreateOptions) {
    return new Promise(((resolve, reject) => {
      const options = {
        method: 'POST',
        url: `${apiBaseUrl}/${apiVersion}/containers`,
        headers: {
          Authorization: apiKey,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        formData: createFormdataObject(ContainerCreateOptions),
      };
      request(options, (error, response) => {
        if (error) throw reject(new Error(error));
        logger.info('Create Container Body:');
        logger.info(response.body);
        checkForRightResponse(response);
        resolve(response.body);
      });
    }));
  },

  async getConfigDataFromJson(filePath) {
    return fs.readFileSync(path.join(__dirname, filePath), 'utf8');
  },
};