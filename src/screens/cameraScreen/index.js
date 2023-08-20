/* eslint no-console: 0 */
import React, {useRef, useState, useMemo, useEffect, useCallback} from 'react';
import PropTypes from 'prop-types';
import {StyleSheet, View, Pressable, Image, AppState} from 'react-native';
import {
  PinchGestureHandler,
  TapGestureHandler,
} from 'react-native-gesture-handler';
import {useCameraDevices, Camera} from 'react-native-vision-camera';
import Reanimated, {
  Extrapolate,
  interpolate,
  useAnimatedGestureHandler,
  useAnimatedProps,
  useSharedValue,
} from 'react-native-reanimated';
import {useIsFocused} from '@react-navigation/native';
import {SafeAreaView} from 'react-native-safe-area-context';
import StatusBarBlurBackground from '../../components/statusBarBlurBackground';
import constants from '../../constants';
import CaptureButton from '../../components/captureButton';
import useStyles from './styles';
import RenderSvg from '../../components/renderSvg/renderSvg';
import svg from '../../assets/images/svg';

const ReanimatedCamera = Reanimated.createAnimatedComponent(Camera);
Reanimated.addWhitelistedNativeProps({
  zoom: true,
});

const SCALE_FULL_ZOOM = 3;
function CameraScreen({navigation, route}) {
  const styles = useStyles();
  const camera = useRef(null);
  const [isCameraInitialized, setIsCameraInitialized] = useState(false);
  const zoom = useSharedValue(0);
  const isPressingButton = useSharedValue(false);

  const {
    hasMicrophoneAccessPermission = false,
    isForUserPicture,
    countOfAlreadySelectedImages = null,
    alreadyVideoSelected = false,
    onSelectSingleMedia,
  } = route.params;

  const [isForeground, setIsForeground] = useState(true);

  // check if camera page is active
  const isFocused = useIsFocused();
  const isActive = isFocused && isForeground;

  const [cameraPosition, setCameraPosition] = useState('back');
  const [flash, setFlash] = useState('off');
  const [media, setMedia] = useState();

  // camera format settings
  const devices = useCameraDevices();
  const device = devices[cameraPosition];

  // #region Memos
  const supportsCameraFlipping = useMemo(
    () => devices.back != null && devices.front != null,
    [devices.back, devices.front],
  );
  const supportsFlash = device?.hasFlash ?? false;

  // #region Animated Zoom
  // This just maps the zoom factor to a percentage value.
  // so e.g. for [min, neutr., max] values [1, 2, 128] this would result in [0, 0.0081, 1]
  const minZoom = device?.minZoom ?? 1;
  const maxZoom = Math.min(
    device?.maxZoom ?? 1,
    constants.cameraDimensions.MAX_ZOOM_FACTOR,
  );

  const cameraAnimatedProps = useAnimatedProps(() => {
    const z = Math.max(Math.min(zoom.value, maxZoom), minZoom);
    return {
      zoom: z,
    };
  }, [maxZoom, minZoom, zoom]);
  // #endregion

  // #region Callbacks
  const setIsPressingButton = useCallback(
    _isPressingButton => {
      isPressingButton.value = _isPressingButton;
    },
    [isPressingButton],
  );

  // Camera callbacks
  const onError = useCallback(error => {
    console.error('Camera error: ', error);
  }, []);

  const onInitialized = useCallback(() => {
    console.log('Camera initialized!');
    setIsCameraInitialized(true);
  }, []);

  const onMediaCaptured = useCallback(capturedMedia => {
    console.log(`Media captured! ${JSON.stringify(capturedMedia)}`);
    setMedia(capturedMedia);
  }, []);

  const onPressBackBtn = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const onFlipCameraPressed = useCallback(() => {
    setCameraPosition(p => (p === 'back' ? 'front' : 'back'));
  }, []);

  const onFlashPressed = useCallback(() => {
    setFlash(f => (f === 'off' ? 'on' : 'off'));
  }, []);
  // #endregion

  // #region Tap Gesture
  const onDoubleTap = useCallback(() => {
    onFlipCameraPressed();
  }, [onFlipCameraPressed]);
  // #endregion

  // #region Effects
  const neutralZoom = device?.neutralZoom ?? 1;
  useEffect(() => {
    // Run everytime the neutralZoomScaled value changes. (reset zoom when device changes)
    zoom.value = neutralZoom;
  }, [neutralZoom, zoom]);
  // #endregion

  // #region Pinch to Zoom Gesture
  // The gesture handler maps the linear pinch gesture (0 - 1) to an exponential curve since a camera's zoom
  // function does not appear linear to the user. (aka zoom 0.1 -> 0.2 does not look equal in difference as 0.8 -> 0.9)
  const onPinchGesture = useAnimatedGestureHandler({
    onStart: (_, context) => {
      context.startZoom = zoom.value;
    },
    onActive: (event, context) => {
      // we're trying to map the scale gesture to a linear zoom here
      const startZoom = context.startZoom ?? 0;
      const scale = interpolate(
        event.scale,
        [1 - 1 / SCALE_FULL_ZOOM, 1, SCALE_FULL_ZOOM],
        [-1, 0, 1],
        Extrapolate.CLAMP,
      );
      zoom.value = interpolate(
        scale,
        [-1, 0, 1],
        [minZoom, startZoom, maxZoom],
        Extrapolate.CLAMP,
      );
    },
  });
  // #endregion

  useEffect(() => {
    const onChange = state => {
      setIsForeground(state === 'active');
    };
    const listener = AppState.addEventListener('change', onChange);
    return () => listener.remove();
  }, [setIsForeground]);

  if (device != null) {
    console.log(
      `Re-rendering camera page with ${
        isActive ? 'active' : 'inactive'
      } camera. Device: "${device.name}"`,
    );
  } else {
    console.log('re-rendering camera page without active camera');
  }

  if (media) {
    navigation.navigate('MediaPreview', {
      isForUserPicture,
      media,
      onSelectSingleMedia,
    });
    setMedia();
  }

  return (
    <SafeAreaView
      edges={constants.deviceTypes.isIOS ? ['bottom'] : undefined}
      style={styles.container}>
      {device != null && (
        <PinchGestureHandler onGestureEvent={onPinchGesture} enabled={isActive}>
          <Reanimated.View style={StyleSheet.absoluteFill}>
            <TapGestureHandler onEnded={onDoubleTap} numberOfTaps={2}>
              <ReanimatedCamera
                ref={camera}
                style={StyleSheet.absoluteFill}
                device={device}
                isActive={isActive}
                onInitialized={onInitialized}
                onError={onError}
                enableZoomGesture={false}
                animatedProps={cameraAnimatedProps}
                photo
                video={!isForUserPicture}
                audio={hasMicrophoneAccessPermission}
                orientation="portrait"
              />
            </TapGestureHandler>
          </Reanimated.View>
        </PinchGestureHandler>
      )}

      <CaptureButton
        style={styles.captureButton}
        camera={camera}
        onMediaCaptured={onMediaCaptured}
        cameraZoom={zoom}
        minZoom={minZoom}
        maxZoom={maxZoom}
        flash={supportsFlash ? flash : 'off'}
        enabled={isCameraInitialized && isActive}
        setIsPressingButton={setIsPressingButton}
        allowVideo={!isForUserPicture}
        hasMicrophoneAccessPermission={hasMicrophoneAccessPermission}
        countOfAlreadySelectedImages={countOfAlreadySelectedImages}
        alreadyVideoSelected={alreadyVideoSelected}
      />

      <StatusBarBlurBackground />

      <View>
        <Pressable onPress={onPressBackBtn} style={styles.backBtn}>
          <RenderSvg xml={svg.backArrow} height={24} width={24} />
        </Pressable>
        <View style={styles.rightButtonRow}>
          {supportsCameraFlipping && (
            <Pressable
              style={styles.button}
              onPress={onFlipCameraPressed}
              disabledOpacity={0.4}>
              <Image
                source={constants.images.CAMERA_REVERSE}
                style={styles.cameraReverse}
              />
            </Pressable>
          )}
          {supportsFlash && (
            <Pressable
              style={styles.button}
              onPress={onFlashPressed}
              disabledOpacity={0.4}>
              <Image
                source={
                  flash === 'off'
                    ? constants.images.NO_FLASH
                    : constants.images.FLASH
                }
                style={styles.flashIcon}
              />
            </Pressable>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

CameraScreen.propTypes = {
  navigation: PropTypes.shape({
    goBack: PropTypes.func.isRequired,
    navigate: PropTypes.func.isRequired,
  }).isRequired,
  route: PropTypes.shape({
    params: PropTypes.shape({
      onSelectSingleMedia: PropTypes.func.isRequired,
      hasMicrophoneAccessPermission: PropTypes.bool,
      countOfAlreadySelectedImages: PropTypes.number,
      alreadyVideoSelected: PropTypes.bool,
      isForUserPicture: PropTypes.bool,
    }),
  }).isRequired,
};

export default CameraScreen;
