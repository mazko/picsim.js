const PicSimModule = require('./picsim.js'),
      PicSim = PicSimModule.PicSim,
      assert = require('assert'),
      fs = require('fs');

assert.deepStrictEqual(PicSimModule.PICSIM_P18, 2);

const proc = PicSim.get_proc_by_name('PIC16F628A');
assert.deepStrictEqual(proc, 0x1060);
const family = PicSim.get_family_by_name('PIC16F628A');
assert.deepStrictEqual(family, 1);
assert.deepStrictEqual(PicSim.get_family_by_proc(proc), 1);

PicSimModule.FS_createDataFile('.','blink.hex', fs.readFileSync('./blink.hex'), true);
const sim = new PicSim();
sim.init(family,proc,'./blink.hex',1,1000000);
assert.deepStrictEqual(sim.dump(), { pc: 0, w: 0 });
[[1,0],[0x07FE,0],[0x07FF,0],[0,0],[0x07DA,0],[0x07DB,0],[0x07DC,0]].map(v => {
  sim.step(0);
  assert.deepStrictEqual(sim.dump(), { pc: v[0], w: v[1] });
});
sim.reset(0);
assert.deepStrictEqual(sim.dump(), { pc: 0, w: 0 });

const TIMER=0.1, NSTEP=TIMER*1000000/4;
var last_pin = null;

function precT(cb, interval){
  var expected = Date.now() + interval;
  setTimeout(step, interval);
  function step() {
    var dt = Date.now() - expected;
    if (dt > 10*interval) {
      console.log('dt > 10*interval, reset timer!');
      expected = Date.now();
    } else if (dt > interval) {
      console.log('dt > interval, not real time');
    }
    cb();
    expected += interval;
    setTimeout(step, Math.max(0, interval - dt));
  }
}
precT(() => {
  for(var i=0; i<NSTEP; i++) {
    sim.step(0);
  }
  // const pins = sim.get_pins();
  // console.log(Object.keys(Object.getPrototypeOf(pins)));
  // for (var i = 0; i < pins.size(); i++){
  //   console.log(pins.get(i));
  // }
  var new_pin = sim.get_pin(6);
  if (new_pin !== last_pin){
    console.log(new_pin);
    last_pin = new_pin;
  }
}, TIMER*1000);

sim.end();


/*
echo '
#include <xc.h>
#define _XTAL_FREQ 1000000

#pragma config WDTE = OFF

int main() {
  TRISB0 = 0; //RB0 as Output PIN

  while(1)
  {
    RB0 = 1;
    __delay_ms(1000);
    RB0 = 0;
    __delay_ms(1000);
  }

  return 0;
}' > blink.c

xc8 --chip=16f628A blink.c

*/