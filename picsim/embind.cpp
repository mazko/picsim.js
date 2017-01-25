/*!
 * PicSim.js
 * http://picsim.js.org/
 * https://github.com/mazko/picsim.js
 *
 * Copyright 2017, Oleg Mazko
 * http://www.opensource.org/licenses/bsd-license.html
 */

#include <emscripten/bind.h>

#include "picsim-0.6/src/picsim.h"

using namespace emscripten;


class PicSim {
public:

  int init(int processor, std::string fname, int lrom, float freq){
    // for old picsim versions:
    // return pic_init(&pic, getfprocbynumber(processor), processor, ...
    return pic_init(&pic, processor, fname.c_str(), lrom, freq);
    // picsimlab also does:
    // pic_init(...
    // pic.config[0] |= 0x0800; // disable DEBUG
  }

  int reset(int flags){
    return pic_reset(&pic, flags);
  }

  void step(){
    // pic.print=0;
    pic_step(&pic /*, 0 for old picsim versions */);
  }

  void end(){
    pic_end(&pic);
  }

  unsigned char get_pin(unsigned char pin){
    return pic_get_pin(&pic, pin);
  }

  int set_pin(unsigned char pin, unsigned char value){
    return pic_set_pin(&pic, pin, value);
  }

  int set_apin(unsigned char pin, float value){
    return pic_set_apin(&pic, pin, value);
  }

  unsigned char get_pin_type(unsigned char pin){
    return pic_get_pin_type(&pic, pin);
  }

  unsigned char get_pin_dir(unsigned char pin){
    return pic_get_pin_dir(&pic, pin);
  }

  unsigned char get_pin_DOV(unsigned char pin){
    return pic_get_pin_DOV(&pic, pin);
  }

  int set_pin_DOV(unsigned char pin, unsigned char value){
    return pic_set_pin_DOV(&pic, pin, value);
  }

  // little hack to bypass embind 200ns bottleneck (1MHz->250000->50ms)
  // https://kripken.github.io/emscripten-site/docs/porting/connecting_cpp_and_javascript/embind.html#performance

  unsigned char em_hack_step_and_get(unsigned char pin1, unsigned char pin2, unsigned char pin3, unsigned char pin4) {
    unsigned char result = 0,
                  pins[4] = { pin1, pin2, pin3, pin4 };

    this->step();

    for (unsigned char i = 0; i < sizeof pins / sizeof pins[0]; i++) {
      const unsigned char pin = pins[i];
      if (pin > 0) {
        if (this->get_pin_dir(pin) == PD_OUT) {
          if (this->get_pin(pin)) {
            result |= ((1 << sizeof pins) << i);
          }
        } else {
          result |= (1 << i);
        }
      }
    }

    return result;
  }

private:
  _pic pic;
};

EMSCRIPTEN_BINDINGS(picsim) {

    constant("PICSIM_PD_OUT", PD_OUT);
    constant("PICSIM_PD_IN", PD_IN);
    constant("PICSIM_PT_CMOS", PT_CMOS);
    constant("PICSIM_PT_TTL", PT_TTL);
    constant("PICSIM_PT_ANALOG", PT_ANALOG);
    constant("PICSIM_P16", P16);
    constant("PICSIM_P18", P18);
    constant("PICSIM_P16F84A", P16F84A);
    constant("PICSIM_P16F628A", P16F628A);
    constant("PICSIM_P16F648A", P16F648A);
    constant("PICSIM_P16F777", P16F777);
    constant("PICSIM_P16F877A", P16F877A);
    constant("PICSIM_P18F452", P18F452);
    constant("PICSIM_P18F4520", P18F4520);
    constant("PICSIM_P18F4550", P18F4550);
    constant("PICSIM_P18F45K50", P18F45K50);
    constant("PICSIM_P18F4620", P18F4620);

    class_<PicSim>("PicSim")
      .constructor<>()
      .function("init", &PicSim::init)
      .function("reset", &PicSim::reset)
      .function("step", &PicSim::step)
      .function("end", &PicSim::end)

      .function("get_pin", &PicSim::get_pin)
      .function("set_pin", &PicSim::set_pin)
      .function("set_apin", &PicSim::set_apin)
      .function("get_pin_type", &PicSim::get_pin_type)
      .function("get_pin_dir", &PicSim::get_pin_dir)
      .function("get_pin_DOV", &PicSim::get_pin_DOV)
      .function("set_pin_DOV", &PicSim::set_pin_DOV)

      .function("em_hack_step_and_get", &PicSim::em_hack_step_and_get)
      ;
}