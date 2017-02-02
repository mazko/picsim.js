#include <stdio.h>
#include <assert.h>

#define PD_OUT 0

unsigned char get_pin(unsigned char pin){
  //printf("pin %d!\n", pin);
  return !(pin % 5);
}

unsigned char get_pin_dir(unsigned char pin){
  //printf("dir %d!\n", pin);
  return !(pin % 3);
}

unsigned char em_hack_step_and_get(unsigned char pin1, unsigned char pin2, unsigned char pin3, unsigned char pin4) {
  unsigned char result = 0,
                pins[4] = { pin1, pin2, pin3, pin4 };

  //this->step();

  for (unsigned char i = 0; i < (sizeof pins / sizeof pins[0]); i++) {
    const unsigned char pin = pins[i];
    if (pin > 0) {
      if (/*this->*/get_pin_dir(pin) == PD_OUT) {
        if (/*this->*/get_pin(pin)) {
          result |= ((1 << (sizeof pins / sizeof pins[0])) << i);
        }
      } else {
        result |= (1 << i);
      }
    }
  }

  return result;
}

int main() {
    //printf("%d\n",em_hack_step_and_get(1,3,4,222));

    assert(em_hack_step_and_get(0,0,0,0) == 0);
    assert(em_hack_step_and_get(1,2,4,7) == 0b0000000);
    assert(em_hack_step_and_get(1,2,3,4) == 0b0000100);

    assert(em_hack_step_and_get(3,6,9,12) == 0b0001111);
    assert(em_hack_step_and_get(1,6,9,12) == 0b0001110);
    assert(em_hack_step_and_get(3,1,9,12) == 0b0001101);
    assert(em_hack_step_and_get(3,6,1,12) == 0b0001011);
    assert(em_hack_step_and_get(3,6,9,1) == 0b0000111);
    assert(em_hack_step_and_get(3,1,9,1) == 0b0000101);
    assert(em_hack_step_and_get(3,1,1,1) == 0b0000001);

    assert(em_hack_step_and_get(5,10,20,25) == 0b11110000);
    assert(em_hack_step_and_get(1,10,20,25) == 0b11100000);
    assert(em_hack_step_and_get(5,1,20,25) == 0b11010000);
    assert(em_hack_step_and_get(5,10,1,25) == 0b10110000);
    assert(em_hack_step_and_get(5,10,20,1) == 0b01110000);
    assert(em_hack_step_and_get(5,1,20,1) == 0b01010000);
    assert(em_hack_step_and_get(1,1,1,5) == 0b10000000);

    assert(em_hack_step_and_get(3*5,6*5,9*5,12*5) == 0b0001111);

    printf("OK\n");

    return 0;
}

