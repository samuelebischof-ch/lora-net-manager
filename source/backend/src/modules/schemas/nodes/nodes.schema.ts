export const DeviceSchema = {
    name: 'Device',
    primaryKey: 'deveui',
    properties: {
        deveui: 'string',
        devaddr: {type: 'string', optional: true},
        model: 'string',
        desc: {type: 'string'},
        room: {type: 'Room', optional: true},
        battery: {type: 'int', default: 0},
        rssi: {type: 'int', default: 0},
        last_seen: 'date',
        log: {type: 'list', objectType: 'Log'},
        has_temperature: 'bool',
        has_pressure: 'bool',
        has_humidity: 'bool',
        has_moisture: 'bool',
        has_movement: 'bool',
        has_door_sensor: 'bool',
        has_light_sensor: 'bool',
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
        unit_temperature: {type: 'string', default: '˚C'},
        unit_pressure: {type: 'string', default: 'hPa'},
        unit_humidity: {type: 'string', default: '%'},
        unit_moisture: {type: 'string', default: '%'},
        value_temperature: 'float?',
        value_pressure: 'float?',
        value_humidity: 'float?',
        value_moisture: 'float?',
        value_movement: 'bool?',
        value_door: 'bool?',
        value_light: 'bool?',
        data_sheet: {type: 'DataSheet', optional: true},
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
        model: 'string',
        resolution: {type: 'float', optional: true},
        sensitivity: {type: 'float', optional: true},
        description: {type: 'string', optional: true},
    },
};

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
    }
}
