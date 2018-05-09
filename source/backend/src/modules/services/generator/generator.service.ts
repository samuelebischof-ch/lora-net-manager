import { Component } from '@nestjs/common';
import { LoggerService } from '../logger/logger.service';
import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'linebyline'
import * as devicesJSON from '../../../../../device/devices.json'
import { RealmService } from '../realm/realm.service';
import { Writable, Readable, Stream } from 'stream';

@Component()
export class GeneratorService {
  
  constructor(private readonly _logger: LoggerService,
    private readonly _realm: RealmService) {}
    
    private ino = path.join(__dirname, 'temp/' + 'otaa.ino');
    private template = '../device/otaa.ino';
    
    async genFile(devuei: string): Promise<string> {
      
      const self = this;
      
      const devices = (devicesJSON as any).devices;
      const esp32 = devices['esp32'];
      
      const keysDB = await this._realm.getKeys();
      
      const otaa = {
        '<APPEUI>': this.keyToLitEndHex(keysDB.appeui),
        '<DEVEUI>': this.keyToLitEndHex(devuei),
        '<APPKEY>': this.keyToHex(keysDB.appkey),
      }
      
      const devicesKeys = Object.keys(esp32);
      const otaaKeys = Object.keys(otaa);
      
      let devicesKeysCounter = 0;
      let otaaKeysCounter = 0;
      
      await this.deleteFile(this.ino);
      const rl = readline(this.template);
      
      const rdLinePromise = () => new Promise((resolve, reject) => {
        rl.on('line', (line) => {
          if (line === '<END>') {
            resolve();
          } else {
            if ((otaaKeysCounter < otaaKeys.length) && (line.includes(otaaKeys[otaaKeysCounter]))) {
              const key = otaaKeys[otaaKeysCounter];
              const mapping = otaa[key];
              const newLine = line.replace(key, mapping)
              self.appendLine(this.ino, newLine);
              otaaKeysCounter++;
            } else if ((devicesKeysCounter < devicesKeys.length) && (line === devicesKeys[devicesKeysCounter])) {
              const key = devicesKeys[devicesKeysCounter];
              const mapping = esp32[key];
              self.appendLine(this.ino, mapping);
              devicesKeysCounter++;
            } else {
              self.appendLine(this.ino, line);
            }
          }
        }).on('error', reject);
      });
      
      try {
        await rdLinePromise()
      } catch (error) {
        this._logger.error(error);
      }
      
      return this.ino;
    }
    
    async genCSV(deveui: string): Promise<string> {
      const self = this,
      csv = path.join(__dirname, 'temp/' + deveui + '.csv');
      
      await this.deleteFile(csv);
      
      let dataStream = await this._realm.getSensorDataStream(deveui);
      
      const outStream = new Writable({
        write(chunk, encoding, callback) {
          let obj = JSON.parse(chunk.toString())
          let line = '';
          let length = Object.keys(obj).length,
              counter = 0;
          for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
              const element = obj[key];
              line += '"';
              line += element;
              line += '"';
              if (counter !== length - 1) {
                line += ','
              }
            }
            counter++;
          }
          self.appendLine(csv, line)
          callback();
        }
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
      }
      
      await streamPromise(dataStream)
      
      return csv;
    }
    
    async deleteFile(fileName) {
      let exists = fs.existsSync(fileName);
      if (exists) {
        fs.unlinkSync(fileName);
      }
    } 
    
    appendLine(fileName, newLine: string) {
      fs.appendFileSync(fileName, newLine + '\n');
    }
    
    keyToHex(key: string): string {
      let hexKey = '';
      let keyArr = this.createGroupedArray(key, 2);
      for (let index = 0; index < keyArr.length; index++) {
        let hex: string = keyArr[index] as string;
        if (index === 0) {
          hexKey += ' 0x' + hex.toUpperCase();
        } else {
          hexKey += ', 0x' + hex.toUpperCase();
        }
      }
      hexKey += ' ';
      return hexKey;
    }
    
    keyToLitEndHex(key: string) {
      let hexKey = '';
      let keyArr = this.createGroupedArray(key, 2);
      for (let index = keyArr.length - 1; index >= 0; index--) {
        let hex: string = keyArr[index] as string;
        if (index === keyArr.length - 1) {
          hexKey += ' 0x' + hex.toUpperCase();
        } else {
          hexKey += ', 0x' + hex.toUpperCase();
        }
      }      
      hexKey += ' ';
      return hexKey;
    }
    
    createGroupedArray(arr, chunkSize) {
      let groups = [], i;
      for (i = 0; i < arr.length; i += chunkSize) {
        groups.push(arr.slice(i, i + chunkSize));
      }
      return groups;
    }
    
    
  }