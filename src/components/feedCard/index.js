import React, { memo, useCallback, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Pressable,
  Alert,
  LayoutAnimation,
  Animated,
} from 'react-native';
import PropTypes from 'prop-types';
import { useMutation, useReactiveVar } from '@apollo/client';
import dayjs from 'dayjs';
import { useNavigation, useTheme } from '@react-navigation/native';
import ParsedText from 'react-native-parsed-text';
import ReAnimated, { FadeIn } from 'react-native-reanimated';
import { SharedElement } from 'react-navigation-shared-element';
import _ from 'lodash';
import reactiveVar from './reactiveVar';
import CustomProfileImage from '../customProfileImage';
import useStyles from './styles';
// import More from '../more';
import FooterButtons from './footerButtons';
import {
  showToastMessage,
  ToastDuration,
  ToastType,
} from '../../services/toast';
import graphqlService from '../../services/graphqlService';
import constants from '../../constants';
import ReportModal from '../modals/reportModal';
import ReportDescriptionModal from '../modals/reportDescriptionModal';
import CommentModal from '../modals/commentModal';
import useResponsiveDimensions from '../../hooks/useResponsiveDimensions';
import FeedCarousalCard from '../feedCarousalCard';
import { showEmojisBackdropVar } from './emojiPicker';
import ScalingDot from '../scalingDot';
import PreferencePicker from '../modals/preferencePicker';

const emojiSize = { height: 14, width: 14 };
const emojiList = [
  {
    emoji: <Image source={constants.images.LOVE_EMOJI} style={emojiSize} />,
    title: 'LIKE',
  },
  {
    emoji: <Image source={constants.images.ANGEL_EMOJI} style={emojiSize} />,
    title: 'HALO',
  },
  {
    emoji: <Image source={constants.images.HAHA_EMOJI} style={emojiSize} />,
    title: 'SMILE',
  },
  {
    emoji: <Image source={constants.images.WINK_EMOJI} style={emojiSize} />,
    title: 'WINK',
  },
  {
    emoji: <Image source={constants.images.KISS_EMOJI} style={emojiSize} />,
    title: 'KISS',
  },
  {
    emoji: <Image source={constants.images.UNAMUSED_EMOJI} style={emojiSize} />,
    title: 'UNAMUSED',
  },
  {
    emoji: <Image source={constants.images.SAD_EMOJI} style={emojiSize} />,
    title: 'SAD',
  },
];

// NOTE- Layout Animations are removed from the app, as this causes video
// to run in background even after unmounting - using Layout animation
// anywhere in the app causes this bug.
// ref - https://github.com/react-native-video/react-native-video/issues/2448#issuecomment-1183367781

function FeedCard({ data, index, currentUser, shouldGoBack = false }) {
  const styles = useStyles();
  const { colors } = useTheme();
  const navigation = useNavigation();
  const { getResponsiveHeight } = useResponsiveDimensions();

  const showEmojisBackdrop = useReactiveVar(showEmojisBackdropVar);

  const reportModalRef = useRef();
  const commentModalRef = useRef();
  const reportDescriptionModalRef = useRef();
  const preferenceModalRef = useRef();
  const footerBtnsRef = useRef();
  const scrollX = useRef(new Animated.Value(0)).current;
  const currentlyVisibleMediaIndex = useRef(0);

  const feedId = data?._id;
  const userId = data?.userId;
  const isUserBlocked = data?.userDetails?.isBlocked;
  const isUserConnected = data?.userDetails?.isConnected;
  const userImage = data?.userDetails?.profileImage;
  const userName = data?.userDetails?.name || 'User';
  const userAddress = data?.locationName || 'Location not provided';
  const userOwnAddress = data?.userDetails?.locationName;
  const feedDescription = data?.description;
  const reactionCount = data?.totalReactions;
  const commentCount = data?.totalComments;
  const taggedUsers = data?.tagedUsers;
  const postCreationDate = data?.createdAt;
  const feedMedia = _.orderBy(data?.medias, 'index');
  const allReactionsArray = data?.reactions;
  const isCreator = userId === currentUser?._id;
  const hitslop = { top: 15, bottom: 15 };

  const [textShown, setTextShown] = useState(false);
  const [lineLength, setLineLength] = useState();

  const month = dayjs(postCreationDate).format('MMM');
  const day = dayjs(postCreationDate).format('D');
  const displayDate = `${month} ${day}`;

  const displayReactionCount =
    reactionCount <= 1
      ? `${reactionCount} Reaction`
      : `${reactionCount} Reactions`;
  const displayCommentCount =
    commentCount === 1 ? `1 Comment` : `${commentCount} Comments`;

  // sorting and modifying to get top 3 non zero reactions
  const allReactionsArrayClone = [...allReactionsArray];
  const sortedReactions = allReactionsArrayClone?.sort((a, b) =>
    a.count > b.count ? -1 : 1,
  );
  const sortedReactionsClone = [...sortedReactions];
  const topThreeReactions = sortedReactionsClone?.splice(0, 3);
  const topNonZeroReactions = topThreeReactions?.filter(
    (item) => item?.count !== 0,
  );

  const onSelect = (val) => {
    if (val === 'Hide') {
      handleHide();
    }
    if (val === 'Report') {
      handleReport();
    }
    if (val === 'Edit') {
      handleEdit();
    }
    if (val === 'Delete') {
      handleDelete();
    }
  };

  const handleEdit = () => {
    const { _id, description, visibility, medias } = data;

    const location = {
      position: {
        longitude: data.location.coordinates[0],
        latitude: data.location.coordinates[1],
      },
      positionDetails: {
        formattedAddress: data.locationName,
        longAddress: data.longAddress,
      },
    };

    const params = {
      _id,
      caption: description,
      taggedList: taggedUsers,
      location,
      visibility,
      medias,
      shouldGoBackToFeedDetailScreen: shouldGoBack,
    };

    navigation.navigate('CreateFeed', params);
  };

  const handleHide = async () => {
    await hideFeed({
      variables: {
        data: {
          contentId: data?._id,
          type: 'FEED',
        },
      },
    });
  };

  const handleReport = () => {
    reportModalRef.current.open();
  };

  const handleDelete = async () => {
    Alert.alert('Are you sure you want to delete this post?', '', [
      {
        text: 'No',
        onPress: () => null,
        style: 'cancel',
      },
      {
        text: 'Yes',
        onPress: async () => {
          await deleteFeed({
            variables: {
              feedId,
            },
          });
        },
      },
    ]);
  };

  const [hideFeed] = useMutation(graphqlService.mutations.HIDE_FEED, {
    onCompleted: () => {
      showToastMessage({
        text: 'The post hidden successfully',
        type: ToastType.SUCCESS,
        duration: ToastDuration.MEDIUM,
      });
    },
    refetchQueries: [
      'ListFeeds',
      'GetMyProfile',
      'GetMyFeeds',
      'ListFeedsByUserId',
    ],
    awaitRefetchQueries: true,
    onError: (err) => {
      showToastMessage({
        text: err.message,
        type: ToastType.DANGER,
        duration: ToastDuration.MEDIUM,
      });
    },
  });

  const [deleteFeed] = useMutation(graphqlService.mutations.DELETE_FEED, {
    onCompleted: () => {
      showToastMessage({
        text: 'Post has been successfully deleted',
        type: ToastType.SUCCESS,
        duration: ToastDuration.MEDIUM,
      });
    },
    refetchQueries: ['ListFeeds', 'GetMyProfile', 'GetMyFeeds'],
    awaitRefetchQueries: true,
    onError: (err) => {
      showToastMessage({
        text: err.message,
        type: ToastType.DANGER,
        duration: ToastDuration.MEDIUM,
      });
    },
  });

  const handleCommentPress = () => {
    closeEmojis();
    commentModalRef.current?.open();
  };
  const handlePreferencePress = () => {
    closeEmojis();
    preferenceModalRef.current?.open();
  };

  const handleReportTypePress = (reportObj) => {
    reactiveVar.selectedReport(reportObj);
    reportModalRef.current?.close();
    reportDescriptionModalRef.current?.open();
  };

  const toggleNumberOfLines = () => {
    LayoutAnimation.configureNext({
      duration: 200,
      update: {
        type: LayoutAnimation.Types.easeInEaseOut,
        springDamping: 0.7,
      },
    });
    setTextShown(!textShown);
  };

  const onTextLayout = (e) => {
    setLineLength(e.nativeEvent.lines.length);
  };

  const closeEmojis = () => {
    footerBtnsRef.current.hideEmojis();
    showEmojisBackdropVar(false);
  };

  const onPressCard = () => {
    navigation.navigate('FeedDetail', {
      paramFeedData: {
        ...data,
        initialScrollIndex: currentlyVisibleMediaIndex.current,
        lineLength,
      },
    });
  };

  const onPressUser = () => {
    if (!isCreator) {
      navigation.navigate('OtherUserProfileScreen', {
        userId,
        userImage,
        userName,
        userOwnAddress,
        isUserBlocked,
        isUserConnected,
      });
    } else {
      navigation.navigate('ProfileScreen');
    }
  };

  const onViewableItemsChanged = useCallback(({ viewableItems }) => {
    currentlyVisibleMediaIndex.current = viewableItems[0]?.index;
  }, []);

  return (
    <ReAnimated.View
      entering={FadeIn.delay(index * 20)}
      style={styles.mainContainer}>
      <Pressable onPress={onPressCard}>
        <View style={styles.topRow}>
          <Pressable style={styles.userContainer} onPress={onPressUser}>
            <CustomProfileImage style={styles.userImage} imageUrl={userImage} />
            <View style={styles.userDetails}>
              <Text style={styles.userName} numberOfLines={1}>
                {userName}
              </Text>
              <View style={styles.addressContainer}>
                <Text style={styles.userAddress} numberOfLines={1}>
                  {`${userAddress} .`}
                </Text>
                <Text style={styles.postDate} numberOfLines={1}>
                  {displayDate}
                </Text>
              </View>
            </View>
          </Pressable>
          <View style={styles.moreContainer}>
            <Pressable style={styles.moreView} onPress={handlePreferencePress}>
              <View style={styles.dot} />
              <View style={styles.dot} />
              <View style={styles.dot} />
            </Pressable>
            {/* <More onSelect={onSelect} isCreator={isCreator} /> */}
          </View>
        </View>
        <ReAnimated.View
          entering={FadeIn.delay(150)}
          style={styles.descriptionContainer}>
          <Text onTextLayout={onTextLayout} style={styles.dummyDescription}>
            {feedDescription?.trim()}
          </Text>
          {!!lineLength && (
            <ParsedText
              numberOfLines={textShown ? undefined : 2}
              style={styles.text}
              parse={[
                {
                  pattern: /#(\w+)/,
                  style: [styles.description, { color: colors.cyanBlue }],
                },
              ]}
              childrenProps={{ allowFontScaling: false }}>
              {feedDescription?.trim()}
            </ParsedText>
          )}

          {lineLength > 2 ? (
            <Pressable style={styles.seeMoreButton}>
              <Text onPress={toggleNumberOfLines} style={styles.seeMoreText}>
                {textShown ? 'See less' : 'See more'}
              </Text>
            </Pressable>
          ) : null}

          {taggedUsers.length
            ? taggedUsers.map((user, idx) => (
                // used index as flashlist recommends - https://shopify.github.io/flash-list/docs/fundamentals/performant-components#remove-key-prop
                <Text style={styles.taggedUser} key={idx}>
                  @{user?.name}{' '}
                </Text>
              ))
            : null}
        </ReAnimated.View>

        <SharedElement id={`feed.media.${feedId}`}>
          <View>
            <Animated.FlatList
              data={feedMedia}
              horizontal
              pagingEnabled
              onViewableItemsChanged={onViewableItemsChanged}
              onScroll={Animated.event(
                [{ nativeEvent: { contentOffset: { x: scrollX } } }],
                {
                  useNativeDriver: false,
                },
              )}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={[
                styles.carousalContainer,
                {
                  marginTop:
                    (feedDescription?.length || taggedUsers?.length) &&
                    feedMedia.length
                      ? getResponsiveHeight(12)
                      : getResponsiveHeight(1),
                },
              ]}
              renderItem={({ index: idx }) => (
                <FeedCarousalCard
                  key={idx}
                  currentItemIdx={idx}
                  media={feedMedia}
                />
              )}
            />

            {feedMedia?.length > 1 && (
              <ScalingDot
                data={feedMedia}
                inActiveDotColor="grey"
                activeDotColor={colors.primary}
                scrollX={scrollX}
                inActiveDotOpacity={0.5}
                dotStyle={styles.pageIndicator}
                containerStyle={styles.pageIndicatorContainer}
              />
            )}
          </View>
        </SharedElement>
        {reactionCount || commentCount ? (
          <View style={styles.reactionContainer}>
            {reactionCount ? (
              <View style={styles.reactionCount}>
                {reactionCount ? (
                  <View style={styles.reactions}>
                    {topNonZeroReactions?.map((reaction, idx) => {
                      const reactionName = reaction?.reactionType;
                      const emojiForReaction = emojiList?.find(
                        (emoji) => emoji.title === reactionName,
                      );
                      return (
                        <View style={{ right: idx * 5 }} key={idx}>
                          {emojiForReaction?.emoji}
                        </View>
                      );
                    })}
                  </View>
                ) : null}
                <Text style={styles.reactionCountText}>
                  {displayReactionCount}
                </Text>
              </View>
            ) : null}
            {commentCount ? (
              <View style={styles.commentCount}>
                <Pressable
                  onPress={handleCommentPress}
                  style={styles.commentCountButton}
                  hitSlop={hitslop}>
                  <Text style={styles.commentCountText}>
                    {displayCommentCount}
                  </Text>
                </Pressable>
              </View>
            ) : null}
          </View>
        ) : null}
      </Pressable>

      <FooterButtons
        ref={footerBtnsRef}
        id={data._id}
        onPressComment={handleCommentPress}
        reactionTypeName={
          data?.myReaction.isReacted ? data.myReaction.reactionType : 'null'
        }
        username={userName}
        firstMedia={feedMedia[0]}
      />

      <View style={styles.commentContainer}>
        <CustomProfileImage
          style={styles.userImage}
          imageUrl={currentUser?.profileImage}
        />
        <TouchableOpacity
          style={styles.commentBox}
          onPress={handleCommentPress}>
          <Text style={styles.commentPlaceholderText}>Add a comment...</Text>
        </TouchableOpacity>
      </View>

      <ReportModal
        ref={reportModalRef}
        feedId={feedId}
        onPress={handleReportTypePress}
      />
      <ReportDescriptionModal ref={reportDescriptionModalRef} feedId={feedId} />
      <CommentModal ref={commentModalRef} feedId={feedId} />
      <PreferencePicker
        ref={preferenceModalRef}
        type={isCreator ? 'self' : 'other'}
        preferenceFun={onSelect}
      />

      {showEmojisBackdrop && (
        <Pressable onPressIn={closeEmojis} style={styles.emojiBackdrop} />
      )}
    </ReAnimated.View>
  );
}
FeedCard.defaultProps = {
  shouldGoBack: false,
};

FeedCard.propTypes = {
  data: PropTypes.oneOfType([PropTypes.object]).isRequired,
  shouldGoBack: PropTypes.bool,
  index: PropTypes.number.isRequired,
  currentUser: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    profileImage: PropTypes.node.isRequired,
  }).isRequired,
};

export default memo(FeedCard);
