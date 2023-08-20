import React, {
  forwardRef,
  memo,
  useCallback,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import PropTypes from 'prop-types';
import { useMutation } from '@apollo/client';
import Share from 'react-native-share';
import useStyles from './styles';
import RenderSvg from '../renderSvg/renderSvg';
import svg from '../../assets/images/svg';
import EmojiPicker, { emojis } from './emojiPicker';
import graphqlService from '../../services/graphqlService';
import firebase from '../../services/firebase';
import BlockingLoader from '../blockingLoader';

const FooterButtons = forwardRef(
  ({ id, onPressComment, reactionTypeName, firstMedia, username }, ref) => {
    const styles = useStyles();
    const iconHeight = 17;
    const iconWidth = 17;
    const hitslop = { top: 15, bottom: 15, right: 15 };

    const [generatingShareOptions, setGeneratingShareOptions] = useState(false);

    const emojiPickerRef = useRef();

    useImperativeHandle(ref, () => ({
      hideEmojis: emojiPickerRef.current?.hideEmojis,
    }));

    const [createReactions] = useMutation(
      graphqlService.mutations.CREATE_REACTION,
    );

    const [deleteReactions] = useMutation(
      graphqlService.mutations.DELETE_REACTION,
      {
        optimisticResponse: {
          deleteReaction: {
            __typename: 'Response',
            message: 'Success',
          },
        },
        update(cache) {
          cache.modify({
            id: `Feed:${id}`,
            fields: {
              totalReactions(cachedCount) {
                return cachedCount === 0 ? cachedCount : cachedCount - 1;
              },
              myReaction(cachedResult) {
                return {
                  ...cachedResult,
                  isReacted: false,
                  reactionId: null,
                  reactionType: null,
                };
              },
              reactions(cachedResult, { readField }) {
                const newCache = [];
                const myReaction = readField('myReaction');
                cachedResult.forEach((reaction) => {
                  if (reaction.reactionType === myReaction.reactionType) {
                    if (reaction.count > 1) {
                      newCache.push({
                        ...reaction,
                        count: reaction.count - 1,
                      });
                    }
                  } else {
                    newCache.push(reaction);
                  }
                });
                return newCache;
              },
            },
            /* broadcast: false // Include this to prevent automatic query refresh */
          });
        },
        onError: () => {},
      },
    );

    const onDeleteReaction = useCallback(
      async (currentReactionIndex) => {
        const type = emojis[currentReactionIndex].title.toUpperCase();
        await deleteReactions({
          variables: {
            reactionId: `${id}_${type}`,
          },
        });
      },
      [deleteReactions, id],
    );

    const onSetReaction = useCallback(
      (newReactionIndex) => {
        const type = emojis[newReactionIndex].title.toUpperCase();
        setTimeout(async () => {
          await createReactions({
            variables: {
              type: 'FEED',
              reactionId: `${id}_${type}`,
            },
            ignoreResults: true,
            optimisticResponse: {
              createReaction: {
                __typename: 'Rection',
                reactionType: emojis[newReactionIndex]?.title.toUpperCase(),
              },
            },
            onError: () => {},

            update(cache) {
              cache.modify({
                id: `Feed:${id}`,
                fields: {
                  totalReactions(cachedCount, { readField }) {
                    const reactedData = readField('myReaction');
                    return reactedData.isReacted
                      ? cachedCount
                      : cachedCount + 1;
                  },
                  myReaction(cachedResult) {
                    return {
                      ...cachedResult,
                      isReacted: true,
                      reactionId: `${id}-${emojis[
                        newReactionIndex
                      ].title.toUpperCase()}`,
                      reactionType:
                        emojis[newReactionIndex].title.toUpperCase(),
                    };
                  },
                  reactions(cachedResult, { readField }) {
                    const myReaction = readField('myReaction');
                    let indexTobeUpdated = -1;
                    let indexToBeRemoved = -1;
                    // check if the new reaction exist in the cache
                    const reactionExist = cachedResult.filter((item, index) => {
                      /* check if the current reaction item type is equal to the selected reaction type and save the index.
                    Then we have to increment the count of this reaction by one. */
                      if (
                        item.reactionType ===
                        emojis[newReactionIndex].title.toUpperCase()
                      ) {
                        indexTobeUpdated = index;
                      }
                      /* check if the current reaction item type is equal to the my exisiting reaction type and save the index.
                    Then we have to decrement the count of this reaction by one. */
                      if (item.reactionType === myReaction.reactionType) {
                        indexToBeRemoved = index;
                      }
                      return (
                        item.reactionType ===
                        emojis[newReactionIndex].title.toUpperCase()
                      );
                    });
                    if (reactionExist.length > 0) {
                      const existing = [...cachedResult];
                      if (indexToBeRemoved >= 0)
                        existing[indexToBeRemoved].count -= 1;
                      if (indexTobeUpdated >= 0)
                        existing[indexTobeUpdated].count += 1;
                      return existing.filter((item) => item.count > 0);
                    }
                    const existing = [...cachedResult];
                    if (indexToBeRemoved >= 0)
                      existing[indexToBeRemoved].count -= 1;
                    return [
                      ...existing,
                      {
                        __typename: 'Reaction',
                        count: 1,
                        reactionType:
                          emojis[newReactionIndex].title.toUpperCase(),
                      },
                    ].filter((item) => item.count > 0);
                  },
                },
              });
            },
          });
        }, 0);
      },
      [createReactions, id],
    );

    const onPressShare = useCallback(async () => {
      setGeneratingShareOptions(true);

      const dynamicLinkOptions = {
        title: `${username} • Village photos and videos`,
        descriptionText: `${username} shared a post on Village`,
        ...(firstMedia && {
          imageUrl: firstMedia.thumbnailUrl || firstMedia.mediaUrl,
        }),
      };

      const dynamicLink = await firebase.createFeedDynamicLink(
        id,
        dynamicLinkOptions,
      );

      const shareOptions = {
        message: `${dynamicLink}`,
        failOnCancel: false,
      };

      try {
        await Share.open(shareOptions);
        setGeneratingShareOptions(false);
      } catch (e) {
        setGeneratingShareOptions(false);
        // eslint-disable-next-line no-console
        console.log('Share feed error', e);
      }
    }, [id, firstMedia, username]);

    return (
      <View style={styles.footerButtonsContainer}>
        <EmojiPicker
          ref={emojiPickerRef}
          reactionTypeName={reactionTypeName}
          onSetReaction={onSetReaction}
          onDeleteReaction={onDeleteReaction}
          style={styles.reactionsButtonContainer}
        />
        <TouchableOpacity
          style={styles.commentButtonContainer}
          hitSlop={hitslop}
          onPress={onPressComment}>
          <RenderSvg
            xml={svg.commentIcon}
            height={iconHeight}
            width={iconWidth}
          />
          <Text style={styles.iconText}>Comment</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={onPressShare}
          style={styles.shareButtonContainer}
          hitSlop={hitslop}>
          <RenderSvg
            xml={svg.shareIcon}
            height={iconHeight}
            width={iconWidth}
          />
          <Text style={styles.iconText}>Share</Text>
        </TouchableOpacity>
        <BlockingLoader modalVisible={generatingShareOptions} />
      </View>
    );
  },
);

FooterButtons.defaultProps = {
  firstMedia: undefined,
  username: undefined,
};

FooterButtons.propTypes = {
  id: PropTypes.string.isRequired,
  onPressComment: PropTypes.func.isRequired,
  reactionTypeName: PropTypes.string.isRequired,
  firstMedia: PropTypes.shape({
    mediaUrl: PropTypes.string,
    thumbnailUrl: PropTypes.string,
  }),
  username: PropTypes.string,
};
export default memo(FooterButtons);
