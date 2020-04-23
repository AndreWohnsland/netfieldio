var netfieldio = require('.');
const { program } = require('commander');

async function getDeviceConfig(configFile) {
    let containerOption = '{}';
    if (configFile != undefined) {
        containerOption = await netfieldio.getConfigDataFromJson(configFile);
    };
    return containerOption;
};

async function getContainerConfig(configFile, tagName) {
    let configData = await netfieldio.getConfigDataFromJson(configFile);
    configData = JSON.parse(configData);
    configData.tagName = tagName;
    return configData;
}


async function createContainer(apiKey, tagName, containerConfigFile) {
    console.log('- Release:'.padEnd(20), tagName);
    console.log('- Config Container:'.padEnd(20), containerConfigFile);

    let configData = await getContainerConfig(containerConfigFile, tagName);

    let responseCreate = await netfieldio.createContainer(apiKey, configData);
};

async function createAndDeployContainer(apiKey, tagName, containerConfigFile, deviceConfigFile, deviceId) {
    console.log('- Release:'.padEnd(20), tagName);
    console.log('- Device:'.padEnd(20), deviceId);
    console.log('- Config Container:'.padEnd(20), containerConfigFile);
    console.log('- Config Device:'.padEnd(20), deviceConfigFile);

    let configData = await getContainerConfig(containerConfigFile, tagName);
    let containerOption = await getDeviceConfig(deviceConfigFile);

    let responseCreate = await netfieldio.createContainer(apiKey, configData);
    responseCreate = JSON.parse(responseCreate);
    containerId = responseCreate.id;
    let responseCreateDevice = await netfieldio.createDeviceContainer(apiKey, deviceId, containerId, containerOption);
};

async function deployContainer(apiKey, deviceId, containerId, deviceConfigFile) {
    console.log('- Device:'.padEnd(20), deviceId);
    console.log('- Container:'.padEnd(20), containerId);
    console.log('- Config Path:'.padEnd(20), deviceConfigFile);

    let containerOption = await getDeviceConfig(deviceConfigFile);

    let responseCreate = await netfieldio.createDeviceContainer(apiKey, deviceId, containerId, containerOption);
};

async function updateAndRedeployContainer(apiKey, deviceId, containerId, tagName, containerConfigFile, deviceConfigFile) {
    console.log('- Release:'.padEnd(20), tagName);
    console.log('- Device:'.padEnd(20), deviceId);
    console.log('- Container:'.padEnd(20), containerId);
    console.log('- Config Container:'.padEnd(20), containerConfigFile);
    console.log('- Config Device:'.padEnd(20), deviceConfigFile);

    let containerOption = await getDeviceConfig(deviceConfigFile);
    let configData = await getContainerConfig(containerConfigFile, tagName);

    let responseUpdate = await netfieldio.updateContainer(apiKey, containerId, configData);
    let responseDelete = await netfieldio.deleteDeviceContainer(apiKey, deviceId, containerId);
    let responseCreate = await netfieldio.createDeviceContainer(apiKey, deviceId, containerId, containerOption);
};


program
    .version('0.0.1');

program
    .command('createContainer')
    .alias('cc')
    .description('Create a container on the gateway')
    .requiredOption('-k, --key <key>', 'api key from netfieldio')
    .requiredOption('-t, --tag <string>', 'version tag of the image')
    .requiredOption('-o, --config <path>', 'path to the config.JSON file')
    .action(function (options) {
        // console.log(options);
        createContainer(options.key, options.tag, options.config);
    }).on('--help', function () {
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
    .action(function (options) {
        // console.log(options);
        createAndDeployContainer(options.key, options.tag, options.configContainer, options.configDevice, options.device);
    }).on('--help', function () {
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
    .option('-o, --config <path>', 'path to the config.JSON, only if other parameters than default container options')
    .action(function (options) {
        // console.log(options);
        deployContainer(options.key, options.device, options.container, options.config);
    }).on('--help', function () {
        console.log('\nNeed the apikey, id of the container and the device.');
        console.log('Please refer to the docs or the official netfieldio API for the structure of the JSON. Only contains values wich differ from standard container config.\n');
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
    .action(function (options) {
        // console.log(options);
        updateAndRedeployContainer(options.key, options.device, options.container, options.tag, options.configContainer, options.configDevice);
    }).on('--help', function () {
        console.log('\nNeed the apikey, url and tag of the image, id of the container and the device.');
        console.log('Please refer to the docs or the official netfieldio API for the structure of the JSON.');
        console.log('Not needed values should left blank and must not be deleted in the containerconfig!');
        console.log('The device config only contains values wich differ from standard container config.\n');
    });

program.parse(process.argv);