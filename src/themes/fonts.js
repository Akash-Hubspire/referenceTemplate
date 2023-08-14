import {responsiveFontSize} from 'react-native-responsive-dimensions';
import constants from '../constants';

const height = constants.deviceDimensions.window_height;

const getResponsiveFontSize = value =>
  responsiveFontSize((value / height) * 100);

const sizes = {
  EXTRA_LARGE: getResponsiveFontSize(30),
  HEADER_LARGE: getResponsiveFontSize(28),
  HEADER_TITLE: getResponsiveFontSize(20),
  SMALL_HEADING: getResponsiveFontSize(18),
  LARGE: getResponsiveFontSize(17),
  REGULAR: getResponsiveFontSize(16),
  MEDIUM: getResponsiveFontSize(14),
  SMALL: getResponsiveFontSize(12),
  EXTRA_SMALL: getResponsiveFontSize(10),
  TINY: getResponsiveFontSize(8.5),
};

const fonts = {
  BOLD_SF_PRO: constants.deviceTypes.isAndroid
    ? 'SF-Pro-Display-Bold'
    : 'SFProDisplay-Bold',

  BOLD_ROBOTO: constants.deviceTypes.isAndroid ? 'Roboto-Bold' : 'Roboto-Bold',

  MEDIUM_SF_PRO: constants.deviceTypes.isAndroid
    ? 'SF-Pro-Display-Medium'
    : 'SFProDisplay-Medium',

  MEDIUM_ROBOTO: constants.deviceTypes.isAndroid
    ? 'Roboto-Medium'
    : 'Roboto-Medium',

  REGULAR_SF_PRO: constants.deviceTypes.isAndroid
    ? 'SF-Pro-Display-Regular'
    : 'SFProDisplay-Regular',

  REGULAR_ROBOTO: constants.deviceTypes.isAndroid
    ? 'Roboto-Regular'
    : 'Roboto-Regular',

  ITALIC: constants.deviceTypes.isAndroid ? 'ABeeZee-Italic' : 'ABeeZee-Italic',
};

export default {fonts, sizes};
