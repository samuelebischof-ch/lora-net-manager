import { DeviceDB } from "./deviceDB.interface";

export interface RoomDB {
    name: string;
    owners: Array<DeviceDB>;
    description: string;
}