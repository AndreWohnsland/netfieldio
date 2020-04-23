# netfieldio API wrapper

Node.js CLI wrapper for [api.netfield.io](https://api.netfield.io)

- [netfieldio API wrapper](#netfieldio-api-wrapper)
- [Acknowledgments](#acknowledgments)
- [Usage](#usage)
  - [createContainer](#createcontainer)
  - [createAndDeployContainer](#createanddeploycontainer)
  - [deployContainer](#deploycontainer)
  - [updateAndRedeployContainer](#updateandredeploycontainer)
- [Examples](#examples)
- [Format of Configs](#format-of-configs)

# Acknowledgments

I hereby thank the [SVA](https://www.sva.de) for granting me the possibility to create this work and release it as open source. 

# Usage

### createContainer
```
Usage: netfieldio createContainer|cc [options]

Create a container on the gateway

Options:
  -k, --key <key>      api key from netfieldio
  -t, --tag <string>   version tag of the image
  -o, --config <path>  path to the config.JSON file
  -h, --help           display help for command

Need the apikey, tag of the image, and a JSON file with all the container options.
Please refer to the docs or the official netfieldio API for the structure of the JSON.
Not needed values should left blank and must not be deleted!
```

### createAndDeployContainer
```
Usage: netfieldio createAndDeployContainer|cdc [options]

Create a container on the gateway and deploy it to the given device

Options:
  -k, --key <key>                 api key from netfieldio
  -t, --tag <string>              version tag of the image
  -d, --device <id>               device id of the device to deploy to
  -oc, --config-container <path>  path to the config.JSON for the container, identical to the create one
  -od, --config-device <path>     path to the config.JSON for the device, can be empty
  -h, --help                      display help for command

Need the apikey, the device id, tag of the image, and a JSON file with all the container options.
Please refer to the docs or the official netfieldio API for the structure of the JSON.
Not needed values should left blank and must not be deleted!
The device config only contains values wich differ from standard container config.
```

### deployContainer
```
Usage: netfieldio deployContainer|dc [options]

Deploy an existing container to a given device

Options:
  -k, --key <key>       api key from netfieldio
  -c, --container <id>  container id of the container to update
  -d, --device <id>     device id of the device to redeploy to
  -o, --config <path>   path to the config.JSON, only if other parameters than default container options
  -h, --help            display help for command

Need the apikey, id of the container and the device.
Please refer to the docs or the official netfieldio API for the structure of the JSON. 
Only contains values wich differ from standard container config.
```

### updateAndRedeployContainer
```
Usage: netfieldio updateAndRedeployContainer|udc [options]

Update an existing container, delete and redeploy it to a given device

Options:
  -k, --key <key>                 api key from netfieldio
  -t, --tag <string>              version tag of the image
  -c, --container <id>            container id of the container to update
  -d, --device <id>               device id of the device to redeploy to
  -oc, --config-container <path>  path to the config.JSON for the container, identical to the create one
  -od, --config-device <path>     path to the config.JSON for the device, can be empty
  -h, --help                      display help for command

Need the apikey, url and tag of the image, id of the container and the device.
Please refer to the docs or the official netfieldio API for the structure of the JSON.
Not needed values should left blank and must not be deleted in the containerconfig!
The device config only contains values wich differ from standard container config.
```

# Examples

Update an existing container and redeploy it ont the given device with default container configuration:
```sh-session
node netfieldio.js udc -k api_key -c container_id -d device_id -t version_tag -oc /relative/path/to/config.json
```

# Format of Configs

There are two different type of config files:
 - configuration file for a container
 - configuration file for a specific device container

 The configuration file for a container is used for creating und updating this container on the gateway and is always needed with all parameters.
 The configuration file for a specific device container is only needed if some of the container configuration differ from the base container configuration. 
 In addition this config file shall only contain values that differ from the base configuration.

 Example `container_config.json`:
 ```json
 {
    "displayName": "YourName",
    "version": "yourVersionNumber",
    "imageUri": "linkToImageWithoutTag",
    "category": "yourCategory",
    "processorArchitecture": "usedArchitecture ARM x86 ...",
    "organisationId": "yourID",
    "containerCreateOptions": {
        "option1": "value1",
        "option2": "value2"
    },
    "environmentVariables": [
        {
            "key": "key1",
            "value": "value1"
        },
        {
            "key": "key2",
            "value": "value2"
        }
    ],
    "containerType": "private or public",
    "registryType": "private or public",
    "credentials": {
        "address": "yourPrivateRegistryAdress",
        "username": "yourUserName",
        "password": "yourSuperSecretPassword"
    },
    "type": "containerType: docker etc.",
    "restartPolicy": "yourPolicy: always never on-failed on-unhealthy",
    "desiredStatus": "yourStatus: running stopped",
    "shortDescription": "At least one Char",
    "description": "At least one Char",
    "containerTwinDesiredOptions": {}
}
 ```

 Example `device_config.json` for a specific container, if you only want to use one environment variable instead of two (according to template above):

```json
{
    "environmentVariables": [
        {
            "key": "key1_device",
            "value": "value1_device"
        }
    ]
}
```
For further information about the options you can also consult the [netfield.io API](https://api.netfield.io).