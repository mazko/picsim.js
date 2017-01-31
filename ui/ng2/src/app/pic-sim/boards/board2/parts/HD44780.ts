// http://awk.js.org/?gist=b0864f8f8085f861f3daed3939d742a3

const LCDfont: number[][] = [
  [0x00, 0x00, 0x00, 0x00, 0x00],
  [0x00, 0x00, 0x5F, 0x00, 0x00],
  [0x00, 0x07, 0x00, 0x07, 0x00],
  [0x14, 0x7F, 0x14, 0x7F, 0x14],
  [0x24, 0x2A, 0x7F, 0x2A, 0x12],
  [0x23, 0x13, 0x08, 0x64, 0x62],
  [0x36, 0x49, 0x55, 0x22, 0x50],
  [0x00, 0x05, 0x03, 0x00, 0x00],
  [0x00, 0x1C, 0x22, 0x41, 0x00],
  [0x00, 0x41, 0x22, 0x1C, 0x00],
  [0x08, 0x2A, 0x1C, 0x2A, 0x08],
  [0x08, 0x08, 0x3E, 0x08, 0x08],
  [0x00, 0x50, 0x30, 0x00, 0x00],
  [0x08, 0x08, 0x08, 0x08, 0x08],
  [0x00, 0x30, 0x30, 0x00, 0x00],
  [0x20, 0x10, 0x08, 0x04, 0x02],
  [0x3E, 0x51, 0x49, 0x45, 0x3E],
  [0x00, 0x42, 0x7F, 0x40, 0x00],
  [0x42, 0x61, 0x51, 0x49, 0x46],
  [0x21, 0x41, 0x45, 0x4B, 0x31],
  [0x18, 0x14, 0x12, 0x7F, 0x10],
  [0x27, 0x45, 0x45, 0x45, 0x39],
  [0x3C, 0x4A, 0x49, 0x49, 0x30],
  [0x01, 0x71, 0x09, 0x05, 0x03],
  [0x36, 0x49, 0x49, 0x49, 0x36],
  [0x06, 0x49, 0x49, 0x29, 0x1E],
  [0x00, 0x36, 0x36, 0x00, 0x00],
  [0x00, 0x56, 0x36, 0x00, 0x00],
  [0x00, 0x08, 0x14, 0x22, 0x41],
  [0x14, 0x14, 0x14, 0x14, 0x14],
  [0x41, 0x22, 0x14, 0x08, 0x00],
  [0x02, 0x01, 0x51, 0x09, 0x06],
  [0x32, 0x49, 0x79, 0x41, 0x3E],
  [0x7E, 0x11, 0x11, 0x11, 0x7E],
  [0x7F, 0x49, 0x49, 0x49, 0x36],
  [0x3E, 0x41, 0x41, 0x41, 0x22],
  [0x7F, 0x41, 0x41, 0x22, 0x1C],
  [0x7F, 0x49, 0x49, 0x49, 0x41],
  [0x7F, 0x09, 0x09, 0x01, 0x01],
  [0x3E, 0x41, 0x41, 0x51, 0x32],
  [0x7F, 0x08, 0x08, 0x08, 0x7F],
  [0x00, 0x41, 0x7F, 0x41, 0x00],
  [0x20, 0x40, 0x41, 0x3F, 0x01],
  [0x7F, 0x08, 0x14, 0x22, 0x41],
  [0x7F, 0x40, 0x40, 0x40, 0x40],
  [0x7F, 0x02, 0x04, 0x02, 0x7F],
  [0x7F, 0x04, 0x08, 0x10, 0x7F],
  [0x3E, 0x41, 0x41, 0x41, 0x3E],
  [0x7F, 0x09, 0x09, 0x09, 0x06],
  [0x3E, 0x41, 0x51, 0x21, 0x5E],
  [0x7F, 0x09, 0x19, 0x29, 0x46],
  [0x46, 0x49, 0x49, 0x49, 0x31],
  [0x01, 0x01, 0x7F, 0x01, 0x01],
  [0x3F, 0x40, 0x40, 0x40, 0x3F],
  [0x1F, 0x20, 0x40, 0x20, 0x1F],
  [0x7F, 0x20, 0x18, 0x20, 0x7F],
  [0x63, 0x14, 0x08, 0x14, 0x63],
  [0x03, 0x04, 0x78, 0x04, 0x03],
  [0x61, 0x51, 0x49, 0x45, 0x43],
  [0x00, 0x00, 0x7F, 0x41, 0x41],
  [0x15, 0x16, 0x7C, 0x16, 0x15],
  [0x41, 0x41, 0x7F, 0x00, 0x00],
  [0x04, 0x02, 0x01, 0x02, 0x04],
  [0x40, 0x40, 0x40, 0x40, 0x40],
  [0x00, 0x01, 0x02, 0x04, 0x00],
  [0x20, 0x54, 0x54, 0x54, 0x78],
  [0x7F, 0x48, 0x44, 0x44, 0x38],
  [0x38, 0x44, 0x44, 0x44, 0x20],
  [0x38, 0x44, 0x44, 0x48, 0x7F],
  [0x38, 0x54, 0x54, 0x54, 0x18],
  [0x08, 0x7E, 0x09, 0x01, 0x02],
  [0x08, 0x14, 0x54, 0x54, 0x3C],
  [0x7F, 0x08, 0x04, 0x04, 0x78],
  [0x00, 0x44, 0x7D, 0x40, 0x00],
  [0x20, 0x40, 0x44, 0x3D, 0x00],
  [0x00, 0x7F, 0x10, 0x28, 0x44],
  [0x00, 0x41, 0x7F, 0x40, 0x00],
  [0x7C, 0x04, 0x18, 0x04, 0x78],
  [0x7C, 0x08, 0x04, 0x04, 0x78],
  [0x38, 0x44, 0x44, 0x44, 0x38],
  [0x7C, 0x14, 0x14, 0x14, 0x08],
  [0x08, 0x14, 0x14, 0x18, 0x7C],
  [0x7C, 0x08, 0x04, 0x04, 0x08],
  [0x48, 0x54, 0x54, 0x54, 0x20],
  [0x04, 0x3F, 0x44, 0x40, 0x20],
  [0x3C, 0x40, 0x40, 0x20, 0x7C],
  [0x1C, 0x20, 0x40, 0x20, 0x1C],
  [0x3C, 0x40, 0x30, 0x40, 0x3C],
  [0x44, 0x28, 0x10, 0x28, 0x44],
  [0x0C, 0x50, 0x50, 0x50, 0x3C],
  [0x44, 0x64, 0x54, 0x4C, 0x44],
  [0x00, 0x08, 0x36, 0x41, 0x00],
  [0x00, 0x00, 0x7F, 0x00, 0x00],
  [0x00, 0x41, 0x36, 0x08, 0x00],
  [0x08, 0x08, 0x2A, 0x1C, 0x08],
  [0x08, 0x1C, 0x2A, 0x08, 0x08],
  [0x00, 0x00, 0x00, 0x00, 0x00],
  [0x00, 0x00, 0x00, 0x00, 0x00],
  [0x00, 0x00, 0x00, 0x00, 0x00],
  [0x00, 0x00, 0x00, 0x00, 0x00],
  [0x00, 0x00, 0x00, 0x00, 0x00],
  [0x00, 0x00, 0x00, 0x00, 0x00],
  [0x00, 0x00, 0x00, 0x00, 0x00],
  [0x00, 0x00, 0x00, 0x00, 0x00],
  [0x00, 0x00, 0x00, 0x00, 0x00],
  [0x00, 0x00, 0x00, 0x00, 0x00],
  [0x00, 0x00, 0x00, 0x00, 0x00],
  [0x00, 0x00, 0x00, 0x00, 0x00],
  [0x00, 0x00, 0x00, 0x00, 0x00],
  [0x00, 0x00, 0x00, 0x00, 0x00],
  [0x00, 0x00, 0x00, 0x00, 0x00],
  [0x00, 0x00, 0x00, 0x00, 0x00],
  [0x00, 0x00, 0x00, 0x00, 0x00],
  [0x00, 0x00, 0x00, 0x00, 0x00],
  [0x00, 0x00, 0x00, 0x00, 0x00],
  [0x00, 0x00, 0x00, 0x00, 0x00],
  [0x00, 0x00, 0x00, 0x00, 0x00],
  [0x00, 0x00, 0x00, 0x00, 0x00],
  [0x00, 0x00, 0x00, 0x00, 0x00],
  [0x00, 0x00, 0x00, 0x00, 0x00],
  [0x00, 0x00, 0x00, 0x00, 0x00],
  [0x00, 0x00, 0x00, 0x00, 0x00],
  [0x00, 0x00, 0x00, 0x00, 0x00],
  [0x00, 0x00, 0x00, 0x00, 0x00],
  [0x00, 0x00, 0x00, 0x00, 0x00],
  [0x00, 0x00, 0x00, 0x00, 0x00],
  [0x00, 0x00, 0x00, 0x00, 0x00],
  [0x00, 0x00, 0x00, 0x00, 0x00],
  [0x00, 0x00, 0x00, 0x00, 0x00],
  [0x70, 0x50, 0x70, 0x00, 0x00],
  [0x00, 0x00, 0x0F, 0x01, 0x01],
  [0x40, 0x40, 0x78, 0x00, 0x00],
  [0x10, 0x20, 0x40, 0x00, 0x00],
  [0x00, 0x18, 0x18, 0x00, 0x00],
  [0x0A, 0x0A, 0x4A, 0x2A, 0x1E],
  [0x04, 0x44, 0x34, 0x14, 0x0C],
  [0x20, 0x10, 0x78, 0x04, 0x00],
  [0x18, 0x08, 0x4C, 0x48, 0x38],
  [0x48, 0x48, 0x78, 0x48, 0x48],
  [0x48, 0x28, 0x18, 0x7C, 0x08],
  [0x08, 0x7C, 0x08, 0x28, 0x18],
  [0x40, 0x48, 0x48, 0x78, 0x40],
  [0x54, 0x54, 0x54, 0x7C, 0x00],
  [0x1C, 0x00, 0x5C, 0x40, 0x3C],
  [0x08, 0x08, 0x08, 0x08, 0x08],
  [0x01, 0x41, 0x3D, 0x09, 0x07],
  [0x10, 0x08, 0x7C, 0x02, 0x01],
  [0x0E, 0x02, 0x43, 0x22, 0x1E],
  [0x42, 0x42, 0x7E, 0x42, 0x42],
  [0x22, 0x12, 0x0A, 0x7F, 0x02],
  [0x42, 0x3F, 0x02, 0x42, 0x3E],
  [0x0A, 0x0A, 0x7F, 0x0A, 0x0A],
  [0x08, 0x46, 0x42, 0x22, 0x1E],
  [0x04, 0x03, 0x42, 0x3E, 0x02],
  [0x42, 0x42, 0x42, 0x42, 0x7E],
  [0x02, 0x4F, 0x22, 0x1F, 0x02],
  [0x4A, 0x4A, 0x40, 0x20, 0x1C],
  [0x42, 0x22, 0x12, 0x2A, 0x46],
  [0x02, 0x3F, 0x42, 0x4A, 0x46],
  [0x06, 0x48, 0x40, 0x20, 0x1E],
  [0x08, 0x46, 0x4A, 0x32, 0x1E],
  [0x0A, 0x4A, 0x3E, 0x09, 0x08],
  [0x0E, 0x00, 0x4E, 0x20, 0x1E],
  [0x04, 0x45, 0x3D, 0x05, 0x04],
  [0x00, 0x7F, 0x08, 0x10, 0x00],
  [0x44, 0x24, 0x1F, 0x04, 0x04],
  [0x40, 0x42, 0x42, 0x42, 0x40],
  [0x42, 0x2A, 0x12, 0x2A, 0x06],
  [0x22, 0x12, 0x7B, 0x16, 0x22],
  [0x00, 0x40, 0x20, 0x1F, 0x00],
  [0x78, 0x00, 0x02, 0x04, 0x78],
  [0x3F, 0x44, 0x44, 0x44, 0x44],
  [0x02, 0x42, 0x42, 0x22, 0x1E],
  [0x04, 0x02, 0x04, 0x08, 0x30],
  [0x32, 0x02, 0x7F, 0x02, 0x32],
  [0x02, 0x12, 0x22, 0x52, 0x0E],
  [0x00, 0x2A, 0x2A, 0x2A, 0x40],
  [0x38, 0x24, 0x22, 0x20, 0x70],
  [0x40, 0x28, 0x10, 0x28, 0x06],
  [0x0A, 0x3E, 0x4A, 0x4A, 0x4A],
  [0x04, 0x7F, 0x04, 0x14, 0x0C],
  [0x40, 0x42, 0x42, 0x7E, 0x40],
  [0x4A, 0x4A, 0x4A, 0x4A, 0x7E],
  [0x04, 0x05, 0x45, 0x25, 0x1C],
  [0x0F, 0x40, 0x20, 0x1F, 0x00],
  [0x7C, 0x00, 0x7E, 0x40, 0x30],
  [0x7E, 0x40, 0x20, 0x10, 0x08],
  [0x7E, 0x42, 0x42, 0x42, 0x7E],
  [0x0E, 0x02, 0x42, 0x22, 0x1E],
  [0x42, 0x42, 0x40, 0x20, 0x18],
  [0x02, 0x04, 0x01, 0x02, 0x00],
  [0x07, 0x05, 0x07, 0x00, 0x00],
  [0x38, 0x44, 0x48, 0x30, 0x48],
  [0x20, 0x55, 0x54, 0x55, 0x78],
  [0xF8, 0x54, 0x54, 0x54, 0x28],
  [0x28, 0x54, 0x54, 0x44, 0x20],
  [0xFC, 0x20, 0x20, 0x10, 0x3C],
  [0x38, 0x44, 0x4C, 0x54, 0x24],
  [0xF0, 0x48, 0x44, 0x44, 0x38],
  [0x38, 0x44, 0x44, 0x44, 0xFC],
  [0x20, 0x40, 0x3C, 0x04, 0x04],
  [0x04, 0x04, 0x00, 0x0E, 0x00],
  [0x00, 0x00, 0x04, 0xFD, 0x00],
  [0x0A, 0x04, 0x0A, 0x00, 0x00],
  [0x18, 0x24, 0x7E, 0x24, 0x10],
  [0x14, 0x7F, 0x54, 0x40, 0x40],
  [0x7C, 0x09, 0x05, 0x05, 0x78],
  [0x38, 0x45, 0x44, 0x45, 0x38],
  [0xFC, 0x28, 0x24, 0x24, 0x18],
  [0x38, 0x44, 0x44, 0x48, 0xFC],
  [0x3C, 0x4A, 0x4A, 0x4A, 0x3C],
  [0x30, 0x28, 0x10, 0x28, 0x18],
  [0x58, 0x64, 0x04, 0x64, 0x58],
  [0x3C, 0x41, 0x40, 0x21, 0x7C],
  [0x63, 0x55, 0x49, 0x41, 0x41],
  [0x24, 0x1C, 0x04, 0x3C, 0x24],
  [0x45, 0x29, 0x11, 0x29, 0x45],
  [0x3C, 0x40, 0x40, 0x40, 0xFC],
  [0x14, 0x14, 0x7C, 0x14, 0x12],
  [0x44, 0x3C, 0x14, 0x14, 0x74],
  [0x7C, 0x14, 0x1C, 0x14, 0x7C],
  [0x10, 0x10, 0x54, 0x10, 0x10],
  [0x00, 0x00, 0x00, 0x00, 0x00],
  [0xFF, 0xFF, 0xFF, 0xFF, 0xFF],
];


const DDRMAX = 80;

const L_FNT = 0x0200; // Sets character font
const L_NLI = 0x0100; // Sets number of display line

const L_DL  = 0x0080; // Sets interface data length

const L_LR  = 0x0040; // Sets shift direction
const L_CD  = 0x0020; // Sets cursor-move or display-shift

const L_DID = 0x0010; // Sets cursor move direction
const L_DSH = 0x0008; // specifies to shift the display

const L_DON = 0x0004; // Sets On/Off of all display
const L_CON = 0x0002; // Sets cursor On/Off
const L_CBL = 0x0001; // Set blink of cursor position character


class LCDRegs {
  flags = 0;
  ddram_ad = 0;
  cgram_ad = 0;
  blinkc = 0; // blink count timer
  blink = false; // cursor state
  shift = 0; // display shift
  // http://stackoverflow.com/a/35086350
  readonly ddram: number[][] = Array<null>(DDRMAX).fill(null).map(() => Array<number>(5).fill(0));
  readonly cgram: number[][] = Array<null>(8).fill(null).map(() => Array<number>(5).fill(0));
  bc = 0;
  buff = 0;
}

/* tslint:disable:no-bitwise */

export class HD44780 {

  public pinE = false;

  private readonly _regs = new LCDRegs();

  getPixel(row: number, seat: number, left: number, top: number): boolean {

    // const f = LCDfont[seat+1][left];
    // return !!(f & (0x01<<top));
    // const f = LCDfont[seat+1][left];
    // return !!(f & (0x01<<top));

    const lcd = this._regs;
    let cs = seat - lcd.shift;
    if (cs < 0) {
      cs = 40 + (cs % 40);
    }
    if (cs >= 40) {
      cs = cs % 40;
    }

    if ((lcd.ddram[cs + (40 * row)][left] & (0x01 << top)) && (lcd.flags & L_DON)) {
      return true;
    } else {
      // cursor
      if ((lcd.flags & L_DON) && (lcd.flags & L_CON)) {
        let l: number, c: number;
        if (lcd.ddram_ad < 40) {
          l = 0;
          c = (lcd.ddram_ad + lcd.shift);
        } else {
          l = 1;
          c = lcd.ddram_ad - 40 + lcd.shift;
        }

        if (c < 0) {
          c = 40 + (c % 40);
        }
        if (c >= 40 ) {
          c = c % 40;
        }

        // draw only visible columns
        if ((c >= 0) && (c < 16)) {
          if (l === row && seat === c) {
            return lcd.blink || top === 7;
          }
        }
      }
    }

  }

  rst(): void {
    const lcd = this._regs;

    // printf("LCD rst--------------------------\n");

    for (let i = 0; i < DDRMAX; i++) {
      for (let j = 0; j < 5; j++) {
        lcd.ddram[i][j] = 0;
      }
    }
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 5; j++) {
        lcd.cgram[i][j] = 0;
      }
    }
    lcd.ddram_ad = 0;
    lcd.cgram_ad = 0xFF;
    // lcd.update = 1;
    lcd.bc = 0;

    lcd.blink = false;
    lcd.blinkc = 0;
    lcd.shift = 0;
    lcd.flags = 0;
    return;
  }

  blink(): void {
    const lcd = this._regs;

    if ((lcd.flags & L_CON) && (lcd.flags & L_CBL)) {
      lcd.blinkc++;
      if (lcd.blinkc > 4) {
        lcd.blinkc = 0;
        // lcd.update = 1;
        lcd.blink = !lcd.blink;
      }
    } else {
     lcd.blink = false;
    }
  }

  cmd(cmd: number): void {
    const lcd = this._regs;

    // switch between 8 and 4 bits communication
    if (!(lcd.flags & L_DL)) {
      if (lcd.bc) {
       lcd.bc = 0;
       cmd = lcd.buff | (cmd >> 4);
      } else {
       lcd.bc = 1;
       lcd.buff = cmd & 0xF0;
       return;
      }
    }

    // printf("LCD cmd=%#04X\n",(unsigned char)cmd);

    // Set DDRAM address
    if (cmd & 0x80 ) {
      const i = cmd & 0x7F;

      if (i < 40) {
        lcd.ddram_ad = i;
      } else {
        lcd.ddram_ad = i - 24;
      }

      if (lcd.ddram_ad >= DDRMAX) {
        lcd.ddram_ad = 0;
      }
      lcd.cgram_ad = 0xFF;
      return;
    }

    // Set CGRAM address
    if (cmd & 0x40) {
      lcd.cgram_ad = cmd & 0x3F;
      return;
    }

    // Function set

    if (cmd & 0x20) {
      // Sets interface data length
      if (cmd & 0x10) {
        lcd.flags |= L_DL;
      } else {
        lcd.flags &= ~L_DL;
      }

      // Sets number of display line
      if (cmd & 0x08) {
        lcd.flags |= L_NLI;
      } else {
        lcd.flags &= ~L_NLI;
      }

      // Sets character font
      if (cmd & 0x04) {
        lcd.flags |= L_FNT;
      } else {
        lcd.flags &= ~L_FNT;
      }

      return;
    }

    // Cursor/display shift
    if (cmd & 0x10 ) {
      // Sets shift direction
      if (cmd & 0x04) {
        lcd.flags |= L_LR;
      } else {
        lcd.flags &= ~L_LR;
      }

      // Sets cursor-move or display-shift
      if (cmd & 0x08) {
        // display shift
        lcd.flags |= L_CD;
        if (lcd.flags & L_LR) {
          lcd.shift++;
          if (lcd.shift > 40) {
            lcd.shift = lcd.shift - 40;
          }
        } else {
          lcd.shift--;
          if (lcd.shift < -40) {
            lcd.shift = lcd.shift + 40;
          }
        }
      } else {
        // cursor move
        lcd.flags &= ~L_CD;
        if (lcd.flags & L_LR) {
          lcd.ddram_ad++;
        } else {
          lcd.ddram_ad--;
        }
      }

      // lcd.update = 1;
      return;
    }

    // Display On/Off control
    if (cmd & 0x08) {
      // Sets On/Off of all display
      if (cmd & 0x04) {
        lcd.flags |= L_DON;
      } else {
        lcd.flags &= ~L_DON;
      }

      // Sets cursor On/Off
      if (cmd & 0x02) {
        lcd.flags |= L_CON;
      } else {
        lcd.flags &= ~L_CON;
      }

      // Set blink of cursor position character
      if (cmd & 0x01) {
        lcd.flags |= L_CBL;
      } else {
        lcd.flags &= ~L_CBL;
      }

      // lcd.update=1;
      return;
    }

    // Entry mode set
    if (cmd & 0x04) {
      // Sets cursor move direction
      if (cmd & 0x02) {
        lcd.flags |= L_DID;
      } else {
        lcd.flags &= ~L_DID;
      }

      // specifies to shift the display
      if (cmd & 0x01) {
        lcd.flags |= L_DSH;
      } else {
        lcd.flags &= ~L_DSH;
      }

      return;
    }

    // Cursor home
    if (cmd & 0x02) {
      lcd.ddram_ad = 0;
      // lcd.update = 1;
      return;
    }

    // Clear display
    if (cmd & 0x01) {
      for (let i = 0; i < DDRMAX; i++) {
        for (let j = 0; j < 5; j++) {
          lcd.ddram[i][j] = 0;
        }
      }
      lcd.ddram_ad = 0;
      lcd.shift = 0;
      lcd.flags |= L_DID;
      // lcd.update = 1;
      return;
    }
  }

  data(data: number): void {

    const lcd = this._regs;

    if (!(lcd.flags & L_DON)) {
      this.cmd(data);
      return;
    }

    // switch betwwen 8 ou 4 bits communication
    if (!(lcd.flags & L_DL)) {
      if (lcd.bc) {
        lcd.bc = 0;
        data = lcd.buff | (data >> 4);
      } else {
        lcd.bc = 1;
        lcd.buff = data & 0xF0;
        return;
      }
    }

    // if(data < 0x20)
    // {
    //   printf("LCD dat=ERROR!\n");
    //   return;
    // }

    const fp = data - 0x20;

    // printf("LCD dat=%#04X (%c)\n",(unsigned char)data,data);

    if (lcd.cgram_ad === 0xFF) {
      for (let j = 0; j < 5; j++) {
        if (fp >= 0) {
          lcd.ddram[lcd.ddram_ad][j] = LCDfont[fp][j];
        } else {
          lcd.ddram[lcd.ddram_ad][j] = lcd.cgram[data & 0x07][j];
        }
      }
      if (lcd.flags & L_DID) {
        lcd.ddram_ad++;
        if (lcd.ddram_ad >= DDRMAX) {
          lcd.ddram_ad = 0;
        }
        if (lcd.flags & L_DSH) {
          lcd.shift--;
          if (lcd.shift < -40) {
            lcd.shift = lcd.shift + 40;
          }
        }
      } else {
        lcd.ddram_ad--;
        if (lcd.ddram_ad >= DDRMAX) {
          lcd.ddram_ad = DDRMAX;
        }
        if (lcd.flags & L_DSH) {
          lcd.shift++;
          if (lcd.shift > 40) {
            lcd.shift = lcd.shift - 40;
          }
        }
      }
      // lcd.update=1;
    } else {
      for (let j = 0; j < 5; j++) {
        if ((data & (0x01 << (4 - j))) > 0) {
          lcd.cgram[lcd.cgram_ad >> 3][j] |= (0x01 << (lcd.cgram_ad & 0x07));
        } else {
          lcd.cgram[lcd.cgram_ad >> 3][j] &= ~(0x01 << (lcd.cgram_ad & 0x07));
        }
      }

      lcd.cgram_ad++;
      if (lcd.cgram_ad >= 64) {
        lcd.cgram_ad = 0;
      }
    }
  }

}
