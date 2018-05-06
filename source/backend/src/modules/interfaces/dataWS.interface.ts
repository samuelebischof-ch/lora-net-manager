// TODO: create list for fields

/**
 * deveui:      device eui as string
 * devaddr:     device address as string
 * battery:     device battery status (0-255)
 * data:        data as Base64
 * datetime:    Date
 * rssi:        received signal strength indication
 * fields:      CayenneLPP decoded on gottharpd server
 * - field1:    temperature     ˚C
 * - field2:    humidity        %
 * - field3:    pressure        hPa
 * - field4:    moisture        %
 */

export interface DataWS {
    deveui: string;
    devaddr: string;
    battery: number;
    data: string;
    datetime: Date;
    rssi: number;
    field1: number;
    field2: number;
    field3: number;
    field4: number;
    field5: boolean;
    field6: boolean;
    field7: boolean;
  }