// disabling logger here
process.env.LOG_LEVEL = 'silent';

const netfield = require('../index');
var rewire = require('rewire')
const expect = require('chai').expect;
const nock = require('nock');

const createResponse = require('./mock/createResponse');
const updateResponse = require('./mock/updateResponse');
const createDeviceResponse = require('./mock/createDeviceResponse');

var privateFunctionIndex = rewire('../index.js');

// API URL to mock
const baseUrl = 'https://api.netfield.io'
const baseVersion = 'v1'

// option object generated for function testing and api calls
var option = {};
option.displayName = "Testcontainer Test";
option.version = "1";
option.restartPolicy = "always";
option.type = "docker";
option.desiredStatus = "running";
option.imageUri = "www.uritotheimage.com";
option.tagName = "tag-1";
option.category = "cat";
option.processorArchitecture = "ARM";
option.shortDescription = "desc";
option.description = "desc";
option.containerCreateOptions = {};
option.containerTwinDesiredOptions = {};
option.environmentVariables = [];
option.containerType = "private";
option.organisationId = "12345";
option.registryType = "private";
option.credentials = {};

const keyDummy = "123456789"
const containerCreateOptionsDummy = '{}'
const containerIdDummy = "somerandomid"
const deviceIdDummy = "randomdevice"

describe("Formdata test", () => {
  it("should be able to create the right formdata", () => {
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

    createFormdataObject = privateFunctionIndex.__get__("createFormdataObject");
    const createdValue = createFormdataObject(option);

    // assert.deepEqual(createdValue, expectedValue);
    expect(expectedValue).to.deep.equal(createdValue);
  });
});

describe("Creating container", () => {
  beforeEach(() => {
    nock(`${baseUrl}/${baseVersion}`)
      .post('/containers')
      .reply(201, createResponse);
  });
  it("Should be able to create a container", () => {
    return netfield.createContainer(keyDummy, option, false)
      .then(response => {
        convertedResponse = JSON.parse(response)
        expect(typeof convertedResponse).to.equal('object');
        expect(convertedResponse.id).to.equal('somerandomid');
        expect(convertedResponse.organisationId).to.equal(12345);
        expect(convertedResponse.containerCreateOptions).to.deep.equal({});
      });
  });
});

describe("Updating container", () => {
  beforeEach(() => {
    nock(`${baseUrl}/${baseVersion}`)
      .put(`/containers/${containerIdDummy}`)
      .reply(201, updateResponse)
      .put(`/containers/wrong/url`)
      .replyWithError('Invalid url');
  });
  it("Should be able to update a container", () => {
    return netfield.updateContainer(keyDummy, containerIdDummy, option, false)
      .then(response => {
        convertedResponse = JSON.parse(response)
        expect(typeof convertedResponse).to.equal('object');
        expect(convertedResponse.id).to.equal('somerandomid');
        expect(convertedResponse.organisationId).to.equal(12345);
        expect(convertedResponse.containerCreateOptions).to.deep.equal({});
      });
  });
  it("Should throw an error using a wrong url", async () => {
    return netfield.updateContainer(keyDummy, "wrong/url", option, false)
      .catch(error => {
        expect(error.message).to.equal('Invalid url');
      });
  });
});

describe("Creating device container", () => {
  beforeEach(() => {
    nock(`${baseUrl}/${baseVersion}`)
      .post(`/devices/${deviceIdDummy}/containers/${containerIdDummy}`)
      .reply(201, createDeviceResponse)
      .post(`/devices/${deviceIdDummy}/containers/nonexistingcontainer`)
      .reply(404, "Container not found")
      .post(`/devices/${deviceIdDummy}/containers/wrong/url`)
      .replyWithError('Invalid url');
  });
  it("Should be able to create a device container", () => {
    return netfield.createDeviceContainer(keyDummy, deviceIdDummy, containerIdDummy, containerCreateOptionsDummy, false)
      .then(response => {
        convertedResponse = JSON.parse(response)
        expect(typeof convertedResponse).to.equal('object');
        expect(convertedResponse.id).to.equal('somerandomid');
        expect(convertedResponse.organisationId).to.equal(12345);
        expect(convertedResponse.containerCreateOptions).to.deep.equal({});
        expect(convertedResponse.deployedAt).to.equal('2020-04-27T12:00:57.020Z');
      });
  });
  it("Should fail creating a non existing container", () => {
    return netfield.createDeviceContainer(keyDummy, deviceIdDummy, "nonexistingcontainer", containerCreateOptionsDummy, false)
      .then(response => {
        expect(typeof response).to.equal('string');
        expect(response).to.equal('Container not found');
      });
  });
  it("Should throw an error using a wrong url", async () => {
    return netfield.createDeviceContainer(keyDummy, deviceIdDummy, "wrong/url", containerCreateOptionsDummy, false)
      .catch(error => {
        expect(error.message).to.equal('Invalid url');
      });
  });
});

describe("Deleting device container", () => {
  beforeEach(() => {
    nock(`${baseUrl}/${baseVersion}`)
      .delete(`/devices/${deviceIdDummy}/containers/${containerIdDummy}`)
      .reply(204, "")
      .delete(`/devices/${deviceIdDummy}/containers/nonexistingcontainer`)
      .reply(404, "Container not found")
      .delete(`/devices/${deviceIdDummy}/containers/wrong/url`)
      .replyWithError('Invalid url');
  });
  it("Should be able to delete a device container", () => {
    return netfield.deleteDeviceContainer(keyDummy, deviceIdDummy, containerIdDummy, false)
      .then(response => {
        expect(typeof response).to.equal('string');
        expect(response).to.equal('');
      });
  });
  it("Should be able to delete a device container with verbose mode", () => {
    return netfield.deleteDeviceContainer(keyDummy, deviceIdDummy, containerIdDummy, true)
      .then(response => {
        expect(typeof response).to.equal('string');
        expect(response).to.equal('');
      });
  });
  it("Should fail deleting a non existing container", () => {
    return netfield.deleteDeviceContainer(keyDummy, deviceIdDummy, "nonexistingcontainer", false)
      .then(response => {
        expect(typeof response).to.equal('string');
        expect(response).to.equal('Container not found');
      });
  });
  it("Should throw an error using a wrong url", async () => {
    return netfield.deleteDeviceContainer(keyDummy, deviceIdDummy, "wrong/url", false)
      .catch(error => {
        expect(error.message).to.equal('Invalid url');
      });
  });
});
