export interface Config {
  jwt: {
    user: string;
    secret: string;
    expiration: number;
  }
  gotthardpws: string;
  gotthardpevtws: string;
  loRaServerOptions: {
    uri: string;
    auth: {
      user: string;
      pass: string;
      sendImmediately: boolean;
    }
    accept: string;
  };
  OWMApiKey: string;
}
