import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import LottieView from 'lottie-react-native';
import theme from '../components/theme';


const SplashScreen = ({ onAnimationFinish }) => {
  return (
    <View style={styles.container}>
      <LottieView
        source={require('../assets/splashAnim.json')}
        autoPlay
        loop={false}
        onAnimationFinish={onAnimationFinish}
        style={{ width: '100%', height: '100%' }}
        onError={console.warn}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
  }
  
});

export default SplashScreen; 