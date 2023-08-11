import {useNavigation} from '@react-navigation/native';
import React from 'react';
import {View, Text, Button, StyleSheet} from 'react-native';
import storage from '../../services/storage';

function HomeScreen() {
  const navigation = useNavigation();
  const styles = useStyles();
  const token = 'eyrshsiudujf.00000';
  const changeToken = () => storage.set('user.token', token);
  const signout = () => storage.clearAll();
  return (
    <View style={styles.container}>
      <Text>home</Text>
      <Button title="Navigate" onPress={() => navigation.navigate('Profile')} />
      <Button title="Change token" onPress={changeToken} />
      <Button title="Signout" onPress={signout} />
    </View>
  );
}

const useStyles = () => {
  return StyleSheet.create({
    container: {flex: 1, alignItems: 'center', justifyContent: 'center'},
  });
};

export default HomeScreen;
