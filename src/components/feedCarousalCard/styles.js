import { useTheme } from '@react-navigation/native';
import { StyleSheet } from 'react-native';
import constants from '../../constants';
import useResponsiveDimensions from '../../hooks/useResponsiveDimensions';

function useStyles() {
  const { sizes, colors } = useTheme();
  const { getResponsiveWidth } = useResponsiveDimensions();

  return StyleSheet.create({
    item: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    imageContainerStyle: {
      borderRadius: 8,
    },
    image: {
      width: constants.deviceDimensions.window_width - getResponsiveWidth(32),
      borderRadius: 8,
    },
    playBtn: {
      position: 'absolute',
      zIndex: 10,
    },
    indicatorContainer: {
      position: 'absolute',
      zIndex: 15,
      right: 5,
      top: 5,
      backgroundColor: 'rgba(0,0,0,0.3)',
      padding: 5,
      borderRadius: 15,
      alignItems: 'center',
      justifyContent: 'center',
    },
    indicatorTxt: {
      fontSize: sizes.EXTRA_SMALL,
      color: colors.concreteGrey,
    },
  });
}

export default useStyles;
