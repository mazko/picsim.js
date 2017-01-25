import { Injectable } from '@angular/core';

// https://angular.io/docs/ts/latest/guide/dependency-injection.html#singleton-services

const em = window['pic_sim_module'];


type CheckActionType = 'throw' | 'log-all' | 'log-err' | 'none';

type PinDirType = 'in' | 'out';


@Injectable()
export class PicSimEmscriptenService {

  private _pic_sim;

  private get lazySim() {
    if (!this._pic_sim) {
      // alert(42);
      this._pic_sim = new em.PicSim();
    }
    return this._pic_sim;
  }

  FS_createDataFile(
      parent: string,
      name: string,
      data: Uint8Array,
      canRead: boolean): void {

    em.FS_createDataFile(parent, name, data, canRead);
  }

  get PIC16F648A(): number {
    // alert([em.PICSIM_P16F648A, em.PICSIM_P16F648A === 0x1100])
    return em.PICSIM_P16F648A;
  }

  get PIC18F4620(): number {
    // alert([em.PICSIM_P18F4620, em.PICSIM_P18F4620 === 0x0C00])
    return em.PICSIM_P18F4620;
  }

  private _checkExitCode(
      code: number,
      act: CheckActionType= 'throw'): void {

    const CODE_ERROR = 0;
    switch (act) {
      case 'throw':
        if (code === CODE_ERROR) {
          throw new Error(`PicSim: bad exit code ${CODE_ERROR} !`);
        }
        break;
      case 'log-all':
        if (code !== CODE_ERROR) {
          console.log(`PicSim: exit code ${code}`);
        }
        /* falls through */
      case 'log-err':
        if (code === CODE_ERROR) {
          console.log(`PicSim: bad exit code ${CODE_ERROR} !`);
        }
        break;
    }
  }

  init(proc: number, fileName: string, freq: number): void {
    const code = this.lazySim.init(proc, fileName, 1, freq);
    this._checkExitCode(code);
  }

  reset(flags: number): void {
    const code = this.lazySim.reset(flags);
    this._checkExitCode(code);
  }

  step(): void {
    this.lazySim.step();
  }

  end(): void {
    this.lazySim.end();
  }

  get_pin(pin: number): boolean {
    return !!this.lazySim.get_pin(pin);
  }

  set_pin(
      pin: number,
      value: boolean,
      act: CheckActionType= 'none'): void {

    const code = this.lazySim.set_pin(pin, +value);
    this._checkExitCode(code, act);
  }

  set_a_pin(
      pin: number,
      value: number,
      act: CheckActionType= 'none'): void {

    const code = this.lazySim.set_apin(pin, value);
    this._checkExitCode(code, act);
  }

  get_pin_dir(pin: number): PinDirType {
    const dir = this.lazySim.get_pin_dir(pin);
    switch (dir) {
      case em.PICSIM_PD_OUT:
        return 'out';
      case em.PICSIM_PD_IN:
        return 'in';
      default:
        throw new Error(`PicSim: unknown pin direction ${dir}`);
    }
  }

  // hack

  em_hack_step_and_get(pin1: number, pin2 = 0, pin3 = 0, pin4 = 0): { dir: PinDirType, val: boolean }[] {
    const res = this.lazySim.em_hack_step_and_get(pin1, pin2, pin3, pin4);
    return [1, 2, 4, 8].map(v => ({
      /* tslint:disable:no-bitwise */
      dir: (res & v) ? 'in' as PinDirType : 'out' as PinDirType,
      val: !!(res & (16 * v))
      /* tslint:enable:no-bitwise */
    }));
  }

}
