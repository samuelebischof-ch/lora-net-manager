import { DeviceDB } from "./deviceDB.interface";

export interface RoomDB {
    roomName: string;
    owners: Array<DeviceDB>;
    description: string;
}