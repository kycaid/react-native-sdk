# KYCAID React Native SDK
A React Native component that allows you to quickly integrate the KYCAID service to identify your customer (KYC/KYB).

![Example of usage KYCAID component](./example/screenshot.png "Screenshot")

## Installation   

```bash
$ npm install @kycaid/react-native-sdk
```
   
## Usage
    
```jsx
import React from 'react';
import { SafeAreaView } from 'react-native';
import { KYCAID } from '@kycaid/react-native-sdk';

function App() {
    const handleVerificationCallback = (data) => {
        console.log(`Callback successfully received!`);
        console.log(`Verification ${data?.verification_id} has status: ${data?.status}`);
    };

    return (
        <SafeAreaView>
            <KYCAID
                config={{
                    api_url: '<api_url>',
                    api_token: '<api_token>', 
                    applicant_id: '<applicant_id>', 
                    form_id: '<form_id>'
                }}
                verificationCallback={handleVerificationCallback}
            />
        </SafeAreaView>
    )
}
```

## Reference
### Props

`api_url`
*string (2048)*

API endpoint URL.

`api_token` (Required)
*string (36)*

API authorization token (can be taken in customer dashboard).

`applicant_id`
*string (36)*

The applicant’s unique identificator.

`form_id` (Required)
*string (36)*

The form unique identificator (can be taken in customer dashboard).

`verificationCallback`
*function*

The callback which triggered when the form was completed by the applicant.

## Documentation

[Additional API reference](https://www.npmjs.com/package/react-native-create-lib)   
    
   
