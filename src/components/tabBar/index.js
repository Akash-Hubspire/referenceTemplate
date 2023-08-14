/* eslint react/prop-types: 0 */
import React from 'react';
import {View, Text, TouchableOpacity, Pressable} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import Animated, {FadeOutDown} from 'react-native-reanimated';
import svg from '../../assets/images/svg';
import RenderSvg from '../renderSvg/renderSvg';
import useStyles from './styles';
import useKeyboard from '../../hooks/useKeyboard';

const plusIconSize = 19.2;
const peopleIconSize = 24;

function OptionsButton({currentIndex, stateData}) {
  const styles = useStyles();
  const navigation = useNavigation();
  const iconSize = currentIndex === 4 ? peopleIconSize : plusIconSize;

  // consider only for public groups, for future cases with more screens, refactor this logic
  const isPublicGroup = stateData?.state?.history?.length === 2;

  const getOptionBtnCenterIcon = index => {
    switch (index) {
      case 0:
        return svg.plusWhiteSvg;
      case 1:
        return svg.plusWhiteSvg;
      case 3:
        return svg.plusWhiteSvg;
      case 4:
        return svg.peopleSvg;
      default:
        return svg.plusSvg;
    }
  };

  const getOptionbtnTitle = index => {
    switch (index) {
      case 0:
        return 'Post';
      case 1:
        return 'Add Event';
      case 3:
        return 'Add Listing';
      case 4:
        return 'More';
      default:
        return 'colors.white';
    }
  };

  const onPressOptionBtn = index => {
    switch (index) {
      case 0:
        navigation.navigate('CreateFeed');
        break;
      case 1:
        navigation.navigate('CreateEvent');
        break;
      case 3:
        navigation.navigate('CreateMarketPosting', {shouldGoBack: false});
        break;
      case 4:
        if (!isPublicGroup) {
          navigation.navigate('CreateConversation', {update: 'NEWGROUP'});
        } else {
          navigation.navigate('CreateConversation', {update: 'ADDGROUP'});
        }
        break;
      default:
    }
  };

  return (
    <View style={styles.optionButtonContainer}>
      <Pressable
        onPress={() => onPressOptionBtn(currentIndex)}
        style={styles.optionButton}>
        <RenderSvg
          xml={getOptionBtnCenterIcon(currentIndex)}
          width={iconSize}
          height={iconSize}
        />
      </Pressable>
      <Text style={styles.optionBtnTitle}>
        {getOptionbtnTitle(currentIndex)}
      </Text>
    </View>
  );
}

function TabBar({state, descriptors, navigation}) {
  const styles = useStyles();
  const {isKeyboardOpen} = useKeyboard();
  const iconSize = 24;

  const getIcon = (index, isFocused) => {
    switch (index) {
      case 0:
        return isFocused ? svg.homeFocusedSvg : svg.homeUnfocusedSvg;
      case 1:
        return isFocused ? svg.eventsFocusedSvg : svg.eventsUnfocusedSvg;
      case 3:
        return isFocused ? svg.marketFocusedSvg : svg.marketUnfocusedSvg;
      case 4:
        return isFocused ? svg.messagesFocusedSvg : svg.messagesUnfocusedSvg;
      default:
        return svg.homeFocusedSvg;
    }
  };

  return (
    !isKeyboardOpen && (
      <Animated.View exiting={FadeOutDown.duration(200)} style={styles.tabBar}>
        {state.routes.map((route, index) => {
          const {options} = descriptors[route.key];
          const label =
            options.tabBarLabel !== undefined
              ? options.tabBarLabel
              : options.title !== undefined
              ? options.title
              : route.name;

          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: 'tabLongPress',
              target: route.key,
            });
          };

          if (index === 2) {
            return (
              <OptionsButton
                key={`key-${route.key}`}
                currentIndex={state.index}
                stateData={state.routes[state.index]}
              />
            );
          }

          return (
            <TouchableOpacity
              key={`key-${route.key}`}
              accessibilityRole="button"
              accessibilityState={isFocused ? {selected: true} : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              testID={options.tabBarTestID}
              onPress={onPress}
              onLongPress={onLongPress}
              activeOpacity={0.8}
              style={styles.tabBarItem}>
              <RenderSvg
                xml={getIcon(index, isFocused)}
                height={iconSize}
                width={iconSize}
              />
              <Text style={isFocused ? styles.labelFocused : styles.label}>
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </Animated.View>
    )
  );
}
export default TabBar;
