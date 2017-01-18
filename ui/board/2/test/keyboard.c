
#include <xc.h>


unsigned char scan_keyboard()
{
  unsigned char i;
  unsigned char ret=0;
  unsigned char tmp=PORTB;

  const unsigned char linha[4]= {0x01,0x02,0x04,0x08};

  #define TC1 PORTBbits.RB7
  #define TC2 PORTBbits.RB6
  #define TC3 PORTBbits.RB5
  #define TC4 PORTBbits.RB4

  char key_code[4][4]={
    {'1','2','3','+'},
    {'4','5','6','-'},
    {'7','8','9','/'},
    {'*','0','#','$'}};

  ADCON1 = 0b111;
  TRISB = 0xF0;
  PORTB = 0;

  while(!ret)  
  {
    for(i=0;i<4;i++)
    {
      PORTB|=~linha[i];
      if(!TC1){__delay_ms(5);if(!TC1){while(!TC1);ret= key_code[i][0];break;}};
      if(!TC2){__delay_ms(5);if(!TC2){while(!TC2);ret= key_code[i][1];break;}};
      if(!TC3){__delay_ms(5);if(!TC3){while(!TC3);ret= key_code[i][2];break;}};
      if(!TC4){__delay_ms(5);if(!TC4){while(!TC4);ret= key_code[i][3];break;}};
      PORTB &=linha[i];
    }
  }
  
  PORTB=tmp;
  return ret;
}


unsigned char scan_keyboard_reverse()
{
  unsigned int to=0;
  unsigned char i;
  unsigned char ret=0;
  unsigned char tmp=PORTB;

  const unsigned char linha[4]= {0x80, 0x40, 0x20, 0x10};

  #undef TC1
  #undef TC2
  #undef TC3
  #undef TC4

  #define TC4 PORTBbits.RB3
  #define TC3 PORTBbits.RB2
  #define TC2 PORTBbits.RB1
  #define TC1 PORTBbits.RB0

  char key_code[4][4]={
    {'1','2','3','+'},
    {'4','5','6','-'},
    {'7','8','9','/'},
    {'*','0','#','$'}};

  ADCON1 = 0b111;
  TRISB = 0xF;
  PORTB = 0;

  while(!ret)  
  {
    for(i=0;i<4;i++)
    {
      PORTB|=~linha[i];
      if(!TC1){__delay_ms(5);if(!TC1){while(!TC1);ret= key_code[0][i];break;}};
      if(!TC2){__delay_ms(5);if(!TC2){while(!TC2);ret= key_code[1][i];break;}};
      if(!TC3){__delay_ms(5);if(!TC3){while(!TC3);ret= key_code[2][i];break;}};
      if(!TC4){__delay_ms(5);if(!TC4){while(!TC4);ret= key_code[3][i];break;}};
      PORTB &=linha[i];
    }
  }
  
  PORTB=tmp;
  return ret;
}

