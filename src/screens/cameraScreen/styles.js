import { useTheme } from '@react-navigation/native';
import { StyleSheet } from 'react-native';
import constants from '../../constants';

function useStyles() {
  const BUTTON_SIZE = 40;
  const { colors } = useTheme();

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    captureButton: {
      position: 'absolute',
      alignSelf: 'center',
      bottom: constants.cameraDimensions.SAFE_AREA_PADDING.paddingBottom,
    },
    button: {
      marginBottom: constants.cameraDimensions.CONTENT_SPACING,
      width: BUTTON_SIZE,
      height: BUTTON_SIZE,
      borderRadius: BUTTON_SIZE / 2,
      backgroundColor: 'rgba(140, 140, 140, 0.3)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    backBtn: {
      position: 'absolute',
      left: constants.cameraDimensions.SAFE_AREA_PADDING.paddingLeft,
      top: constants.cameraDimensions.SAFE_AREA_PADDING.paddingTop,
    },
    rightButtonRow: {
      position: 'absolute',
      right: constants.cameraDimensions.SAFE_AREA_PADDING.paddingRight,
      top: constants.cameraDimensions.SAFE_AREA_PADDING.paddingTop,
    },
    text: {
      color: 'white',
      fontSize: 11,
      fontWeight: 'bold',
      textAlign: 'center',
    },
    cameraReverse: {
      height: 30,
      width: 30,
    },
    flashIcon: {
      height: 30,
      width: 30,
    },
  });
}

export default useStyles;
