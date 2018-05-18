import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../@services/api.service/api.service';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material';

@Component({
  selector: 'app-meteo',
  templateUrl: './meteo.component.html',
  styleUrls: ['./meteo.component.scss']
})
export class MeteoComponent implements OnInit {

  public locations: any;
  public location = '';
  public panelOpenState: boolean;

  constructor(
    private _api: ApiService,
    public snackBar: MatSnackBar,
  ) { }

  /**
   * @name addLocation
   * @description add a location to the backend
   */
  addLocation() {
    if (this.isNewLocation(this.location)) {
      this._api.saveLocation(this.location).subscribe(res => this.getLocations());
      this.snackBar.open(this.location + ' added', 'Close', {
        duration: 3000
      });
      this.location = '';
    } else {
      this.snackBar.open('Location already in Database', 'Close', {
        duration: 3000
      });
    }
  }

  /**
   * @name getLocations
   * @description ask the server for a list of locations
   */
  getLocations() {
    this._api.getLocations().subscribe((meteo: any) => {
      this.locations = meteo.locations;
    });
  }

  /**
   * @name isNewLocation
   * @param location string
   * @returns true if the location is new
   */
  isNewLocation(location: string): Boolean {
    let isNew = true;
    this.locations.forEach(loc => {
      if (location === loc) {
        isNew = false;
      }
    });
    return isNew;
  }

  ngOnInit() {
    this.getLocations();
  }

}
