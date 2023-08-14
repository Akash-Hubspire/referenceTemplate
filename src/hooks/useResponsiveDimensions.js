import {useWindowDimensions} from 'react-native';
import {
  responsiveHeight,
  responsiveWidth,
} from 'react-native-responsive-dimensions';

const useResponsiveDimensions = () => {
  const {height, width} = useWindowDimensions();

  const getResponsiveHeight = value => responsiveHeight((value / height) * 100);

  const getResponsiveWidth = value => responsiveWidth((value / width) * 100);

  return {
    getResponsiveHeight,
    getResponsiveWidth,
  };
};

export default useResponsiveDimensions;
