import React from 'react';
import {View, Text, StyleSheet} from 'react-native';

function ProfileScreen() {
  const styles = useStyles();
  return (
    <View style={styles.container}>
      <Text>profile</Text>
    </View>
  );
}

const useStyles = () => {
  return StyleSheet.create({
    container: {flex: 1, alignItems: 'center', justifyContent: 'center'},
  });
};

export default ProfileScreen;
