export interface Config {
  secret: string;
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
