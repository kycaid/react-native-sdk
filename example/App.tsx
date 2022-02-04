import React from 'react';
import { withNavigationItem } from 'hybrid-navigation';
import {
  LogBox,
  StyleSheet,
  SafeAreaView,
  Platform,
  Alert
} from 'react-native';
import { KYCAID, VerificationData } from '@kycaid/react-native-sdk'

function App() {
  const handleVerificationCallback = (data?: VerificationData) => {
    console.log(`Callback successfully received!`);
    console.log(`Verification ${data?.verification_id} has status: ${data?.status}`);

    Alert.alert(
        "Callback successfully received!",
        `Verification ${data?.verification_id} has status: ${data?.status}`,
        [
          {
            text: "Cancel",
            onPress: () => console.log("Cancel Pressed"),
            style: "cancel"
          },
          { text: "OK", onPress: () => console.log("OK Pressed") }
        ]
    );
  };

  LogBox.ignoreAllLogs();

  return (
    <SafeAreaView style={styles.container}>
      <KYCAID
        config={{
          // api_url: 'https://api.kycaid.com',
          // api_token: '***REMOVED***',
          // form_id: '***REMOVED***',
            // api_token: '***REMOVED***',
            // form_id: '***REMOVED***',
          api_url: 'https://stg-api.kycaid.com',
          api_token: '***REMOVED***',
          form_id: '***REMOVED***',
          // applicant_id: '***REMOVED***',
            // api_url: 'https://192.168.0.115:3005',
            // api_token: '***REMOVED***',
            // form_id: '***REMOVED***',
            response_url: 'https://www.google.com/',
        }}
        verificationCallback={handleVerificationCallback}
      />
    </SafeAreaView>
  )
}

export default withNavigationItem({
  titleItem: {
    title: 'KYCAID SDK',
  },
})(App)

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f3f9',
    paddingTop: Platform.OS === 'android' ? 25 : 0,
  },
  webView: {
    backgroundColor: '#f0f3f9',
  }
});
