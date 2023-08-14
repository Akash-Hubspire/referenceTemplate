import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import TabBar from '../../../components/tabBar';
import HomeScreen from '../../../screens/homeScreen';
import ProfileScreen from '../../../screens/profileScreen';
import FeedScreen from '../../../screens/feedScreen';
import ExploreScreen from '../../../screens/exploreScreen';

const Tab = createBottomTabNavigator();

function TabComp(props) {
  return <TabBar {...props} />;
}

function BottomTabNavigator() {
  return (
    <Tab.Navigator
      tabBar={TabComp}
      screenOptions={{
        lazy: true,
        // headerShown: false,
        // header: //give custom header here
      }}>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Events" component={ExploreScreen} />
      <Tab.Screen name="Create">{() => null}</Tab.Screen>
      <Tab.Screen name="Feed" component={FeedScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
export default BottomTabNavigator;
