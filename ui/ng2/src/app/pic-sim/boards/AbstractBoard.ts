import { OnDestroy, Injectable } from '@angular/core';
import { PicSimEmscriptenService } from '../services/pic-sim-emscripten.service';
import { ControllerService } from '../services/controller.service';
import { StateService } from '../services/state.service';
import { Subscription } from 'rxjs/Subscription';
import { ui_catcher } from './decorators';


enum SimStateEnum {
  READY,
  RUNNING,
  STOPPING
}

/*
  That decorator makes it possible for Angular
  to identify the types of its dependencies - ControllerService etc.
  The PicSimComponent class had two dependencies
  as well but no @Injectable(). It didn't need
  @Injectable() because that component class has
  the @Component decorator. In Angular with TypeScript,
  a single decorator — any decorator — is sufficient
  to identify dependency types.
*/

@Injectable()
export abstract class AbstractBoard implements OnDestroy {

  private _simSatate = SimStateEnum.READY;

  protected readonly _subscriptions: Subscription[] = [];

  constructor(
      protected readonly _picSim: PicSimEmscriptenService,
      protected readonly _state: StateService,
      readonly _controller: ControllerService) {

    this._subscriptions.push(_controller
      .simulationStarted$
      .subscribe(this.start.bind(this))
    );

    this._subscriptions.push(_controller
      .simulationStopped$
      .subscribe(this.stop.bind(this))
    );
  }

  ngOnDestroy(): void {
    this.stop();
    // prevent memory leak when component destroyed
    for (const sub of this._subscriptions) {
      sub.unsubscribe();
    }
  }

  @ui_catcher
  private stop(): void {
    if (this._simSatate === SimStateEnum.RUNNING) {
      this._simSatate = SimStateEnum.STOPPING;
    }
  }

  protected abstract _do_steps(steps: number): void;

  private _prec_timer(cb: () => void, interval: number): void {
    let expected = Date.now(),
        health_cache = null;
    const UNADJUSTABLE_INTERVAL = 10 * interval;
    const next = (): void => {
      if (this._simSatate === SimStateEnum.STOPPING) {
        this._simSatate = SimStateEnum.READY;
        this._state.isRunning = false;
        this._picSim.end();
      } else {
        const dt = Date.now() - expected;
        if (dt > UNADJUSTABLE_INTERVAL) {
          console.log('dt is unadjustable, reset timer!');
          expected = Date.now();
        } else if (dt > interval) {
          console.log('dt > interval, not real time');
        }
        // DEBUG: should happen only once after UNADJUSTABLE
        // if (dt < 0) {
        //   console.log('dt < 0 ???');
        // }
        if (health_cache !== (dt > interval)) {
          this._controller.healthChanged({dt, interval});
          health_cache = (dt > interval);
        }
        cb();
        expected += interval;
        setTimeout(next, Math.max(0, interval - dt));
      }
    };
    // start
    next();
  }

  @ui_catcher
  private start(): void {

    if (this._simSatate === SimStateEnum.READY) {

      this._picSim.init(
        this._state.chip,
        this._state.HEX_FILE_NAME,
        this._state.freq);

      const TIMER = 0.1, NSTEP = TIMER * this._state.freq / 4;

      if (NSTEP % 1) {
        throw new Error('NSTEP has Fractional part ?');
      }

      this._prec_timer((): void  => {
        this._do_steps(NSTEP);
      }, TIMER * 1000);

      this._simSatate = SimStateEnum.RUNNING;
      this._state.isRunning = true;
    } else {
      throw new Error('Skip start. Not ready.');
    }
  }

}
