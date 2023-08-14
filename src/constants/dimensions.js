import {Dimensions, StatusBar} from 'react-native';
import deviceTypes from './deviceTypes';

const deviceDimensions = {
  window_width: Dimensions.get('window').width,
  window_height:
    Dimensions.get('window').height -
    (deviceTypes.isAndroid ? StatusBar.currentHeight : 0),
  screen_height: Dimensions.get('screen').height,
  screen_width: Dimensions.get('screen').width,
};

export default deviceDimensions;
