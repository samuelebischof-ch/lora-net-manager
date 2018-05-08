import { DataRate, MaxDataRate, RX2DataRate } from './enums/datarate.enum';
import { Channel } from './enums/channel.enum';
import { RX2Freq } from './enums/frequency.enum';
import { GWPower } from './enums/power.enum';

export interface Profile {
    adr_mode: Adr_mode;
    adr_set: Adrset;
    app: string;
    can_join: boolean;
    fcnt_check: Fcnt_check;
    max_datr: MaxDataRate;
    name: string;
    network: string;
    request_devstat: boolean;
    rxwin_set: Rxwinset;
    txwin: Txwin;
}

interface Rxwinset {
    rx1_dr_offset: RX1ODROffset;
    rx2_dr: RX2DataRate;
    rx2_freq: RX2Freq;
}

interface Adrset {
    chans: Channel;
    datr: DataRate;
    power: GWPower;
}

enum Adr_mode {
    DISABLE = 0,
    AUTO_ADJUST = 1,
    MANTAIN = 2,
}

enum Fcnt_check {
    STRICT_16 = 0,
    STRICT_31 = 1,
    RST_ON_0 = 2,
    DISABLED = 3,
}

enum Txwin {
    AUTO = 0,
    RX1 = 1,
    RX2 = 2,
}