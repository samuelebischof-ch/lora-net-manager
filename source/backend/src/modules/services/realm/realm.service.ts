import { Component, Inject, forwardRef } from '@nestjs/common';
import { DataWS } from '../../../../../shared/interfaces/dataWS.interface';
import { DeviceDB, DataSheet, SensorDataSheet } from '../../../../../shared/interfaces/deviceDB.interface';
import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';
import { SensorDB } from '../../../../../shared/interfaces/sensorDB.interface';
import { EventsWS } from '../../../../../shared/interfaces/eventsWS.interface';
import { Node } from '../../../../../shared/interfaces/node.interface';
import { RoomDB } from '../../../../../shared/interfaces/roomDB.interface';
import { subscribeOn } from 'rxjs/operator/subscribeOn';
import { Config } from '../../../../../shared/interfaces/config.interface';
import { LoggerService } from '../logger/logger.service';
import { EventService } from '../events/events.service';
import { GotthardpService } from '../gotthardp/gotthardp.service';
import { Readable } from 'stream';
import {
  DeviceSchema,
  LogSchema,
  SensorSchema,
  DataSheetSchema,
  SensorDataSheetSchema,
  RoomSchema,
  SettingSchema,
} from '../../schemas/nodes/nodes.schema';
import * as Realm from 'realm';
import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';
import * as configJSON from '../../../../config.json';

const config: Config = configJSON as any;

@Component()
export class RealmService {

  constructor(
    @Inject(forwardRef(() => EventService))
    private readonly _events: EventService,
    @Inject(forwardRef(() => GotthardpService))
    private readonly _gotthardp: GotthardpService,
    private readonly _logger: LoggerService,
  ) {}

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
      migration: (oldRealm, newRealm) => {},
    },
  );

  /********************************** keys ***********************************/

  /**
  * @name generateKeys
  * @description creates the security keys (AppKey and AppEUI)
  */
  async generateKeys() {
    this.OpenedRealm.then(realm => {
      try {
        realm.write(() => {
          const setting = realm.objectForPrimaryKey('Setting', 0);
          if (!setting) {
            realm.create('Setting', {
              id: 0,
              appeui: crypto.randomBytes(8).toString('hex'),
              appkey: crypto.randomBytes(16).toString('hex'),
            });
          }
        });
      } catch (error) {
        this._logger.error('at generateKeys(): ' + error);
      }
    })
    .catch(error => {
      this._logger.error('at generateKeys(): ' + error);
    });
  }

  async getKeys(): Promise<{ appeui: string, appkey: string }> {
    const keys = { appeui: null, appkey: null };
    await this.OpenedRealm.then(realm => {
      try {
        realm.write(() => {
          const setting = realm.objectForPrimaryKey('Setting', 0);
          if (setting) {
            keys.appeui = (setting as any).appeui;
            keys.appkey = (setting as any).appkey;
          }
        });
      } catch (error) {
        this._logger.error('at getKeys(): ' + error);
      }
    })
    .catch(error => {
      this._logger.error('at getKeys(): ' + error);
    });
    return keys;
  }

  /********************************** devices ********************************/

  /**
  * @name createDevice
  * @param dev DeviceDB
  * @returns a Promise of a boolean
  * @description creates the device and returns true on success
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
                name: dev.room.name,
              };
            }

            /**
            * convert dev.data_sheet nulls to +infinity and -infinity which are
            * removed when converting to json
            */
            for (const key in dev.data_sheet) {
              if (dev.data_sheet.hasOwnProperty(key)) {
                const min = dev.data_sheet[key].permitted_min;
                const max = dev.data_sheet[key].permitted_max;
                dev.data_sheet[key].permitted_min = (min === null || min === undefined) ? Number.NEGATIVE_INFINITY : min;
                dev.data_sheet[key].permitted_max = (max === null || max === undefined) ? Number.POSITIVE_INFINITY : max;
              }
            }

            const node = realm.create('Device', {
              deveui: dev.deveui,
              devaddr: dev.devaddr,
              model: dev.model,
              desc: dev.desc,
              battery: dev.battery,
              last_seen: new Date(Date.now()),
              data_sheet: dev.data_sheet,
            });

            if (room) {
              (node as any).room = room;
            } else {
              (node as any).room = {
                name: dev.room.name,
                description: dev.room.description,
              };
            }

          });
        } catch (error) {
          this._logger.error('at createDevice(): ' + error);
          created = false;
        }
      }
    })
    .catch(error => {
      this._logger.error('at createDevice(): ' + error);
      created = false;
    });
    return created;
  }

  async updateDeviceStatus(msg: EventsWS) {
    this.OpenedRealm.then(realm => {
      try {
        realm.write(() => {
          const device: DeviceDB = realm.objectForPrimaryKey('Device', msg.deveui);
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
        this._logger.error('at updateDeviceStatus(): ' + error);
      }
    })
    .catch(error => {
      this._logger.error('at updateDeviceStatus(): ' + error);
    });
  }

  /**
  * @name getDevicesByRoom
  * @returns an array of rooms with the associated devices
  */
  async getDevicesByRoom() {
    const devicesByRoom = [];
    await this.OpenedRealm.then(realm => {
      try {
        const rooms = realm.objects('Room');
        for (const room of rooms) {
          const name = (room as RoomDB).name;
          const devices = [];
          for (const owner of (room as RoomDB).owners) {
            const dev = {
              checked: false,
              deveui: owner.deveui,
              desc: owner.desc,
              expanded: false,
            };
            devices.push(dev);
          }
          if (devices.length > 0) {
            devicesByRoom.push({ name, devices });
          }
        }
      } catch (error) {
        this._logger.error('at getDevice(): ' + error);
      }
    })
    .catch(error => {
      this._logger.error('at getDevice(): ' + error);
    });
    return devicesByRoom;
  }

  /**
  * @name getDeviceRoom
  * @param deveui
  * @returns the room of a given device
  */
  async getDeviceRoom(deveui: string) {
    let name = '';
    await this.OpenedRealm.then(realm => {
      try {
        const device: DeviceDB = realm.objectForPrimaryKey('Device', deveui) as DeviceDB;
        if (device !== undefined && device.room !== undefined) { name = device.room.name; }
      } catch (error) {
        this._logger.error('at getDeviceRoom(): ' + error);
      }
    })
    .catch(error => {
      this._logger.error('at getDeviceRoom(): ' + error);
    });
    return name;
  }

  /**
  * @name removeDevice
  * @param deveui
  * @description removes the device with pk deveui
  */
  removeDevice(deveui: string) {
    new Promise((resolve, reject) => {
      this.OpenedRealm.then(realm => {
        try {
          const device: DeviceDB = realm.objectForPrimaryKey('Device', deveui);
          if (device.devaddr !== null && device.devaddr !== undefined) this._gotthardp.removeNode(device.devaddr);
          realm.write(() => {
            const dataSheet = (realm.objectForPrimaryKey('Device', deveui) as DeviceDB).data_sheet;
            for (const key in dataSheet) {
              if (dataSheet.hasOwnProperty(key)) {
                const element = dataSheet[key];
                realm.delete(element);
              }
            }
            realm.delete(device.data_sheet);
            realm.delete(device.sensor_readings);
            realm.delete(device);
            resolve();
          });
        } catch (error) {
          this._logger.error('at removeDevice(): ' + error);
        }
      })
      .catch(error => {
        this._logger.error('at removeDevice(): ' + error);
      });
    });
  }

  /****************************** sensor_data ********************************/

  /**
  * @name storeSensorData
  * @param data received from LoRaServer websocket
  * @description stores the sensor data received from LoRaServer
  */
  async storeSensorData(data: DataWS) {
    this.checkSensorData(data);
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

          data.datetime.setMilliseconds(0);

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
        this._logger.success('new data stored to db');
      } catch (error) {
        this._logger.error('1 at storeSensorData(): ' + error);
      }
    })
    .catch(error => {
      this._logger.error('2 at storeSensorData(): ' + error);
    });
  }

  /**
  * @name checkSensorData
  * @param data
  * @description checks if some readings are out of bounds,
  * sends a notification to the frontend and logs to the DB
  */
  async checkSensorData(data: DataWS) {
    this.OpenedRealm.then(realm => {
      let counter = 1;
      const dataSheet: DataSheet = (realm.objectForPrimaryKey('Device', data.deveui) as any).data_sheet;
      for (const key in dataSheet) {
        if (dataSheet.hasOwnProperty(key)) {
          const sensorSheet: SensorDataSheet = dataSheet[key];
          const field = data['field' + counter];
          if (field !== undefined) {
            if (field < sensorSheet.permitted_min || field > sensorSheet.permitted_max) {
              const msg: EventsWS = {
                app: data.app,
                datetime: new Date(data.datetime),
                devaddr: data.devaddr,
                deveui: data.deveui,
                event: (field < sensorSheet.permitted_min) ?
                'WARNING: ' + key + ' exceeded minimum permitted value' :
                'WARNING: ' + key + ' exceeded maximum permitted value',
              };
              this._events.pushEvent(msg);
            }
          }
          counter++;
        }
      }
    })
    .catch(error => {
      this._logger.error('at checkSensorData(): ' + error);
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
        realm.objects('Device').filtered('deveui == \'' + deveui + '\'')
        .addListener((last_seen, changes) => {
          // Update UI in response to modified objects
          changes.modifications.forEach((index) => {
            const deveuiT = (realm.objects('Device') as any)[index].deveui;
            observer.next(deveuiT);
          });
        });
      } catch (error) {
        this._logger.error('at addWatcher(): ' + error);
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
        this._logger.error('at addWatcher(): ' + error);
      }
    });
  }

  /**
  * @name getSensorData
  * @param body: { deveui, start, end }
  * @description returns all the data relative to a node in range start to end
  */
  async getSensorData(body) {

    let devDescription = '';
    let DBreadings;
    let DataSheet: DeviceDB['data_sheet'];

    await this.OpenedRealm.then(realm => {
      try { // different range cases
        const device = realm.objectForPrimaryKey('Device', body.deveui);
        DataSheet = (device as DeviceDB).data_sheet;
        devDescription = (device as DeviceDB).desc;
        if (body.start !== undefined && body.end === undefined) {
          DBreadings = (device as DeviceDB).sensor_readings.filtered('read >= $0', new Date(Number(body.start)));
          this._logger.success('getSensorData 1');
        } else if (body.start === undefined && body.end !== undefined) {
          DBreadings = (device as DeviceDB).sensor_readings.filtered('read <= $0', new Date(Number(body.end)));
          this._logger.success('getSensorData 2');
        } else if (body.start !== undefined && body.end !== undefined) {
          DBreadings =
          (device as DeviceDB).sensor_readings.filtered('read >= $0 AND read <= $1', new Date(Number(body.start)), new Date(Number(body.end)));
          this._logger.success('getSensorData 3');
        } else if (body.start === undefined && body.end === undefined) {
          DBreadings = (device as DeviceDB).sensor_readings;
          this._logger.success('getSensorData 4');
        }
      } catch (error) {
        this._logger.error('at getSensorData() 1: ' + error);
        return [];
      }
    })
    .catch(error => {
      this._logger.error('at getSensorData() 2: ' + error);
      return [];
    });

    if (!DBreadings) {
      return undefined;
    }

    const returnDate = [];

    const temperature = [];
    const pressure = [];
    const humidity = [];
    const moisture = [];
    const movement = [];
    const door = [];
    const light = [];

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

    for (const i in DBreadings) {
      if (DBreadings[i]) {
        const sensorReadingAtI = (DBreadings[i] as SensorDB);
        returnDate.push(sensorReadingAtI.read);
        if (DataSheet.sensor_temperature.has_sensor) {
          temperature.push(sensorReadingAtI.value_temperature);
        }
        if (DataSheet.sensor_pressure.has_sensor) {
          pressure.push(sensorReadingAtI.value_pressure);
        }
        if (DataSheet.sensor_humidity.has_sensor) {
          humidity.push(sensorReadingAtI.value_humidity);
        }
        if (DataSheet.sensor_moisture.has_sensor) {
          moisture.push(sensorReadingAtI.value_moisture);
        }
        if (DataSheet.sensor_movement.has_sensor) {
          movement.push(sensorReadingAtI.value_movement);
        }
        if (DataSheet.sensor_door.has_sensor) {
          door.push(sensorReadingAtI.value_door);
        }
        if (DataSheet.sensor_light.has_sensor) {
          light.push(sensorReadingAtI.value_light);
        }
      }
    }

    const returnData = [
      { label: 'Temperature', unit: unitTemperature, data: temperature, deveui: body.deveui, desc: devDescription },
      { label: 'Pressure', unit: unitPressure, data: pressure, deveui: body.deveui, desc: devDescription },
      { label: 'Humidity', unit: unitHumidity, data: humidity, deveui: body.deveui, desc: devDescription },
      { label: 'Moisture', unit: unitMoisture, data: moisture, deveui: body.deveui, desc: devDescription },
      { label: 'Movement', unit: '', data: movement, deveui: body.deveui, desc: devDescription },
      { label: 'Door', unit: '', data: door, deveui: body.deveui, desc: devDescription },
      { label: 'Light', unit: '', data: light, deveui: body.deveui, desc: devDescription },
    ];

    return {date: returnDate, data: returnData};
  }

  async getSensorDataStream(deveui: string) {
    let sensorData;

    await this.OpenedRealm.then(realm => {
      try { // different range cases
        sensorData = (realm.objectForPrimaryKey('Device', deveui) as any).sensor_readings;
      } catch (error) {
        this._logger.error('at getSensorDataStream() 1: ' + error);
      }
    })
    .catch(error => {
      this._logger.error('at getSensorDataStream() 2: ' + error);
    });

    let counter = 0;
    const length = sensorData.length;
    const sensorDataStream = new Readable({
      read(size) {
        if (counter === 0) {
          const header = {
            read: 'Date',
            value_temperature: 'Temperature',
            value_pressure: 'Pressure',
            value_humidity: 'Humidity',
            value_moisture: 'Moisture',
            value_movement: 'Movement',
            value_door: 'Door',
            value_light: 'Light',
          };
          this.push(JSON.stringify(header));
          if (length === 0) {
            this.push(null);
          }
        }
        if (length !== 0) {
          const sensorDataPointer = sensorData[counter];
          // TODO take class info from file for automatic update
          const sensorDataReading = {
            read: sensorDataPointer.read,
            value_temperature: sensorDataPointer.value_temperature,
            value_pressure: sensorDataPointer.value_pressure,
            value_humidity: sensorDataPointer.value_humidity,
            value_moisture: sensorDataPointer.value_moisture,
            value_movement: sensorDataPointer.value_movement,
            value_door: sensorDataPointer.value_door,
            value_light: sensorDataPointer.value_light,
          };
          this.push(JSON.stringify(sensorDataReading));
          if (counter === length - 1) {
            this.push(null);
          }
        }
        counter++;
      },
    });

    return sensorDataStream;
  }

  /**
  * @name getSensorDataLast
  * @param deveui
  * @returns the last sensor readings
  */
  async getSensorDataLast(deveui: string) {
    const data = await this.OpenedRealm.then(realm => {
      try {
        const node: DeviceDB = realm.objectForPrimaryKey('Device', deveui);
        const lastReading = node.sensor_readings.filtered('read = $0', (node as DeviceDB).last_seen)[0] as SensorDB;
        // TODO: complete list
        const temperature = (lastReading !== undefined && node.data_sheet.sensor_temperature.has_sensor) ? lastReading.value_temperature : null;
        const pressure = (lastReading !== undefined && node.data_sheet.sensor_pressure.has_sensor) ? lastReading.value_pressure : null;
        const humidity = (lastReading !== undefined && node.data_sheet.sensor_humidity.has_sensor) ? lastReading.value_humidity : null;
        const moisture = (lastReading !== undefined && node.data_sheet.sensor_moisture.has_sensor) ? lastReading.value_moisture : null;
        const movement = (lastReading !== undefined && node.data_sheet.sensor_movement.has_sensor) ? lastReading.value_movement : null;
        const door = (lastReading !== undefined && node.data_sheet.sensor_door.has_sensor) ? lastReading.value_door : null;
        const light = (lastReading !== undefined && node.data_sheet.sensor_light.has_sensor) ? lastReading.value_light : null;
        return {
          newDate: node.last_seen,
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
        this._logger.error('at getSensorDataLast(): ' + error);
        return error;
      }
    }).catch(error => {
      this._logger.error('at getSensorDataLast(): ' + error);
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
        this._logger.error('at getKonva(): ' + error);
      }
    })
    .catch(error => {
      this._logger.error('at getKonva(): ' + error);
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
          const setting = realm.objectForPrimaryKey('Setting', 0);
          if (setting && setting !== undefined) {
            (setting as any).konva = this.JSON2ab(data);
          }
        });
      } catch (error) {
        this._logger.error('at getKonva(): ' + error);
      }
    })
    .catch(error => {
      this._logger.error('at getKonva(): ' + error);
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

  /********************************* meteo ***********************************/

  /**
  * @name saveJWTToken
  * @param JWT
  * @description saves the JWT to Realm RB
  */
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
          this._logger.error('at saveJWTToken(): ' + error);
        }
      })
      .catch(error => {
        this._logger.error('at saveJWTToken(): ' + error);
      });
    });
  }

  /**
  * @name checkJWTToken
  * @param jwt
  * @returns a Promise of a boolean
  * @description returns true if the JWT is equal to the one in the DB
  */
  async checkJWTToken(jwt: string): Promise<boolean> {
    let equalJWT = false;
    await this.OpenedRealm.then(async realm => {
      try {
        const setting = realm.objectForPrimaryKey('Setting', 0);
        if (setting && setting !== undefined && (setting as any).jwt !== undefined ) {
          await bcrypt.compare(jwt, (setting as any).jwt).then(res => {
            equalJWT = res;
          }).catch(err => {
            this._logger.error(err);
          });
        }
      } catch (error) {
        this._logger.error('at saveJWTToken(): ' + error);
      }
    })
    .catch(error => {
      this._logger.error('at saveJWTToken(): ' + error);
    });
    return await equalJWT;
  }

  /********************************* meteo ***********************************/

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
        room: { name: 'Meteo' },
        battery: 0,
        rssi: 0,
        last_seen: new Date(Date.now()),
        model: '',
        data_sheet: {
          sensor_temperature: { has_sensor: true, unit: '˚C' },
          sensor_pressure: { has_sensor: true, unit: 'hPa' },
          sensor_humidity: { has_sensor: true, unit: '%' },
        },
      } as DeviceDB,
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
            this._logger.error('at saveLocation(): ' + error);
          }
        })
        .catch(error => {
          this._logger.error('at saveLocation(): ' + error);
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
        const setting = realm.objectForPrimaryKey('Setting', 0);
        const locationData = (realm.objectForPrimaryKey('Setting', 0) as any);
        const locationsArray = [];
        for (const key in locationData.locations) {
          if (locationData.locations.hasOwnProperty(key)) {
            const loc = locationData.locations[key];
            locationsArray.push(loc);
          }
        }
        locations = { locations: locationsArray, apikey: locationData.apikey };
      } catch (error) {
        this._logger.error('at getLocations(): ' + error);
      }
    })
    .catch(error => {
      this._logger.error('at getLocations(): ' + error);
    });
    return locations;
  }

  removeLocation(location: string) {
    new Promise((resolve, reject) => {
      this.OpenedRealm.then(realm => {
        try {
          realm.write(async () => {
            const setting = realm.objectForPrimaryKey('Setting', 0);
            if (setting && setting !== undefined) {
              const locations = (setting as any).locations;
              const index = locations.indexOf(location);
              if (index > -1) {
                locations.splice(index, 1);
              }
              await this.removeDevice(location);
              resolve('success');
            }
          });
        } catch (error) {
          this._logger.error('at removeLocation(): ' + error);
        }
      })
      .catch(error => {
        this._logger.error('at removeLocation(): ' + error);
      });
    });
  }

}