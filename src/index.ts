import { NativeModules } from 'react-native';

const { RNSdk } = NativeModules

export default RNSdk

export { VerificationData } from './store'
export { Config, KYCAID } from './App';
export { KycaidConfigError } from './api/auth';
