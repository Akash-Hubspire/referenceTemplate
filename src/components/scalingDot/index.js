/* eslint-disable react/prop-types */
import React from 'react';
import { Animated, View } from 'react-native';
import constants from '../../constants';
import useResponsiveDimensions from '../../hooks/useResponsiveDimensions';
import useStyles from './styles';

function ScalingDot({
  scrollX,
  data,
  dotStyle,
  containerStyle,
  inActiveDotOpacity,
  inActiveDotColor,
  activeDotScale,
  activeDotColor,
}) {
  const styles = useStyles();
  const { getResponsiveWidth } = useResponsiveDimensions();

  const defaultProps = {
    inActiveDotColor: inActiveDotColor || '#347af0',
    activeDotColor: activeDotColor || '#347af0',
    animationType: 'scale',
    inActiveDotOpacity: inActiveDotOpacity || 0.5,
    activeDotScale: activeDotScale || 1.4,
  };

  return (
    <View style={[styles.containerStyle, containerStyle]}>
      {data.map((_, index) => {
        const inputRange = [
          (index - 1) *
            (constants.deviceDimensions.window_width - getResponsiveWidth(32)),
          index *
            (constants.deviceDimensions.window_width - getResponsiveWidth(32)),
          (index + 1) *
            (constants.deviceDimensions.window_width - getResponsiveWidth(32)),
        ];

        const colour = scrollX.interpolate({
          inputRange,
          outputRange: [
            defaultProps.inActiveDotColor,
            defaultProps.activeDotColor,
            defaultProps.inActiveDotColor,
          ],
          extrapolate: 'clamp',
        });
        const opacity = scrollX.interpolate({
          inputRange,
          outputRange: [
            defaultProps.inActiveDotOpacity,
            1,
            defaultProps.inActiveDotOpacity,
          ],
          extrapolate: 'clamp',
        });
        const scale = scrollX.interpolate({
          inputRange,
          outputRange: [1, defaultProps.activeDotScale, 1],
          extrapolate: 'clamp',
        });

        return (
          <Animated.View
            key={`dot-${index}`}
            style={[
              styles.dotStyle,
              { opacity },
              { transform: [{ scale }] },
              dotStyle,
              { backgroundColor: colour },
            ]}
          />
        );
      })}
    </View>
  );
}

export default ScalingDot;
