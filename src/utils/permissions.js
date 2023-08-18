/* eslint no-console: 0 */
import {Alert, Platform} from 'react-native';
import {
  check,
  PERMISSIONS,
  request,
  RESULTS,
  openSettings,
  checkMultiple,
  requestMultiple,
} from 'react-native-permissions';
// import {Camera} from 'react-native-vision-camera';
// import notifee, {AuthorizationStatus} from '@notifee/react-native';
import constants from '../constants';

export const openSettingsAlert = title =>
  Alert.alert('Permission required!', title, [
    {
      text: 'Cancel',
      onPress: () => console.log('Cancel Pressed'),
      style: 'cancel',
    },
    {text: 'Go To Settings', onPress: openSettings},
  ]);

// NOTE: USE COMMENTED FUNCTIONS AFTER INSTALLING VISION CAMERA

// const getCameraPermissionStatus = async () => {
//   const cameraPermission = await Camera.getCameraPermissionStatus();
//   if (cameraPermission === 'authorized') {
//     return true;
//   }
//   const newCameraPermission = await Camera.requestCameraPermission();
//   if (newCameraPermission === 'authorized') {
//     return true;
//   }
//   openSettingsAlert(
//     'We need your permission to access the camera of the device',
//   );
//   return false;
// };

// const getMicrophonePermissionStatus = async () => {
//   const microphonePermission = await Camera.getMicrophonePermissionStatus();
//   if (microphonePermission === 'authorized') {
//     return true;
//   }
//   const newMicrophonePermission = await Camera.requestMicrophonePermission();
//   if (newMicrophonePermission === 'authorized') {
//     return true;
//   }
//   openSettingsAlert(
//     'We need your permission to access the microphone of the device',
//   );
//   return false;
// };

const getOpenSettingsTitle = type => {
  switch (type) {
    case 'storage':
      return 'We need your permission to access files from your device';
    case 'location':
      return 'We need your permission to access your location from your device';
    case 'notification':
      return 'We need your permission to send notifications to your device';
    default:
      return 'We need your permission to access some features of your device';
  }
};

const handlePermission = (result, type = 'storage') => {
  switch (result) {
    case RESULTS.UNAVAILABLE:
      console.log(
        'This feature is not available (on this device / in this context)',
      );
      return false;
    case RESULTS.DENIED:
      console.log(
        'The permission has not been requested / is denied but requestable',
      );
      return false;
    case RESULTS.LIMITED:
      console.log('The permission is limited: some actions are possible');
      return true;
    case RESULTS.GRANTED:
      console.log(`The ${type} permission is granted`);
      return true;
    case RESULTS.BLOCKED:
      openSettingsAlert(getOpenSettingsTitle(type));
      console.log('The permission is denied and not requestable anymore');
      return false;
    default:
      return false;
  }
};

const getStoragePermissionStatus = async () => {
  let hasPermission;
  if (constants.deviceTypes.isAndroid) {
    const osVer = Platform.constants.Release;

    try {
      let checkResult;

      if (osVer > 12) {
        checkResult = await checkMultiple([
          PERMISSIONS.ANDROID.READ_MEDIA_IMAGES,
          PERMISSIONS.ANDROID.READ_MEDIA_VIDEO,
        ]);
        hasPermission = Object.values(checkResult).every(
          el => el === 'granted',
        );
        if (hasPermission) {
          console.log('The storage permission is granted');
        } else if (Object.values(checkResult).some(e => e === 'blocked')) {
          openSettingsAlert(
            'We need your permission to access the storage of the device',
          );
        }
      } else {
        checkResult = await check(PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE);
        hasPermission = handlePermission(checkResult);
      }

      if (!hasPermission) {
        try {
          let requestResult;

          if (osVer > 12) {
            requestResult = await requestMultiple([
              PERMISSIONS.ANDROID.READ_MEDIA_IMAGES,
              PERMISSIONS.ANDROID.READ_MEDIA_VIDEO,
            ]);
            hasPermission = Object.values(requestResult).every(
              el => el === 'granted',
            );
            if (hasPermission) {
              console.log('The storage permission is granted');
            } else if (
              Object.values(requestResult).some(e => e === 'blocked')
            ) {
              openSettingsAlert(
                'We need your permission to access the storage of the device',
              );
            }
          } else {
            requestResult = await request(
              PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE,
            );
            hasPermission = handlePermission(requestResult);
          }
        } catch (err) {
          console.log('Unable to request the storage permission', err);
        }
      }
    } catch (err) {
      console.log('Unable to check the storage permission', err);
    }
  } else {
    try {
      const checkResult = await check(PERMISSIONS.IOS.PHOTO_LIBRARY);
      hasPermission = handlePermission(checkResult);
      if (!hasPermission) {
        try {
          const requestResult = await request(PERMISSIONS.IOS.PHOTO_LIBRARY);
          hasPermission = handlePermission(requestResult);
        } catch (err) {
          console.log('Unable to request the storage permission', err);
        }
      }
    } catch (err) {
      console.log('Unable to check the storage permission', err);
    }
  }
  return hasPermission;
};

const getLocationPermissionStatus = async () => {
  let hasPermission;
  if (constants.deviceTypes.isAndroid) {
    try {
      const checkResult = await check(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION);
      hasPermission = handlePermission(checkResult, 'location');
      if (!hasPermission) {
        try {
          const requestResult = await request(
            PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
          );
          hasPermission = handlePermission(requestResult, 'location');
        } catch (err) {
          console.log('Unable to request the location permission', err);
        }
      }
    } catch (err) {
      console.log('Unable to check the location permission', err);
    }
  } else {
    try {
      const checkResult = await check(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE);
      hasPermission = handlePermission(checkResult, 'location');
      if (!hasPermission) {
        try {
          const requestResult = await request(
            PERMISSIONS.IOS.LOCATION_WHEN_IN_USE,
          );
          hasPermission = handlePermission(requestResult, 'location');
        } catch (err) {
          console.log('Unable to request the location permission', err);
        }
      }
    } catch (err) {
      console.log('Unable to check the location permission', err);
    }
  }
  return hasPermission;
};

// const getNotificationPermissionStatus = async () => {
//   let hasPermission;
//   const settings = await notifee.getNotificationSettings();
//   if (
//     [AuthorizationStatus.AUTHORIZED, AuthorizationStatus.PROVISIONAL].includes(
//       settings.authorizationStatus,
//     )
//   ) {
//     hasPermission = true;
//   } else if (
//     [AuthorizationStatus.NOT_DETERMINED, AuthorizationStatus.DENIED].includes(
//       settings.authorizationStatus,
//     )
//   ) {
//     const newSettings = await notifee.requestPermission();
//     if (
//       [
//         AuthorizationStatus.AUTHORIZED,
//         AuthorizationStatus.PROVISIONAL,
//       ].includes(newSettings.authorizationStatus)
//     ) {
//       hasPermission = true;
//     }
//   } else {
//     hasPermission = false;
//     openSettingsAlert(
//       'We need your permission to send notifications to your device',
//     );
//     console.log('Notification permissions has been denied');
//   }
//   return hasPermission;
// };

export default {
  // getCameraPermissionStatus,
  // getMicrophonePermissionStatus,
  getStoragePermissionStatus,
  getLocationPermissionStatus,
  // getNotificationPermissionStatus,
};
