import { useState } from 'react';
import { useSharedValue, withSpring } from 'react-native-reanimated';

interface ScrollEvent {
  nativeEvent: {
    contentOffset: {
      y: number;
    };
    velocity?: {
      y: number;
    };
  };
}

export const useTabBarVisibility = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const translateY = useSharedValue(0);

  const handleScroll = (event: ScrollEvent) => {
    const currentScrollY = event.nativeEvent.contentOffset.y;
    const velocity = event.nativeEvent.velocity?.y || 0;
    const scrollDirection = currentScrollY > lastScrollY ? 'down' : 'up';
    
    // Só esconde/mostra se o scroll for significativo
    if (Math.abs(currentScrollY - lastScrollY) > 5) {
      if (scrollDirection === 'down' && currentScrollY > 100 && velocity > 0.5) {
        // Escondendo a tab bar
        if (isVisible) {
          setIsVisible(false);
          translateY.value = withSpring(100, {
            damping: 20,
            stiffness: 200,
          });
        }
      } else if (scrollDirection === 'up' && velocity < -0.5) {
        // Mostrando a tab bar
        if (!isVisible) {
          setIsVisible(true);
          translateY.value = withSpring(0, {
            damping: 20,
            stiffness: 200,
          });
        }
      }
    }
    
    setLastScrollY(currentScrollY);
  };

  const showTabBar = () => {
    setIsVisible(true);
    translateY.value = withSpring(0, {
      damping: 20,
      stiffness: 200,
    });
  };

  const hideTabBar = () => {
    setIsVisible(false);
    translateY.value = withSpring(100, {
      damping: 20,
      stiffness: 200,
    });
  };

  return {
    isVisible,
    translateY,
    handleScroll,
    showTabBar,
    hideTabBar,
  };
}; 