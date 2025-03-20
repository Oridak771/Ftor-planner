import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import LottieView from 'lottie-react-native';
import theme from '../components/theme';

const { width, height } = Dimensions.get('window');

const SplashScreen = ({ onAnimationFinish }) => {
  return (
    <View style={styles.container}>
      <LottieView
        source={require('../assets/splashScreen.json')}
        autoPlay
        loop={false}
        onAnimationFinish={onAnimationFinish}
        style={styles.animation}
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
  },
  animation: {
    width: width * 0.8, // 80% of screen width
    height: height * 0.4, // 40% of screen height
  },
});

export default SplashScreen; 