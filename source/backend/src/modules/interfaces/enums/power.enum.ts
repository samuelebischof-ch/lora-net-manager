enum Power {
    DBM16 = 0,
    DBM14 = 1,
    DBM12 = 2,
    DBM10 = 3,
    DBM8 = 4,
    DBM6 = 5,
    DBM4 = 6,
    DBM2 = 7,
}

export enum GWPower {
    EU868 = Power.DBM16,
    US902 = Power.DBM16,
    CN779 = Power.DBM12,
    EU433 = Power.DBM12,
    AU915 = Power.DBM16,
    CN470 = Power.DBM16,
    AS923 = Power.DBM16,
    KR920 = Power.DBM16,
    IN865 = Power.DBM16,
    RU864 = Power.DBM16,
}

export enum MaxPower {
    EU868 = 0,
    US902 = 0,
    CN779 = 0,
    EU433 = 0,
    AU915 = 0,
    CN470 = 0,
    AS923 = 0,
    KR920 = 0,
    IN865 = 0,
    RU864 = 0,
}

export enum MinPower {
    EU868 = 7,
    US902 = 10,
    CN779 = 5,
    EU433 = 5,
    AU915 = 7,
    CN470 = 7,
    AS923 = 7,
    KR920 = 7,
    IN865 = 10,
    RU864 = 7,
}