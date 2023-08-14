import {useNavigation} from '@react-navigation/native';
import React from 'react';
import {View, Text, StyleSheet, Button} from 'react-native';

function ProfileScreen() {
  const styles = useStyles();
  const navigation = useNavigation();
  return (
    <View style={styles.container}>
      <Text>Feed</Text>
      <Button title="Navigate" onPress={() => navigation.navigate('Home')} />
    </View>
  );
}

const useStyles = () => {
  return StyleSheet.create({
    container: {flex: 1, alignItems: 'center', justifyContent: 'center'},
  });
};

export default ProfileScreen;
