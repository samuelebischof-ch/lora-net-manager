export interface SensorDB {
    read: Date;
    value_temperature: number;
    unit_temperature: string;
    unit_pressure: string;
    unit_humidity: string;
    unit_moisture: string;
    value_pressure: number;
    value_humidity: number;
    value_moisture: number;
    value_movement: boolean;
    value_door: boolean;
    value_light: boolean;
    data_sheet: boolean;
}
