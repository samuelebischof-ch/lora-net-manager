import { RealmService } from '../realm/realm.service';
import { Component } from '@nestjs/common';
import { Gateway } from '../../interfaces/gateway.interface';
import { Device } from '../../interfaces/device.interface';
import * as request from 'request';
import * as rp from 'request-promise-native';
import * as configJSON from '../../../../../config.json';
import * as gotthardpConfigJSON from '../../../../gotthardp.config.json';
import { Config } from '../../interfaces/config.interface';

const config: Config = configJSON as any;
const gotthardpConfig: any = gotthardpConfigJSON as any;
const loRaServerOptions: Config["loRaServerOptions"] = config.loRaServerOptions;
const gatewayOptions = gotthardpConfig.gateway;
const networkOptions = gotthardpConfig.network;
const profileOptions = gotthardpConfig.profile;
const handlerOptions = gotthardpConfig.handler;
const connectorOptions = gotthardpConfig.connectors;
const deviceOptions = gotthardpConfig.device;
const downlinkOptions = gotthardpConfig.downlink;

@Component()
export class GotthardpService {

    constructor(private readonly _realm: RealmService) {}

/********************************** gateways *********************************/

    /**
     * @name getGateways
     * @returns list of gateways
     * @description returns the list of gatewy registered to gotthardp
     */
    async getGateways(): Promise<Array<Gateway>> {
        const options = Object.assign({}, loRaServerOptions);
        options.uri += 'api/gateways';
        options.method = 'GET';
        try {
            const gateways = await rp(options);
            return JSON.parse(gateways);
        } catch (err) {
            console.error('ERROR at getGateways(): ' + err);
            return err;
        }
    }

    /**
     * @name addGateway
     * @description adds a gateway from the settings in gotthardp.config.json to the server
     */
    async addGateway(body) {
        const options = Object.assign({}, loRaServerOptions);
        options.uri += 'api/gateways';
        options.method = 'POST';
        options.json = Object.assign({}, gatewayOptions);
        options.json.mac = body.mac;
        try {
            await rp(options);
            console.log('SUCCESS: at addGateway()');
        } catch (err) {
            console.error('ERROR at addGateway(): ' + err);
            return err;
        }
    }

    /**
     * @name removeGateway
     * @param mac
     * @description removes the gateway from the gotthardp server
     */
    async removeGateway(mac: string) {
        const options = Object.assign({}, loRaServerOptions);
        options.uri += 'api/gateways/' + mac;
        options.method = 'DELETE';
        try {
            await rp(options);
            console.log('SUCCESS: at removeGateway()')
        } catch (err) {
            console.error('ERROR at removeGateway(): ' + err);
            return err;
        }
    }

/********************************** network **********************************/

    /**
     * @name addNetwork
     * @description adds a network from the settings in gotthardp.config.json to the server
     */
    addNetwork() {
        const options = Object.assign({}, loRaServerOptions);
        options.uri += 'api/networks';
        options.method = 'POST';
        options.json = Object.assign({}, networkOptions);
        request(options, (error, response, body) => {
            if (error) console.log(error);
        });
    }

/********************************** profile **********************************/

    /**
     * @name addProfile
     * @description adds a profile from the settings in gotthardp.config.json to the server
     */
    addProfile() {
        const options = Object.assign({}, loRaServerOptions);
        options.uri += 'api/profiles';
        options.method = 'POST';
        options.json = Object.assign({}, profileOptions);
        request(options, (error, response, body) => {
            if (error) console.log(error);
        });
    }

/********************************** handler **********************************/

    /**
     * @name addHandler
     * @description adds a handler from the settings in gotthardp.config.json to the server
     */
    addHandler() {
        const options = Object.assign({}, loRaServerOptions);
        options.uri += 'api/handlers';
        options.method = 'POST';
        options.json = Object.assign({}, handlerOptions);
        request(options, (error, response, body) => {
            if (error) console.log(error);
        });
    }

/********************************* connector *********************************/

    /**
     * @name addConnectors
     * @description adds a connector from the settings in gotthardp.config.json to the server
     */
    addConnectors() {
        const options = Object.assign({}, loRaServerOptions);
        options.uri += 'api/connectors';
        options.method = 'POST';
        // tslint:disable-next-line:forin
        for (const c in connectorOptions) {
            options.json = Object.assign({}, connectorOptions[c]);
            request(options, (error, response, body) => {
                if (error) console.log(error);
            });
        }
    }

/*********************************** device **********************************/

    /**
     * @name getDevices
     * @returns list of devices
     * @description returns the list of gatewy registered to gotthardp
     */
    async getDevices(): Promise<Array<Device>> {
        const options = Object.assign({}, loRaServerOptions);
        options.uri += 'api/devices';
        options.method = 'GET';
        try {
            const devices = await rp(options);
            return JSON.parse(devices);
        } catch (err) {
            console.error('ERROR at getDevices(): ' + err);
            return err;
        }
    }

    /**
     * @name addDevice
     * @description adds a device from the settings in gotthardp.config.json to the server
     */
    addDevice(body) {
        const options = Object.assign({}, loRaServerOptions);
        options.uri += 'api/devices';
        options.method = 'POST';
        options.json = Object.assign({}, deviceOptions);
        
        this._realm.getKeys().then(res => {
            options.json.appeui = (body.appeui === undefined) ? res.appeui : body.appeui;
            options.json.appkey = (body.appkey === undefined) ? res.appkey : body.appkey;
            options.json.desc = body.desc;
            options.json.deveui = body.deveui;
            // after creation node transforms do devaddr
            options.json.node = body.devaddr;

            request(options, (error, response, body) => {
                if (error) console.log(error);
            });
        });
    }

    /**
     * @name removeDevice
     * @param mac
     * @description removes the gateway from the gotthardp server
     */
    async removeDevice(deveui: string) {
        const options = Object.assign({}, loRaServerOptions);
        options.uri += 'api/devices/' + deveui;
        options.method = 'DELETE';
        try {
            await rp(options);
            console.log('SUCCESS: at removeDevice()')
        } catch (err) {
            console.error('ERROR at removeDevice(): ' + err);
            return err;
        }
    }

    /**
     * @name downlinkTo
     * @description sends a downlink to the device with id devaddr
     */
    downlinkTo(devaddr: string, frame) {
        const options = Object.assign({}, loRaServerOptions);
        options.uri += 'in/' + devaddr;
        options.method = 'POST';
        options.headers = {
            'Accept': '*/*',
            'content-length': 79,
          },
        options.json = Object.assign({}, downlinkOptions);
        request(options, (error, response, body) => {
            if (error) console.log(error);
        });
    }

/*********************************** server **********************************/

    /**
     * @name pingGotthardp
     * @description checks if the LoRaServer is up and running
     */
    async pingGotthardp() {
        const options = Object.assign({}, loRaServerOptions);
        options.uri += 'api/servers';
        options.method = 'GET';
        try {
            await rp(options);
            return true;
        } catch (err) {
            return false;
        }
    }

}