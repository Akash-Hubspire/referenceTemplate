import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import HomeScreen from '../../screens/homeScreen';
import ProfileScreen from '../../screens/profileScreen';
import {createDrawerNavigator} from '@react-navigation/drawer';
import BottomTabNavigator from './bottomTabNavigator';

const HomeStack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();

const HomeStackNavigator = () => {
  return (
    <HomeStack.Navigator screenOptions={{headerShown: false}}>
      <HomeStack.Screen name="BottomTabs" component={BottomTabNavigator} />
      <HomeStack.Screen name="Home" component={HomeScreen} />
      <HomeStack.Screen name="Profile" component={ProfileScreen} />
    </HomeStack.Navigator>
  );
};

function HomeNavigator() {
  return (
    <Drawer.Navigator
      screenOptions={{
        // header: // give custom header
        headerShown: false,
      }}
      //   drawerContent={DrawerContent}
    >
      <Drawer.Screen name="HomeStack" component={HomeStackNavigator} />
    </Drawer.Navigator>
  );
}

export default HomeNavigator;
