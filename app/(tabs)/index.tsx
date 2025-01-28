import MainScreen from '@/src/screens/MainScreen';
import React from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';


const App: React.FC = () => {
  return (
    <SafeAreaView style={styles.container} >
      <MainScreen />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;