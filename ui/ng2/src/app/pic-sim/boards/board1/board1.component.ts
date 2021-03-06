import { Component, OnInit } from '@angular/core';
import { AbstractBoard } from '../AbstractBoard';
import { Subscription } from 'rxjs/Subscription';
import { ui_catcher } from '../decorators';


const SVG_SWITCH_ON = 'matrix(.078133 0 0 .078133 70.84 90.539)';
const SVG_SWITCH_OFF = 'matrix(.078133 0 0 -.078133 70.84 128)';

const DEFAULT_RED = '#050000';
const DEFAULT_GREEN = '#000500';
const DEFAULT_YELLOW = '#050500';
const DEFAULT_SEGMENT = '#000';


class Display7 {
  A: string;
  B: string;
  C: string;
  D: string;
  E: string;
  F: string;
  G: string;
  DOT: string;

  clear() {
    this.A = this.B = this.C = this.D = this.E =
    this.F = this.G = this.DOT = DEFAULT_SEGMENT;
  }
}


@Component({
  selector: 'app-board1',
  templateUrl: './board1.component.html',
  styleUrls: ['./board1.component.css']
})
export class Board1Component extends AbstractBoard implements OnInit {

  RB0_RGB: string;
  RB1_RGB: string;
  RB2_RGB: string;
  RB3_RGB: string;
  RB4_RGB: string;
  RB5_RGB: string;
  RB6_RGB: string;
  RB7_RGB: string;

  RA1_RGB: string;
  RA2_RGB: string;
  RA3_RGB: string;

  RA0_RGB: string;

  RA1_IN: boolean;
  RA2_IN: boolean;
  RA3_IN: boolean;
  RA4_IN: boolean;

  private _switchStateIsOnLeds = true;

  actuator_transform = SVG_SWITCH_ON;

  public readonly DISPLAY_BACKGROUND = DEFAULT_SEGMENT;

  private readonly _display: {left: Display7, right: Display7} = {
    left: new Display7(), right: new Display7()
  };

  // left seven segments display

  get segment1A(): string {
    return this._display.left.A;
  }

  get segment1B(): string {
    return this._display.left.B;
  }

  get segment1C(): string {
    return this._display.left.C;
  }

  get segment1D(): string {
    return this._display.left.D;
  }

  get segment1E(): string {
    return this._display.left.E;
  }

  get segment1F(): string {
    return this._display.left.F;
  }

  get segment1G(): string {
    return this._display.left.G;
  }

  get segment1Dot(): string {
    return this._display.left.DOT;
  }

  // right seven segments display

  get segment2A(): string {
    return this._display.right.A;
  }

  get segment2B(): string {
    return this._display.right.B;
  }

  get segment2C(): string {
    return this._display.right.C;
  }

  get segment2D(): string {
    return this._display.right.D;
  }

  get segment2E(): string {
    return this._display.right.E;
  }

  get segment2F(): string {
    return this._display.right.F;
  }

  get segment2G(): string {
    return this._display.right.G;
  }

  get segment2Dot(): string {
    return this._display.right.DOT;
  }

  ngOnInit(): void {
    this._state.currentBoardId = 1;
    this._state.chip = this._picSim.PIC16F648A;
    this._state.freq = this._state.freq || 25e4;
    this._subscriptions.push(this._state
      .subscribe('simulation', (): void => {
        if (!this._state.isRunning) {
          this._reset_board_ui();
        }
      })
    );
  }

  private _clear_portb_leds(): void {
    this.RB0_RGB = this.RB1_RGB = this.RB2_RGB =
    this.RB3_RGB = this.RB4_RGB = this.RB5_RGB =
    this.RB6_RGB = this.RB7_RGB = DEFAULT_RED;
  }

  private _clear_display_segments() {
    for (const display of [this._display.left, this._display.right]) {
      display.clear();
    }
  }

  private _reset_board_ui(): void {
    this._clear_portb_leds();
    this._clear_display_segments();

    this.RA1_RGB = this.RA2_RGB = this.RA3_RGB = DEFAULT_GREEN;

    this.RA0_RGB = DEFAULT_YELLOW;

    this.btn_mouseup();
  }

  private _normalize_probes(values: number[], PROBES: number): void {
    for (let i = 0; i < values.length; i++) {
      values[i] = Math.ceil(values[i] * 0xFF / PROBES);
      if (values[i] > 0xFF) {
        console.log(`ERROR: wrong math ${values[i]} !`);
        values[i] = 0xFF;
      }
    }
  }

  @ui_catcher
  _do_steps(STEPS_TOTAL: number): void {
    const sim = this._picSim,
          PROBES = 250,
          STEPS_BETWEEN_PROBES = STEPS_TOTAL / PROBES,
          PORTB_OUT = Array<number>(8).fill(0),
          PORTA_OUT = Array<number>(4).fill(0),
          SEGMENTS_1 = Array<number>(7).fill(0),
          SEGMENTS_2 = [...SEGMENTS_1];

    if (STEPS_BETWEEN_PROBES % 1) {
      throw new Error('PROBES have Fractional part ?');
    }

    for (const step = {__step: 0}; step.__step < STEPS_TOTAL; step.__step++) {
      sim.step();
      // get_pins same as in doc DS40044E
      if (!(step.__step % STEPS_BETWEEN_PROBES)) {

        if (this._switchStateIsOnLeds) {
          // PORTB pins 6..13
          for (let i = 0; i < PORTB_OUT.length; i++) {
            if (sim.get_pin(i + 6)) { PORTB_OUT[i]++; }
          }
        } else {
          // RB4 select current display7 index
          const display_idx = sim.get_pin(10 /* 6 + 4 */);
          for (let i = 0; i < SEGMENTS_1.length; i++) {
            const value = sim.get_pin(i < 4 ? i + 6 : i + 7);
            if (display_idx) {
              if (value) { SEGMENTS_2[i]++; }
            } else {
              if (value) { SEGMENTS_1[i]++; }
            }
          }
        }

        // PORTA leds pins 17,18,1,2
        // PORTA buttons pins 18,1,2,3
        if (sim.get_pin(17)) { PORTA_OUT[0]++; }
        // if (sim.get_pin_dir(3) === 'in') {
        //   sim.set_pin(3, this.RA4_IN, 'log-err');
        // }
        sim.set_pin(3, this.RA4_IN);

        // leds & buttons intersection pins
        if (sim.get_pin_dir(18) === 'in') {
          sim.set_pin(18, this.RA1_IN);
          // led pulled up by resistor
          if (this.RA1_IN) { PORTA_OUT[1]++; }
        } else {
          if (sim.get_pin(18)) { PORTA_OUT[1]++; }
        }

        if (sim.get_pin_dir(1) === 'in') {
          sim.set_pin(1, this.RA2_IN);
          // led pulled up by resistor
          if (this.RA2_IN) { PORTA_OUT[2]++; }
        } else {
          if (sim.get_pin(1)) { PORTA_OUT[2]++; }
        }

        if (sim.get_pin_dir(2) === 'in') {
          sim.set_pin(2, this.RA3_IN);
          // led pulled up by resistor
          if (this.RA3_IN) { PORTA_OUT[3]++; }
        } else {
          if (sim.get_pin(2)) { PORTA_OUT[3]++; }
        }

      }
    }

    // normalize
    this._normalize_probes(PORTB_OUT, PROBES);
    this._normalize_probes(PORTA_OUT, PROBES);
    this._normalize_probes(SEGMENTS_1, PROBES);
    this._normalize_probes(SEGMENTS_2, PROBES);

    // console.log(PORTB_OUT)

    if (this._switchStateIsOnLeds) {
      // leds
      this.RB0_RGB = `rgb(${PORTB_OUT[0]},0,0)`;
      this.RB1_RGB = `rgb(${PORTB_OUT[1]},0,0)`;
      this.RB2_RGB = `rgb(${PORTB_OUT[2]},0,0)`;
      this.RB3_RGB = `rgb(${PORTB_OUT[3]},0,0)`;
      this.RB4_RGB = `rgb(${PORTB_OUT[4]},0,0)`;
      this.RB5_RGB = `rgb(${PORTB_OUT[5]},0,0)`;
      this.RB6_RGB = `rgb(${PORTB_OUT[6]},0,0)`;
      this.RB7_RGB = `rgb(${PORTB_OUT[7]},0,0)`;
    } else {
      // 7-segment
      this._display.left.G = `rgb(${SEGMENTS_1[0]},0,0)`;
      this._display.left.F = `rgb(${SEGMENTS_1[1]},0,0)`;
      this._display.left.A = `rgb(${SEGMENTS_1[2]},0,0`;
      this._display.left.B = `rgb(${SEGMENTS_1[3]},0,0`;
      this._display.left.C = `rgb(${SEGMENTS_1[4]},0,0`;
      this._display.left.D = `rgb(${SEGMENTS_1[5]},0,0`;
      this._display.left.E = `rgb(${SEGMENTS_1[6]},0,0`;

      this._display.right.G = `rgb(${SEGMENTS_2[0]},0,0`;
      this._display.right.F = `rgb(${SEGMENTS_2[1]},0,0`;
      this._display.right.A = `rgb(${SEGMENTS_2[2]},0,0`;
      this._display.right.B = `rgb(${SEGMENTS_2[3]},0,0`;
      this._display.right.C = `rgb(${SEGMENTS_2[4]},0,0`;
      this._display.right.D = `rgb(${SEGMENTS_2[5]},0,0`;
      this._display.right.E = `rgb(${SEGMENTS_2[6]},0,0`;
    }

    // console.log(PORTA_OUT)

    this.RA0_RGB = `rgb(${PORTA_OUT[0]},${PORTA_OUT[0]},0)`;
    this.RA1_RGB = `rgb(0,${PORTA_OUT[1]},0)`;
    this.RA2_RGB = `rgb(0,${PORTA_OUT[2]},0)`;
    this.RA3_RGB = `rgb(0,${PORTA_OUT[3]},0)`;
  }

  switched(): void {
    this._switchStateIsOnLeds = !this._switchStateIsOnLeds;
    this.actuator_transform = this._switchStateIsOnLeds ? SVG_SWITCH_ON : SVG_SWITCH_OFF;
    if (this._switchStateIsOnLeds) {
      this._clear_display_segments();
    } else {
      this._clear_portb_leds();
    }
  }

  @ui_catcher
  resetClicked(): void {
    this._picSim.reset(-1);
  }

  btn_mouseup(): void {
    this.RA1_IN = this.RA2_IN =
    this.RA3_IN = this.RA4_IN = true;
  }

  // http://stackoverflow.com/q/9506041

  btn_RA1($event: Event): void {
    this.RA1_IN = false;
    $event.preventDefault();
  }

  btn_RA2($event: Event): void {
    this.RA2_IN = false;
    $event.preventDefault();
  }

  btn_RA3($event: Event): void {
    this.RA3_IN = false;
    $event.preventDefault();
  }

  btn_RA4($event: Event): void {
    this.RA4_IN = false;
    $event.preventDefault();
  }

}
