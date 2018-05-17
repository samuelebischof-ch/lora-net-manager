import { Component, Inject, forwardRef } from '@nestjs/common';
import { Subject } from 'rxjs/Subject'
import { LoggerService } from '../logger/logger.service';
import { RealmService } from '../realm/realm.service';

@Component()
export class EventService {

  constructor(
    @Inject(forwardRef(() => RealmService))
    private readonly _realm: RealmService,
    private readonly _logger: LoggerService,
  ) {}

  private events$: Subject<any> = new Subject();

  /**
   * @name pushEvent
   * @param event
   * @description pushed an event to events$
   */
  pushEvent(event: any) {
    this.events$.next(event);
    this._realm.updateDeviceStatus(event);
  }

  /**
   * @name getEvents
   * @returns the events$ Subject
   */
  getEvents(): Subject<any> {
    return this.events$;
  }

}