import { Component, OnInit } from '@angular/core';
import { AbstractBoard } from '../AbstractBoard';
import { Subscription } from 'rxjs/Subscription';
import { ui_catcher } from '../decorators';


const SVG_SWITCH_ON = 'matrix(.078133 0 0 .078133 70.84 90.539)';
const SVG_SWITCH_OFF = 'matrix(.078133 0 0 -.078133 70.84 128)';

const DEFAULT_RED = '#050000';
const DEFAULT_GREEN = '#000500';
const DEFAULT_YELLOW = '#050500';
const DEFAULT_SEGMENT = '#FFF';


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

  private _switchState = true;

  actuator_transform = SVG_SWITCH_ON;

  private readonly _display = {
    idx: -1,
    segments: {
      A: DEFAULT_SEGMENT, B: DEFAULT_SEGMENT, C: DEFAULT_SEGMENT,
      D: DEFAULT_SEGMENT, E: DEFAULT_SEGMENT, F: DEFAULT_SEGMENT,
      G: DEFAULT_SEGMENT, DOT: DEFAULT_SEGMENT
    }
  };

  getSegmentA(idx: number): string {
    return idx === this._display.idx
      ? this._display.segments.A
      : DEFAULT_SEGMENT;
  }

  getSegmentB(idx: number): string {
    return idx === this._display.idx
      ? this._display.segments.B
      : DEFAULT_SEGMENT;
  }

  getSegmentC(idx: number): string {
    return idx === this._display.idx
      ? this._display.segments.C
      : DEFAULT_SEGMENT;
  }

  getSegmentD(idx: number): string {
    return idx === this._display.idx
      ? this._display.segments.D
      : DEFAULT_SEGMENT;
  }

  getSegmentE(idx: number): string {
    return idx === this._display.idx
      ? this._display.segments.E
      : DEFAULT_SEGMENT;
  }

  getSegmentF(idx: number): string {
    return idx === this._display.idx
      ? this._display.segments.F
      : DEFAULT_SEGMENT;
  }

  getSegmentG(idx: number): string {
    return idx === this._display.idx
      ? this._display.segments.G
      : DEFAULT_SEGMENT;
  }

  getSegmentDot(idx: number): string {
    return idx === this._display.idx
      ? this._display.segments.DOT
      : DEFAULT_SEGMENT;
  }

  ngOnInit() {
    this._state.currentBoardId = 1;
    this._state.chip = this._picSim.PIC16F648A;
    this._state.freq = this._state.freq || 1e6;
    this._subscriptions.push(this._state
      .subscribe('simulation', () =>
        !this._state.isRunning
        && this._reset_board_ui()
    ));
  }

  private _clear_portb_leds() {
    this.RB0_RGB = this.RB1_RGB = this.RB2_RGB =
    this.RB3_RGB = this.RB4_RGB = this.RB5_RGB =
    this.RB6_RGB = this.RB7_RGB = DEFAULT_RED;
  }

  private _clear_display_segments() {
    this._display.idx = -1;
  }

  private _reset_board_ui() {
    this._clear_portb_leds();
    this._clear_display_segments();

    this.RA1_RGB = this.RA2_RGB = this.RA3_RGB = DEFAULT_GREEN;

    this.RA0_RGB = DEFAULT_YELLOW;

    this.btn_mouseup();
  }

  private _normalize_port(port: number[], PROBES: number) {
    for (let i = 0; i < port.length; i++) {
      port[i] = Math.ceil(port[i] * 0xFF / PROBES);
      if (port[i] > 0xFF) {
        console.log(`ERROR: wrong math ${port[i]} !`);
        port[i] = 0xFF;
      }
    }
  }

  @ui_catcher
  _do_steps(steps: number) {
    const sim = this._picSim,
          PROBES = 250,
          STEPS_BETWEEN_PROBES = steps / PROBES,
          PORTB_OUT = Array<number>(8).fill(0),
          PORTA_OUT = Array<number>(4).fill(0);

    if (STEPS_BETWEEN_PROBES % 1) {
      throw new Error('PROBES have Fractional part ?');
    }

    for (let step = 0; step < steps; step++) {
      sim.step();
      // get_pins same as in doc DS40044E
      if (!(step % STEPS_BETWEEN_PROBES)) {
        // PORTB pins 6..13
        for (let i = 0; i < PORTB_OUT.length; i++) {
          PORTB_OUT[i] += sim.get_pin(i + 6);
        }

        // PORTA leds pins 17,18,1,2
        // PORTA buttons pins 18,1,2,3
        PORTA_OUT[0] += sim.get_pin(17);
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
          PORTA_OUT[1] += sim.get_pin(18);
        }

        if (sim.get_pin_dir(1) === 'in') {
          sim.set_pin(1, this.RA2_IN);
          // led pulled up by resistor
          if (this.RA2_IN) { PORTA_OUT[2]++; }
        } else {
          PORTA_OUT[2] += sim.get_pin(1);
        }

        if (sim.get_pin_dir(2) === 'in') {
          sim.set_pin(2, this.RA3_IN);
          // led pulled up by resistor
          if (this.RA3_IN) { PORTA_OUT[3]++; }
        } else {
          PORTA_OUT[3] += sim.get_pin(2);
        }

      }
    }

    // normalize
    this._normalize_port(PORTB_OUT, PROBES);
    this._normalize_port(PORTA_OUT, PROBES);

    // console.log(PORTB_OUT)

    if (this._switchState) {
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
      this._display.segments.G = `rgb(255,${255 - PORTB_OUT[0]},${255 - PORTB_OUT[0]})`;
      this._display.segments.F = `rgb(255,${255 - PORTB_OUT[1]},${255 - PORTB_OUT[1]})`;
      this._display.segments.A = `rgb(255,${255 - PORTB_OUT[2]},${255 - PORTB_OUT[2]})`;
      this._display.segments.B = `rgb(255,${255 - PORTB_OUT[3]},${255 - PORTB_OUT[3]})`;
      this._display.segments.C = `rgb(255,${255 - PORTB_OUT[5]},${255 - PORTB_OUT[5]})`;
      this._display.segments.D = `rgb(255,${255 - PORTB_OUT[6]},${255 - PORTB_OUT[6]})`;
      this._display.segments.E = `rgb(255,${255 - PORTB_OUT[7]},${255 - PORTB_OUT[7]})`;
      this._display.idx = +(PORTB_OUT[4] < 128); // 0 or 1
    }

    // console.log(PORTA_OUT)

    this.RA0_RGB = `rgb(${PORTA_OUT[0]},${PORTA_OUT[0]},0)`;
    this.RA1_RGB = `rgb(0,${PORTA_OUT[1]},0)`;
    this.RA2_RGB = `rgb(0,${PORTA_OUT[2]},0)`;
    this.RA3_RGB = `rgb(0,${PORTA_OUT[3]},0)`;
  }

  switched() {
    this._switchState = !this._switchState;
    this.actuator_transform = this._switchState ? SVG_SWITCH_ON : SVG_SWITCH_OFF;
    if (!this._switchState) {
      this._clear_portb_leds();
    } else {
      this._clear_display_segments();
    }
  }

  @ui_catcher
  resetClicked() {
    this._picSim.reset(-1);
  }

  btn_mouseup() {
    this.RA1_IN = this.RA2_IN =
    this.RA3_IN = this.RA4_IN = true;
  }

  // http://stackoverflow.com/q/9506041

  btn_RA1($event) {
    this.RA1_IN = false;
    $event.preventDefault();
  }

  btn_RA2($event) {
    this.RA2_IN = false;
    $event.preventDefault();
  }

  btn_RA3($event) {
    this.RA3_IN = false;
    $event.preventDefault();
  }

  btn_RA4($event) {
    this.RA4_IN = false;
    $event.preventDefault();
  }

}
