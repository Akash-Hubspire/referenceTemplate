import { StyleSheet } from 'react-native';

function useStyles() {
  return StyleSheet.create({
    containerStyle: {
      position: 'absolute',
      bottom: 20,
      flexDirection: 'row',
      alignSelf: 'center',
    },
    dotStyle: {
      width: 10,
      height: 10,
      borderRadius: 5,
      marginHorizontal: 5,
    },
  });
}
export default useStyles;
