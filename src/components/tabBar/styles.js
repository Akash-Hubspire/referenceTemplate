import {useTheme} from '@react-navigation/native';
import {StyleSheet} from 'react-native';
import useResponsiveDimensions from '../../hooks/useResponsiveDimensions';

function useStyles() {
  const {colors, fonts, sizes} = useTheme();
  const {getResponsiveHeight, getResponsiveWidth} = useResponsiveDimensions();

  return StyleSheet.create({
    tabBar: {
      borderTopWidth: 1,
      borderColor: colors.border,
      flexDirection: 'row',
      paddingTop: getResponsiveHeight(14.4),
      backgroundColor: '#f9f9f9',
      height: getResponsiveHeight(90),
    },
    tabBarItem: {
      flex: 1,
      alignItems: 'center',
    },
    label: {
      fontFamily: fonts.REGULAR_ROBOTO,
      fontSize: sizes.SMALL,
      marginTop: getResponsiveHeight(10),
      color: colors.label,
    },
    labelFocused: {
      fontFamily: fonts.BOLD_ROBOTO,
      fontSize: sizes.SMALL,
      marginTop: getResponsiveHeight(10),
      color: colors.primary,
    },
    optionButtonContainer: {
      alignItems: 'center',
      bottom: getResponsiveHeight(35),
    },
    optionButton: {
      alignItems: 'center',
      justifyContent: 'center',
      height: getResponsiveHeight(56),
      width: getResponsiveWidth(56),
      borderRadius: 28,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.primary,
    },
    optionBtnTitle: {
      fontFamily: fonts.REGULAR_ROBOTO,
      fontSize: sizes.SMALL,
      color: colors.label,
      marginTop: getResponsiveHeight(8),
    },
  });
}

export default useStyles;
