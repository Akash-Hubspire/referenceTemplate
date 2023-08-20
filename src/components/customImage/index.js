import React from 'react';
import FastImage from 'react-native-fast-image';
import PropTypes from 'prop-types';

import constants from '../../constants';

const PLACEHOLDER = constants.images.SPLASH_LOGO;
function CustomImage({ imageUrl, style, tintColor, resizeMode }) {
  return (
    <FastImage
      key={imageUrl}
      style={style}
      tintColor={tintColor}
      defaultSource={PLACEHOLDER}
      resizeMode={resizeMode}
      source={
        imageUrl
          ? { uri: imageUrl, priority: 'high', cache: 'immutable' }
          : PLACEHOLDER
      }
    />
  );
}

function compareImage(prevProps, currProps) {
  return prevProps.imageUrl === currProps.imageUrl;
}

CustomImage.defaultProps = {
  tintColor: null,
  resizeMode: 'cover',
};

CustomImage.propTypes = {
  tintColor: PropTypes.string,
  imageUrl: PropTypes.string.isRequired,
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]).isRequired,
  resizeMode: PropTypes.string,
};
export default React.memo(CustomImage, compareImage);
