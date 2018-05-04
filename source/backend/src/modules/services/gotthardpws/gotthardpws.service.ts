import { Component } from '@nestjs/common';
import { Subject } from "rxjs/Rx"
import { RealmService } from '../realm/realm.service';
import * as WebSocket from 'ws';
import * as configJSON from '../../../../../config.json';
import * as rnd from 'random-js';
import { DataWS } from '../../interfaces/dataWS.interface';
import { EventsWS } from '../../interfaces/eventsWS.interface';
import { MeteoService } from '../meteo/meteo.service';
import { Config } from '../../interfaces/config.interface';

const config: Config = configJSON as any;
const gotthardpws = config.gotthardpws;
const gotthardpevtws = config.gotthardpevtws;

@Component()
export class GotthardpwsService {
    constructor(private readonly _realm: RealmService,
                private readonly _meteo: MeteoService) {}
    
    private uplinkWS;
    private eventsWS;
    
    public events$: Subject<EventsWS> = new Subject();
    
    /**
    * @name connect
    * @description connects to the uplinks websockets and sends data to the database (/ws/uplinks/{devaddr})
    */
    connect() {
        const self = this;
        const path = gotthardpws;
        
        /**
        * @name setup
        * @description setups the websocket intstance to the LoRaServer
        */
        async function setup() {
            await self.delay(5000);
            self.uplinkWS = new WebSocket(path);
            self.uplinkWS.binaryType = 'arraybuffer';
            self.uplinkWS.onopen = (evt) => { onOpen(evt); };
            self.uplinkWS.onclose = (evt) => { onClose(evt); };
            self.uplinkWS.onmessage = (evt) => { onMessage(evt); };
            self.uplinkWS.onerror = (evt) => { onError(evt); };
        }
        
        setup();
        
        /**
        * @name onOpen
        * @param evt
        * @description when the websocket connects
        */
        function onOpen(evt) {
            console.log('SUCCESS: LORASERVER uplinks WS opened');
        }
        
        /**
        * @name onClose
        * @param evt
        * @description when the websocket closes the connection
        */
        function onClose(evt) {
            console.log('SUCCESS: LORASERVER uplinks WS closed');
            setup(); // tries to rejoin socket
        }
        
        /**
        * @name onMessage
        * @param evt
        * @description when the websocket receives a message
        */
        function onMessage(evt) {
            console.log('SUCCESS: LORASERVER uplinks WS message');
            const msg: DataWS = JSON.parse(evt.data);
            console.log(msg);
            self._realm.storeSensorData(msg);
            // console.log(msg);
        }
        
        /**
        * @name onError
        * @param evt
        * @description when there is an error in the ws connection
        */
        function onError(evt) {
            console.log('ERROR: LORASERVER uplinks WS error');
            console.error('ERROR: LORASERVER uplinks WS error: ' + evt.data);
        }
        
    }
    
    /**
    * @name events
    * @description connects to the events websockets to read status of nodes (/ws/events/)
    */
    events() {
        const self = this;
        const path = gotthardpevtws;
        
        /**
        * @name setup
        * @description setups the websocket intstance to the LoRaServer
        */
        async function setup() {
            await self.delay(2000); // TODO check
            self.eventsWS = new WebSocket(path);
            self.eventsWS.binaryType = 'arraybuffer';
            self.eventsWS.onopen = (evt) => { onOpen(evt); };
            self.eventsWS.onclose = (evt) => { onClose(evt); };
            self.eventsWS.onmessage = (evt) => { onMessage(evt); };
            self.eventsWS.onerror = (evt) => { onError(evt); };
        }
        
        setup();
        
        /**
        * @name onOpen
        * @param evt
        * @description when the websocket connects
        */
        function onOpen(evt) {
            console.log('SUCCESS: LORASERVER events WS opened');
        }
        
        /**
        * @name onClose
        * @param evt
        * @description when the websocket closes the connection
        */
        function onClose(evt) {
            console.log('SUCCESS: LORASERVER events WS closed');
            setup(); // tries to rejoin socket
        }
        
        /**
        * @name onMessage
        * @param evt
        * @description when the websocket receives a message
        */
        function onMessage(evt) {
            console.log('SUCCESS: LORASERVER events WS message');
            const msg: EventsWS = JSON.parse(evt.data);
            self._realm.updateDeviceStatus(msg);
            self.events$.next(msg);
            console.log(msg);
        }
        
        /**
        * @name onError
        * @param evt
        * @description when there is an error in the ws connection
        */
        function onError(evt) {
            console.log('ERROR: LORASERVER events WS error');
            console.error('ERROR: LORASERVER events WS error: ' + evt.data);
        }
        
    }
    
    async simulateData(devices: {deveui: string, city: string}[]) {
        
        for (let i = 0; i < devices.length; i++) {
            const msg = {} as DataWS;
            msg.battery = 240;
            msg.deveui = devices[i].deveui;
            let meteo = await this._meteo.getMeteo();
            msg.field1 = meteo.main.temp;
            msg.field2 = meteo.main.pressure;
            msg.field3 = meteo.main.humidity;
            this._realm.storeSensorData(msg);
        }
        await this.delay(60000 * 10);
        
        this.simulateData(devices);
    }
    
    /**
    * @name delay
    * @param ms: time in milliseconds
    * @description returns a Promise of a timeout
    */
    async delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}