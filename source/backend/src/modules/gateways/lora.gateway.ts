
import {
  WebSocketGateway,
  SubscribeMessage,
  WsResponse,
  OnGatewayInit,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';
import { EventService } from '../services/events/events.service';
import { LoggerService } from '../services/logger/logger.service';
import { Observable } from 'rxjs/Observable';
import { RealmService } from '../services/realm/realm.service';
import { Subscription } from 'rxjs/Subscription';

@WebSocketGateway()
export class LoraGateway implements OnGatewayInit {

  constructor(
    private readonly _realm: RealmService,
    private readonly _events: EventService,
    private readonly _logger: LoggerService,
  ) {}

  private subscriptions: Array<Subscription> = [];
  private observable: Observable<string>;

  /**
  * @name onDataEvent
  * @param client
  * @param request
  * @description creates a websocket server for requesting sensor data
  */
  @SubscribeMessage('requestData')
  async onDataEvent(client, request) {
    if (await this._realm.checkJWTToken(request.jwt)) { // if authenticated

      client.emit('responsetData', await this._realm.getSensorData(request.data));

      this.observable = this._realm.addWatcher(request.data.deveui);
      this.subscriptions.push(
        this.observable.subscribe(async res => {
          client.emit('responsetData', await this._realm.getSensorDataLast(request.data.deveui));
        }, error => {
          this._logger.error('ERROR at lora.gateway.ts: ' + error);
        }),
      );
    } else { // if authenticatio fails
      client.emit('responsetData', 'WS: Unauthorized');
    }
  }

  /**
  * @name onEventEvent
  * @param client
  * @param request
  * @description creates a websocket server for requesting device notifications
  */
  @SubscribeMessage('requestEvents')
  async onEventEvent(client, request) {
    if (await this._realm.checkJWTToken(request.jwt)) { // if authenticated

      this._logger.success('frontend connected to ws gateway');

      this._events.getEvents().subscribe(event => {
        client.emit('responseEvents', event);
      });
    } else { // if authenticatio fails
      client.emit('responseEvents', 'WS: Unauthorized');
    }
  }

  /**
  * @name handleConnection
  */
  handleConnection() {
    this._logger.success('frontend requested data');
  }

  /**
  * @name handleDisconnect
  * @description fired when a socekt is disconnected
  */
  handleDisconnect() {
    this._logger.success('handleDisconnect()');
    this.subscriptions.forEach((subscription: Subscription) => {
      subscription.unsubscribe();
    });
    this._realm.removeWatcher()
    this._logger.success('socket closed');
  }

  /**
  * @name afterInit
  * @description fired after socket server started
  */
  afterInit() {
    this._logger.success('sockets gateway started');
  }
}
