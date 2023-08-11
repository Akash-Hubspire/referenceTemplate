import React, {useCallback, useEffect, useState} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import AuthNavigator from './authNavigator';
import HomeNavigator from './homeNavigator';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import storage from '../services/storage';

const Stack = createNativeStackNavigator();

function RootNavigator() {
  const [userLoggedIn, setUserLoggedIn] = useState();

  const token = storage.getString('user.token');
  console.log({token});

  const onChangeStorageValue = useCallback(async newValue => {
    console.log({newValue});
    if (newValue) {
      setUserLoggedIn(true);
      // add firebase logic here in case the token changes
    } else {
      setUserLoggedIn(false);
    }
  }, []);

  useEffect(() => {
    console.log('listener');
    const listener = storage.addOnValueChangedListener(changedKey => {
      const newValue = storage.getString(changedKey);
      console.log({changedKey});
      if (changedKey === 'user.token') {
        onChangeStorageValue(newValue);
      }
    });
    return listener.remove;
  }, [onChangeStorageValue]);

  useEffect(() => {
    console.log('token listener useeffect');
    if (token) {
      setUserLoggedIn(true);
    }
  }, [token]);
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{headerShown: false}}>
          {userLoggedIn ? (
            <Stack.Screen name="HomeNavigator" component={HomeNavigator} />
          ) : (
            <Stack.Screen name="AuthNavigator" component={AuthNavigator} />
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

export default RootNavigator;
