import { Component } from '@angular/core';
import { PicSimEmscriptenService } from './services/pic-sim-emscripten.service';
import { GistService } from './services/gist.service';
import { ControllerService } from './services/controller.service';
import { StateService } from './services/state.service';


type BsAlertType = 'success' | 'info' | 'danger';


@Component({
  selector: 'app-pic-sim',
  templateUrl: './pic-sim.component.html',
  styleUrls: ['./pic-sim.component.css'],
  providers: [ControllerService, StateService],
})
export class PicSimComponent {

  isFreezed = false;

  freqs: {f: string, v: number}[] = [
    {f: '50 KHz',  v: 5e4},
    {f: '100 KHz', v: 1e5},
    {f: '250 KHz', v: 25e4},
    {f: '500 KHz', v: 5e5},
    {f: '1 MHz',   v: 1e6},
    {f: '2 MHz',   v: 2e6},
    {f: '4 MHz',   v: 4e6},
    {f: '8 MHz',   v: 8e6},
    {f: '16 MHz',  v: 16e6},
  ];

  readonly alerts: {msg: string, type: BsAlertType, html?: boolean}[] = [];

  gistBtnEnabled: boolean;

  freq: string;

  // Angular2 template binding magic 
  // detects changes even inside getters

  get isRunning(): boolean {
    return this._state.isRunning;
  }

  get hasHex(): boolean {
    return this._state.hasHex;
  }

  run_clicked() {
    if (this.isRunning) {
      this._controller.stopSimulation();
    } else {
      this._controller.startSimulation();
    }
  }

  freq_clicked(idx) {
    this.freq = this.freqs[idx].f;
    this._state.freq = this.freqs[idx].v;
  }

  gist_clicked() {

    this._gist
      .create({
        hex: this._state.hex,
        boardId: this._state.currentBoardId,
        freq: this._state.freq
      })
      .then(({id, url}) => {
        // TODO: routerLink instead window.location
        this.alerts.push({
          msg: `<strong>GIST:</strong>
            <a href='${url}'>${id}</a> | <strong>Share:</strong>
            <a href='${window.location.protocol}//${window.location.host}/${id}'>me</a>`,
          type: 'success', html: true});
      })
      .catch(e => {
        console.log(e);
        this.alerts.push({msg: `Can't create gist, http error! ${e.statusText}`, type: 'danger'});
      });
  }

  hex_changed($event) {
    const this_ = this;
    for (const file of $event.target.files) {
      const reader = new FileReader();
      reader.onload = (function(theFile) {
        return (e) => {
          const contents = new Uint8Array(e.target.result);
          try {
            this_._state.create_hex_file(contents);
            this_.gistBtnEnabled = true;
          } catch (err) {
            // console.log(e);
            console.log(err.message || err); // error short version
            this_.alerts.push({msg: `${this_._state.HEX_FILE_NAME}: ${err.message}`, type: 'danger'});
          }
        };
      })(file);
      reader.readAsArrayBuffer(file);
    }
  }

  constructor(
      private readonly _gist: GistService,
      private readonly _controller: ControllerService,
      private readonly _state: StateService) {

    _controller
      .errorOccured$
      .subscribe(err => {
          // console.log(model);
          console.log(`${err}`); // error short version
          this.alerts.push({msg: `${err}`, type: 'danger'});
      });

    _controller
      .healthChanged$
      .subscribe(({dt, interval}) => {
        // console.log(dt > interval)
        this.isFreezed = (dt > interval);
      });

    _state.subscribe('freq', () =>
        this.freqs.forEach(({f, v}) =>
          (v === this._state.freq) &&
          (this.freq = f)
      ));
  }

}