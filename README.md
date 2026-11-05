# KYCAID React Native SDK
A React Native component that allows you to quickly integrate the KYCAID service to identify your customer (KYC/KYB).

![Example of usage KYCAID component](./example/screenshot.png "Screenshot")

## Installation   

```bash
$ npm install @kycaid/react-native-sdk
```

## Security: never put your `api_token` in the app

Your `api_token` is a full-access credential to your KYCAID account and it does not expire. Anything shipped in a mobile app, or sent from it, can be extracted by whoever holds the app. **Never embed your `api_token` in the app or send it to the device.**

The SDK authenticates with a `form_token` instead: a token scoped to one applicant and one form, which your own backend mints with the `api_token`.

1. Your backend creates (or finds) the applicant and calls [`POST /forms/{form_id}/urls`](https://docs.kycaid.com/api/forms/form-get-url) with your `api_token` and the `applicant_id` in the body.
2. Your backend returns `form_token`, `form_id` and `applicant_id` to the app.
3. The app passes them to the `KYCAID` component.

> **Upgrading:** earlier versions of this guide asked for an `api_token` in the app. If your app has ever shipped one, switch to `form_token` and rotate that `api_token` in the dashboard — it stays valid until you do.

## Usage

Backend (example, Node.js):

```js
// Runs on your server. The api_token never leaves it.
const response = await fetch(`https://api.kycaid.com/forms/${FORM_ID}/urls`, {
    method: 'POST',
    headers: {
        'Authorization': `Token ${process.env.KYCAID_API_TOKEN}`,
        'Content-Type': 'application/json',
    },
    body: JSON.stringify({ applicant_id: applicantId }),
});
if (!response.ok) throw new Error(`KYCAID form URL request failed: ${response.status}`);
const { form_token } = await response.json();
// return { form_token, form_id: FORM_ID, applicant_id: applicantId } to the app
```

App:

```jsx
import React from 'react';
import { SafeAreaView } from 'react-native';
import { KYCAID } from '@kycaid/react-native-sdk';

function App({ formToken, formId, applicantId }) {
    const handleVerificationCallback = (data) => {
        console.log(`Callback successfully received!`);
        console.log(`Verification ${data?.verification_id} has status: ${data?.status}`);
    };

    return (
        <SafeAreaView>
            <KYCAID
                config={{
                    form_token: formToken,
                    form_id: formId,
                    applicant_id: applicantId
                }}
                verificationCallback={handleVerificationCallback}
            />
        </SafeAreaView>
    )
}
```

The SDK sends the `form_token` in the `form-token` header. It never sends an unauthenticated request: without a `form_token` it logs a `KycaidConfigError` and does not call the API.

## Reference
### Props

`api_url`
*string (2048)*

API endpoint URL.

`form_token` (Required)
*string (36)*

Form token minted by your backend with `POST /forms/{form_id}/urls`. Never pass your `api_token` to the app.

`applicant_id` (Required)
*string (36)*

The applicant’s unique identificator. Must be the applicant the `form_token` was minted for.

`form_id` (Required)
*string (36)*

The form unique identificator (can be taken in customer dashboard).

`response_url`
*string*

When the form navigates to this URL, the SDK fetches the verification and calls `verificationCallback`.

`language`
*string*

Form language code.

`verificationCallback`
*function*

The callback which triggered when the form was completed by the applicant.

## Documentation

[Additional API reference](https://www.npmjs.com/package/react-native-create-lib)   
    
   
