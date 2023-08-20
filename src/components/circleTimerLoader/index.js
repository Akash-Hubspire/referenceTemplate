import React from 'react';
import { CountdownCircleTimer } from 'react-native-countdown-circle-timer';
import PropTypes from 'prop-types';
import useStyles from './styles';

function CircleTimerLoader({ isPlaying }) {
  const styles = useStyles();
  return (
    <CountdownCircleTimer
      isPlaying={isPlaying}
      duration={60}
      colors={['#d9d9d9']}
      trailColor="#000705"
      size={styles.loaderSize}
      strokeWidth={2}
    />
  );
}
CircleTimerLoader.propTypes = {
  isPlaying: PropTypes.bool.isRequired,
};
export default CircleTimerLoader;
