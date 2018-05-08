export interface Node {
    adr_failed: any[];
    adr_flag: number;
    adr_use: Adruse;
    appargs: string;
    appskey: string;
    desc: string;
    devaddr: string;
    devstat: Devstat[];
    devstat_fcnt: number;
    devstat_time: string;
    fcntdown: number;
    fcntup: number;
    first_reset: string;
    gateways: Gateway[];
    health_alerts: string[];
    health_decay: number;
    last_qs: Lastq[];
    last_reset: string;
    last_rx: string;
    nwkskey: string;
    profile: string;
    reset_count: number;
    rxwin_failed: any[];
    rxwin_use: Rxwinuse;
}

interface Rxwinuse {
    rx1_dr_offset: number;
    rx2_dr: number;
    rx2_freq: number;
}

interface Lastq {
    rssi: number;
    snr: number;
}

interface Gateway {
    mac: string;
    rxq: Rxq;
}

interface Rxq {
    codr: string;
    datr: string;
    freq: number;
    lsnr: number;
    rssi: number;
    time: string;
    tmst: number;
}

interface Devstat {
    battery: number;
    datetime: string;
    margin: number;
    max_snr: number;
}

interface Adruse {
    chans: string;
    datr: number;
    power: number;
}