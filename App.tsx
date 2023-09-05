import React from 'react';
import {View, Text, TouchableOpacity} from 'react-native';
import NfcManager from 'react-native-nfc-manager';
import {VisaCardReader} from './helper';

class AppV2Mifare extends React.Component {
  componentDidMount() {
    NfcManager.start();
  }

  componentWillUnmount() {
    this._cleanUp();
  }

  render() {
    return (
      <View style={{padding: 20}}>
        <Text>NFC Demo</Text>
        <TouchableOpacity
          style={{
            padding: 10,
            width: 200,
            margin: 20,
            borderWidth: 1,
            borderColor: 'black',
          }}
          onPress={this._test}>
          <Text>Test</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={{
            padding: 10,
            width: 200,
            margin: 20,
            borderWidth: 1,
            borderColor: 'black',
          }}
          onPress={this._cleanUp}>
          <Text>Cancel Test</Text>
        </TouchableOpacity>
      </View>
    );
  }

  _cleanUp = () => {
    NfcManager.cancelTechnologyRequest().catch(() => 0);
  };

  _test = async () => {
    try {
      const visa = new VisaCardReader();
      const card = await visa.readVisaCreditCard();
      console.log(card);
    } catch (ex) {
      console.warn('ex', ex);
      this._cleanUp();
    }
  };
}

export default AppV2Mifare;
