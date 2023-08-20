import React, {
  useMemo,
  useCallback,
  useState,
  forwardRef,
  useImperativeHandle,
  useEffect,
  memo,
} from 'react';
import { Text, Image, View, StyleSheet, ViewStyle } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  FadeInDown,
  FadeOutDown,
  runOnJS,
  useSharedValue,
} from 'react-native-reanimated';
import PropTypes from 'prop-types';
import { useTheme } from '@react-navigation/native';
import { makeVar, useReactiveVar } from '@apollo/client';
import constants from '../../constants';
import RenderSvg from '../renderSvg/renderSvg';
import svg from '../../assets/images/svg';
import useResponsiveDimensions from '../../hooks/useResponsiveDimensions';
import EmojiItem from '../emojis/emojiItem';

const emojiSize = { height: 24, width: 24 };

const emojiRed = 'rgb(243, 62, 88)';

const emojiYellow = 'rgb(247, 177, 37)';

export const emojis = [
  {
    emoji: <Image source={constants.images.LOVE_EMOJI} style={emojiSize} />,
    title: 'Like',
    color: emojiRed,
  },
  {
    emoji: <Image source={constants.images.ANGEL_EMOJI} style={emojiSize} />,
    title: 'Halo',
    color: emojiYellow,
  },
  {
    emoji: <Image source={constants.images.HAHA_EMOJI} style={emojiSize} />,
    title: 'Smile',
    color: emojiYellow,
  },
  {
    emoji: <Image source={constants.images.WINK_EMOJI} style={emojiSize} />,
    title: 'Wink',
    color: emojiYellow,
  },
  {
    emoji: <Image source={constants.images.KISS_EMOJI} style={emojiSize} />,
    title: 'Kiss',
    color: emojiYellow,
  },
  {
    emoji: <Image source={constants.images.UNAMUSED_EMOJI} style={emojiSize} />,
    title: 'Unamused',
    color: emojiYellow,
  },
  {
    emoji: <Image source={constants.images.SAD_EMOJI} style={emojiSize} />,
    title: 'Sad',
    color: emojiYellow,
  },
];

export const showEmojisBackdropVar = makeVar(false);

const EmojiPicker = forwardRef(
  ({ style, onSetReaction, onDeleteReaction, reactionTypeName }, ref) => {
    const { colors } = useTheme();
    const styles = useStyles();

    const showEmojisBackdrop = useReactiveVar(showEmojisBackdropVar);

    const myReactionindex = emojis.findIndex(
      (y) => y.title.toUpperCase() === reactionTypeName,
    );

    const [show, setShow] = useState(false);
    const [current, setCurrent] = useState(null);

    const isDragging = useSharedValue(false);

    useImperativeHandle(ref, () => ({
      hideEmojis,
    }));

    const hideEmojis = useCallback(() => {
      setShow(false);
      showEmojisBackdropVar(false);
    }, []);

    const onLongPressBtn = useCallback(() => {
      setShow(true);
      showEmojisBackdropVar(true);
    }, []);

    const onEndPan = useCallback(() => {
      if (myReactionindex === current) {
        return;
      }
      onSetReaction(current);
    }, [myReactionindex, current, onSetReaction]);

    const gesture = useMemo(() => {
      const getNewEmojiIndex = (e) => {
        'worklet';

        let newIndex = current;

        if (e.x > 0 && e.x < 50) {
          newIndex = 0;
        }
        if (e.x > 50 && e.x < 90) {
          newIndex = 1;
        }
        if (e.x > 90 && e.x < 130) {
          newIndex = 2;
        }
        if (e.x > 130 && e.x < 170) {
          newIndex = 3;
        }
        if (e.x > 170 && e.x < 210) {
          newIndex = 4;
        }
        if (e.x > 210 && e.x < 260) {
          newIndex = 5;
        }
        if (e.x > 260) {
          newIndex = 6;
        }
        return newIndex;
      };

      const tap = Gesture.Tap()
        .onStart((e) => {
          const newEmojiIndex = getNewEmojiIndex(e);

          if (show) {
            // select emoji from list
            if (current !== newEmojiIndex) {
              runOnJS(setCurrent)(newEmojiIndex);
              runOnJS(onSetReaction)(newEmojiIndex);
            }
          } else if (current !== null) {
            // clear already selected emoji when we click on emoji button
            runOnJS(setCurrent)(null);
            runOnJS(onDeleteReaction)(current);
          } else if (current !== 0) {
            // select heart emoji when we click one time on emoji button
            runOnJS(setCurrent)(0);
            runOnJS(onSetReaction)(0);
          }
        })
        .onEnd(() => {
          runOnJS(hideEmojis)();
        })
        .numberOfTaps(1);

      const longPress = Gesture.LongPress()
        .onStart(() => {
          isDragging.value = true;
          runOnJS(onLongPressBtn)();
        })
        .minDuration(250);

      const pan = Gesture.Pan()
        .manualActivation(true)
        .onTouchesMove((_e, state) => {
          if (isDragging.value) {
            state.activate();
          } else {
            state.fail();
          }
        })
        .shouldCancelWhenOutside(true)
        .hitSlop(
          !show
            ? undefined
            : {
                left: 10,
                right: 200,
                bottom: 50,
                top: 100,
              },
        )

        .onUpdate((e) => {
          if (!show) {
            return;
          }
          const newEmojiIndex = getNewEmojiIndex(e);
          runOnJS(setCurrent)(newEmojiIndex);
        })
        .onEnd(() => {
          if (!show) {
            return;
          }
          runOnJS(hideEmojis)();
          runOnJS(onEndPan)();
        })
        .onFinalize(() => {
          isDragging.value = false;
        })
        .simultaneousWithExternalGesture(longPress);
      return Gesture.Race(pan, longPress, tap);
    }, [
      show,
      onSetReaction,
      current,
      onDeleteReaction,
      onEndPan,
      hideEmojis,
      onLongPressBtn,
      isDragging,
    ]);

    useEffect(() => {
      setCurrent(myReactionindex === -1 ? null : myReactionindex);
    }, [myReactionindex]);

    useEffect(() => {
      if (!showEmojisBackdrop) setShow(false);
    }, [showEmojisBackdrop]);

    return (
      <GestureDetector gesture={gesture}>
        <View collapsable={false} style={[styles.button, style]}>
          {show && (
            <Animated.View
              entering={FadeInDown.duration(150)}
              exiting={FadeOutDown.duration(150)}
              style={styles.emojiesContainer}>
              <View style={styles.emojiBox}>
                {emojis.map((item, index) => (
                  <EmojiItem
                    key={index}
                    data={item}
                    index={index}
                    scaled={current === index}
                  />
                ))}
              </View>
            </Animated.View>
          )}

          {current === null ? (
            <RenderSvg xml={svg.loveEmojiOutline} height={24} width={24} />
          ) : (
            emojis[current].emoji
          )}
          <Text
            style={[
              styles.text,
              {
                color: current === null ? colors.black : emojis[current].color,
              },
            ]}>
            {emojis[current === null ? 0 : current].title}
          </Text>
        </View>
      </GestureDetector>
    );
  },
);

EmojiPicker.defaultProps = {
  style: undefined,
  reactionTypeName: undefined,
  onSetReaction: undefined,
  onDeleteReaction: undefined,
};

EmojiPicker.propTypes = {
  style: PropTypes.shape(ViewStyle),
  reactionTypeName: PropTypes.string,
  onSetReaction: PropTypes.func,
  onDeleteReaction: PropTypes.func,
};

export default memo(EmojiPicker);

function useStyles() {
  const { sizes, colors, fonts } = useTheme();
  const { getResponsiveWidth, getResponsiveHeight } = useResponsiveDimensions();
  return StyleSheet.create({
    button: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    text: {
      fontSize: sizes.SMALL,
      fontFamily: fonts.REGULAR_ROBOTO,
      fontStyle: 'normal',
      color: colors.lightGrey,
      paddingLeft: getResponsiveWidth(7),
    },
    emojiesContainer: {
      position: 'absolute',
      bottom: getResponsiveHeight(35),
      left: getResponsiveWidth(0),
      justifyContent: 'center',
    },
    emojiBox: {
      flexDirection: 'row',
      borderRadius: 33,
      backgroundColor: colors.white,
      elevation: 1,
      shadowColor: colors.black,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.24,
      shadowRadius: 1,
      paddingVertical: getResponsiveHeight(4),
      paddingHorizontal: getResponsiveWidth(4),
    },
  });
}
