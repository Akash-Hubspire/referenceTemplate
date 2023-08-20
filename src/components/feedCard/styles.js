import { useTheme } from '@react-navigation/native';
import { StyleSheet } from 'react-native';
import useResponsiveDimensions from '../../hooks/useResponsiveDimensions';

function useStyles() {
  const { sizes, colors, fonts } = useTheme();
  const { getResponsiveWidth, getResponsiveHeight } = useResponsiveDimensions();
  const letterSpacing = 0.5;
  return StyleSheet.create({
    mainContainer: {
      marginHorizontal: getResponsiveWidth(16),
      marginTop: getResponsiveWidth(24),
    },
    topRow: {
      flex: 1,
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    userContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 6,
      overflow: 'hidden',
    },
    userImage: {
      width: getResponsiveWidth(50),
      height: getResponsiveHeight(50),
      borderRadius: 50,
    },
    userDetails: {
      flex: 1,
      paddingLeft: getResponsiveWidth(15),
    },
    userName: {
      fontSize: sizes.SMALL_HEADING,
      fontFamily: fonts.MEDIUM_ROBOTO,
      letterSpacing,
      fontStyle: 'normal',
      color: colors.black,
    },
    addressContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    userAddress: {
      fontSize: sizes.SMALL,
      fontFamily: fonts.REGULAR_ROBOTO,
      letterSpacing,
      fontStyle: 'normal',
      color: colors.lightGrey,
      maxWidth: '70%',
    },
    postDate: {
      fontSize: sizes.SMALL,
      fontFamily: fonts.REGULAR_ROBOTO,
      letterSpacing,
      fontStyle: 'normal',
      color: colors.lightGrey,
      width: '30%',
      paddingLeft: getResponsiveWidth(5),
    },
    moreContainer: {
      flex: 1,
      justifyContent: 'center',
    },
    dot: {
      width: getResponsiveWidth(2.88),
      height: getResponsiveHeight(2.88),
      backgroundColor: colors.lightText,
      marginHorizontal: getResponsiveWidth(0.96),
    },
    moreView: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-end',
      height: '100%',
      paddingRight: 5,
    },
    carousalContainer: {
      borderRadius: 8,
    },
    reactionContainer: {
      width: '100%',
      justifyContent: 'space-between',
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: getResponsiveHeight(20),
      borderBottomWidth: 0.5,
      borderBottomColor: colors.borderGreyAlpha,
    },
    reactionCount: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-start',
    },
    reactionCountText: {
      fontSize: sizes.SMALL,
      fontFamily: fonts.REGULAR_ROBOTO,
      letterSpacing,
      fontStyle: 'normal',
      color: colors.lightGrey,
      paddingLeft: getResponsiveWidth(4),
    },
    reactions: {
      flexDirection: 'row',
    },
    commentCount: {
      flex: 1,
      alignItems: 'flex-end',
    },
    commentCountButton: {
      alignItems: 'flex-end',
      justifyContent: 'center',
    },
    commentCountText: {
      fontSize: sizes.SMALL,
      fontFamily: fonts.REGULAR_ROBOTO,
      letterSpacing,
      fontStyle: 'normal',
      color: colors.lightGrey,
      paddingLeft: getResponsiveWidth(7),
    },
    footerButtonsContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-end',
      paddingTop: getResponsiveHeight(11.11),
      paddingBottom: getResponsiveHeight(23.84),
      zIndex: 20,
    },
    reactionsButtonContainer: {
      flex: 1,
    },
    commentButtonContainer: {
      flexDirection: 'row',
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    iconText: {
      fontSize: sizes.SMALL,
      fontFamily: fonts.REGULAR_ROBOTO,
      letterSpacing,
      fontStyle: 'normal',
      color: colors.lightGrey,
      paddingLeft: getResponsiveWidth(7),
    },
    shareButtonContainer: {
      flex: 1,
      flexDirection: 'row',
      justifyContent: 'flex-end',
      alignItems: 'center',
    },
    descriptionContainer: {
      marginTop: getResponsiveHeight(12),
    },
    dummyDescription: {
      opacity: 0,
      position: 'absolute',
    },
    description: {
      fontSize: sizes.MEDIUM,
      fontFamily: fonts.REGULAR_ROBOTO,
      letterSpacing,
      fontStyle: 'normal',
      color: colors.label,
      lineHeight: 22,
    },
    taggedUser: {
      fontSize: sizes.MEDIUM,
      fontFamily: fonts.MEDIUM_ROBOTO,
      letterSpacing,
      fontStyle: 'normal',
      color: colors.cyanBlue,
      lineHeight: 22,
    },
    seeMoreText: {
      fontSize: sizes.SMALL,
      letterSpacing,
      fontFamily: fonts.BOLD_ROBOTO,
      fontStyle: 'normal',
      color: colors.lightText,
      marginTop: getResponsiveHeight(12),
    },
    commentContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingBottom: getResponsiveHeight(14), // 24 - 10 (item separator)
    },
    commentBox: {
      backgroundColor: colors.concreteGrey,
      height: getResponsiveHeight(50),
      justifyContent: 'center',
      flex: 1,
      paddingLeft: getResponsiveWidth(16),
      marginLeft: getResponsiveWidth(15),
      borderRadius: 23,
    },
    commentPlaceholderText: {
      fontSize: sizes.MEDIUM,
      fontFamily: fonts.REGULAR_ROBOTO,
      letterSpacing,
      fontStyle: 'normal',
      color: colors.lightText,
    },
    emojiesContainer: {
      position: 'absolute',
      bottom: getResponsiveHeight(126),
      left: getResponsiveWidth(16),
      justifyContent: 'center',
      zIndex: 10,
    },
    floatBox: {
      alignItems: 'center',
    },
    emojiBox: {
      flexDirection: 'row',
      borderRadius: 33,
      backgroundColor: '#fff',
      elevation: 1,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.24,
      shadowRadius: 1,
      paddingVertical: getResponsiveHeight(4),
      paddingHorizontal: getResponsiveWidth(4),
    },
    emojiBackdrop: {
      position: 'absolute',
      backgroundColor: 'transparent',
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
    },
    pageIndicatorContainer: {
      bottom: getResponsiveHeight(16),
    },
    pageIndicator: {
      width: 8,
      height: 8,
      borderRadius: 5,
      marginHorizontal: getResponsiveWidth(1),
    },
  });
}

export default useStyles;
