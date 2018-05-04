import { Channel } from './enums/channel.enum';
import { RX1JoinDelay, RX2JoinDelay, RX1Delay, RX2Delay } from './enums/delay.enum';
import { MaxDataRate, RX2DataRate } from './enums/datarate.enum';
import { MaxEIRP } from './enums/eirp.enum';
import { GWPower, MaxPower, MinPower } from './enums/power.enum';
import { CodingRate } from './enums/codingrate.enum';
import { RX2Freq } from './enums/frequency.enum';

export interface Network {
    gw_power: GWPower;
    init_chans: Channel;
    join1_delay: RX1JoinDelay;
    join2_delay: RX2JoinDelay;
    max_datr: MaxDataRate;
    max_eirp: MaxEIRP;
    max_power: MaxPower;
    min_power: MinPower;
    name: string;
    netid: string;
    region: string;
    rx1_delay: RX1Delay;
    rx2_delay: RX2Delay;
    rxwin_init: Rxwininit;
    subid: Subid;
    tx_codr: CodingRate;
}

interface Subid {
    len: number;
    val: string;
}

interface Rxwininit {
    rx1_dr_offset: RX1ODROffset;
    rx2_dr: RX2DataRate;
    rx2_freq: RX2Freq;
}