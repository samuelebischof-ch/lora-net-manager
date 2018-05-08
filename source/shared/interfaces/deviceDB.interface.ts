export interface IDeviceDB {
    deveui: string;
    devaddr: string;
    model: string;
    desc: string;
    room: Room;
    battery: any;
    rssi: any;
    last_seen: Date;
    log: Array<any>;
    data_sheet: DataSheet;
    sensor_readings: any;
}

export class DeviceDB implements IDeviceDB {
    constructor() {
        this.deveui = '';
        this.devaddr = '';
        this.model = '';
        this.desc = '';
        this.room = new Room();
        this.battery = 255;
        this.rssi = 0;
        this.last_seen = new Date(Date.now());
        this.log = [];
        this.data_sheet = new DataSheet();
        this.sensor_readings = [];
    }
    deveui: string;
    devaddr: string;
    model: string;
    desc: string;
    room: Room;
    battery: any;
    rssi: any;
    last_seen: Date;
    log: Array<any>;
    data_sheet: DataSheet;
    sensor_readings: any;
}

export interface IDataSheet {
    sensor_temperature: SensorDataSheet;
    sensor_pressure: SensorDataSheet;
    sensor_humidity: SensorDataSheet;
    sensor_moisture: SensorDataSheet;
    sensor_movement: SensorDataSheet;
    sensor_door: SensorDataSheet;
    sensor_light: SensorDataSheet;
}

export class DataSheet implements IDataSheet {
    constructor() {
        this.sensor_temperature = new SensorDataSheet();
        this.sensor_pressure = new SensorDataSheet();
        this.sensor_humidity = new SensorDataSheet();
        this.sensor_moisture = new SensorDataSheet();
        this.sensor_movement = new SensorDataSheet();
        this.sensor_door = new SensorDataSheet();
        this.sensor_light = new SensorDataSheet();
    }
    sensor_temperature: SensorDataSheet;
    sensor_pressure: SensorDataSheet;
    sensor_humidity: SensorDataSheet;
    sensor_moisture: SensorDataSheet;
    sensor_movement: SensorDataSheet;
    sensor_door: SensorDataSheet;
    sensor_light: SensorDataSheet;
}

export interface ISensorDataSheet {
    has_sensor: boolean;
    permitted_min: number;
    permitted_max: number;
    unit: string;
    resolution: number;
    sensitivity: number;
    description: string;
}

export class SensorDataSheet implements ISensorDataSheet {
    constructor() {
        this.has_sensor = false;
        this.permitted_min = Number.NEGATIVE_INFINITY;
        this.permitted_max = Number.POSITIVE_INFINITY;
        this.unit = '';
        this.resolution = 0;
        this.sensitivity = 0;
        this.description = '';
    }
    has_sensor: boolean;
    permitted_min: number;
    permitted_max: number;
    unit: string;
    resolution: number;
    sensitivity: number;
    description: string;
}

export interface IRoom {
    name: string;
    description: string;
}

export class Room implements IRoom {
    constructor() {
        this.name = '';
        this.description = '';
    }
    name: string;
    description: string;
}