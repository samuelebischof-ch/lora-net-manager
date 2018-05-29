import { Component } from '@nestjs/common';
import { LoggerService } from '../logger/logger.service';
import { RealmService } from '../realm/realm.service';
import { Writable, Readable, Stream } from 'stream';
import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';
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
  * @param {string} devuei
  * @returns {Promise<string>} file path
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
      await this.deleteFilePromise(this.inoPath);
    } catch (error) {
      this._logger.error(error);
    }

    const rl = readline.createInterface({
      input: require('fs').createReadStream(this.templatePath),
    });

    const rdLinesPromise = () => new Promise(async (resolve, reject) => {
      await rl.on('line', async (line) => {
        if (line === '<END>') {
          resolve();
        } else {
          if ((otaaKeysCounter < otaaKeys.length) && (line.includes(otaaKeys[otaaKeysCounter]))) {
            const key = otaaKeys[otaaKeysCounter];
            const mapping = otaa[key];
            const newLine = line.replace(key, mapping);
            await self.appendLinePromise(this.inoPath, newLine);
            otaaKeysCounter++;
          } else if ((devicesKeysCounter < devicesKeys.length) && (line === devicesKeys[devicesKeysCounter])) {
            const key = devicesKeys[devicesKeysCounter];
            const mapping = esp32[key];
            await self.appendLinePromise(this.inoPath, mapping);
            devicesKeysCounter++;
          } else {
            await self.appendLinePromise(this.inoPath, line);
          }
        }
      });
    });

    try {
      await rdLinesPromise();
    } catch (error) {
      this._logger.error(error);
    }

    return this.inoPath;
  }

  /**
  * @name genCSV
  * @param {string} deveui
  * @returns {Promise<string>} a Promise of the path
  * @description creates a CSV file with all the data of a sensor and returns the path
  */
  async genCSV(deveui: string): Promise<string> {
    const self = this;
    const csv = path.join(__dirname, 'temp/' + deveui + '.csv');

    await this.deleteFilePromise(csv);

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
            if (counter === 0 && element !== 'Date') {
              const date = new Date(element);
              line += date.getDate();
              line += '.';
              line += date.getMonth();
              line += '.';
              line += date.getFullYear();
              line += ' ';
              line += date.getHours();
              line += ':';
              line += date.getMinutes();
              line += ':';
              line += date.getSeconds();
              line += ',';
            } else {
              line += '"';
              if (element !== null) {
                if (!isNaN(element)) {
                  line += ((Math.round(Number(element) * 100)) / 100);
                } else {
                  line += element;
                }
              }
              line += '"';
              if (counter !== length - 1) {
                line += ',';
              }
            }
            counter++;
          }
        }
        self.appendLinePromise(csv, line).then(() => callback());
      },
    });

    const streamPromise = (stream) => {
      return new Promise((resolve, reject) => {
        stream.pipe(outStream)
        .on('finish', () => {
          resolve();
        })
        .on('error', (error) => {
          reject(error);
        });
      });
    };

    await streamPromise(dataStream);
    return csv;
  }

  /**
  * @name deleteFilePromise
  * @param fileName
  */
  deleteFilePromise(fileName) {
    return new Promise(async (resolve, reject) => {
      const exists = await this.existsPromise(fileName);
      if (exists) {
        fs.unlink(fileName, (err) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
      } else {
        resolve();
      }
    });
  }

  /**
  * @name existsPromise
  * @param fileName
  * @description promisified fs.exists
  */
  existsPromise(fileName) {
    return new Promise((resolve, reject) => {
      fs.exists(fileName, exists => {
        resolve(exists);
      });
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
  * @param {string} key
  * @param {number} chunkSize
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
