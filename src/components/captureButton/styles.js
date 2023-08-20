import { StyleSheet } from 'react-native';
import constants from '../../constants';

function useStyles() {
  const captureBtnSize = constants.cameraDimensions.CAPTURE_BUTTON_SIZE;

  return StyleSheet.create({
    flex: {
      flex: 1,
    },
    buttonInner: {
      backgroundColor: 'red',
      height: captureBtnSize,
      width: captureBtnSize,
      borderRadius: captureBtnSize / 2,
    },
  });
}

export default useStyles;
