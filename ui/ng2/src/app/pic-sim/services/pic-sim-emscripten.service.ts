import { Injectable } from '@angular/core';

// https://angular.io/docs/ts/latest/guide/dependency-injection.html#singleton-services

const em = window['pic_sim_module'],
      PicSim = em.PicSim;

type CheckActionType = 'throw' | 'log-all' | 'log-err' | 'none';


@Injectable()
export class PicSimEmscriptenService {

  private _pic_sim;

  private get lazySim() {
    if (!this._pic_sim) {
      // alert(42);
      this._pic_sim = new PicSim();
    }
    return this._pic_sim;
  }

  FS_createDataFile(parent: string, name: string, data: Uint8Array, canRead: boolean) {
    em.FS_createDataFile(parent, name, data, canRead);
  }

  get PIC16F648A(): number {
    // alert([em.PICSIM_P16F648A, PicSim.get_proc_by_name('PIC16F648A')]);
    return em.PICSIM_P16F648A;
  }

  private _checkExitCode(code: number, act: CheckActionType= 'throw') {
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

  init(proc: number, fileName: string, freq: number) {
    const family = PicSim.get_family_by_proc(proc),
          code = this.lazySim.init(family, proc, fileName, 1, freq);
    this._checkExitCode(code);
  }

  reset(flags: number) {
    const code = this.lazySim.reset(flags);
    this._checkExitCode(code);
  }

  step() {
    this.lazySim.step(0);
  }

  end() {
    this.lazySim.end();
  }

  get_pin(pin: number): number {
    return this.lazySim.get_pin(pin);
  }

  set_pin(pin: number, value: boolean, act: CheckActionType= 'none') {
    const code = this.lazySim.set_pin(pin, +value);
    this._checkExitCode(code, act);
  }

  get_pin_dir(pin: number): 'in' | 'out' {
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

}