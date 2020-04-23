var request = require('request');
const YAML = require('yaml');
const fs = require('fs');

var apiBaseUrl = 'https://api.netfield.io'
var apiVersion = 'v1'

async function convertYamlData(filePath) {
    const file = fs.readFileSync(__dirname + filePath, 'utf8');
    var data = YAML.parse(file);
    return data;
}

function checkForRightResponse(response) {
    if (response.statusCode >= 400) {
        // throw new Error(`Connection Error. Status Code ${response.statusCode}`);
        // Best practise seems to be 1) use process.exitCode = 1, 2) throw uncaught error
        console.log(`An Error occured with the Status Code: ${response.statusCode}`)
        process.exit(1);
    }
}

function createFormdataObject(ContainerCreateOptions) {
    returnObject = {
        // mqttTopics not included because it needs to be a list with at least 1 items and cannot be empty
        'displayName': ContainerCreateOptions.displayName,
        'containerName': ContainerCreateOptions.displayName.toLowerCase().replace(/ /g, "-"),
        'version': ContainerCreateOptions.version,
        'restartPolicy': ContainerCreateOptions.restartPolicy,
        'type': ContainerCreateOptions.type,
        'desiredStatus': ContainerCreateOptions.desiredStatus,
        'imageUri': `${ContainerCreateOptions.imageUri}:${ContainerCreateOptions.tagName}`,
        'category': ContainerCreateOptions.category,
        'processorArchitecture': ContainerCreateOptions.processorArchitecture,
        'shortDescription': ContainerCreateOptions.shortDescription,
        'description': ContainerCreateOptions.description,
        'containerCreateOptions': JSON.stringify(ContainerCreateOptions.containerCreateOptions),
        'containerTwinDesiredOptions': JSON.stringify(ContainerCreateOptions.containerTwinDesiredOptions),
        'environmentVariables': JSON.stringify(ContainerCreateOptions.environmentVariables),
        'containerType': ContainerCreateOptions.containerType,
        'organisationId': ContainerCreateOptions.organisationId,
        'registryType': ContainerCreateOptions.registryType,
        'credentials': JSON.stringify(ContainerCreateOptions.credentials)
    };
    return returnObject;
}

module.exports = {
    updateContainer: function (apiKey, containerId, ContainerCreateOptions) {
        return new Promise(function (resolve, reject) {
            var options = {
                'method': 'PUT',
                'url': `${apiBaseUrl}/${apiVersion}/containers/${containerId}`,
                'headers': {
                    'Authorization': apiKey
                },
                formData: createFormdataObject(ContainerCreateOptions)
            };
            // console.log(options);
            request(options, function (error, response) {
                if (error) throw new Error(error);
                console.log('Updated Container Body:');
                console.log(response.body);
                checkForRightResponse(response);
                resolve(response.body);
            });
        });
    },

    deleteDeviceContainer: function (apiKey, deviceId, containerId) {
        return new Promise(function (resolve, reject) {
            var options = {
                'method': 'DELETE',
                'url': `${apiBaseUrl}/${apiVersion}/devices/${deviceId}/containers/${containerId}`,
                'headers': {
                    'Authorization': apiKey,
                    'Content-Type': 'application/json'
                }
            };
            request(options, function (error, response) {
                if (error) throw new Error(error);
                console.log('Delete Device Container Body:');
                console.log(response.body);
                resolve(response.body);
            });
        });
    },

    createDeviceContainer: function (apiKey, deviceId, containerId, containerOption = '{}') {
        return new Promise(function (resolve, reject) {
            var options = {
                'method': 'POST',
                'url': `${apiBaseUrl}/${apiVersion}/devices/${deviceId}/containers/${containerId}`,
                'headers': {
                    'Content-Type': 'application/json',
                    'Authorization': apiKey
                },
                body: containerOption

            };
            // console.log(options);
            request(options, function (error, response) {
                if (error) throw new Error(error);
                console.log('Create Device Container Body:');
                console.log(response.body);
                checkForRightResponse(response);
                resolve(response.body);
            });
        });
    },

    createContainer: function (apiKey, ContainerCreateOptions) {
        return new Promise(function (resolve, reject) {
            var options = {
                'method': 'POST',
                'url': `${apiBaseUrl}/${apiVersion}/containers`,
                'headers': {
                    'Authorization': apiKey,
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                formData: createFormdataObject(ContainerCreateOptions)
            };
            // console.log(options);
            request(options, function (error, response) {
                if (error) throw new Error(error);
                console.log('Create Container Body:');
                console.log(response.body);
                checkForRightResponse(response);
                resolve(response.body);
            });
        });
    },

    getConfigDataFromJson: async function (filePath) {
        let allData = await fs.readFileSync(__dirname + filePath, 'utf8');
        // console.log("AllData received")
        return allData;
    }
}