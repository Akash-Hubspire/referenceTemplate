/* eslint-disable no-param-reassign */
/* eslint no-console: 0 */
/* eslint react/prop-types: 0 */
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { View } from 'react-native';
import {
  PanGestureHandler,
  State,
  TapGestureHandler,
} from 'react-native-gesture-handler';
import Reanimated, {
  cancelAnimation,
  Easing,
  Extrapolate,
  interpolate,
  useAnimatedStyle,
  withSpring,
  withTiming,
  useAnimatedGestureHandler,
  useSharedValue,
} from 'react-native-reanimated';
import { CountdownCircleTimer } from 'react-native-countdown-circle-timer';
import { useTheme } from '@react-navigation/native';
import { SCREEN_HEIGHT, SCREEN_WIDTH } from '../../constants/camera';
import {
  showToastMessage,
  ToastDuration,
  ToastType,
} from '../../services/toast';
import { openSettingsAlert } from '../../utils/permissions';
import useStyles from './styles';

const START_RECORDING_DELAY = 200;
const PAN_GESTURE_HANDLER_FAIL_X = [-SCREEN_WIDTH, SCREEN_WIDTH];
const PAN_GESTURE_HANDLER_ACTIVE_Y = [-2, 2];
const VIDEO_RECORD_DURATION = 60;

function CaptureBtn({
  camera,
  onMediaCaptured,
  minZoom,
  maxZoom,
  cameraZoom,
  flash,
  enabled,
  setIsPressingButton,
  style,
  hasMicrophoneAccessPermission,
  allowVideo,
  countOfAlreadySelectedImages,
  alreadyVideoSelected,
  ...props
}) {
  const styles = useStyles();
  const { colors } = useTheme();
  const pressDownDate = useRef(undefined);
  const isRecording = useRef(false);
  const recordingProgress = useSharedValue(0);

  const [videoTime, setVideoTime] = useState(VIDEO_RECORD_DURATION);
  const videoTimerRef = useRef(videoTime);
  let videoTimerId;

  const startVideoTimer = () => {
    videoTimerId = setInterval(() => {
      videoTimerRef.current -= 1;
      if (videoTimerRef.current < 0) {
        clearInterval(videoTimerId);
      } else {
        setVideoTime(videoTimerRef.current);
      }
    }, 1000);
  };

  const resetVideoTimer = () => {
    clearInterval(videoTimerId);
    videoTimerRef.current = VIDEO_RECORD_DURATION;
    setVideoTime(VIDEO_RECORD_DURATION);
  };

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
  const isPressingButton = useSharedValue(false);

  // #region Camera Capture
  const takePhoto = useCallback(async () => {
    if (countOfAlreadySelectedImages > 9) {
      showToastMessage({
        text: 'Only 10 images can be uploaded for a post',
        type: ToastType.DANGER,
      });
      return;
    }

    try {
      if (camera.current == null) throw new Error('Camera ref is null!');

      console.log('Taking photo...');
      const photo = await camera.current.takePhoto(takePhotoOptions);
      onMediaCaptured(photo, 'photo');
    } catch (e) {
      console.error('Failed to take photo!', e);
    }
  }, [camera, onMediaCaptured, takePhotoOptions, countOfAlreadySelectedImages]);

  const onStoppedRecording = useCallback(() => {
    isRecording.current = false;
    cancelAnimation(recordingProgress);
    resetVideoTimer();
    console.log('stopped recording video!');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recordingProgress]);

  const stopRecording = useCallback(async () => {
    try {
      if (camera.current == null) throw new Error('Camera ref is null!');

      console.log('calling stopRecording()...');
      await camera.current.stopRecording();
      console.log('called stopRecording()!');
    } catch (e) {
      console.error('failed to stop recording!', e);
    }
  }, [camera]);
  const startRecording = useCallback(() => {
    if (alreadyVideoSelected) {
      showToastMessage({
        text: 'Only one video can be uploaded for a post',
        type: ToastType.DANGER,
      });
      return;
    }

    if (!hasMicrophoneAccessPermission) {
      openSettingsAlert(
        'We need your permission to access the microphone of the device',
      );
      return;
    }
    try {
      if (camera.current == null) throw new Error('Camera ref is null!');

      console.log('calling startRecording()...');
      startVideoTimer();
      isRecording.current = true;
      camera.current.startRecording({
        flash,
        onRecordingError: (error) => {
          console.error('Recording failed!', error);
          onStoppedRecording();
        },
        onRecordingFinished: (video) => {
          console.log(`Recording successfully finished! ${video.path}`);
          onMediaCaptured(video, 'video');
          onStoppedRecording();
        },
      });
      // TODO: wait until startRecording returns to actually find out if the recording has successfully started
      console.log('called startRecording()!');
    } catch (e) {
      console.error('failed to start recording!', e, 'camera');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    camera,
    flash,
    onMediaCaptured,
    onStoppedRecording,
    hasMicrophoneAccessPermission,
    alreadyVideoSelected,
  ]);
  // #endregion

  // #region Tap handler
  const tapHandler = useRef();
  const onHandlerStateChanged = useCallback(
    async ({ nativeEvent: event }) => {
      // This is the gesture handler for the circular "shutter" button.
      // Once the finger touches the button (State.BEGAN), a photo is being taken and "capture mode" is entered. (disabled tab bar)
      // Also, we set `pressDownDate` to the time of the press down event, and start a 200ms timeout. If the `pressDownDate` hasn't changed
      // after the 200ms, the user is still holding down the "shutter" button. In that case, we start recording.
      //
      // Once the finger releases the button (State.END/FAILED/CANCELLED), we leave "capture mode" (enable tab bar) and check the `pressDownDate`,
      // if `pressDownDate` was less than 200ms ago, we know that the intention of the user is to take a photo. We check the `takePhotoPromise` if
      // there already is an ongoing (or already resolved) takePhoto() call (remember that we called takePhoto() when the user pressed down), and
      // if yes, use that. If no, we just try calling takePhoto() again
      console.debug(`state: ${Object.keys(State)[event.state]}`);
      switch (event.state) {
        case State.BEGAN: {
          // enter "recording mode"
          recordingProgress.value = 0;
          isPressingButton.value = true;
          const now = new Date();
          pressDownDate.current = now;

          setTimeout(() => {
            if (pressDownDate.current === now) {
              // user is still pressing down after 200ms, so his intention is to create a video
              if (allowVideo) {
                startRecording();
              } else {
                showToastMessage({
                  text: 'Please tap on the capture button once to take a photo',
                  type: ToastType.DANGER,
                  duration: ToastDuration.LONG,
                });
              }
            }
          }, START_RECORDING_DELAY);
          setIsPressingButton(true);
          return;
        }
        case State.END:
        case State.FAILED:
        case State.CANCELLED: {
          // exit "recording mode"
          try {
            if (pressDownDate.current == null)
              throw new Error('PressDownDate ref .current was null!');
            const now = new Date();
            const diff = now.getTime() - pressDownDate.current.getTime();
            pressDownDate.current = undefined;
            if (diff < START_RECORDING_DELAY) {
              // user has released the button within 200ms, so his intention is to take a single picture.
              await takePhoto();
            } else if (allowVideo)
              // user has held the button for more than 200ms, so he has been recording this entire time.
              await stopRecording();
          } finally {
            setTimeout(() => {
              isPressingButton.value = false;
              setIsPressingButton(false);
            }, 500);
          }
          // eslint-disable-next-line no-useless-return
          return;
        }
        default:
          break;
      }
    },
    [
      isPressingButton,
      recordingProgress,
      setIsPressingButton,
      startRecording,
      stopRecording,
      takePhoto,
      allowVideo,
    ],
  );
  // #endregion
  // #region Pan handler
  const panHandler = useRef();
  const onPanGestureEvent = useAnimatedGestureHandler({
    onStart: (event, context) => {
      context.startY = event.absoluteY;
      const yForFullZoom = context.startY * 0.7;
      const offsetYForFullZoom = context.startY - yForFullZoom;

      // extrapolate [0 ... 1] zoom -> [0 ... Y_FOR_FULL_ZOOM] finger position
      context.offsetY = interpolate(
        cameraZoom.value,
        [minZoom, maxZoom],
        [0, offsetYForFullZoom],
        Extrapolate.CLAMP,
      );
    },
    onActive: (event, context) => {
      const offset = context.offsetY ?? 0;
      const startY = context.startY ?? SCREEN_HEIGHT;
      const yForFullZoom = startY * 0.7;

      cameraZoom.value = interpolate(
        event.absoluteY - offset,
        [yForFullZoom, startY],
        [maxZoom, minZoom],
        Extrapolate.CLAMP,
      );
    },
  });
  // #endregion

  const buttonStyle = useAnimatedStyle(() => {
    let scale;
    if (enabled) {
      if (isPressingButton.value) {
        scale = withSpring(1, {
          stiffness: 100,
          damping: 1000,
        });
      } else {
        scale = withSpring(0.9, {
          stiffness: 500,
          damping: 300,
        });
      }
    } else {
      scale = withSpring(0.6, {
        stiffness: 500,
        damping: 300,
      });
    }

    return {
      opacity: withTiming(enabled ? 1 : 0.3, {
        duration: 100,
        easing: Easing.linear,
      }),
      transform: [
        {
          scale,
        },
      ],
    };
  }, [enabled, isPressingButton]);

  useEffect(() => () => clearInterval(videoTimerId), [videoTimerId]);

  useEffect(() => {
    if (allowVideo && !videoTime) {
      stopRecording();
    }
  }, [allowVideo, videoTime, stopRecording]);

  return (
    <TapGestureHandler
      enabled={enabled}
      ref={tapHandler}
      onHandlerStateChange={onHandlerStateChanged}
      shouldCancelWhenOutside={false}
      maxDurationMs={99999999} // <-- this prevents the TapGestureHandler from going to State.FAILED when the user moves his finger outside of the child view (to zoom)
      simultaneousHandlers={panHandler}>
      <Reanimated.View {...props} style={[buttonStyle, style]}>
        <PanGestureHandler
          enabled={enabled}
          ref={panHandler}
          failOffsetX={PAN_GESTURE_HANDLER_FAIL_X}
          activeOffsetY={PAN_GESTURE_HANDLER_ACTIVE_Y}
          onGestureEvent={onPanGestureEvent}
          simultaneousHandlers={tapHandler}>
          <Reanimated.View style={styles.flex}>
            <CountdownCircleTimer
              isPlaying={isRecording.current}
              size={90}
              key={Math.random()}
              strokeWidth={8}
              initialRemainingTime={videoTime}
              rotation="counterclockwise"
              duration={59}
              colors={colors.white}>
              {() =>
                isRecording.current ? <View style={styles.buttonInner} /> : null
              }
            </CountdownCircleTimer>
          </Reanimated.View>
        </PanGestureHandler>
      </Reanimated.View>
    </TapGestureHandler>
  );
}

const CaptureButton = React.memo(CaptureBtn);

export default CaptureButton;
