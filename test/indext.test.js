const netfield = require('../index');
var rewire = require('rewire')
const assert = require('assert').strict;

var app = rewire('../index.js');

describe("Formdata test", function () {
  it("should be able to create the right formdata", function () {
    option = {};
    option.displayName = "A Name";
    option.version = "1";
    option.restartPolicy = "always";
    option.type = "docker";
    option.desiredStatus = "running";
    option.imageUri = "www.uritotheimage.com";
    option.tagName = "tag-1";
    option.category = "cat";
    option.processorArchitecture = "ARM";
    option.shortDescription = "s. desc";
    option.description = "desc";
    option.containerCreateOptions = {};
    option.containerTwinDesiredOptions = {};
    option.environmentVariables = [];
    option.containerType = "private";
    option.organisationId = "123456789";
    option.registryType = "private";
    option.credentials = {};

    expectedValue = {
      displayName: option.displayName,
      containerName: option.displayName.toLowerCase().replace(/ /g, '-'),
      version: option.version,
      restartPolicy: option.restartPolicy,
      type: option.type,
      desiredStatus: option.desiredStatus,
      imageUri: `${option.imageUri}:${option.tagName}`,
      category: option.category,
      processorArchitecture: option.processorArchitecture,
      shortDescription: option.shortDescription,
      description: option.description,
      containerCreateOptions: JSON.stringify(option.containerCreateOptions),
      containerTwinDesiredOptions: JSON.stringify(option.containerTwinDesiredOptions),
      environmentVariables: JSON.stringify(option.environmentVariables),
      containerType: option.containerType,
      organisationId: option.organisationId,
      registryType: option.registryType,
      credentials: JSON.stringify(option.credentials),
    };

    createFormdataObject = app.__get__("createFormdataObject");
    const createdValue = createFormdataObject(option);

    assert.deepEqual(createdValue, expectedValue);

  });
});