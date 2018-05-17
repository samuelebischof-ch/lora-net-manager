import { Component } from '@nestjs/common';
import { LoggerService } from '../logger/logger.service';
import { RealmService } from '../realm/realm.service';
import { Writable, Readable, Stream } from 'stream';
import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'linebyline';
import * as devicesJSON from '../../../../../device/devices.json';

@Component()
export class GeneratorService {

  constructor(
    private readonly _logger: LoggerService,
    private readonly _realm: RealmService,
  ) {}

  private inoPath = path.join(__dirname, 'temp/' + 'otaa.ino');
  private templatePath = '../device/otaa.ino';

  /**
  * @name genFile
  * @param devuei string
  * @returns a Promise of the path
  * @description creates a *.ino file and returns the path
  */
  async genFile(devuei: string): Promise<string> {

    const self = this;

    const devices = (devicesJSON as any).devices;
    const esp32 = devices.esp32;

    const keysDB = await this._realm.getKeys();

    const otaa = {
      '<APPEUI>': this.keyToLitEndHex(keysDB.appeui),
      '<DEVEUI>': this.keyToLitEndHex(devuei),
      '<APPKEY>': this.keyToHex(keysDB.appkey),
    };

    const devicesKeys = Object.keys(esp32);
    const otaaKeys = Object.keys(otaa);

    let devicesKeysCounter = 0;
    let otaaKeysCounter = 0;

    try {
      await this.deleteFile(this.inoPath);
    } catch (error) {
      this._logger.error(error);
    }
    const rl = readline(this.templatePath);

    const rdLinePromise = () => new Promise((resolve, reject) => {
      rl.on('line', (line) => {
        if (line === '<END>') {
          resolve();
        } else {
          if ((otaaKeysCounter < otaaKeys.length) && (line.includes(otaaKeys[otaaKeysCounter]))) {
            const key = otaaKeys[otaaKeysCounter];
            const mapping = otaa[key];
            const newLine = line.replace(key, mapping);
            self.appendLine(this.inoPath, newLine);
            otaaKeysCounter++;
          } else if ((devicesKeysCounter < devicesKeys.length) && (line === devicesKeys[devicesKeysCounter])) {
            const key = devicesKeys[devicesKeysCounter];
            const mapping = esp32[key];
            self.appendLine(this.inoPath, mapping);
            devicesKeysCounter++;
          } else {
            self.appendLine(this.inoPath, line);
          }
        }
      }).on('error', reject);
    });

    try {
      await rdLinePromise();
    } catch (error) {
      this._logger.error(error);
    }

    return this.inoPath;
  }

  /**
  * @name genCSV
  * @param deveui string
  * @returns a Promise of the path
  * @description creates a CSV file with all the data of a sensor and returns the path
  */
  async genCSV(deveui: string): Promise<string> {
    const self = this,
    csv = path.join(__dirname, 'temp/' + deveui + '.csv');

    await (csv);

    const dataStream = await this._realm.getSensorDataStream(deveui);

    const outStream = new Writable({
      write(chunk, encoding, callback) {
        const obj = JSON.parse(chunk.toString());
        const length = Object.keys(obj).length;
        let line = '';
        let counter = 0;
        for (const key in obj) {
          if (obj.hasOwnProperty(key)) {
            const element = obj[key];
            line += '"';
            line += element;
            line += '"';
            if (counter !== length - 1) {
              line += ',';
            }
            counter++;
          }
        }
        self.appendLine(csv, line);
        callback();
      },
    });

    const streamPromise = (stream) => {
      return new Promise((resolve, reject) => {
        stream.pipe(outStream);
        stream.on('end', () => {
          resolve('end');
        });
        stream.on('finish', () => {
          resolve('finish');
        });
        stream.on('error', (error) => {
          reject(error);
        });
      });
    };

    await streamPromise(dataStream);

    return csv;
  }

  /**
  * @name deleteFile
  * @param fileName
  */
  deleteFile(fileName) {
    return new Promise((resolve, reject) => {
      const exists = fs.existsSync(fileName);
      if (exists) {
        fs.unlink(fileName, (err) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
      }
    });
  }

  /**
  * @name appendLinePromise
  * @param fileName string
  * @param newLine string
  * @returns a Promise
  * @description appends a line to the file with name fileName
  */
  appendLinePromise(fileName: string, newLine: string): Promise<any> {
    return new Promise((resolve, reject) => {
      fs.appendFile(fileName, newLine + '\n', (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  /**
  * @name appendLine
  * @param fileName string
  * @param newLine string
  * @description appends a line to the file with name fileName
  */
  async appendLine(fileName: string, newLine: string) {
    try {
      await this.appendLinePromise(fileName, newLine);
    } catch (error) {
      this._logger.error(error);
    }
  }

  /**
  * @name keyToHex
  * @param key string
  * @returns a string representing a hex string in 0x** format
  */
  keyToHex(key: string): string {
    let hexKey = '';
    const keyArr = this.createGroupedArray(key, 2);
    for (let index = 0; index < keyArr.length; index++) {
      const hex: string = keyArr[index] as string;
      if (index === 0) {
        hexKey += ' 0x' + hex.toUpperCase();
      } else {
        hexKey += ', 0x' + hex.toUpperCase();
      }
    }
    hexKey += ' ';
    return hexKey;
  }

  /**
  * @name keyToLitEndHex
  * @param key string
  * @returns a string representing a hex string in 0x** little endian format
  */
  keyToLitEndHex(key: string) {
    let hexKey = '';
    const keyArr = this.createGroupedArray(key, 2);
    for (let index = keyArr.length - 1; index >= 0; index--) {
      const hex: string = keyArr[index] as string;
      if (index === keyArr.length - 1) {
        hexKey += ' 0x' + hex.toUpperCase();
      } else {
        hexKey += ', 0x' + hex.toUpperCase();
      }
    }
    hexKey += ' ';
    return hexKey;
  }

  /**
  * @name createGroupedArray
  * @param key string
  * @param chunkSize num
  * @returns an array with groups of size chunkSize
  */
  createGroupedArray(key: string, chunkSize: number) {
    const groups = [];
    for (let i = 0; i < key.length; i += chunkSize) {
      groups.push(key.slice(i, i + chunkSize));
    }
    return groups;
  }

}
