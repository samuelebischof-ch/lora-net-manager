export interface Gateway {
    ant_gain: number;
    delays: any[];
    desc: string;
    dwell: Dwell[];
    gpsalt: number;
    gpspos: Gpspos;
    health_alerts: any[];
    health_decay: number;
    ip_address: Ipaddress;
    last_alive: string;
    last_report: string;
    mac: string;
    tx_rfch: number;
}

interface Ipaddress {
    ip: string;
    port: number;
    ver: number;
}

interface Gpspos {
    lat: number;
    lon: number;
}

interface Dwell {
    duration: number;
    freq: number;
    hoursum: number;
    time: string;
}