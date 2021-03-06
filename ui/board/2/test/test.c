/*

  xc8 --chip=18f4620 test.c

*/

#define _XTAL_FREQ 1e6

#include <xc.h>
#include <stdbool.h>
#include <stdint.h>
#include <stdlib.h>
#include <stdio.h>
#include "config_4620.h"

#include "lcd.c"
#include "keyboard.c"
#include "rtc_r.c"


#define DUTY_MAX 100

static void _duty_cycle(
    const unsigned char value,
    unsigned char volatile * const port,
    const char mask) {

  for (unsigned char i = 0; i < DUTY_MAX; i++) {
    *port = i < value ? mask : 0;        
  }
}


int main() {

  // PORTA = PORTC = 0; // bug ?
  PORTA = TRISA = 0; // wow! http://stackoverflow.com/questions/19353686/
  PORTC = TRISC = 0;

  // lcd
  PORTD = TRISD = 0;
  PORTE = 0;
  TRISE = 1;

  lcd_init();

  lcd_cmd (LCD_CURSOR_OFF);

  for (uint8_t i = 10; --i;) {
    rtc_r();
    lcd_cmd(L_CLR);
    lcd_cmd(L_L1);
    lcd_str(rtc_date);
    lcd_cmd(L_L2);
    lcd_str(rtc_time);
  }

lcd_cmd (LCD_CURSOR_ON);

//testa caracter especial
  lcd_cmd(L_CLR);
  lcd_cmd(L_L1);
  lcd_str("   Teste LCD");
  
  for(uint8_t i=0;i<10;i++)
  {
    __delay_ms(200);
    lcd_cmd(0x18);//display shift
  }
  
  for(uint8_t i=0;i<10;i++)
  {
    __delay_ms(200);
    lcd_cmd(0x1C);//display shift
  }
  
  for(uint8_t i=0;i<10;i++)
  {
    __delay_ms(200);
    lcd_cmd(0x10);
  }
  for(uint8_t i=0;i<10;i++)
  {
    __delay_ms(200);
    lcd_cmd(0x14);
  }
  

  lcd_cmd(0x40);//endereço

  lcd_dat(0x11);
  lcd_dat(0x19);
  lcd_dat(0x15);
  lcd_dat(0x13);
  lcd_dat(0x13);
  lcd_dat(0x15);
  lcd_dat(0x19);
  lcd_dat(0x11);

  lcd_dat(0x0E);
  lcd_dat(0x11);
  lcd_dat(0x0E);
  lcd_dat(0x05);
  lcd_dat(0x0E);
  lcd_dat(0x14);
  lcd_dat(0x0A);
  lcd_dat(0x11);


  lcd_cmd(L_L2);

  for(uint8_t i=0;i<16;i++)
  {
    lcd_dat(i%2);
    __delay_ms(100);
  }

//teste lcd
  lcd_cmd(L_CLR);
  lcd_cmd(L_L1);
  lcd_str("   Teste LCD");
  
  for(uint8_t i=32;i>=32;i++)
  {
    if((i%16) == 0)lcd_cmd(L_L2); 
    lcd_dat(i);
    __delay_ms(50);
  }

  __delay_ms(100);
  lcd_cmd(L_CLR);
  lcd_cmd(L_L1);
  lcd_str("   Teste LCD");
  lcd_cmd(L_L2);
  lcd_str("       Ok");
  __delay_ms(500);

// ADC

  lcd_cmd(L_CLR);
  lcd_cmd(L_L1);
  lcd_str("ADC RE0:");
  lcd_cmd(L_L2);

lcd_cmd (LCD_CURSOR_OFF);

  ADCON0bits.CHS3=ADCON0bits.CHS1=0;
  ADCON0bits.CHS2=ADCON0bits.CHS0=1;
  ADCON0bits.ADON=1;

  for (uint16_t i = 333; --i;) {
    ADCON0bits.GO=1;
    while(ADCON0bits.GO == 1);
    char str[10] = {0};
    uint16_t tmp = ((((unsigned int)ADRESH)<<2)|(ADRESL>>6));
    sprintf(&str, "%4d;%3d", tmp, i);
    lcd_cmd(L_L2);
    lcd_str(str);
  }

// keyboard


  lcd_cmd(L_CLR);
  lcd_cmd(L_L1);
  lcd_str("Keyboard:");
  lcd_cmd(L_L2);

  for(uint8_t i=0; i<16; i++)
  {
    uint8_t tmp=scan_keyboard();
    lcd_cmd(L_L2);
    lcd_dat(tmp);
  }

  lcd_cmd(L_CLR);
  lcd_cmd(L_L1);
  lcd_str("Rev. Keyboard:");
  lcd_cmd(L_L2);

  for(uint8_t i=0; i<16; i++)
  {
    uint8_t tmp=scan_keyboard_reverse();
    lcd_cmd(L_L2);
    lcd_dat(tmp);
  }

  lcd_cmd(L_CLR);
  lcd_cmd(L_L1);
  lcd_str("Hey PICSim.js !");
  lcd_cmd(L_L2);
  lcd_str("Life is cool :)");

  while(1)
  {

    unsigned char led;

    led = 1;

    do {
      for (unsigned char i = 0; i < DUTY_MAX; i++) {
        _duty_cycle(i, &PORTA, led);
      }
    } while(led <<= 1);

    led = 1;

    do {
      if (led & 0b1000) {
        led = 0b100000;
      }
      for (unsigned char i = 0; i < DUTY_MAX; i++) {
        _duty_cycle(i, &PORTC, led);
      }
    } while(led <<= 1);

  }

  return 0;
}