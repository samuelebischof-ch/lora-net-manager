export interface Seed {
  gateways: Gateway[];
  devices: Device[];
  locations: String[];
}

interface Device {
  deveui: string;
  appeui: string;
  appkey: string;
  last_seen: Date;
  devaddr: string;
  desc: string;
  room: Room;
  battery: number;
  rssi: number;
  model: string;
  has_temperature: boolean;
  has_pressure: boolean;
  has_humidity: boolean;
  has_moisture: boolean;
  has_movement: boolean;
  has_door_sensor: boolean;
  has_light_sensor: boolean;
}

interface Room {
  name: string;
}

interface Gateway {
  mac: string;
}