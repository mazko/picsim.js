import { Component, OnInit } from '@angular/core';
import { AbstractBoard } from '../AbstractBoard';
import { Subscription } from 'rxjs/Subscription';
import { ui_catcher } from '../decorators';

import { HD44780 } from './parts/HD44780';
import { DS1307 } from './parts/DS1307';

const DEFAULT_RED = '#050000';
const DEFAULT_GREEN = '#000500';
const DEFAULT_BLUE = '#000005';

/*

// http://awk.js.org/?gist=c15d195b8ae7778a8517f2faaece952c

~$ echo '
"use strict";
const width=10.027, height=16.522, X_DOTS=5, Y_DOTS=8;
let yIndex = -1;
for (let y of [34.154, 51.37]) {
  yIndex++;
  let xIndex = -1;
  for (let x of [27.79,38.534,49.278,60.022,70.768,81.512,92.256,103,113.74,124.49,135.23,145.98,156.72,167.46,178.21,188.95]) {
    xIndex++;
    for (let dx = 0; dx < X_DOTS; dx++) {
      for (let dy = 0; dy < Y_DOTS; dy++) {
        let padHeight = (height/Y_DOTS)*3/4;
        let padWidth = (width/X_DOTS)*3/4;
        console.log(`<rect [attr.fill-opacity]="getPixel(${yIndex},${xIndex},${dx},${dy})?1:0.1" y="${y+(height*dy/Y_DOTS)}"
          width="${padWidth}" x="${x+(width*dx/X_DOTS)}" height="${padHeight}" rx="${padWidth/3}" ry="${padHeight/3}"/>`);
      }
    }
  }
}' | node | xclip -selection clipboard

*/


@Component({
  selector: 'app-board2',
  templateUrl: './board2.component.html',
  styleUrls: ['./board2.component.css']
})
export class Board2Component extends AbstractBoard implements OnInit {

  RA0_RGB: string;
  RA1_RGB: string;
  RA2_RGB: string;
  RA3_RGB: string;
  RA4_RGB: string;
  RA5_RGB: string;
  RA6_RGB: string;
  RA7_RGB: string;

  RC0_RGB: string;
  RC1_RGB: string;
  RC2_RGB: string;
  RC5_RGB: string;
  RC6_RGB: string;
  RC7_RGB: string;

  RB0_RB7_IN: boolean;
  RB0_RB6_IN: boolean;
  RB0_RB5_IN: boolean;
  RB0_RB4_IN: boolean;

  RB1_RB7_IN: boolean;
  RB1_RB6_IN: boolean;
  RB1_RB5_IN: boolean;
  RB1_RB4_IN: boolean;

  RB2_RB7_IN: boolean;
  RB2_RB6_IN: boolean;
  RB2_RB5_IN: boolean;
  RB2_RB4_IN: boolean;

  RB3_RB7_IN: boolean;
  RB3_RB6_IN: boolean;
  RB3_RB5_IN: boolean;
  RB3_RB4_IN: boolean;

  public readonly DEFAULT_ANALOG_VALUE = 512;
  private _analog_value = this.DEFAULT_ANALOG_VALUE;

  private readonly _lcd_display = new HD44780();
  private readonly _rtc = new DS1307();

  ngOnInit(): void {
    this._state.chip = this._picSim.PIC18F4620;
    this._state.freq = this._state.freq || 25e4;
    this._state.currentBoardId = 2;
    this._subscriptions.push(this._state
      .subscribe('simulation', (): void => {
        if (!this._state.isRunning) {
          this._reset_board_ui();
        }
      })
    );
  }

  private _reset_board_ui(): void {
    this._lcd_display.rst();
    this.RA0_RGB = this.RA1_RGB = this.RA2_RGB =
    this.RA3_RGB = this.RA4_RGB = DEFAULT_RED;

    this.RC0_RGB = this.RA7_RGB =
    this.RA5_RGB = this.RA6_RGB = DEFAULT_BLUE;

    this.RC2_RGB = this.RC5_RGB = this.RC6_RGB =
    this.RC7_RGB = this.RC1_RGB = DEFAULT_GREEN;
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

  private _lcd_io_pins(): void {
    const sim = this._picSim,
          lcd = this._lcd_display;
    if (sim.get_pin_dir(9) === 'out' && !sim.get_pin(9)) {
      if (!lcd.pinE) {
        let data = 0;
        /* tslint:disable:no-bitwise */
        if (sim.get_pin(30)) { data |= 0x80; }
        if (sim.get_pin(29)) { data |= 0x40; }
        if (sim.get_pin(28)) { data |= 0x20; }
        if (sim.get_pin(27)) { data |= 0x10; }
        if (sim.get_pin(22)) { data |= 0x08; }
        if (sim.get_pin(21)) { data |= 0x04; }
        if (sim.get_pin(20)) { data |= 0x02; }
        if (sim.get_pin(19)) { data |= 0x01; }
        /* tslint:enable:no-bitwise */
        if (sim.get_pin_dir(10) === 'out') {
          sim.get_pin(10) ? lcd.data(data) : lcd.cmd(data);
        }

        lcd.pinE = true;
      }
    } else {
      lcd.pinE = false;
    }
  }

  private _rtc_io_pins(): void {
    const sim = this._picSim,
          sda_dir = sim.get_pin_dir(23);
    let sck: number, sda: number, res: boolean;

    if (sda_dir === 'in') {
      // pull up
      sda = 1;
    } else {
      sda = +sim.get_pin(23);
    }
    if (sim.get_pin_dir(18) === 'in') {
      // pull up
      sck = 1;
      sim.set_pin(18, true);
    } else {
      sck = +sim.get_pin(18);
    }
    res = this._rtc.io(sck, sda);
    if (sda_dir === 'in') {
      sim.set_pin(23, res);
    }
  }

  @ui_catcher
  _do_steps(STEPS_TOTAL: number): void {
    const sim = this._picSim,
          PROBES = 250,
          STEPS_BETWEEN_PROBES = STEPS_TOTAL / PROBES,
          PORT_LEDS_OUT = Array<number>(14).fill(0);

    if (STEPS_BETWEEN_PROBES % 1) {
      throw new Error('PROBES have Fractional part ?');
    }

    this._lcd_display.blink();
    this._rtc.update();

    for (const step = {__step: 0}; step.__step < STEPS_TOTAL; step.__step++) {
      sim.step();

      // high priority io

      this._lcd_io_pins();
      this._rtc_io_pins();

      // low priority io

      if (!(step.__step % STEPS_BETWEEN_PROBES)) {

        // leds
        const pins: number[] = [
          /* RA0:7     */ 2, 3, 4, 5, 6, 7, 14, 13,
          /* RC0:2,5:7 */ 15, 16, 17, 24, 25, 26
        ];
        for (let i = 0; i < PORT_LEDS_OUT.length; i++) {
          if (sim.get_pin(pins[i])) { PORT_LEDS_OUT[i]++; }
        }

        // keyboard matrix
        const pins_y: number[] = [33 /* RB0 */, 34, 35, 36],
              pins_x: number[] = [40 /* RB7 */, 39, 38, 37],
              pins_y_dir = pins_y.map(p => sim.get_pin_dir(p)),
              pins_x_dir = pins_x.map(p => sim.get_pin_dir(p));

        const btn_matrix: boolean[][] = [
          [this.RB0_RB7_IN, this.RB0_RB6_IN, this.RB0_RB5_IN, this.RB0_RB4_IN],
          [this.RB1_RB7_IN, this.RB1_RB6_IN, this.RB1_RB5_IN, this.RB1_RB4_IN],
          [this.RB2_RB7_IN, this.RB2_RB6_IN, this.RB2_RB5_IN, this.RB2_RB4_IN],
          [this.RB3_RB7_IN, this.RB3_RB6_IN, this.RB3_RB5_IN, this.RB3_RB4_IN]
        ].map((vy, yidx) => vy.map(
          (vx, xidx) => vx && pins_y_dir[yidx] !== pins_x_dir[xidx]
        ));

        for (let y = 0; y < btn_matrix.length; y++) {
          if (pins_y_dir[y] === 'in') {
            if (btn_matrix[y].some((v, x) => v && !sim.get_pin(pins_x[x]))) {
              sim.set_pin(pins_y[y], false);
            } else {
              // default pull up
              sim.set_pin(pins_y[y], true);
            }
          }
        }

        const transpose = m => m[0].map((col, i) => m.map(row => row[i])),
              t_btn_matrix = transpose(btn_matrix);

        for (let x = 0; x < t_btn_matrix.length; x++) {
          if (pins_x_dir[x] === 'in') {
            if (t_btn_matrix[x].some((v, y) => v && !sim.get_pin(pins_y[y]))) {
              sim.set_pin(pins_x[x], false);
            } else {
              // default pull up
              sim.set_pin(pins_x[x], true);
            }
          }
        }

        // analog input RE0
        sim.set_a_pin(8, 5.0 * this._analog_value / 1023);

      }
    }

    // normalize
    this._normalize_probes(PORT_LEDS_OUT, PROBES);

    // leds
    this.RA0_RGB = `rgb(${PORT_LEDS_OUT[0]},0,0)`;
    this.RA1_RGB = `rgb(${PORT_LEDS_OUT[1]},0,0)`;
    this.RA2_RGB = `rgb(${PORT_LEDS_OUT[2]},0,0)`;
    this.RA3_RGB = `rgb(${PORT_LEDS_OUT[3]},0,0)`;
    this.RA4_RGB = `rgb(${PORT_LEDS_OUT[4]},0,0)`;
    this.RA5_RGB = `rgb(0,0,${PORT_LEDS_OUT[5]})`;
    this.RA6_RGB = `rgb(0,0,${PORT_LEDS_OUT[6]})`;
    this.RA7_RGB = `rgb(0,0,${PORT_LEDS_OUT[7]})`;
    this.RC0_RGB = `rgb(0,0,${PORT_LEDS_OUT[8]})`;
    this.RC1_RGB = `rgb(0,${PORT_LEDS_OUT[9]},0)`;
    this.RC2_RGB = `rgb(0,${PORT_LEDS_OUT[10]},0)`;
    this.RC5_RGB = `rgb(0,${PORT_LEDS_OUT[11]},0)`;
    this.RC6_RGB = `rgb(0,${PORT_LEDS_OUT[12]},0)`;
    this.RC7_RGB = `rgb(0,${PORT_LEDS_OUT[13]},0)`;
  }

  // http://stackoverflow.com/q/34179897
  // simple this._display_lcd.getPixel(...args) won't work
  getPixel(r: number, s: number, l: number, t: number): boolean {
    return this._lcd_display.getPixel(r, s, l, t);
  }

  @ui_catcher
  resetClicked(): void {
    this._picSim.reset(-1);
  }

  btn_mouseup(): void {
    this.RB0_RB7_IN = this.RB0_RB6_IN =
    this.RB0_RB5_IN = this.RB0_RB4_IN =
    this.RB1_RB7_IN = this.RB1_RB6_IN =
    this.RB1_RB5_IN = this.RB1_RB4_IN =
    this.RB2_RB7_IN = this.RB2_RB6_IN =
    this.RB2_RB5_IN = this.RB2_RB4_IN =
    this.RB3_RB7_IN = this.RB3_RB6_IN =
    this.RB3_RB5_IN = this.RB3_RB4_IN = false;
  }

  // http://stackoverflow.com/q/9506041

  btn_RB0_RB7($event: Event): void {
    // alert(1)
    this.RB0_RB7_IN = true;
    $event.preventDefault();
  }

  btn_RB0_RB6($event: Event): void {
    // alert(2)
    this.RB0_RB6_IN = true;
    $event.preventDefault();
  }

  btn_RB0_RB5($event: Event): void {
    // alert(3)
    this.RB0_RB5_IN = true;
    $event.preventDefault();
  }

  btn_RB0_RB4($event: Event): void {
    // alert('+')
    this.RB0_RB4_IN = true;
    $event.preventDefault();
  }

  // 2

  btn_RB1_RB7($event: Event): void {
    // alert(4)
    this.RB1_RB7_IN = true;
    $event.preventDefault();
  }

  btn_RB1_RB6($event: Event): void {
    // alert(5)
    this.RB1_RB6_IN = true;
    $event.preventDefault();
  }

  btn_RB1_RB5($event: Event): void {
    // alert(6)
    this.RB1_RB5_IN = true;
    $event.preventDefault();
  }

  btn_RB1_RB4($event: Event): void {
    // alert('-')
    this.RB1_RB4_IN = true;
    $event.preventDefault();
  }

  // 3

  btn_RB2_RB7($event: Event): void {
    // alert(7)
    this.RB2_RB7_IN = true;
    $event.preventDefault();
  }

  btn_RB2_RB6($event: Event): void {
    // alert(8)
    this.RB2_RB6_IN = true;
    $event.preventDefault();
  }

  btn_RB2_RB5($event: Event): void {
    // alert(9)
    this.RB2_RB5_IN = true;
    $event.preventDefault();
  }

  btn_RB2_RB4($event: Event): void {
    // alert('/')
    this.RB2_RB4_IN = true;
    $event.preventDefault();
  }

  // 4

  btn_RB3_RB7($event: Event): void {
    // alert('*')
    this.RB3_RB7_IN = true;
    $event.preventDefault();
  }

  btn_RB3_RB6($event: Event): void {
    // alert(0)
    this.RB3_RB6_IN = true;
    $event.preventDefault();
  }

  btn_RB3_RB5($event: Event): void {
    // alert('#')
    this.RB3_RB5_IN = true;
    $event.preventDefault();
  }

  btn_RB3_RB4($event: Event): void {
    // alert('$')
    this.RB3_RB4_IN = true;
    $event.preventDefault();
  }

  changeAnalog(value: number) {
    this._analog_value = value;
  }

}
