export interface Handler {
    app: string;
    downlink_expires: Expires;
    event_fields: EventField[];
    payload: Payload;
    uplink_fields: UplinkField[];
}

enum Expires {
    NEVER = 'Never',
    WHEN_SUPERSEDED = 'When Superseded',
}

enum Payload {
    ASCII_TEXT = 'ASCII Text',
    CAYENNE_LPP = 'Cayenne LPP',
}

enum EventField {
    APP = 'app',
    DATETIME = 'datetime',
    EVENT = 'event',
    DEVADDR = 'devaddr',
    DEVEUI = 'deveui',
    APPARGS = 'appargs',
}

enum UplinkField {
    NETID = 'netid',
    APP = 'app',
    DEVADDR = 'devaddr',
    DEVEUI = 'deveui',
    APPARGS = 'appargs',
    FCNT = 'fcnt',
    PORT = 'port',
    FREQ = 'freq',
    DATR = 'datr',
    CODR = 'codr',
    MAC = 'mac',
    LSNR = 'lsnr',
    ALL_GW = 'all_gw',
    BATTERY = 'battery',
    DATETIME = 'datetime',
    DATA = 'data',
    RSSI = 'rssi',
    BEST_GW = 'best_gw',
}