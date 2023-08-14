import React from 'react';
import {SvgXml} from 'react-native-svg';
import PropTypes from 'prop-types';

function RenderSvg(props) {
  const {xml, width, height} = props;
  return <SvgXml xml={xml} width={width || '100%'} height={height || '100%'} />;
}

RenderSvg.propTypes = {
  xml: PropTypes.string.isRequired,
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
};

export default RenderSvg;
