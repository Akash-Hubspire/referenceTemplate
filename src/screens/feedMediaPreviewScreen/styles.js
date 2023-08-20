import { StyleSheet } from 'react-native';
import { useTheme } from '@react-navigation/native';

function useStyles() {
  const { colors } = useTheme();
  return StyleSheet.create({
    mainContainer: {
      flex: 1,
      backgroundColor: colors.black,
      justifyContent: 'center',
      alignItems: 'center',
    },
    video: {
      width: '100%',
      height: '100%',
    },
    image: {
      width: '100%',
      height: '100%',
    },
  });
}
export default useStyles;
