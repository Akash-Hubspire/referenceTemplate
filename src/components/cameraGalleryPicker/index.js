/* eslint-disable react-hooks/exhaustive-deps */
/* eslint no-console: 0 */
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
  StyleSheet,
  Image,
  TouchableOpacity,
  View,
  Platform,
  StatusBar,
  AppState,
} from 'react-native';
import Modal from 'react-native-modal';
import ImagePicker from 'react-native-image-crop-picker';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Camera, useCameraDevices} from 'react-native-vision-camera';
import {useTheme} from '@react-navigation/native';

const CLOSE_ICON = require('../../assets/icons/camera/closeRed.png');
const GALLERY_ICON = require('../../assets/icons/camera/gallery.png');
const FLIP_CAMERA_ICON = require('../../assets/icons/camera/flip_camera.png');
const FLASH_ON_ICON = require('../../assets/icons/camera/flash_on.png');
const FLASH_OFF_ICON = require('../../assets/icons/camera/flash_off.png');

const CameraGallery = ({
  handleImage,
  enableCamera,
  onPressBack,
  // experienceDetail,
  // journeyDetail,
}) => {
  const styles = useStyles();
  const {colors} = useTheme();
  const cameraRef = useRef();
  const [isCameraInitialized, setIsCameraInitialized] = useState(false);
  const [cameraPosition, setCameraPosition] = useState('back');
  const [flash, setFlash] = useState('off');
  const [isForeground, setIsForeground] = useState(true);
  const devices = useCameraDevices();
  const device = devices[cameraPosition];

  const isActive = isForeground && enableCamera;

  const supportsCameraFlipping = useMemo(
    () => devices.back != null && devices.front != null,
    [devices.back, devices.front],
  );
  const supportsFlash = device?.hasFlash ?? false;

  const hitslop = {
    top: 15,
    bottom: 15,
    left: 15,
    right: 15,
  };

  // check if APP is foreground
  useEffect(() => {
    const onChange = state => {
      setIsForeground(state === 'active');
    };
    const listener = AppState.addEventListener('change', onChange);
    return () => listener.remove();
  }, []);

  const onPressFlipCamera = useCallback(() => {
    setCameraPosition(p => (p === 'back' ? 'front' : 'back'));
  }, []);
  const onPressFlash = useCallback(() => {
    setFlash(f => (f === 'off' ? 'on' : 'off'));
  }, []);

  const handlePressBack = () => {
    onPressBack(false);
  };

  const onError = useCallback(error => {
    console.error('Camera error: ', error);
  }, []);

  const onInitialized = useCallback(() => {
    setIsCameraInitialized(true);
  }, [isActive]);

  const takePhotoOptions = useMemo(
    () => ({
      photoCodec: 'jpeg',
      qualityPrioritization: 'speed',
      flash,
      quality: 90,
      skipMetadata: true,
    }),
    [flash],
  );

  const takePhoto = async () => {
    try {
      if (cameraRef.current == null) {
        throw new Error('Camera ref is null!');
      }
      const photo = await cameraRef.current.takePhoto(takePhotoOptions);
      const uri = `${Platform.OS === 'android' ? 'file://' : ''}${photo.path}`;
      const imageDetails = {
        ...photo,
        path: uri,
      };
      handleImage([imageDetails]);
    } catch (e) {
      console.error('Failed to take photo!', e);
    }
  };

  const onPressGallery = () => {
    try {
      ImagePicker.openPicker({
        multiple: true,
        mediaType: 'photo',
        maxFiles: 5,
        compressImageQuality: 0.3,
      })
        .then(images => {
          handleImage(images);
          onPressBack(false);
        })
        .catch(e => console.log('Failed to pick media', e));
    } catch (error) {
      console.error('Failed to select photo from gallery!', error);
    }
  };
  return (
    <Modal
      animationType="fade"
      transparent
      isVisible={enableCamera}
      animationOutTiming={100}
      style={{margin: 0}}>
      <View style={{height: '100%', width: '100%'}}>
        <StatusBar
          barStyle="light-content"
          backgroundColor={colors.background}
        />
        <View style={styles.container}>
          <View style={styles.topContainer}>
            <TouchableOpacity
              onPress={handlePressBack}
              hitSlop={hitslop}
              accessibilityLabel="Close"
              accessibilityHint="Press to close camera">
              <Image source={CLOSE_ICON} style={styles.closeIcon} />
            </TouchableOpacity>
            {supportsFlash ? (
              <TouchableOpacity
                onPress={onPressFlash}
                hitSlop={hitslop}
                accessibilityLabel="Toggle flash"
                accessibilityHint="Press to toggle flash">
                <Image
                  source={flash === 'on' ? FLASH_ON_ICON : FLASH_OFF_ICON}
                  style={styles.flashIcon}
                />
              </TouchableOpacity>
            ) : null}
          </View>
          {device != null && enableCamera && (
            <View style={styles.cameraContainer}>
              <Camera
                ref={cameraRef}
                style={StyleSheet.absoluteFill}
                device={device}
                isActive={isActive}
                orientation="portrait"
                photo
                onInitialized={onInitialized}
                onError={onError}
              />
              {isCameraInitialized && (
                <View style={styles.bottomMenu}>
                  <TouchableOpacity
                    hitSlop={hitslop}
                    style={styles.galleryButtonContainer}
                    accessibilityLabel="Gallery"
                    accessibilityHint="Press to open gallery"
                    onPress={onPressGallery}>
                    <Image
                      source={GALLERY_ICON}
                      style={styles.galleryButtonImage}
                    />
                  </TouchableOpacity>
                  <View style={styles.captureButtonContainer}>
                    <TouchableOpacity
                      style={styles.captureButton}
                      onPress={takePhoto}
                      accessibilityLabel="Capture image"
                      accessibilityHint="Press to capture image"
                    />
                  </View>
                  {supportsCameraFlipping ? (
                    <TouchableOpacity
                      hitSlop={hitslop}
                      style={styles.flipcameraButtonContainer}
                      onPress={onPressFlipCamera}
                      accessibilityLabel="Flip camera"
                      accessibilityHint="Press to flip camera">
                      <Image
                        source={FLIP_CAMERA_ICON}
                        style={styles.flipcameraButtonImage}
                      />
                    </TouchableOpacity>
                  ) : (
                    <View style={styles.emptyButtonPosition} />
                  )}
                </View>
              )}
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const useStyles = () => {
  const innerButtonWidth = 50;
  const outerRingGap = 25;
  const outerRingThickness = 3;
  const horizontalSpacing = 20;
  const insets = useSafeAreaInsets();

  return StyleSheet.create({
    container: {flex: 1, zIndex: 20},
    topContainer: {
      position: 'absolute',
      paddingHorizontal: horizontalSpacing,
      paddingTop: Platform.OS === 'ios' ? insets.top : insets.top,
      zIndex: 20,
      width: '100%',
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    closeIcon: {width: 20, height: 20, tintColor: '#FFFFFF'},
    flashIcon: {width: 25, height: 25, tintColor: '#FFFFFF'},
    cameraContainer: {
      flex: 1,
      backgroundColor: 'black',
    },
    bottomMenu: {
      bottom: 40 + insets.bottom,
      position: 'absolute',
      width: '100%',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexDirection: 'row',
      paddingHorizontal: horizontalSpacing,
    },
    galleryButtonContainer: {
      width: 45,
      height: 45,
      borderRadius: 35,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    galleryButtonImage: {
      width: 25,
      height: 25,
    },
    flipcameraButtonContainer: {
      width: 45,
      height: 45,
      borderRadius: 35,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    flipcameraButtonImage: {
      width: 30,
      height: 30,
    },
    captureButtonContainer: {
      width: innerButtonWidth + outerRingGap,
      height: innerButtonWidth + outerRingGap,
      borderRadius: innerButtonWidth,
      borderWidth: outerRingThickness,
      borderColor: 'white',
      alignItems: 'center',
      justifyContent: 'center',
    },
    captureButton: {
      width: innerButtonWidth,
      height: innerButtonWidth,
      borderRadius: innerButtonWidth,
      backgroundColor: 'white',
    },
  });
};

export default CameraGallery;
