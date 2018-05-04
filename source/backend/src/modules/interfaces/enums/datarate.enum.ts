export enum DataRate {
    SF12 = 0,
    SF11 = 1,
    SF10 = 2,
    SF9 = 3,
    SF8 = 4,
    SF7 = 5,
    SF7b = 6,
    FSK = 7,
}

export enum RX2DataRate {
    EU868 = DataRate.SF7,
    US902 = DataRate.SF12,
    CN779 = DataRate.SF12,
    EU433 = DataRate.SF12,
    AU915 = DataRate.SF12,
    CN470 = DataRate.SF12,
    AS923 = DataRate.SF10,
    KR920 = DataRate.SF12,
    IN865 = DataRate.SF10,
    RU864 = DataRate.SF10,
}

export enum MaxDataRate {
    EU868 = DataRate.SF12,
    US902 = DataRate.SF8,
    CN779 = DataRate.SF7,
    EU433 = DataRate.SF7,
    AU915 = DataRate.SF8,
    CN470 = DataRate.SF7,
    AS923 = DataRate.SF7,
    KR920 = DataRate.SF7,
    IN865 = DataRate.SF7,
    RU864 = DataRate.SF7,
}