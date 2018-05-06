import * as Realm from 'realm';
import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';
import { Component } from '@nestjs/common';
import { DataWS } from '../../interfaces/dataWS.interface';
import { DeviceDB } from '../../interfaces/deviceDB.interface';
import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';
import { SensorDB } from '../../interfaces/sensorDB.interface';
import {
    DeviceSchema,
    LogSchema,
    SensorSchema,
    DataSheetSchema,
    SensorDataSheetSchema,
    RoomSchema,
    SettingSchema,
} from '../../schemas/nodes/nodes.schema';
import { EventsWS } from '../../interfaces/eventsWS.interface';
import { Node } from '../../interfaces/node.interface';
import { RoomDB } from '../../interfaces/roomDB.interface';
import { subscribeOn } from 'rxjs/operator/subscribeOn';
import * as configJSON from '../../../../../config.json';
import { Config } from '../../interfaces/config.interface';

const config: Config = configJSON as any;

@Component()
export class RealmService {
    
    constructor() {}
    
    /**
    * @name OpenedRealm
    * @description the opened Realm Object DB
    */
    private OpenedRealm = Realm.open(
        {
            path: 'realm/db.realm',
            schema: [
                DeviceSchema,
                LogSchema,
                SensorSchema,
                DataSheetSchema,
                SensorDataSheetSchema,
                RoomSchema,
                SettingSchema,
            ], 
            schemaVersion: 0,
            migration: (oldRealm, newRealm) => {}
        });
        
/************************************keys*************************************/
        
        /**
        * @name generateKeys
        * @description creates the security keys (AppKey and AppEUI)
        */
        async generateKeys() {
            this.OpenedRealm.then(realm => {
                try {
                    realm.write(() => {
                        let setting = realm.objectForPrimaryKey('Setting', 0);
                        if (!setting) {
                            realm.create('Setting', {
                                id: 0,
                                appeui: crypto.randomBytes(8).toString('hex'),
                                appkey: crypto.randomBytes(16).toString('hex'),
                            });
                        }
                    });
                } catch (error) {
                    console.error('ERROR at generateKeys(): ' + error);
                }
            })
            .catch(error => {
                console.error('ERROR at generateKeys(): ' + error);
            });
        }
        
        async getKeys(): Promise<{ appeui: string, appkey: string }> {
            let keys = { appeui: null, appkey: null }
            await this.OpenedRealm.then(realm => {
                try {
                    realm.write(() => {
                        let setting = realm.objectForPrimaryKey('Setting', 0);
                        if (setting) {
                            keys.appeui = (setting as any).appeui;
                            keys.appkey = (setting as any).appkey;
                        }
                    });
                } catch (error) {
                    console.error('ERROR at getKeys(): ' + error);
                }
            })
            .catch(error => {
                console.error('ERROR at getKeys(): ' + error);
            });
            return keys;
        }
        
/***********************************devices***********************************/
        
        /**
        * @name createDevice
        * @param deveui
        * @param devaddr
        * @param model
        * @param battery
        * @param has_temperature
        * @param has_pressure
        * @param has_humidity
        * @param has_moisture
        * @param has_movement
        * @param has_door_sensor
        * @param has_light_sensor
        * @description creates the node in the LoRaServer
        */
        async createDevice( dev: DeviceDB ): Promise<boolean> {
            let created = false;
            await this.OpenedRealm.then(realm => {
                const device = realm.objectForPrimaryKey('Device', dev.deveui);
                if (device === undefined) {
                    created = true;
                    try {
                        realm.write(() => {
                            let room = realm.objectForPrimaryKey('Room', dev.deveui);
                            if (!room) {
                                room = {
                                    roomName: dev.room.roomName,
                                }
                            }
                            
                            const node = realm.create('Device', {
                                deveui: dev.deveui,
                                devaddr: dev.devaddr,
                                model: dev.model,
                                desc: dev.desc,
                                battery: (dev.battery === undefined) ? 0 : dev.battery,
                                last_seen: new Date(Date.now()),
                                data_sheet: dev.data_sheet,
                            });
    
                            // TODO: check
                            if (room) {
                                (node as any).room = room;
                            } else {
                                (node as any).room = {
                                    roomName: dev.room.roomName,
                                }
                            }
    
                        });
                    } catch (error) {
                        console.error('ERROR at createDevice(): ' + error);
                        created = false;
                    }
                }
            })
            .catch(error => {
                console.error('ERROR at createDevice(): ' + error);
                created = false;
            });
            return created;
        }
        
        async updateDeviceStatus(msg: EventsWS) {
            this.OpenedRealm.then(realm => {
                try {
                    realm.write(() => {
                        let device: DeviceDB = realm.objectForPrimaryKey('Device', msg.deveui);
                        if (device) {
                            if (msg.event === 'joined') {
                                device.last_seen = new Date(msg.datetime);
                            }
                            const log = realm.create('Log', {
                                date: new Date(msg.datetime),
                                deveui: msg.deveui,
                                event: msg.event,
                            });
                            device.log.push(log);
                        }
                    });
                } catch (error) {
                    console.error('ERROR at updateDeviceStatus(): ' + error);
                }
            })
            .catch(error => {
                console.error('ERROR at updateDeviceStatus(): ' + error);
            });
        }
        
        /**
         * @name getDevicesByRoom
         * @returns an array of rooms with the associated devices
         */
        async getDevicesByRoom() {
            let devicesByRoom = [];
            await this.OpenedRealm.then(realm => {
                try {
                    let rooms = realm.objects('Room');
                    for (const c in rooms) {
                        let roomName = (rooms[c] as RoomDB).roomName;
                        let devices = []
                        for (const i in (rooms[c] as RoomDB).owners) {
                            let r = { 
                                checked: false,
                                deveui: (rooms[c] as RoomDB).owners[i].deveui,
                                desc: (rooms[c] as RoomDB).owners[i].desc,
                                expanded: false }
                            devices.push(r)
                        }
                        if (devices.length > 0) {
                            let room = { roomName, devices }
                            devicesByRoom.push(room);
                        }
                    }
                } catch (error) {
                    console.error('ERROR at getDevice(): ' + error);
                }
            })
            .catch(error => {
                console.error('ERROR at getDevice(): ' + error);
            });
            return devicesByRoom;
        }
        
        /**
        * @name getDeviceRoom
        * @param deveui
        * @returns the room of a given device
        */
        async getDeviceRoom(deveui: string) {
            let roomName = '';
            await this.OpenedRealm.then(realm => {
                try {
                    const device: DeviceDB = realm.objectForPrimaryKey('Device', deveui) as DeviceDB
                    if (device.room !== undefined) { roomName = device.room.roomName; }
                } catch (error) {
                    console.error('ERROR at getDeviceRoom(): ' + error);
                }
            })
            .catch(error => {
                console.error('ERROR at getDeviceRoom(): ' + error);
            });
            return roomName;
        }
        
        /**
         * @name removeDevice
         * @param deveui
         * @description removes the device with pk deveui
         */
        async removeDevice(deveui: string) {
            this.OpenedRealm.then(realm => {
                try {
                    realm.write(() => {

                        realm.delete((realm.objectForPrimaryKey('Device', deveui) as DeviceDB).data_sheet.sensor_temperature);
                        realm.delete((realm.objectForPrimaryKey('Device', deveui) as DeviceDB).data_sheet.sensor_pressure);
                        realm.delete((realm.objectForPrimaryKey('Device', deveui) as DeviceDB).data_sheet.sensor_humidity);
                        realm.delete((realm.objectForPrimaryKey('Device', deveui) as DeviceDB).data_sheet.sensor_moisture);
                        realm.delete((realm.objectForPrimaryKey('Device', deveui) as DeviceDB).data_sheet.sensor_door);
                        realm.delete((realm.objectForPrimaryKey('Device', deveui) as DeviceDB).data_sheet.sensor_movement);
                        realm.delete((realm.objectForPrimaryKey('Device', deveui) as DeviceDB).data_sheet.sensor_light);

                        realm.delete((realm.objectForPrimaryKey('Device', deveui) as DeviceDB).data_sheet);

                        realm.delete((realm.objectForPrimaryKey('Device', deveui) as DeviceDB).sensor_readings);

                        realm.delete(realm.objectForPrimaryKey('Device', deveui));
                    });
                } catch (error) {
                    console.error('ERROR at removeDevice(): ' + error);
                }
            })
            .catch(error => {
                console.error('ERROR at removeDevice(): ' + error);
            });
        }
        
/********************************sensor_data**********************************/
        
        /**
        * @name storeSensorData
        * @param data received from LoRaServer websocket
        * @description stores the sensor data received from LoRaServer
        */
        async storeSensorData(data: DataWS) {
            this.OpenedRealm.then(realm => {
                try {
                    const node: DeviceDB = realm.objectForPrimaryKey('Device', data.deveui);
                    realm.write(() => {
                        node.last_seen = data.datetime;
                        if (data.battery !== undefined) { node.battery = data.battery; }
                        // TODO complete list
                        const value_temperature = node.data_sheet.sensor_temperature.has_sensor ? Number(data.field1.toFixed(1)) : null;
                        const value_pressure = node.data_sheet.sensor_pressure.has_sensor ? Number(data.field2.toFixed(1)) : null;
                        const value_humidity = node.data_sheet.sensor_humidity.has_sensor ? Number(data.field3.toFixed(0)) : null;
                        const value_moisture = node.data_sheet.sensor_moisture.has_sensor ? Number(data.field4.toFixed(0)) : null;
                        const value_movement = node.data_sheet.sensor_movement.has_sensor ? data.field5 : null;
                        const value_door = node.data_sheet.sensor_door.has_sensor ? data.field6 : null;
                        const value_light = node.data_sheet.sensor_light.has_sensor ? data.field7 : null;
                        
                        node.sensor_readings.push({
                            read: data.datetime,
                            value_temperature,
                            value_pressure,
                            value_humidity,
                            value_moisture,
                            value_movement,
                            value_door,
                            value_light,
                        });
                    });
                    console.log('SUCCESS: new data stored to db')
                } catch (error) {
                    console.error('ERROR 1 at storeSensorData(): ' + error);
                }
            })
            .catch(error => {
                console.error('ERROR 2 at storeSensorData(): ' + error);
            });
        }
        
        /**
        * @name addWatcher to device deveui
        * @description adds a watcher to the database
        * @returns an observale
        */
        addWatcher(deveui: string): Observable<any> {
            let observer: Observer<any>;
            this.OpenedRealm.then(realm => {
                try {
                    // realm watcher
                    realm.objects('Device').filtered("deveui == '" + deveui + "'")
                    .addListener((last_seen, changes) => {
                        // Update UI in response to modified objects
                        changes.modifications.forEach((index) => {
                            let deveui = (realm.objects('Device') as any)[index].deveui;
                            observer.next(deveui);
                        });
                    });
                } catch (error) {
                    console.error('ERROR at addWatcher(): ' + error);
                }
            });
            return new Observable(observe => {
                observer = observe;
            });
        }
        
        /**
         * @name removeWatcher
         * @description removes the watcher on the database when the websockets are disconnected
         */
        removeWatcher() {
            this.OpenedRealm.then(realm => {
                try {
                    realm.removeAllListeners();
                } catch (error) {
                    console.error('ERROR at addWatcher(): ' + error);
                }
            });
        }
        
        /**
        * @name getSensorData
        * @param body: { deveui, start, end }
        * @description returns all the data relative to a node in range start to end
        */
        async getSensorData(body) {
            
            let label = '';
            let devDescription = '';
            
            let DBreadings;
            let DataSheet: DeviceDB["data_sheet"];
            
            await this.OpenedRealm.then(realm => {
                try { // different range cases
                    const device = realm.objectForPrimaryKey('Device', body.deveui)
                    DataSheet = (device as DeviceDB).data_sheet;
                    devDescription = (device as DeviceDB).desc;
                    if (body.start !== undefined && body.end === undefined) {
                        DBreadings = (device as DeviceDB).sensor_readings.filtered('read >= $0', new Date(Number(body.start)));
                        console.log('getSensorData 1')
                    } else if (body.start === undefined && body.end !== undefined) {
                        DBreadings = (device as DeviceDB).sensor_readings.filtered('read <= $0', new Date(Number(body.end)));
                        console.log('getSensorData 2')
                    } else if (body.start !== undefined && body.end !== undefined) {
                        DBreadings = (device as DeviceDB).sensor_readings.filtered('read >= $0 AND read <= $1', new Date(Number(body.start)), new Date(Number(body.end)));
                        console.log('getSensorData 3')
                    } else if (body.start === undefined && body.end === undefined) {
                        DBreadings = (device as DeviceDB).sensor_readings;
                        console.log('getSensorData 4')
                    }
                } catch (error) {
                    console.error('ERROR at getSensorData() 1: ' + error);
                    return [];
                }
            })
            .catch(error => {
                console.error('ERROR at getSensorData() 2: ' + error);
                return [];
            });
            
            if (!DBreadings) {
                return undefined;
            }
            
            let returnDate = []
            
            let temperature = [];
            let pressure = [];
            let humidity = [];
            let moisture = [];
            let movement = [];
            let door = [];
            let light = [];
            
            let unitTemperature;
            let unitPressure;
            let unitHumidity;
            let unitMoisture;
            
            if (DataSheet !== undefined) {
                unitTemperature = DataSheet.sensor_temperature.unit;
                unitPressure = DataSheet.sensor_pressure.unit;
                unitHumidity = DataSheet.sensor_humidity.unit;
                unitMoisture = DataSheet.sensor_moisture.unit;
            }
            
            for (let i in DBreadings) {
                if (DBreadings[i]) {
                    const sensorReadingAtI = (DBreadings[i] as SensorDB);
                    returnDate.push(sensorReadingAtI.read);
                    temperature.push(sensorReadingAtI.value_temperature);
                    pressure.push(sensorReadingAtI.value_pressure);
                    humidity.push(sensorReadingAtI.value_humidity);
                    moisture.push(sensorReadingAtI.value_moisture);
                    movement.push(sensorReadingAtI.value_movement);
                    door.push(sensorReadingAtI.value_door);
                    light.push(sensorReadingAtI.value_light);
                }
            }
            
            let returnData = [
                { label: 'Temperature', unit: unitTemperature, data: temperature, deveui: body.deveui, desc: devDescription },
                { label: 'Pressure', unit: unitPressure, data: pressure, deveui: body.deveui, desc: devDescription },
                { label: 'Humidity', unit: unitHumidity, data: humidity, deveui: body.deveui, desc: devDescription },
                { label: 'Moisture', unit: unitMoisture, data: moisture, deveui: body.deveui, desc: devDescription },
                // TODO: check behaviour
                { label: 'Movement', unit: '', data: movement, deveui: body.deveui, desc: devDescription },
                { label: 'Door', unit: '', data: door, deveui: body.deveui, desc: devDescription },
                { label: 'Light', unit: '', data: light, deveui: body.deveui, desc: devDescription },
            ];
            
            return {date: returnDate, data: returnData};
        }
        
        /**
        * @name getSensorDataLast
        * @param deveui
        * @returns the last sensor readings
        */
        async getSensorDataLast(deveui: string) {
            let data = await this.OpenedRealm.then(realm => {
                try {
                    let node: DeviceDB = realm.objectForPrimaryKey('Device', deveui);
                    let lastReading = node.sensor_readings.filtered('read = $0', (node as DeviceDB).last_seen)[0] as SensorDB;
                    // TODO: finish list
                    let temperature = node.data_sheet.sensor_temperature.has_sensor ? lastReading.value_temperature : null;
                    let pressure = node.data_sheet.sensor_pressure.has_sensor ? lastReading.value_pressure : null;
                    let humidity = node.data_sheet.sensor_humidity.has_sensor ? lastReading.value_humidity : null;
                    let moisture = node.data_sheet.sensor_moisture.has_sensor ? lastReading.value_moisture : null;
                    let movement = node.data_sheet.sensor_movement.has_sensor ? lastReading.value_movement : null;
                    let door = node.data_sheet.sensor_door.has_sensor ? lastReading.value_door : null;
                    let light = node.data_sheet.sensor_light.has_sensor ? lastReading.value_light : null;
                    return {
                        newDate: (node).last_seen,
                        newData: [
                            {label: 'Temperature', data: temperature},
                            {label: 'Pressure', data: pressure},
                            {label: 'Humidity', data: humidity},
                            {label: 'Moisture', data: moisture},
                            {label: 'Movement', data: movement},
                            {label: 'Door', data: door},
                            {label: 'Light', data: light},
                        ],
                    };
                } catch (error) {
                    console.error('ERROR at getSensorDataLast(): ' + error);
                    return error;
                }
            }).catch(error => {
                console.error('ERROR at getSensorDataLast(): ' + error);
                return error;
            });
            return data;
        }
        
/***********************************konva*************************************/
        
        /**
         * @name loadKonva
         * @returns the konva canvas object from the database
         */
        async loadKonva() {
            let konva = null;
            await this.OpenedRealm.then(realm => {
                try {
                    const setting = realm.objectForPrimaryKey('Setting', 0);
                    if (setting !== undefined) {
                        konva = this.ab2JSON((setting as any).konva);
                    }
                } catch (error) {
                    console.error('ERROR at getKonva(): ' + error);
                }
            })
            .catch(error => {
                console.error('ERROR at getKonva(): ' + error);
            });
            return konva;
        }
        
        /**
         * @name saveKonva
         * @param data
         * @description saves the konva object to the database
         */
        async saveKonva(data: JSON) {
            await this.OpenedRealm.then(realm => {
                try {
                    realm.write(() => {
                        let setting = realm.objectForPrimaryKey('Setting', 0);
                        if (setting && setting !== undefined) {
                            (setting as any).konva = this.JSON2ab(data);
                        }
                    });
                } catch (error) {
                    console.error('ERROR at getKonva(): ' + error);
                }
            })
            .catch(error => {
                console.error('ERROR at getKonva(): ' + error);
            });
        }
        
        /**
         * @name ab2JSON
         * @param buf
         * @returns a buffer transformed to JSON
         */
        ab2JSON(buf): JSON {
            return JSON.parse(String.fromCharCode.apply(null, new Uint16Array(buf)));
        }
        
        /**
         * @name JSON2ab
         * @param data
         * @returns an ArrayBuffer from a JSON object
         */
        JSON2ab(data): ArrayBuffer {
            const str = JSON.stringify(data);
            const buf = new ArrayBuffer(str.length * 2); // 2 bytes for each char
            const bufView = new Uint16Array(buf);
            for (let i = 0, strLen = str.length; i < strLen; i++) {
                bufView[i] = str.charCodeAt(i);
            }
            return buf;
        }
        

/***********************************meteo*************************************/

saveJWTToken(JWT: string) {
    bcrypt.hash(JWT, 10, (err, hash) => {
        this.OpenedRealm.then(realm => {
            try {
                realm.write(() => {
                    const setting = realm.objectForPrimaryKey('Setting', 0);
                    if (setting && setting !== undefined) {
                        (setting as any).jwt = hash;
                    }
                });
            } catch (error) {
                console.error('ERROR at saveJWTToken(): ' + error);
            }
        })
        .catch(error => {
            console.error('ERROR at saveJWTToken(): ' + error);
        });
    });
}

async checkJWTToken(jwt: string): Promise<boolean> {
    let equalJWT = false;
    await this.OpenedRealm.then(async realm => {
       try {
            const setting = realm.objectForPrimaryKey('Setting', 0);
            if (setting && setting !== undefined && (setting as any).jwt !== undefined ) {
                await bcrypt.compare(jwt, (setting as any).jwt).then(res => {
                    equalJWT = res;
                }).catch(err => {
                    console.log(err);
                });
            }
        } catch (error) {
            console.error('ERROR at saveJWTToken(): ' + error);
        }
    })
    .catch(error => {
        console.error('ERROR at saveJWTToken(): ' + error);
    });
    return await equalJWT;
}

/***********************************meteo*************************************/
        
        /**
         * @name saveLocation
         * @param locationName
         * @description saves a location in the database
         * as a device and as a locations list item in setting with pk 0
         */
        async saveLocation(locationName: string) {
            // Meteo object
            const res = await this.createDevice(
                {
                    deveui: locationName,
                    devaddr: 'meteo',
                    desc: locationName,
                    room: { roomName: 'Meteo' },
                    battery: 0,
                    rssi: 0,
                    last_seen: new Date(Date.now()),
                    model: '',
                    data_sheet: {
                        sensor_temperature: { has_sensor: true },
                        sensor_pressure: { has_sensor: true },
                        sensor_humidity: { has_sensor: true },
                    }
                } as DeviceDB
            ).then(async response => {
                if (response) {
                    // Settings object
                    await this.OpenedRealm.then(realm => {
                        try {
                            realm.write(() => {
                                const setting = realm.objectForPrimaryKey('Setting', 0);
                                if (setting && setting !== undefined) {
                                    (setting as any).locations.push(locationName);
                                    (setting as any).apikey = config.OWMApiKey;
                                }
                            });
                        } catch (error) {
                            console.error('ERROR at saveLocation(): ' + error);
                        }
                    })
                    .catch(error => {
                        console.error('ERROR at saveLocation(): ' + error);
                    });
                }
            });
        }
        
        /**
         * @name getLocations
         * @returns a list of locations stored in the setting element in the database
         */
        async getLocations() {
            let locations = null;
            await this.OpenedRealm.then(realm => {
                try {
                    let setting = realm.objectForPrimaryKey('Setting', 0);
                    const locationData = (realm.objectForPrimaryKey('Setting', 0) as any);
                    locations = { locations: locationData.locations, apikey: locationData.apikey }
                } catch (error) {
                    console.error('ERROR at getLocations(): ' + error);
                }
            })
            .catch(error => {
                console.error('ERROR at getLocations(): ' + error);
            });
            return locations;
        }
        
    }