
#define ICLK PORTCbits.RC3
#define IDAT PORTCbits.RC4
#define TIDAT TRISCbits.TRISC4

#define I2C_DELAY 10

void i2c_init(void)
{
  TIDAT=0;
  ICLK=1;
  IDAT=1;
}

void i2c_start(void)
{
  ICLK=1;
  IDAT=1;
  __delay_ms(I2C_DELAY);
  IDAT=0;
  __delay_ms(I2C_DELAY);
}

void i2c_stop(void)
{
  ICLK=1;
  IDAT=0;
  __delay_ms(I2C_DELAY);
  IDAT=1;
  __delay_ms(I2C_DELAY);
}

void i2c_wb(unsigned char val)
{
  unsigned char i;
  ICLK=0;
  for(i=0;i<8;i++)
  {
    IDAT=((val>>(7-i))& 0x01);
    ICLK=1;
    __delay_ms(I2C_DELAY);
    ICLK=0;
  } 
  IDAT=1;
  __delay_ms(I2C_DELAY);
  ICLK=1;
  __delay_ms(I2C_DELAY);
  ICLK=0;
}

unsigned char i2c_rb(unsigned char ack)
{
  char i;
  unsigned char ret=0;

  ICLK=0;
  TIDAT=1;
  IDAT=1;
  for(i=0;i<8;i++)
  {
    ICLK=1;
    __delay_ms(I2C_DELAY);
    ret|=(IDAT<<(7-i));
    ICLK=0;
  }
  TIDAT=0;
  if(ack)
    IDAT=0;
  else
  IDAT=1;
  __delay_ms(I2C_DELAY);
  ICLK=1;
  __delay_ms(I2C_DELAY);
  ICLK=0;

  return ret;
}

char rtc_date[10];
char rtc_time[10];


unsigned char getd(unsigned char nn)
{
 return ((nn & 0xF0)>>4)+0x30;
}

unsigned char getu(unsigned char nn)
{
  return (nn  & 0x0F)+0x30;
}

//--------------------- Reads rtc_time and rtc_date information from RTC (PCF8563)
void rtc_r(void) 
{
  unsigned char tmp;

  i2c_start();
  i2c_wb(0xD0);
  i2c_wb(0);

  i2c_start();
  i2c_wb(0xD1);
  tmp= 0x7F & i2c_rb(1); //segundos
  rtc_time[5]=':';
  rtc_time[6]=getd(tmp);
  rtc_time[7]=getu(tmp);
  rtc_time[8]=0;

  tmp= 0x7F & i2c_rb(1); //minutos
  rtc_time[2]=':';
  rtc_time[3]=getd(tmp);
  rtc_time[4]=getu(tmp);

  tmp= 0x3F & i2c_rb(1); //horas
  rtc_time[0]=getd(tmp);
  rtc_time[1]=getu(tmp);

  i2c_rb(1); //dia semana

  tmp= 0x3F & i2c_rb(1); //dia
  rtc_date[0]=getd(tmp);
  rtc_date[1]=getu(tmp);


  tmp= 0x1F & i2c_rb(1); //mes
  rtc_date[2]='/'; 
  rtc_date[3]=getd(tmp);
  rtc_date[4]=getu(tmp);

  tmp=  i2c_rb(0); //ano
  rtc_date[5]='/';
  rtc_date[6]=getd(tmp);
  rtc_date[7]=getu(tmp);
  rtc_date[8]=0;

  i2c_stop();

}

