// disabling logger here
process.env.LOG_LEVEL = 'silent';

const path = require('path');
const netfield = require('../index');
var rewire = require('rewire');
const expect = require('chai').expect;
const nock = require('nock');
const mock = require('mock-fs');

const createResponse = require('./mock/createResponse');
const updateResponse = require('./mock/updateResponse');
const createDeviceResponse = require('./mock/createDeviceResponse');
const getContainerIdResponse = require('./mock/getContainerIdResponse');

var privateFunctionIndex = rewire('../index.js');

// API URL to mock
const baseUrl = 'https://api.netfield.io';
const baseVersion = 'v1';

// option object generated for function testing and api calls
var option = {};
option.displayName = 'Testcontainer Test';
option.version = '1';
option.restartPolicy = 'always';
option.type = 'docker';
option.desiredStatus = 'running';
option.imageUri = 'www.uritotheimage.com';
option.tagName = 'tag-1';
option.category = 'cat';
option.processorArchitecture = 'ARM';
option.shortDescription = 'desc';
option.description = 'desc';
option.containerCreateOptions = {};
option.containerTwinDesiredOptions = {};
option.environmentVariables = [];
option.containerType = 'private';
option.organisationId = '12345';
option.registryType = 'private';
option.credentials = {};

const keyDummy = '123456789';
const containerCreateOptionsDummy = '{}';
const containerIdDummy = 'somerandomid';
const deviceIdDummy = 'randomdevice';

describe('Testing the base funktion of the package', () => {
  describe('Formdata test', () => {
    it('should be able to create the right formdata', () => {
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

      createFormdataObject = privateFunctionIndex.__get__('createFormdataObject');
      const createdValue = createFormdataObject(option);

      // assert.deepEqual(createdValue, expectedValue);
      expect(expectedValue).to.deep.equal(createdValue);
    });
  });

  describe('Creating container', () => {
    beforeEach(() => {
      nock(`${baseUrl}/${baseVersion}`).post('/containers').reply(201, createResponse);
    });
    it('Should be able to create a container', () => {
      return netfield.createContainer(keyDummy, option, false).then((response) => {
        convertedResponse = JSON.parse(response);
        expect(typeof convertedResponse).to.equal('object');
        expect(convertedResponse.id).to.equal('somerandomid');
        expect(convertedResponse.organisationId).to.equal(12345);
        expect(convertedResponse.containerCreateOptions).to.deep.equal({});
      });
    });
  });

  describe('Updating container', () => {
    beforeEach(() => {
      nock(`${baseUrl}/${baseVersion}`)
        .put(`/containers/${containerIdDummy}`)
        .reply(201, updateResponse)
        .put(`/containers/wrong/url`)
        .replyWithError('Invalid url');
    });
    it('Should be able to update a container', () => {
      return netfield.updateContainer(keyDummy, containerIdDummy, option, false).then((response) => {
        convertedResponse = JSON.parse(response);
        expect(typeof convertedResponse).to.equal('object');
        expect(convertedResponse.id).to.equal('somerandomid');
        expect(convertedResponse.organisationId).to.equal(12345);
        expect(convertedResponse.containerCreateOptions).to.deep.equal({});
      });
    });
    it('Should throw an error using a wrong url', async () => {
      return netfield.updateContainer(keyDummy, 'wrong/url', option, false).catch((error) => {
        expect(error.message).to.equal('Invalid url');
      });
    });
  });

  describe('Creating device container', () => {
    beforeEach(() => {
      nock(`${baseUrl}/${baseVersion}`)
        .post(`/devices/${deviceIdDummy}/containers/${containerIdDummy}`)
        .reply(201, createDeviceResponse)
        .post(`/devices/${deviceIdDummy}/containers/nonexistingcontainer`)
        .reply(404, 'Container not found')
        .post(`/devices/${deviceIdDummy}/containers/wrong/url`)
        .replyWithError('Invalid url');
    });
    it('Should be able to create a device container', () => {
      return netfield
        .createDeviceContainer(keyDummy, deviceIdDummy, containerIdDummy, containerCreateOptionsDummy, false)
        .then((response) => {
          convertedResponse = JSON.parse(response);
          expect(typeof convertedResponse).to.equal('object');
          expect(convertedResponse.id).to.equal('somerandomid');
          expect(convertedResponse.organisationId).to.equal(12345);
          expect(convertedResponse.containerCreateOptions).to.deep.equal({});
          expect(convertedResponse.deployedAt).to.equal('2020-04-27T12:00:57.020Z');
        });
    });
    it('Should fail creating a non existing container', () => {
      return netfield
        .createDeviceContainer(keyDummy, deviceIdDummy, 'nonexistingcontainer', containerCreateOptionsDummy, false)
        .then((response) => {
          expect(typeof response).to.equal('string');
          expect(response).to.equal('Container not found');
        });
    });
    it('Should throw an error using a wrong url', async () => {
      return netfield
        .createDeviceContainer(keyDummy, deviceIdDummy, 'wrong/url', containerCreateOptionsDummy, false)
        .catch((error) => {
          expect(error.message).to.equal('Invalid url');
        });
    });
  });

  describe('Deleting device container', () => {
    beforeEach(() => {
      nock(`${baseUrl}/${baseVersion}`)
        .delete(`/devices/${deviceIdDummy}/containers/${containerIdDummy}`)
        .reply(204, '')
        .delete(`/devices/${deviceIdDummy}/containers/nonexistingcontainer`)
        .reply(404, 'Container not found')
        .delete(`/devices/${deviceIdDummy}/containers/wrong/url`)
        .replyWithError('Invalid url');
    });
    it('Should be able to delete a device container', () => {
      return netfield.deleteDeviceContainer(keyDummy, deviceIdDummy, containerIdDummy, false).then((response) => {
        expect(typeof response).to.equal('string');
        expect(response).to.equal('');
      });
    });
    it('Should be able to delete a device container with verbose mode', () => {
      return netfield.deleteDeviceContainer(keyDummy, deviceIdDummy, containerIdDummy, true).then((response) => {
        expect(typeof response).to.equal('string');
        expect(response).to.equal('');
      });
    });
    it('Should fail deleting a non existing container', () => {
      return netfield.deleteDeviceContainer(keyDummy, deviceIdDummy, 'nonexistingcontainer', false).then((response) => {
        expect(typeof response).to.equal('string');
        expect(response).to.equal('Container not found');
      });
    });
    it('Should throw an error using a wrong url', async () => {
      return netfield.deleteDeviceContainer(keyDummy, deviceIdDummy, 'wrong/url', false).catch((error) => {
        expect(error.message).to.equal('Invalid url');
      });
    });
  });

  describe('Getting container id data', () => {
    beforeEach(() => {
      nock(`${baseUrl}/${baseVersion}`)
        .get('/containers?page=1&limit=50&sortBy=id&sortOrder=asc')
        .reply(200, getContainerIdResponse);
    });
    it('Should be able to get the id of an existing container', () => {
      return netfield.getContainerId(keyDummy, 'Testcontainer Test', false).then((response) => {
        expect(response).to.equal('somerandomid');
      });
    });
    it('Should be able to get the id of another existing container with verbose mode', () => {
      return netfield.getContainerId(keyDummy, 'Testcontainer Test2', true).then((response) => {
        expect(response).to.equal('someotherrandomid');
      });
    });
    it('Should return null if the container does not exists', () => {
      return netfield.getContainerId(keyDummy, 'Non existing container', false).then((response) => {
        expect(response).to.equal(null);
      });
    });
  });

  describe('Testing getting container id data with invalid request', () => {
    beforeEach(() => {
      nock(`${baseUrl}/${baseVersion}`, {
        reqheaders: {
          Authorization: 'wrongKey',
        },
      })
        .get('/containers?page=1&limit=50&sortBy=id&sortOrder=asc')
        .replyWithError('Invalid url');
    });
    it('Should throw an error if the url is invalid', () => {
      return netfield.getContainerId('wrongKey', 'Testcontainer Test', false).catch((error) => {
        expect(error.message).to.equal('Invalid url');
      });
    });
  });

  describe('Testing with invalid key', () => {
    beforeEach(() => {
      nock(`${baseUrl}/${baseVersion}`, {
        reqheaders: {
          Authorization: 'wrongKey',
        },
      })
        .get('/containers?page=1&limit=50&sortBy=id&sortOrder=asc')
        .reply(401, 'Invalid Token');
    });
    it('Should throw an error if the header/key is invalid', () => {
      return netfield.getContainerId('wrongKey', 'Testcontainer Test', false).catch((error) => {
        expect(error.message).to.equal('Invalid request');
      });
    });
  });

  describe('Testing the file load function', () => {
    before(() => {
      mock({
        'path/to/fake/dir': {
          'config.json': '{"data": "test"}',
          'empty-dir': {
            /** empty directory */
          },
        },
      });
    });
    after(() => {
      mock.restore();
    });
    it('Should be able to load relative paths', () => {
      return netfield.getConfigDataFromJson('path/to/fake/dir/config.json').then((data) => {
        expect(data).to.equal('{"data": "test"}');
      });
    });
    // this still needs to be implemented. The path behaviur can not be recreated ...
    // it("Should be able to load relative paths with the node_js/.bin/ fix for deployed packages", () => {
    //   return netfield.getConfigDataFromJson('/path/to/fake/dir/config_npm.json')
    //     .then(data => {
    //       expect(data).to.equal('{"data": "test2"}');
    //     });
    // });
    // it("Should be able to load absolute paths", () => {
    //   filepath = path.join(__dirname, '/path/to/fake/dir/config.json');
    //   return netfield.getConfigDataFromJson(filepath)
    //     .then(data => {
    //       expect(data).to.equal('{"data": "test"}');
    //     });
    // });
    it('Should throw an error if the file does not exists', () => {
      return netfield.getConfigDataFromJson('path/to/fake/dir/notexisting.json').catch((error) => {
        expect(error.message).to.equal('File not found');
      });
    });
    it('Should throw an error if the Path is wrong', () => {
      return netfield.getConfigDataFromJson('path/wrong/path/dir/config.json').catch((error) => {
        expect(error.message).to.equal('File not found');
      });
    });
  });
});
