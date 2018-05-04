
import {
    WebSocketGateway,
    SubscribeMessage,
    WsResponse,
    OnGatewayInit,
    WebSocketServer,
    WsException,
} from '@nestjs/websockets';
import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';
import { Subscription } from 'rxjs/Subscription';
import { RealmService } from '../services/realm/realm.service';
import { GotthardpwsService } from '../services/gotthardpws/gotthardpws.service';

@WebSocketGateway()
export class LoraGateway implements OnGatewayInit {

    private subscriptions: Array<Subscription> = [];
    private observable: Observable<string>;

    constructor(private readonly _realm: RealmService,
                private readonly _gotthardpws: GotthardpwsService) {}
    
    /**
     * @name onEvent
     * @param client 
     * @param data 
     * @description created a websocket server for requesting sensor data
     */
    @SubscribeMessage('requestData')
    async onDataEvent(client, data) {

        // this.subscriptions.forEach((subscription: Subscription) => {
        //     subscription.unsubscribe();
        // });
        // this._realm.removeWatcher()
        
        client.emit('responsetData', await this._realm.getSensorData(data));
        
        this.observable = this._realm.addWatcher(data.deveui);
        this.subscriptions.push(
            this.observable.subscribe(async res => {
                client.emit('responsetData', await this._realm.getSensorDataLast(data.deveui));
            }, error => {
            console.error('ERROR at lora.gateway.ts: ' + error); // TODO remove line
        }));
    }

    @SubscribeMessage('requestEvents')
    async onEventEvent(client, data) {
        console.log('SUCCESS: frontend connected to ws gateway')

        this._gotthardpws.events$.subscribe(msg => {
            client.emit('responseEvents', msg);
        })

    }

    handleConnection() {
        console.log('SUCCESS: frontend requested data');
    }
        
    handleDisconnect() {
        console.log('handleDisconnect()');
        this.subscriptions.forEach((subscription: Subscription) => {
            subscription.unsubscribe();
        });
        console.log('removeWatcher');
        this._realm.removeWatcher()
        console.log('SUCCESS: socket closed');
    }

    afterInit() {
        console.log('SUCCESS: sockets gateway started')
    }
}
