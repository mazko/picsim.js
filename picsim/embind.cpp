/*!
 * PicSim.js
 * http://picsim.js.org/
 * https://github.com/mazko/picsim.js
 *
 * Copyright 2017, Oleg Mazko
 * http://www.opensource.org/licenses/bsd-license.html
 */

#include <emscripten/bind.h>

#include "picsim-0.6/picsim.h"

using namespace emscripten;

/*
  for alias in 'emcc' 'emconfigure' 'emmake' 'emar'; do
    alias $alias="docker run -i -t --rm -v \$(pwd):/home/src 42ua/emsdk $alias"
  done
  unset alias
  PS1="(emsdk)$PS1"
*/

typedef struct {
  unsigned int   pc;
  unsigned char  w;
} PicSimDump;

class PicSim {
public:

  static int get_proc_by_name(std::string str) {
    return getprocbyname(str2chr(str));
  }

  static int get_family_by_name(std::string str) {
    return getfprocbyname(str2chr(str));
  }

  void set_serial(std::string name, int flowcontrol, int ctspin, int rtspin){
    pic_set_serial(&pic, str2chr(name), flowcontrol, ctspin, rtspin);
  }

  int init(char family, int processor, std::string fname, int lrom,float freq){
    return pic_init(&pic, family, processor, fname.c_str(), lrom, freq);
  }

  int reset(int flags){
    return pic_reset(&pic, flags);
  }

  void step(int print){
    pic_step(&pic, print);
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

  int set_apin(unsigned char pin,float value){
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

  int set_pin_DOV(unsigned char pin,unsigned char value){
    return pic_set_pin_DOV(&pic, pin, value);
  }

  const PicSimDump dump() {
    return {.pc=pic.pc, .w=pic.w};
  }

private:

  // http://stackoverflow.com/q/347949/

  static char * str2chr(std::string str){
    std::vector<char> writable(str.begin(), str.end());
    writable.push_back('\0');
    return &writable[0];
  }
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
    constant("PICSIM_P16F628", P16F628);
    constant("PICSIM_P16F877", P16F877);
    constant("PICSIM_P16F628A", P16F628A);
    constant("PICSIM_P16F648A", P16F648A);
    constant("PICSIM_P16F648AICD", P16F648AICD);
    constant("PICSIM_P16F877A", P16F877A);
    constant("PICSIM_P16F777", P16F777);
    constant("PICSIM_P18F452", P18F452);
    constant("PICSIM_P18F4620", P18F4620);
    constant("PICSIM_P18F4550", P18F4550);
    constant("PICSIM_BUFFMAX", BUFFMAX);

    value_object<PicSimDump>("PicSimDump")
      .field("pc", &PicSimDump::pc)
      .field("w", &PicSimDump::w)
      ;

    class_<PicSim>("PicSim")
      .constructor<>()
      .class_function("get_proc_by_name", &PicSim::get_proc_by_name)
      .class_function("get_family_by_name", &PicSim::get_family_by_name)
      .class_function("get_family_by_proc", &getfprocbynumber)
      .function("set_serial", &PicSim::set_serial)
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

      .function("dump", &PicSim::dump)
      ;
}