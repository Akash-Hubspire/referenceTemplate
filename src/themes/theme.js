import {DefaultTheme} from '@react-navigation/native';
import {lightThemeColors, darkThemeColors} from './colors';
import Font from './fonts';

console.log(Font);
export const darkTheme = {
  ...DefaultTheme,
  colors: darkThemeColors,
  fonts: Font.fonts,
  sizes: Font.sizes,
};
export const lightTheme = {
  ...DefaultTheme,
  colors: lightThemeColors,
  fonts: Font.fonts,
  sizes: Font.sizes,
};
