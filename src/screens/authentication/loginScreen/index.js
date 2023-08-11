import React from 'react';
import {View, Text, Button, StyleSheet} from 'react-native';
import storage from '../../../services/storage';

function LoginScreen() {
  const styles = useStyles();
  const token = 'eyrshsiudujf.tyykk';
  const handleLogin = () => storage.set('user.token', token);
  return (
    <View style={styles.container}>
      <Text>Login Screen</Text>
      <Button title="Login" onPress={handleLogin} />
    </View>
  );
}

const useStyles = () => {
  return StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
};
export default LoginScreen;
