import { TouchableWithoutFeedback } from 'react-native';
import React, { useEffect } from 'react';
import Animated, {
  interpolateColor,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  useDerivedValue,
} from 'react-native-reanimated';
import PropTypes from 'prop-types';
import useStyles from './styles';

function CustomSwitch({ activeColor, inActiveColor, onValueChange, value }) {
  const styles = useStyles();
  const switchTranslate = useSharedValue(0);
  const progress = useDerivedValue(() => withTiming(value ? 22 : 0));

  useEffect(() => {
    if (value) {
      switchTranslate.value = 26;
    } else {
      switchTranslate.value = 4;
    }
  }, [value, switchTranslate]);

  const customSpringStyles = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: withSpring(switchTranslate.value, {
          mass: 1,
          damping: 15,
          stiffness: 120,
          overshootClamping: false,
          restSpeedThreshold: 0.001,
          restDisplacementThreshold: 0.001,
        }),
      },
    ],
  }));

  const backgroundColorStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      progress.value,
      [0, 22],
      [inActiveColor, activeColor],
    );
    return {
      backgroundColor,
    };
  });

  return (
    <TouchableWithoutFeedback onPress={onValueChange}>
      <Animated.View style={[styles.container, backgroundColorStyle]}>
        <Animated.View style={[styles.circle, customSpringStyles]} />
      </Animated.View>
    </TouchableWithoutFeedback>
  );
}

CustomSwitch.propTypes = {
  activeColor: PropTypes.string.isRequired,
  inActiveColor: PropTypes.string.isRequired,
  onValueChange: PropTypes.func.isRequired,
  value: PropTypes.bool.isRequired,
};

export default CustomSwitch;
