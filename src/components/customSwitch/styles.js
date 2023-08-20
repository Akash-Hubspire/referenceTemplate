import { StyleSheet } from 'react-native';
import { useTheme } from '@react-navigation/native';
import useResponsiveDimensions from '../../hooks/useResponsiveDimensions';

function useStyles() {
  const { colors } = useTheme();
  const { getResponsiveWidth, getResponsiveHeight } = useResponsiveDimensions();

  return StyleSheet.create({
    container: {
      width: getResponsiveWidth(50),
      height: getResponsiveHeight(28),
      borderRadius: 30,
      justifyContent: 'center',
      backgroundColor: colors.primary,
    },
    circle: {
      width: getResponsiveWidth(20),
      height: getResponsiveHeight(20),
      borderRadius: 30,
      backgroundColor: colors.white,
    },
  });
}
export default useStyles;
