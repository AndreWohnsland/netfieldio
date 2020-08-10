const request = require('request');
const path = require('path');
const fs = require('fs');
const pino = require('pino');

const apiBaseUrl = 'https://api.netfield.io';
const apiVersion = 'v1';
const logger = pino({ level: process.env.LOG_LEVEL || 'info' });

function checkForRightResponse(response, errorList = [400, 401, 402, 403, 404]) {
  if (errorList.includes(response.statusCode)) {
    // throw new Error(`Connection Error. Status Code ${response.statusCode}`);
    // Best practise seems to be 1) use process.exitCode = 1, 2) throw uncaught error
    logger.error(`An Error occured with the Status Code: ${response.statusCode} and the message: ${response.body}`);
    process.exitCode = 1;
    return false;
  }
  return true;
}

function verboseResponsePrint(verbose, header, response) {
  if (verbose) {
    logger.info(header + response.body + ', status code: ' + response.statusCode);
  }
}

function verbosePrint(verbose, message) {
  if (verbose) {
    logger.info(message);
  }
}

function getContainerResponse(options) {
  return new Promise((resolve, reject) => {
    request(options, function (error, response) {
      if (error) return reject(new Error(error.message));
      resolve(response);
    });
  });
}

function createFormdataObject(ContainerCreateOptions) {
  return {
    // mqttTopics not included because it needs to be a list with at least 1
    // items and cannot be empty
    displayName: ContainerCreateOptions.displayName,
    containerName: ContainerCreateOptions.displayName.toLowerCase().replace(/ /g, '-').replace(/\./g, '-'),
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
  updateContainer(apiKey, containerId, ContainerCreateOptions, verbose) {
    return new Promise((resolve, reject) => {
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
        if (error) return reject(new Error(error.message));
        verboseResponsePrint(verbose, 'Updated Container Body: ', response);
        checkForRightResponse(response);
        resolve(response.body);
      });
    });
  },

  deleteDeviceContainer(apiKey, deviceId, containerId, verbose) {
    return new Promise((resolve, reject) => {
      const options = {
        method: 'DELETE',
        url: `${apiBaseUrl}/${apiVersion}/devices/${deviceId}/containers/${containerId}`,
        headers: {
          Authorization: apiKey,
          'Content-Type': 'application/json',
        },
      };

      request(options, (error, response) => {
        if (error) return reject(new Error(error.message));
        verboseResponsePrint(verbose, 'Delete Device Container Body: ', response);
        resolve(response.body);
      });
    });
  },

  createDeviceContainer(apiKey, deviceId, containerId, containerOption, verbose) {
    return new Promise((resolve, reject) => {
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
        if (error) return reject(new Error(error.message));
        verboseResponsePrint(verbose, 'Create Device Container Body: ', response);
        checkForRightResponse(response);
        resolve(response.body);
      });
    });
  },

  createContainer(apiKey, ContainerCreateOptions, verbose) {
    return new Promise((resolve, reject) => {
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
        if (error) return reject(new Error(error.message));
        verboseResponsePrint(verbose, 'Create Container Body: ', response);
        checkForRightResponse(response);
        resolve(response.body);
      });
    });
  },

  async getContainerId(apiKey, containerName, verbose) {
    const limit = 50;
    let page = 1;
    let total = 0;
    let offset = 0;
    let containerInfo = [];
    let containerId = null;
    // let response = null;
    do {
      var options = {
        method: 'GET',
        url: `${apiBaseUrl}/${apiVersion}/containers?page=${page}&limit=${limit}&sortBy=id&sortOrder=asc`,
        headers: {
          Authorization: apiKey,
          'Content-Type': 'application/json',
        },
      };
      try {
        response = await getContainerResponse(options);
      } catch (err) {
        return new Error(err.message);
      }
      checkForRightResponse(response);
      if (response.statusCode >= 400) return new Error('Invalid request');
      information = JSON.parse(response.body);
      offset = information.pagination.offset;
      total = information.pagination.total;
      containerInfo.push(...information.containers);
      page += 1;
    } while (offset + limit < total);

    for (let data of containerInfo) {
      if (data.displayName === containerName) {
        verbosePrint(verbose, `Container found for name: ${containerName}, id is: ${data.id}`);
        return data.id;
      }
    }
    verbosePrint(verbose, `Container not found for name: ${containerName}`);
    return containerId;
  },

  postMethod(apiKey, deviceId, containerName, methodName, methodPayload, verbose) {
    return new Promise((resolve, reject) => {
      bodyObject = {
        containerName: containerName,
        methodName: methodName,
        methodPayload: JSON.parse(methodPayload),
      };
      bodyJson = JSON.stringify(bodyObject);

      var options = {
        method: 'POST',
        url: `${apiBaseUrl}/${apiVersion}/devices/${deviceId}/methods`,
        headers: {
          'Content-Type': 'application/json',
          Authorization: apiKey,
        },
        body: bodyJson,
      };
      request(options, (error, response) => {
        if (error) return reject(new Error(error.message));
        verboseResponsePrint(verbose, 'Create Container Body: ', response);
        checkForRightResponse(response, (errorList = [400, 401, 402, 403]));
        resolve([response.statusCode, response.body]);
      });
    });
  },

  getGroupDevices(apiKey, groupId, verbose) {
    return new Promise((resolve, reject) => {
      var options = {
        method: 'GET',
        url: `${apiBaseUrl}/${apiVersion}/groups/${groupId}`,
        headers: {
          Authorization: apiKey,
          'Content-Type': 'application/json',
        },
      };
      request(options, (error, response) => {
        if (error) return reject(new Error(error.message));
        verbosePrint(verbose, 'Get Group Device Body: ', response);
        if (!checkForRightResponse(response)) return resolve([]);
        information = JSON.parse(response.body);
        deviceList = information.items;
        let deviceInformation = [];
        for (let device of deviceList) {
          deviceInformation.push([device.id, device.name]);
        }
        resolve(deviceInformation);
      });
    });
  },

  async getConfigDataFromJson(filePath) {
    // console.log(filePath);
    // console.log(path.join('../..', filePath));
    if (fs.existsSync(path.join(__dirname, '../..', filePath))) {
      return fs.readFileSync(path.join(__dirname, '../..', filePath), 'utf8');
    } else if (fs.existsSync(path.join(__dirname, filePath))) {
      return fs.readFileSync(path.join(__dirname, filePath), 'utf8');
    } else if (fs.existsSync(filePath)) {
      //
      return fs.readFileSync(filePath, 'utf8');
    } else {
      throw new Error('File not found');
    }
  },
};
