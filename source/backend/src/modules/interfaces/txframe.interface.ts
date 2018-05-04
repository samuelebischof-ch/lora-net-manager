export interface Txframe {
    datetime: string;
    devaddr: string;
    frid: string;
    txdata: Txdata;
}

interface Txdata {
    data: string;
    port: number;
}