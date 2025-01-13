import * as Font from 'expo-font';
import { useState, useEffect } from 'react';

const useFonts = async () => {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    const loadFonts = async () => {
      await Font.loadAsync({
        'ProductSans-Bold': require('../assets/fonts/ProductSans-Bold.ttf'),
        'ProductSans-Regular': require('../assets/fonts/ProductSans-Regular.ttf'),
      });
      setFontsLoaded(true);
    };

    loadFonts();
  }, []);

  return fontsLoaded;
};

export default useFonts;
