import { Component, Inject, OnInit, ViewChild, ElementRef, Input, Output, EventEmitter } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import * as Konva from 'konva';
import { ApiService } from '../../@services/api.service/api.service';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements OnInit {

  @ViewChild('container')
  container: ElementRef;

  animal: string;
  name: string;

  private stage;
  private layer;
  private bgLayer;
  public modus = 'click'; // click | draw
  private backgroundImg = {
    src: '/assets/images/plan.png',
    x: 0,
    y: 0,
    width: 1000,
    height: 400,
    rotation: 0,
    draggable: false,
    id: 'background',
    name: 'background',
  };
  @Input() roomList = []; // list of rooms
  @Output() roomClicked: EventEmitter<string> = new EventEmitter<string>();
  private roomsArray = [ ]; // list of room elements

  constructor(private _api: ApiService,
    public dialog: MatDialog) {}

    ngOnInit() {
      // reload the canvas from server
      this.loadKonvaFromServer();
      // TODO: remove lines
      this.selectImage();
    }

    loadKonvaFromServer() {
      const self = this;
      this.loadKonva();
      this._api.loadKonva().subscribe(res => {
        if (res !== null && res !== undefined) {
          self.backgroundImg = (res as StoreData).backgroundImg;
          self.roomsArray = (res as StoreData).roomsArray;
        }
        this.loadKonva();
        // TODO: check
        setTimeout(() => {
          this.loadKonva();
          this.saveKonva();
        }, 1000);
      });
    }

    selectImage() {
      const width = 1000;
      const height = 400;
      this.backgroundImg.src = '/assets/images/plan.png';
      this.backgroundImg.width = width;
      this.backgroundImg.height = height;
      this.container.nativeElement.style.width = width + 'px';
      this.container.nativeElement.style.height = height + 'px';
      this.loadKonva();
    }

    // click on room
    clickRoom(event) {
      this.roomClicked.emit(event.target.attrs.id);
    }

    /**
    * @name saveKonva
    * @description saves the actual state and deactivates the movement of parts
    */
    saveKonva() {
      // save rooms
      this.roomsArray = [];
      const rooms = this.layer.find('.room');
      rooms.forEach(room => {
        this.roomsArray.push({
          x: room.attrs.x,
          y: room.attrs.y,
          width: ((!room.attrs.scaleX) ? room.attrs.width : (room.attrs.width * room.attrs.scaleX)),
          height: ((!room.attrs.scaleY) ? room.attrs.height : (room.attrs.height * room.attrs.scaleY)),
          rotation: room.attrs.rotation,
          draggable: false,
          name: room.attrs.name,
          id: room.attrs.id,
        });
      });

      // save background
      const bg = this.bgLayer.findOne('#background');
      if (bg !== null && bg !== undefined) {
        this.backgroundImg.x = bg.attrs.x;
        this.backgroundImg.y = bg.attrs.y;
        this.backgroundImg.width = ((!bg.attrs.scaleX) ? bg.attrs.width : (bg.attrs.width * bg.attrs.scaleX));
        this.backgroundImg.height = ((!bg.attrs.scaleY) ? bg.attrs.height : (bg.attrs.height * bg.attrs.scaleY));
        this.backgroundImg.rotation = bg.attrs.rotation;
        this.backgroundImg.draggable = false;
      }

      // send to server
      this._api.saveKonva({
        backgroundImg: this.backgroundImg,
        roomsArray: this.roomsArray
      }).subscribe();

      // reload konva
      this.loadKonva();
    }

    /**
    * @loadKonva
    */
    loadKonva() {
      const self = this;

      // create stage
      this.stage = new Konva.Stage({
        container: 'container',
        width: this.backgroundImg.width,
        height: this.backgroundImg.height,
      });

      // load image
      this.bgLayer = new Konva.Layer();
      const imageObj = new Image();
      imageObj.src = self.backgroundImg.src;

      // create bg layer
      imageObj.onload = async function() {
        const image = new Konva.Image({
          x: self.backgroundImg.x,
          y: self.backgroundImg.y,
          image: imageObj,
          width: self.backgroundImg.width,
          height: self.backgroundImg.height,
          rotation: self.backgroundImg.rotation,
          draggable: self.backgroundImg.draggable,
          id: self.backgroundImg.id,
          name: self.backgroundImg.name,
        });
        self.bgLayer.add(image);
        self.stage.add(self.bgLayer);

        // create layer
        self.layer = new Konva.Layer();
        self.stage.add(self.layer);

        self.roomsArray.forEach(room => {
          // remove room from roomList
          const index = self.roomList.indexOf(room.id);
          if (index > -1) {
            self.roomList.splice(index, 1);
          }
          // add room to roomsArray
          const rect = new Konva.Rect({
            x: room.x,
            y: room.y,
            width: room.width,
            height: room.height,
            rotation: room.rotation,
            stroke: 'rgb(2, 150, 213)',
            strokeWidth: 4,
            name: room.name,
            id: room.id,
            draggable: room.draggable
          });
          self.layer.add(rect);
        });
        self.layer.draw();

        // adds listener
        self.addKonvaListener();
      };
    }

    addKonvaListener() {
      const self = this;

      // on click
      this.stage.on('click', function (e) {
        if (self.modus === 'draw') {
          // if click on empty area - remove all transformers
          if (e.target === self.stage) {
            self.stage.find('Transformer').destroy();
            self.bgLayer.draw();
            self.layer.draw();
            return;
          }
          if (e.target.hasName('room')) {
            self.stage.find('Transformer').destroy();
            self.bgLayer.draw();
            // create new transformer
            const tr = new Konva.Transformer();
            self.layer.add(tr);
            tr.attachTo(e.target); // todo check layer
            self.layer.draw();
          } else {
            self.addRoom(e);
          }
        } else if (self.modus === 'click') {
          if (e.target.hasName('room')) {
            self.clickRoom(e);
          }
        }
      });

       // on tap TODO: fix to only one function
       this.stage.on('tap', function (e) {
        if (self.modus === 'draw') {
          // if click on empty area - remove all transformers
          if (e.target === self.stage) {
            self.stage.find('Transformer').destroy();
            self.bgLayer.draw();
            self.layer.draw();
            return;
          }
          if (e.target.hasName('room')) {
            self.stage.find('Transformer').destroy();
            self.bgLayer.draw();
            // create new transformer
            const tr = new Konva.Transformer();
            self.layer.add(tr);
            tr.attachTo(e.target); // todo check layer
            self.layer.draw();
          } else {
            self.addRoom(e);
          }
        } else if (self.modus === 'click') {
          if (e.target.hasName('room')) {
            self.clickRoom(e);
          }
        }
      });

      // on dblclick
      this.stage.on('dblclick', function (e) {
        if (self.modus === 'draw') {
          if (e.target.hasName('background')) {
            self.stage.find('Transformer').destroy();
            self.layer.draw();
            // create new transformer
            const tr = new Konva.Transformer();
            self.bgLayer.add(tr);
            tr.attachTo(e.target); // todo check layer
            self.bgLayer.draw();
          }
          // dblclick on room remove it
          if (e.target.hasName('room')) {
            self.removeRoom(e);
          }
        }
      });

      // on dbltap
      this.stage.on('dbltap', function (e) {
        if (self.modus === 'draw') {
          if (e.target.hasName('background')) {
            self.stage.find('Transformer').destroy();
            self.layer.draw();
            // create new transformer
            const tr = new Konva.Transformer();
            self.bgLayer.add(tr);
            tr.attachTo(e.target); // todo check layer
            self.bgLayer.draw();
          }
          // dblclick on room remove it
          if (e.target.hasName('room')) {
            self.removeRoom(e);
          }
        }
      });

      // on mouseover
      this.stage.on('mouseover', function (e) {
        if (self.modus === 'draw') {
          if (e.target.hasName('background')) {
            self.stage.container().style.cursor = 'crosshair';
          }
          if (e.target.hasName('room')) {
            self.stage.container().style.cursor = 'move';
          }
        }
        if (self.modus === 'click') {
          if (e.target.hasName('background')) {
            self.stage.container().style.cursor = 'default';
          }
          if (e.target.hasName('room')) {
            self.stage.container().style.cursor = 'pointer';
          }
        }
      });

      // on mouseenter
      this.stage.on('mousemove', function (e) {
        if (self.modus === 'click') {
          if (e.target.hasName('room')) {
            self.addTooltip(e);
          }
          if (e.target.hasName('background')) {
            self.removeTooltip();
          }
        }
      });

      // on touchstart
      this.stage.on('touchstart', function (e) {
        if (self.modus === 'click') {
          if (e.target.hasName('room')) {
            self.addTooltip(e);
          }
        }
      });

      // on touchend
      this.stage.on('touchend', function (e) {
        if (self.modus === 'click') {
          self.removeTooltip();
        }
      });
    }

    addTooltip(event) {
            // show tooltip
            const _layer = new Konva.Layer();
            _layer.addName('label');

            const tooltip = new Konva.Label({
              x: event.target.attrs.x,
              y: event.target.attrs.y,
              opacity: 0.75,
              id: 'label',
            });

            tooltip.add(new Konva.Tag({
              fill: 'black',
              pointerDirection: 'down',
              pointerWidth: 10,
              pointerHeight: 10,
              lineJoin: 'round',
              shadowColor: 'black',
              shadowBlur: 10,
              shadowOffset: 10,
              shadowOpacity: 0.5,
            } as any));

            tooltip.add(new Konva.Text({
              text: event.target.attrs.id,
              fontFamily: 'Roboto',
              fontSize: 18,
              padding: 5,
              fill: 'white',
            }));

            _layer.add(tooltip);

            this.removeTooltip();
            this.stage.add(_layer);
    }

    removeTooltip() {
      const _oldStage = this.stage.findOne('.label');
            if (_oldStage !== undefined) { _oldStage.destroy(); }
    }

    addRoom(event) {
      // select room name
      const dialogRef = this.dialog.open(MapDialogComponent, {
        width: '250px',
        data: { roomList: this.roomList }
      });
      // when dialog closed create node
      dialogRef.afterClosed().subscribe(res => {
        if (res !== undefined) {
          this.roomsArray.push({
            x: (event.evt.offsetX - 25),
            y: (event.evt.offsetY - 25),
            width: 50,
            height: 50,
            rotation: 0,
            draggable: true,
            name: 'room',
            id: res,
          });
          this.loadKonva();
        }
      });
    }

    removeRoom(event) {
      // remove element from roomsArray
      for (let i = 0; i < this.roomsArray.length; i++) {
        if (this.roomsArray[i].id === event.target.attrs.id) {
          this.roomsArray.splice(i, 1);
        }
      }
      // add element name to roomList
      this.roomList.push(event.target.attrs.id);
      this.loadKonva();
    }

    toggleMode() {
      if (this.modus === 'draw') {
        // deactivate movement, save and reload
        this.modus = 'click';
        this.backgroundImg.draggable = false;
        this.saveKonva();
      } else {
        // activate movement, save and reload
        this.modus = 'draw';
        this.backgroundImg.draggable = true;
        this.roomsArray.forEach(room => {
          room.draggable = true;
        });
        this.loadKonva();
      }
    }

  }

  @Component({
    selector: 'app-map-dialog',
    templateUrl: 'map.dialog.html',
  })
  export class MapDialogComponent {

    constructor(
      public dialogRef: MatDialogRef<MapDialogComponent>,
      @Inject(MAT_DIALOG_DATA) public data: any) { }

      selected = this.data.roomList[0];

      onNoClick(): void {
        this.dialogRef.close();
      }

    }

    interface StoreData {
      backgroundImg: any;
      roomsArray: any;
    }
