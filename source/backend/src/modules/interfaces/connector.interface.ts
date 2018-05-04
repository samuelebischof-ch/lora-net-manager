export interface Connectors {
    connectors: Connector[];
}

export interface Connector {
    app: string;
    auth: Auth;
    client_id: string;
    connid: string;
    enabled: boolean;
    failed: Fail[];
    format: string;
    name: string;
    pass: string;
    publish_events: string;
    publish_uplinks: string;
    received: string;
    subscribe: string;
    uri: string;
}

enum Auth {
    NORMAL = 'normal',
    SAS = 'sas',
}

enum Fail {
    NETWORK = 'network',
    BADARG = 'badarg',
    TOPIC = 'topic',
}

enum Format {
    RAW = 'raw',
    JSON = 'json',
    FORM = 'www-form',
}