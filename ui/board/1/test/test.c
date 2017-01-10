/*

  xc8 --chip=16f628A test.c

*/

#include <xc.h>
#include <stdbool.h>
#define _XTAL_FREQ 1000000

#pragma config WDTE = OFF

static volatile bool animate;

// software pwm
// http://microchip.wikidot.com/faq:26
// The delay amount must be a constant (cannot be a variable).

static void _duty_cycle(
    const unsigned char value,
    unsigned char volatile * const port,
    const char mask) {

  unsigned char i = 0;
  if (animate) *port = mask;
  while (++i <= value) {
    __delay_us(1);
  }
  if (animate) *port = 0;
  while (i++ < 0xFF) {
    __delay_us(1);
  }
}

static unsigned char display7s(unsigned char v)
{
  switch(v)
  {
    case 0:
      return 0xEE;
    case 1:
      return 0x28;
    case 2:
      return 0xCD;
    case 3:
      return 0x6D;
    case 4:
      return 0x2B;
    case 5:
      return 0x67;
    case 6:
      return 0xE7;
    case 7:
      return 0x2C;
    case 8:
      return 0xEF;
    case 9:
      return 0x6F;
    case 10:
      return 0xAF;
    case 11:
      return 0xE3;
    case 12:
      return 0xC6;
    case 13:
      return 0xE9;
    case 14:
      return 0xC7;
    case 15:
      return 0x87;
    default:
      return 0;
  }
}


int main() {

  PORTB = PORTA = 0;
  TRISB = 0; // RB0 as Output PIN

  OPTION_REGbits.T0CS = 0;     // Timer increments on instruction clock
  INTCONbits.T0IE = 1;         // Enable interrupt on TMR0 overflow
  OPTION_REGbits.INTEDG = 0;   // falling edge trigger the interrupt
  INTCONbits.INTE = 1;         // enable the external interrupt
  INTCONbits.GIE = 1;          // Global interrupt enable

  while(1)
  {

    unsigned char led = 1;

    do {
      for (unsigned char i = 0; i < 0xFF; i++) {
        _duty_cycle(i, &PORTB, led);
      }
    } while(led <<= 1);

    led = 0b1000;

    if (animate) {
      TRISA = 0;

      do {
        for (unsigned char i = 0; i < 0xFF; i++) {
          _duty_cycle(i, &PORTA, led);
        }
      } while(led >>= 1);

      TRISA = 0b11110;
    }
  }

  return 0;
}

// http://microchip.wikidot.com/faq:31

void interrupt tc_int(void) // interrupt function 
{
  if(INTCONbits.T0IF && INTCONbits.T0IE) 
  {                           // if timer flag is set & interrupt enabled
    TMR0 -= 250;              // reload the timer - 250uS per interrupt
    INTCONbits.T0IF = 0;      // clear the interrupt flag 
    
    if (TRISA) {
      animate = false;
      if (!RA1) {
        PORTB = display7s(2) | 0b10000;
      } else if (!RA2) {
        PORTB = display7s(4) | 0b10000;
      } else if (!RA3) {
        PORTB = display7s(2);
      } else if (!RA4) {
        PORTB = display7s(4);
      } else {
        animate = true;
      }
    }
  }
}