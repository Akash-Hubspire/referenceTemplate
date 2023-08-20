import React, {useCallback, useEffect, useRef, useState} from 'react';
import {useNavigation, useTheme} from '@react-navigation/native';
import PropTypes from 'prop-types';
import {SharedElement} from 'react-navigation-shared-element';
import {SafeAreaView} from 'react-native-safe-area-context';
import Animated from 'react-native-reanimated';
import FastImage from 'react-native-fast-image';
import VideoPlayer from 'react-native-media-console';
import {FlatList} from 'react-native';
import useStyles from './styles';
import {
  showToastMessage,
  ToastDuration,
  ToastType,
} from '../../../services/toast';
import MediaPreviewNavHeader from '../../../components/navigation/mediaPreviewNavHeader';
import Zoomable from '../../../components/zoomable';
import constants from '../../../constants';

const AnimatedSharedElement = Animated.createAnimatedComponent(SharedElement);

function FeedMediaPreviewScreen({route}) {
  const styles = useStyles();
  const navigation = useNavigation();
  const {colors} = useTheme();

  const {mediaId, media, defaultIndex, videoIndex, shouldAutoPlayVideo} =
    route.params;

  const parsedFeedMedia = JSON.parse(JSON.stringify(media));

  const totalItems = media.length;

  const [isVideoPaused, setIsVideoPaused] = useState(!shouldAutoPlayVideo);
  const [showHeader, setShowHeader] = useState(true);
  const [showList, setShowList] = useState(false);

  const listRef = useRef();
  const videoRef = useRef();
  const currentIndexRef = useRef(defaultIndex);

  const onVideoError = () => {
    showToastMessage({
      text: 'Oops something went wrong!',
      type: ToastType.DANGER,
      duration: ToastDuration.MEDIUM,
    });
  };

  const goBackToPreviousScreen = useCallback(() => {
    if (!isVideoPaused) {
      setIsVideoPaused(true);
    }
    setShowList(false); // to fix issues related to shared transition
    navigation.goBack();
  }, [isVideoPaused, navigation]);

  const showHeaderIfNotShowing = () => {
    if (!showHeader) {
      setShowHeader(true);
    }
  };

  const onPlay = () => {
    setIsVideoPaused(false);
  };

  const onPause = () => {
    setIsVideoPaused(true);
  };

  const snapToNext = useCallback(() => {
    if (!showList) {
      return;
    }
    if (currentIndexRef.current + 1 !== totalItems) {
      listRef.current.scrollToIndex({
        index: currentIndexRef.current + 1,
        animated: true,
      });
      currentIndexRef.current += 1;
      showHeaderIfNotShowing();

      if (currentIndexRef.current + 1 === videoIndex) {
        setIsVideoPaused(false);
      } else {
        setIsVideoPaused(true);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalItems, showList]);

  const snapToPrevious = useCallback(() => {
    if (!showList) {
      return;
    }
    if (!currentIndexRef.current) {
      goBackToPreviousScreen();
      return;
    }
    listRef.current.scrollToIndex({
      index: currentIndexRef.current - 1,
      animated: true,
    });
    currentIndexRef.current -= 1;
    showHeaderIfNotShowing();

    if (currentIndexRef.current + 1 === videoIndex) {
      setIsVideoPaused(false);
    } else {
      setIsVideoPaused(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [goBackToPreviousScreen, showList]);

  const getItemLayout = useCallback(
    (data, index) => ({
      length: constants.deviceDimensions.window_width,
      offset: constants.deviceDimensions.window_width * index,
      index,
    }),
    [],
  );

  useEffect(() => {
    if (showHeader) {
      setTimeout(() => {
        setShowHeader(false);
      }, 2000);
    }
  }, [showHeader]);

  useEffect(() => {
    setTimeout(() => {
      setShowList(true);
    }, 600);
  }, []);

  const renderItem = ({item}) => {
    const {thumbnailUrl, mediaUrl} = item;
    if (thumbnailUrl) {
      return (
        <Zoomable
          onTap={showHeaderIfNotShowing}
          snapToNext={snapToNext}
          snapToPrevious={snapToPrevious}
          style={{
            height: constants.deviceDimensions.window_height,
            width: constants.deviceDimensions.window_width,
            backgroundColor: colors.black,
          }}>
          <AnimatedSharedElement id={`media.${mediaId}`}>
            <VideoPlayer
              videoRef={videoRef}
              source={{
                uri: mediaUrl,
              }}
              disableBack
              style={styles.video}
              onBack={snapToPrevious}
              onPlay={onPlay}
              onPause={onPause}
              paused={isVideoPaused}
              poster={thumbnailUrl}
              onError={onVideoError}
              toggleResizeModeOnFullscreen
            />
          </AnimatedSharedElement>
        </Zoomable>
      );
    }
    return (
      <Zoomable
        onTap={showHeaderIfNotShowing}
        snapToNext={snapToNext}
        snapToPrevious={snapToPrevious}
        style={{
          height: constants.deviceDimensions.screen_height,
          width: constants.deviceDimensions.screen_width,
          backgroundColor: colors.black,
        }}>
        <AnimatedSharedElement id={`media.${mediaId}`}>
          <FastImage
            key={mediaUrl}
            resizeMode="contain"
            source={{
              uri: mediaUrl,
              priority: 'high',
              cache: 'immutable',
            }}
            style={styles.image}
          />
        </AnimatedSharedElement>
      </Zoomable>
    );
  };

  // To fix issues related to shared element transition. Initially we show the selected media only.
  if (!showList) {
    const initialItem = parsedFeedMedia[defaultIndex];
    return renderItem({item: initialItem});
  }

  return (
    <>
      <SafeAreaView edges={['bottom']} style={styles.mainContainer}>
        <FlatList
          ref={listRef}
          data={parsedFeedMedia}
          horizontal
          initialScrollIndex={defaultIndex}
          getItemLayout={getItemLayout}
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          keyExtractor={item => item._id}
          renderItem={renderItem}
        />
      </SafeAreaView>

      <MediaPreviewNavHeader
        title="Go back"
        onPressbackBtn={goBackToPreviousScreen}
        currentItemIndex={currentIndexRef.current}
        totalItems={totalItems}
        showHeader={showHeader}
      />
    </>
  );
}

FeedMediaPreviewScreen.propTypes = {
  route: PropTypes.shape({
    params: PropTypes.shape({
      mediaId: PropTypes.string.isRequired,
      media: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
      defaultIndex: PropTypes.number.isRequired,
      shouldAutoPlayVideo: PropTypes.bool.isRequired,
      videoIndex: PropTypes.number.isRequired,
    }),
  }).isRequired,
};

export default FeedMediaPreviewScreen;
