// disabling logger here
process.env.LOG_LEVEL = 'silent';

const path = require('path');
var rewire = require('rewire');
const expect = require('chai').expect;
const nock = require('nock');
const mock = require('mock-fs');

const netfield = require('./../netfieldHelper');

const createResponse = require('./mock/createResponse');
const updateResponse = require('./mock/updateResponse');
const createDeviceResponse = require('./mock/createDeviceResponse');
const getContainerIdResponse = require('./mock/getContainerIdResponse');
const getGroupResponse = require('./mock/getGroupResonse');

var privateFunctionhelper = rewire('./../netfieldHelper.js');
getDeviceConfig = privateFunctionhelper.__get__('getDeviceConfig');

// API URL to mock
const baseUrl = 'https://api.netfield.io';
const baseVersion = 'v1';

const keyDummy = '123456789';
const containerIdDummy = 'somerandomid';
const deviceIdDummy = 'randomdevice';
const displayNameDummy = 'Testcontainer Test';
const tagNameDummy = 'tag-1';
const realContainerIdDummy = 'aaaaaaaa-1111-11aa-22ss-123456789alf';

describe('Testing the Helper Functions which combine multiple index.js ones', () => {
  beforeEach(() => {
    nock(`${baseUrl}/${baseVersion}`)
      .delete(`/devices/${deviceIdDummy}/containers/${containerIdDummy}`)
      .reply(204, '')
      .delete(`/devices/${deviceIdDummy}/containers/${realContainerIdDummy}`)
      .reply(204, '')
      .post('/containers')
      .reply(201, createResponse)
      .put(`/containers/${containerIdDummy}`)
      .reply(201, updateResponse)
      .post(`/devices/${deviceIdDummy}/containers/${containerIdDummy}`)
      .reply(201, createDeviceResponse)
      .post(`/devices/${deviceIdDummy}/containers/${realContainerIdDummy}`)
      .reply(201, createDeviceResponse)
      .post(`/devices/idOfFirstDevice/containers/${realContainerIdDummy}`)
      .reply(201, '')
      .post(`/devices/idOfSecondDevice/containers/${realContainerIdDummy}`)
      .reply(201, '')
      .post(`/devices/${deviceIdDummy + '_exist'}/containers/${containerIdDummy}`)
      .reply(400, 'Container already exists!')
      .get('/containers?page=1&limit=50&sortBy=id&sortOrder=asc')
      .reply(200, getContainerIdResponse)
      .post(`/devices/${deviceIdDummy}/methods`)
      .reply(200, 'Filler for now')
      .post(`/devices/${deviceIdDummy}_wrong/methods`)
      .reply(404, 'Not found')
      .get(`/groups/4`)
      .reply(200, getGroupResponse);

    mock({
      'path/to/fake/dir': {
        'containerConfig.json':
          '{"displayName": "Testcontainer Test", "version": "1", "restartPolicy": "always", "type": "docker", "desiredStatus": "running", "imageUri": "www.uritotheimage.com", "tagName": "tag-1", "category": "cat", "processorArchitecture": "ARM", "shortDescription": "desc", "description": "desc", "containerCreateOptions": {}, "containerTwinDesiredOptions": {}, "environmentVariables": [], "containerType": "private", "organisationId": "12345", "registryType": "private", "credentials": {}}',
        'newContainerConfig.json':
          '{"displayName": "Testcontainer Test3", "version": "1", "restartPolicy": "always", "type": "docker", "desiredStatus": "running", "imageUri": "www.uritotheimage.com", "tagName": "tag-1", "category": "cat", "processorArchitecture": "ARM", "shortDescription": "desc", "description": "desc", "containerCreateOptions": {}, "containerTwinDesiredOptions": {}, "environmentVariables": [], "containerType": "private", "organisationId": "12345", "registryType": "private", "credentials": {}}',
        'deviceConfig.json': '{}',
      },
    });
  });

  afterEach(() => {
    mock.restore();
  });

  describe('createContainer', () => {
    it('Should be able to be executed on an existing container', () => {
      return netfield
        .createContainer(keyDummy, tagNameDummy, 'path/to/fake/dir/containerConfig.json', false)
        .then((response) => {
          convertedResponse = JSON.parse(response);
          expect(typeof convertedResponse).to.equal('object');
          expect(convertedResponse.id).to.equal('somerandomid');
        });
    });
    it('Should be able to be executed on an existing container in verbose mode', () => {
      return netfield
        .createContainer(keyDummy, tagNameDummy, 'path/to/fake/dir/containerConfig.json', true)
        .then((response) => {
          convertedResponse = JSON.parse(response);
          expect(typeof convertedResponse).to.equal('object');
          expect(convertedResponse.id).to.equal('somerandomid');
        });
    });
    it('Should be able to create a non existing container', () => {
      return netfield
        .createContainer(keyDummy, tagNameDummy, 'path/to/fake/dir/newContainerConfig.json', false)
        .then((response) => {
          convertedResponse = JSON.parse(response);
          expect(typeof convertedResponse).to.equal('object');
          expect(convertedResponse.id).to.equal('somerandomid');
        });
    });
    it('Should be able to create a non existing container in verbose mode', () => {
      return netfield
        .createContainer(keyDummy, tagNameDummy, 'path/to/fake/dir/newContainerConfig.json', true)
        .then((response) => {
          convertedResponse = JSON.parse(response);
          expect(typeof convertedResponse).to.equal('object');
          expect(convertedResponse.id).to.equal('somerandomid');
        });
    });
  });

  describe('createAndDeployContainer', () => {
    it('Should be able to create and deploy a non existing container with force on', () => {
      return netfield
        .createAndDeployContainer(
          keyDummy,
          tagNameDummy,
          'path/to/fake/dir/newContainerConfig.json',
          undefined,
          deviceIdDummy,
          true,
          false
        )
        .then((response) => {
          convertedResponse = JSON.parse(response);
          expect(typeof convertedResponse).to.equal('object');
          expect(convertedResponse.id).to.equal('somerandomid');
        });
    });
    it('Should be able to create and deploy a non existing container with force on in verbose mode', () => {
      return netfield
        .createAndDeployContainer(
          keyDummy,
          tagNameDummy,
          'path/to/fake/dir/newContainerConfig.json',
          undefined,
          deviceIdDummy,
          true,
          true
        )
        .then((response) => {
          convertedResponse = JSON.parse(response);
          expect(typeof convertedResponse).to.equal('object');
          expect(convertedResponse.id).to.equal('somerandomid');
        });
    });
    it('Should be able to create and deploy a non existing container with force off', () => {
      return netfield
        .createAndDeployContainer(
          keyDummy,
          tagNameDummy,
          'path/to/fake/dir/newContainerConfig.json',
          undefined,
          deviceIdDummy,
          false,
          true
        )
        .then((response) => {
          convertedResponse = JSON.parse(response);
          expect(typeof convertedResponse).to.equal('object');
          expect(convertedResponse.id).to.equal('somerandomid');
        });
    });
    it('Should be able to create and deploy a non existing container with a device config file', () => {
      return netfield
        .createAndDeployContainer(
          keyDummy,
          tagNameDummy,
          'path/to/fake/dir/newContainerConfig.json',
          'path/to/fake/dir/deviceConfig.json',
          deviceIdDummy,
          false,
          false
        )
        .then((response) => {
          convertedResponse = JSON.parse(response);
          expect(typeof convertedResponse).to.equal('object');
          expect(convertedResponse.id).to.equal('somerandomid');
        });
    });
  });

  describe('deployContainer', () => {
    it('Should be able to deploy a non existing container', () => {
      return netfield
        .deployContainer(keyDummy, deviceIdDummy, realContainerIdDummy, undefined, false, false)
        .then((response) => {
          convertedResponse = JSON.parse(response);
          expect(typeof convertedResponse).to.equal('object');
          expect(convertedResponse.id).to.equal('somerandomid');
        });
    });
    it('Should be able to deploy an existing container with force', () => {
      return netfield
        .deployContainer(keyDummy, deviceIdDummy, realContainerIdDummy, undefined, true, false)
        .then((response) => {
          convertedResponse = JSON.parse(response);
          expect(typeof convertedResponse).to.equal('object');
          expect(convertedResponse.id).to.equal('somerandomid');
        });
    });
    it('Should be able to deploy a non existing container in verbose', () => {
      return netfield
        .deployContainer(keyDummy, deviceIdDummy, realContainerIdDummy, undefined, false, true)
        .then((response) => {
          convertedResponse = JSON.parse(response);
          expect(typeof convertedResponse).to.equal('object');
          expect(convertedResponse.id).to.equal('somerandomid');
        });
    });
    it('Should be able to deploy an existing container in verbose with force', () => {
      return netfield
        .deployContainer(keyDummy, deviceIdDummy, realContainerIdDummy, undefined, true, true)
        .then((response) => {
          convertedResponse = JSON.parse(response);
          expect(typeof convertedResponse).to.equal('object');
          expect(convertedResponse.id).to.equal('somerandomid');
        });
    });
    it('Should be able to deploy an container when a name instead of the id is given', () => {
      return netfield
        .deployContainer(keyDummy, deviceIdDummy, displayNameDummy, undefined, true, true)
        .then((response) => {
          convertedResponse = JSON.parse(response);
          expect(typeof convertedResponse).to.equal('object');
          expect(convertedResponse.id).to.equal('somerandomid');
        });
    });
  });

  describe('postMethod', () => {
    it('Should be able retry if response is a 404', () => {
      return netfield
        .postMethod(keyDummy, `${deviceIdDummy}_wrong`, 'containerName', 'methodName', '{}', 2, 0, true)
        .then((response) => {
          expect(response[0]).to.equal(404);
        });
    });
    it('Should be able to run postMethod', () => {
      return netfield
        .postMethod(keyDummy, deviceIdDummy, 'containerName', 'methodName', '{}', 2, 0, false)
        .then((response) => {
          expect(response[0]).to.equal(200);
        });
    });
    it('Should be able to run postMethod with undefined parameters', () => {
      return netfield
        .postMethod(keyDummy, deviceIdDummy, 'containerName', 'methodName', undefined, undefined, undefined, false)
        .then((response) => {
          expect(response[0]).to.equal(200);
        });
    });
    it('Should be able to run postMethod in verbose mode', () => {
      return netfield
        .postMethod(keyDummy, deviceIdDummy, 'containerName', 'methodName', '{}', 2, 0, true)
        .then((response) => {
          expect(response[0]).to.equal(200);
        });
    });
  });

  describe('deployContainerOnGroup', () => {
    it('Should be able to carry out process if container exists in verbose', () => {
      return netfield
        .deployContainerOnGroup(keyDummy, 4, realContainerIdDummy, undefined, false, true)
        .then((response) => {
          expect(response).to.equal(true);
        });
    });
    it('Should be able to carry out process if container exists in not verbose', () => {
      return netfield
        .deployContainerOnGroup(keyDummy, 4, realContainerIdDummy, undefined, false, false)
        .then((response) => {
          expect(response).to.equal(true);
        });
    });
    it('Should be terminate if container does not exists', () => {
      return netfield.deployContainerOnGroup(keyDummy, 4, 'wrong name', undefined, false, true).then((response) => {
        expect(response).to.equal(false);
      });
    });
  });
});
