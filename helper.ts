import NfcManager, {NfcTech} from 'react-native-nfc-manager';
// @ts-ignore
import emv from 'node-emv';

export class VisaCardReader {
  readVisaCreditCard = async () => {
    try {
      NfcManager.cancelTechnologyRequest();
    } catch (error) {}

    try {
      const commands = [
        '00A404000E325041592E5359532E444446303100',
        '00A4040007A00000000310100E',
        '80A800002383212800000000000000000000000000000002500000000000097820052600E8DA935200',
      ];

      await NfcManager.requestTechnology([NfcTech.IsoDep]);

      const responses = [];

      for (let i = 0; i < commands.length; i++) {
        const resp = await NfcManager.isoDepHandler.transceive(
          this.toByteArray(commands[i]),
        );
        responses.push(resp);
      }

      if (responses && responses.length > 2) {
        const r = await this.getEmvInfo(this.toHexString(responses[2]));
        console.log('3');
        console.log(r);
        if (r) {
          const cardInfo = this.getCardInfoVisa(r);
          if (cardInfo) {
            return {
              card: cardInfo.card,
              exp: cardInfo.exp,
            };
          } else {
            return null;
          }
        } else {
          return null;
        }
      } else {
        return null;
      }
    } catch (error) {
      return null;
    } finally {
      NfcManager.cancelTechnologyRequest();
    }
  };

  getEmvInfo = (info: any) => {
    return new Promise(resolve => {
      emv.describe(info, (data: any) => {
        if (data) {
          resolve(data);
        } else {
          resolve(null);
        }
      });
    });
  };

  toByteArray = (text: any) => {
    return text.match(/.{1,2}/g).map((b: any) => {
      return parseInt(b, 16);
    });
  };

  toHexString = (byteArr: any) => {
    return byteArr.reduce((acc: any, byte: any) => {
      return acc + ('00' + byte.toString(16).toUpperCase()).slice(-2);
    }, '');
  };

  getCardInfoVisa = (responses: any) => {
    let res;
    let end = false;
    for (let i = 0; i < responses.length; i++) {
      const r = responses[i];
      if (r.tag === '77' && r.value && r.value.length > 0) {
        for (let j = 0; j < r.value.length; j++) {
          const e = r.value[j];
          if (e.tag === '57' && e.value) {
            const parts = e.value.split('D');
            if (parts.length > 1) {
              res = {
                card: parts[0],
                exp: parts[1].substring(0, 4),
              };
              end = true;
            }
          }

          if (end) {
            break;
          }
        }

        if (end) {
          break;
        }
      }
    }
    return res;
  };
}
