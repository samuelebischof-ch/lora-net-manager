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
    has_temperature: boolean;
    has_pressure: boolean;
    has_humidity: boolean;
    has_moisture: boolean;
    has_movement: boolean;
    has_door_sensor: boolean;
    has_light_sensor: boolean;
    sensor_readings: any;
}