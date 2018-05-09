import { Component } from '@nestjs/common';
import { LoggerService } from '../logger/logger.service';
import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'linebyline'
import * as devicesJSON from '../../../../../device/devices.json'
import { RealmService } from '../realm/realm.service';

@Component()
export class GeneratorService {
  
  constructor(private readonly _logger: LoggerService,
    private readonly _realm: RealmService) {}
    
    private ino = path.join(__dirname, 'otaa.ino');
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
      
      console.log('here');
      await this.deleteFile();
      const rl = readline(this.template);

        console.log('here2');
          // rl.on('line', (line) => {
          //   // console.log(line);
          //   if ((otaaKeysCounter < otaaKeys.length) && (line.includes(otaaKeys[otaaKeysCounter]))) {
          //     const key = otaaKeys[otaaKeysCounter];
          //     const mapping = otaa[key];
          //     const newLine = line.replace(key, mapping)
          //     self.appendLine(newLine);
          //     otaaKeysCounter++;
          //   } else if ((devicesKeysCounter < devicesKeys.length) && (line === devicesKeys[devicesKeysCounter])) {
          //     const key = devicesKeys[devicesKeysCounter];
          //     const mapping = esp32[key];
          //     self.appendLine(mapping);
          //     devicesKeysCounter++;
          //   } else {
          //     self.appendLine(line);
          //   }
          // });   

          
          const rdLinePromise = () => new Promise((resolve, reject) => {
            rl.on('line', (line) => {
              if (line === '<END>') {
                resolve();
              } else {
                if ((otaaKeysCounter < otaaKeys.length) && (line.includes(otaaKeys[otaaKeysCounter]))) {
                  const key = otaaKeys[otaaKeysCounter];
                  const mapping = otaa[key];
                  const newLine = line.replace(key, mapping)
                  self.appendLine(newLine);
                  otaaKeysCounter++;
                } else if ((devicesKeysCounter < devicesKeys.length) && (line === devicesKeys[devicesKeysCounter])) {
                  const key = devicesKeys[devicesKeysCounter];
                  const mapping = esp32[key];
                  self.appendLine(mapping);
                  devicesKeysCounter++;
                } else {
                  self.appendLine(line);
                }
              }
            }).on('error', reject);
          });

          try {
            console.log('here 3')
            await rdLinePromise()
          } catch (error) {
            console.log(error);
          }
          

      console.log('here 4')
      
      return this.ino;
    }
    
    appendLine(newLine: string) {
      fs.appendFileSync(this.ino, newLine + '\n');
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
    
    async deleteFile() {
      let exists = fs.existsSync(this.ino);
      if (exists) {
        fs.unlinkSync(this.ino);
      }
    } 
    
  }