import {Pressable, Text, View} from 'react-native';
import React, {useCallback, useEffect, memo} from 'react';
import PropTypes from 'prop-types';
import {useNavigation} from '@react-navigation/native';
import {SharedElement} from 'react-navigation-shared-element';
import FastImage from 'react-native-fast-image';
import useStyles from './styles';
import RenderSvg from '../renderSvg/renderSvg';
import svg from '../../assets/images/svg';
import useResponsiveDimensions from '../../hooks/useResponsiveDimensions';

function FeedCarousalCard({currentItemIdx, media}) {
  const totalItems = media.length;
  const currentItem = media[currentItemIdx];

  const {getResponsiveHeight} = useResponsiveDimensions();
  const styles = useStyles();
  const navigation = useNavigation();

  const {_id, type: mediaType, mediaUrl, thumbnailUrl, dimension} = currentItem;

  const isVideo = mediaType === 'VIDEO';
  const videoIndex = media.findIndex(m => m.type === 'VIDEO'); // used for auto playing video in preview screen when items are scrolled

  const onPress = () => {
    navigation.navigate('FeedMediaPreviewScreen', {
      mediaId: _id,
      media,
      defaultIndex: currentItemIdx,
      shouldAutoPlayVideo: isVideo, // used to auto play video in preview screen if video is selected from feed
      videoIndex,
    });
  };

  const url = isVideo ? thumbnailUrl : mediaUrl;

  const getImageAspectRatio = useCallback(() => {
    let imageAspectRatio;
    if (dimension) {
      const {width, height} = dimension;
      imageAspectRatio = width / height;
    }
    return imageAspectRatio || 1;
  }, [dimension]);

  useEffect(() => {
    if (dimension) {
      getImageAspectRatio();
    }
  }, [dimension, getImageAspectRatio]);

  return (
    <>
      <Pressable onPress={onPress} style={styles.item}>
        {isVideo && (
          <View style={styles.playBtn}>
            <RenderSvg xml={svg.playButton} height={40} width={40} />
          </View>
        )}
        <SharedElement id={`media.${_id}`}>
          <FastImage
            source={{
              uri: url,
            }}
            containerStyle={styles.imageContainerStyle}
            style={[
              styles.image,
              totalItems === 1 && {
                aspectRatio: getImageAspectRatio(),
              },
              totalItems > 1 && {
                height: getResponsiveHeight(230),
              },
            ]}
            resizeMode={totalItems > 1 ? 'cover' : 'contain'}
          />
        </SharedElement>
      </Pressable>
      {totalItems > 1 && (
        <View style={styles.indicatorContainer}>
          <Text style={styles.indicatorTxt}>
            {currentItemIdx + 1}/{totalItems}
          </Text>
        </View>
      )}
    </>
  );
}

FeedCarousalCard.propTypes = {
  currentItemIdx: PropTypes.number.isRequired,
  media: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      type: PropTypes.string.isRequired,
      mediaUrl: PropTypes.string.isRequired,
      thumbnailUrl: PropTypes.string,
      dimension: PropTypes.shape({
        height: PropTypes.number.isRequired,
        width: PropTypes.number.isRequired,
      }).isRequired,
    }),
  ).isRequired,
};
export default memo(FeedCarousalCard);
