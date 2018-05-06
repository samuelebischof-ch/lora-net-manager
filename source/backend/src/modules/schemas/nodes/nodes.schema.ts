export const DeviceSchema = {
    name: 'Device',
    primaryKey: 'deveui',
    properties: {
        deveui: 'string',
        devaddr: 'string?',
        model: 'string',
        desc: 'string',
        room: 'Room?',
        battery: {type: 'int', default: 0, optional: true},
        rssi: {type: 'int', default: 0},
        last_seen: 'date',
        log: {type: 'list', objectType: 'Log'},
        data_sheet: 'DataSheet',
        sensor_readings: {type: 'list', objectType: 'SensorReading'},
    },
};

export const LogSchema = {
    name: 'Log',
    properties: {
        owners: {type: 'linkingObjects', objectType: 'Device', property: 'log'},
        date: 'date',
        deveui: 'string',
        event: 'string',
    }
}

export const SensorSchema = {
    name: 'SensorReading',
    properties: {
        owners: {type: 'linkingObjects', objectType: 'Device', property: 'sensor_readings'},
        read: {type: 'date', indexed: true},
        value_temperature: 'float?',
        value_pressure: 'float?',
        value_humidity: 'float?',
        value_moisture: 'float?',
        value_movement: 'bool?',
        value_door: 'bool?',
        value_light: 'bool?',
    },
};

export const RoomSchema = {
    name: 'Room',
    primaryKey: 'roomName',
    properties: {
        roomName: 'string',
        owners: {type: 'linkingObjects', objectType: 'Device', property: 'room'},
        description: {type: 'string', optional: true},
    },
};

export const DataSheetSchema = {
    name: 'DataSheet',
    properties: {
        sensor_temperature: { type: 'SensorDataSheet', default: {} },
        sensor_pressure: { type: 'SensorDataSheet', default: {} },
        sensor_humidity: { type: 'SensorDataSheet', default: {} },
        sensor_moisture: { type: 'SensorDataSheet', default: {} },
        sensor_movement: { type: 'SensorDataSheet', default: {} },
        sensor_door: { type: 'SensorDataSheet', default: {} },
        sensor_light: { type: 'SensorDataSheet', default: {} },
    },
};

export const SensorDataSheetSchema = {
    name: 'SensorDataSheet',
    properties: {
        has_sensor: {type: 'bool', default: false},
        permitted_min: {type: 'float', default: Number.NEGATIVE_INFINITY},
        permitted_max: {type: 'float', default: Number.POSITIVE_INFINITY},
        unit: {type: 'string', default: ''},
        resolution: {type: 'float', optional: true},
        sensitivity: {type: 'float', optional: true},
        description: {type: 'string', optional: true},
    }
}

export const SettingSchema = {
    name: 'Setting',
    primaryKey: 'id',
    properties: {
        id: 'int',
        appeui: 'string',
        appkey: 'string',
        konva: 'data?',
        locations: 'string[]',
        apikey: 'string?',
        jwt: 'string?',
    }
};