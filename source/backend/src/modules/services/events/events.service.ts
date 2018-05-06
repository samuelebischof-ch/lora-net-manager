import { Component, Inject, forwardRef } from '@nestjs/common';
import { Subject } from "rxjs/Rx"
import { LoggerService } from '../logger/logger.service';
import { RealmService } from '../realm/realm.service';

@Component()
export class EventService {
  
  private events$: Subject<any> = new Subject();
  
  constructor(@Inject(forwardRef(() => RealmService))
              private readonly _realm: RealmService,
              private readonly _logger: LoggerService) {}

  pushEvent(event: any) {
    this.events$.next(event);
    this._realm.updateDeviceStatus(event);
  }

  getEvents(): Subject<any> {
    return this.events$;
  }
  
}