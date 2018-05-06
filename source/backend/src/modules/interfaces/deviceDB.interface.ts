export interface DeviceDB {
    deveui: string;
    devaddr: string;
    model: string;
    desc: string;
    room: {
        roomName: string;
        description: string;
    };
    battery: any;
    rssi: any;
    last_seen: Date;
    log: Array<any>;
    data_sheet: DataSheet;
    sensor_readings: any;
}

export interface DataSheet {
    sensor_temperature: SensorDataSheet;
    sensor_pressure: SensorDataSheet;
    sensor_humidity: SensorDataSheet;
    sensor_moisture: SensorDataSheet;
    sensor_movement: SensorDataSheet;
    sensor_door: SensorDataSheet;
    sensor_light: SensorDataSheet;
}

export interface SensorDataSheet {
    has_sensor: boolean,
    permitted_min: number,
    permitted_max: number,
    unit: string,
    resolution: number,
    sensitivity: number,
    description: string,
}
