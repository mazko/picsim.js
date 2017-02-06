/* tslint:disable:no-bitwise */

class DS1307Model {
  readonly data: number[] = [
    ...Array<number>(16).fill(0xFF),
    ...Array<number>(64 - 16).fill(0)
  ];
  addr = 0;

  datab = 0;
  datas = 0;

  ctrl = 0;

  sclo = 0;
  sdao = 0;

  ret = false;

  bit = 0;
  byte = 0;

  readonly dtime2 = {
    tm_sec: 0,
    tm_min: 0,
    tm_hour: 0,
    tm_wday: 0,
    tm_mday: 0,
    tm_mon: 0,
    tm_year: 0
  };

  constructor() {
    this.jsDate = new Date();
  }

  set jsDate(jsDate: Date) {
    const dtime2 = this.dtime2;

    dtime2.tm_sec = jsDate.getSeconds(); /* 0-59 */
    dtime2.tm_min = jsDate.getMinutes(); /* 0-59 */
    dtime2.tm_hour = jsDate.getHours();  /* 0-23 */
    dtime2.tm_wday = jsDate.getDay();    /* 0-6  */
    dtime2.tm_mday = jsDate.getDate();   /* 1-31 */
    dtime2.tm_mon = jsDate.getMonth();   /* 0-11 */
    dtime2.tm_year = jsDate.getFullYear() - 1900;

    this.data[0] = ((dtime2.tm_sec / 10) << 4) | (dtime2.tm_sec % 10);
    this.data[1] = ((dtime2.tm_min / 10) << 4) | (dtime2.tm_min % 10);
    this.data[2] = ((dtime2.tm_hour / 10) << 4) | (dtime2.tm_hour % 10);
    this.data[3] = dtime2.tm_wday;
    this.data[4] = ((dtime2.tm_mday / 10) << 4) | (dtime2.tm_mday % 10);
    this.data[5] = (((dtime2.tm_mon + 1) / 10) << 4) | ((dtime2.tm_mon + 1) % 10);
    this.data[6] = (((dtime2.tm_year % 100) / 10) << 4) | (dtime2.tm_year % 10);
  }
}

export class DS1307 {
  private readonly _model = new DS1307Model();
  private _rtcc2 = 0;

  constructor() {
    this.rst();
  }

  rst(): void {
    const rtc = this._model;

    rtc.sclo = 1;
    rtc.bit = 0xFF;
    rtc.byte = 0xFF;
    rtc.datab = 0;
    rtc.ctrl = 0;
    rtc.ret = false;
  }

  update(): void {
    const rtc = this._model,
          dtime2 = this._model.dtime2;

    this._rtcc2++;

    if (this._rtcc2 >= 10) /* each second */ {
      this._rtcc2 = 0;
      if ((rtc.data[0] & 0x80) === 0) /* CH bit (clock halt) */ {

        // https://developer.mozilla.org/ru/docs/Web/JavaScript/Reference/Global_Objects/Date

        rtc.jsDate = new Date(
          dtime2.tm_year + 1900, dtime2.tm_mon, dtime2.tm_mday,
          dtime2.tm_hour, dtime2.tm_min, dtime2.tm_sec + 1);
      }
    }
  }

  io(scl: number, sda: number): boolean {
    const rtc = this._model,
          dtime2 = this._model.dtime2;

    if ((rtc.sdao === 1) && (sda === 0) && (scl === 1) && (rtc.sclo === 1)) { // start
      rtc.bit = 0;
      rtc.byte = 0;
      rtc.datab = 0;
      rtc.ctrl = 0;
      rtc.ret = false;
      // printf("rtc start!\n");
    }

    if ((rtc.sdao === 0) && (sda === 1) && (scl === 1) && (rtc.sclo === 1)) { // stop
      rtc.bit = 0xFF;
      rtc.byte = 0xFF;
      rtc.ctrl = 0;
      rtc.ret = false;
      // printf("rtc stop!\n");
    }

    if ((rtc.bit < 9) && (rtc.sclo === 0) && (scl === 1)) { // data
      if (rtc.bit < 8) {
        rtc.datab |= (sda << (7 - rtc.bit));
      }

      rtc.bit++;
    }

    if ((rtc.bit < 9) && (rtc.sclo === 1) && (scl === 0 ) && (rtc.ctrl === 0x0D1)) { // data
      if (rtc.bit < 8) {
       rtc.ret = ((rtc.datas & (1 << (7 - rtc.bit))) > 0);
       //// printf("send %i %i (%02X)\n",rtc->bit,rtc->ret,rtc->datas);
      } else {
       rtc.ret = false;
      }
    }

    if (rtc.bit === 9) {
       // printf("rtc data %02X\n",rtc->datab);
       if (rtc.byte === 0) {
         rtc.ctrl = rtc.datab;
         // printf("rtc ctrl = %02X\n",rtc->ctrl);
         rtc.ret = false;
         if ((rtc.ctrl & 0x01) === 0x00) {
             rtc.addr = ((rtc.ctrl & 0x0E) << 7);
         }
       }

       if ((rtc.ctrl) === 0xD0) {
          if (rtc.byte === 1) {
            rtc.addr = rtc.datab;
          }

          if (((rtc.byte > 1) && (rtc.ctrl & 0x01) === 0)) {
            // printf("write rtc[%04X]=%02X\n",rtc->addr,rtc->datab);
            rtc.data[rtc.addr] = rtc.datab;

            switch (rtc.addr) {
              case 0:
                 dtime2.tm_sec = (((rtc.datab & 0xF0) >> 4) * 10) + (rtc.datab & 0x0F);
                 break;
              case 1:
                 dtime2.tm_min = (((rtc.datab & 0xF0) >> 4) * 10) + (rtc.datab & 0x0F);
                 break;
              case 2:
                 dtime2.tm_hour = (((rtc.datab & 0xF0) >> 4) * 10) + (rtc.datab & 0x0F);
                 break;
              case 4:
                 dtime2.tm_mday = (((rtc.datab & 0xF0) >> 4) * 10) + (rtc.datab & 0x0F);
                 break;
              case 3:
                 dtime2.tm_wday = (((rtc.datab & 0xF0) >> 4) * 10) + (rtc.datab & 0x0F);
                 break;
              case 5:
                 dtime2.tm_mon = (((rtc.datab & 0xF0) >> 4) * 10) + (rtc.datab & 0x0F);
                 break;
              case 6:
                 dtime2.tm_year = (dtime2.tm_year & 0xFF00) | ((((rtc.datab & 0xF0) >> 4) * 10) + (rtc.datab & 0x0F));
                 break;
             default:
                break;
            }

            rtc.addr++;
            rtc.ret = false;
          }
       } else if (rtc.ctrl === 0xD1) { // read
         if (rtc.byte < 16) {
           rtc.datas = rtc.data[rtc.addr];
           // printf("read rtc[%04X]=%02X\n",rtc->addr,rtc->datas);
           rtc.addr++;
         } else {
           rtc.ctrl = 0xFF;
         }
       }

       rtc.bit = 0;
       rtc.datab = 0;
       rtc.byte++;
    }

    rtc.sdao = sda;
    rtc.sclo = scl;

    return rtc.ret;
  }

}
