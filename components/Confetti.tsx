import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View, useWindowDimensions } from 'react-native';
import { confettiColors, radius } from '../constants/theme';

type ConfettiProps = { visible: boolean; onDone?: () => void };

const pieces = Array.from({ length: 60 }, (_, index) => {
  const circle = Math.random() < 0.2;
  return {
    delay: Math.random() * 150,
    launchDuration: 500 + Math.random() * 200,
    fallDuration: 1300 + Math.random() * 600,
    width: circle ? 7 : 6 + Math.random() * 2,
    height: circle ? 7 : 10 + Math.random() * 6,
    peakX: (Math.random() - 0.5) * 2,
    peakY: 0.25 + Math.random() * 0.3,
    driftX: (Math.random() - 0.5) * 0.4,
    rotation: (Math.random() < 0.5 ? -1 : 1) * (2 + Math.random() * 3) * 360,
    color: confettiColors[Math.floor(Math.random() * confettiColors.length)],
    circle,
    values: {
      x: new Animated.Value(0),
      y: new Animated.Value(0),
      rotation: new Animated.Value(0),
      scaleX: new Animated.Value(1),
      opacity: new Animated.Value(1),
    },
    key: index,
  };
});

export function Confetti({ visible, onDone }: ConfettiProps) {
  const { width, height } = useWindowDimensions();
  const generation = useRef(0);

  useEffect(() => {
    if (!visible) return;
    const activeGeneration = generation.current + 1;
    generation.current = activeGeneration;
    let completedPieces = 0;

    pieces.forEach((piece) => {
      const { x, y, rotation, scaleX, opacity } = piece.values;
      x.setValue(0);
      y.setValue(0);
      rotation.setValue(0);
      scaleX.setValue(1);
      opacity.setValue(1);

      const launchX = piece.peakX * width * 0.5;
      const fallX = launchX + piece.driftX * width;
      const launchY = -piece.peakY * height;
      const fallY = height * 0.55 + piece.height;
      const launchRotation = piece.rotation * 0.35;

      const launch = Animated.parallel([
        Animated.timing(x, { toValue: launchX, duration: piece.launchDuration, easing: Easing.out(Easing.quad), useNativeDriver: true }),
        Animated.timing(y, { toValue: launchY, duration: piece.launchDuration, easing: Easing.out(Easing.quad), useNativeDriver: true }),
        Animated.timing(rotation, { toValue: launchRotation, duration: piece.launchDuration, easing: Easing.out(Easing.quad), useNativeDriver: true }),
        Animated.timing(scaleX, { toValue: 0.2, duration: piece.launchDuration / 2, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      ]);
      const fall = Animated.parallel([
        Animated.timing(x, { toValue: fallX, duration: piece.fallDuration, easing: Easing.in(Easing.quad), useNativeDriver: true }),
        Animated.timing(y, { toValue: fallY, duration: piece.fallDuration, easing: Easing.in(Easing.quad), useNativeDriver: true }),
        Animated.timing(rotation, { toValue: piece.rotation, duration: piece.fallDuration, easing: Easing.in(Easing.quad), useNativeDriver: true }),
        Animated.timing(scaleX, { toValue: 1, duration: piece.fallDuration, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.sequence([
          Animated.delay(piece.fallDuration - 300),
          Animated.timing(opacity, { toValue: 0, duration: 300, useNativeDriver: true }),
        ]),
      ]);

      Animated.sequence([
        Animated.delay(piece.delay),
        launch,
        fall,
      ]).start(({ finished }) => {
        if (!finished || generation.current !== activeGeneration) return;
        completedPieces += 1;
        if (completedPieces === pieces.length) onDone?.();
      });
    });

    return () => {
      generation.current += 1;
      pieces.forEach(({ values }) => Object.values(values).forEach((value) => value.stopAnimation()));
    };
  }, [visible, width, height, onDone]);

  if (!visible) return null;

  return (
    <View pointerEvents="none" style={styles.overlay}>
      {pieces.map((piece) => {
        const rotate = piece.values.rotation.interpolate({ inputRange: [-1800, 1800], outputRange: ['-1800deg', '1800deg'] });
        return (
          <Animated.View
            key={piece.key}
            style={[
              styles.piece,
              { left: width / 2 - piece.width / 2, top: height * 0.6, width: piece.width, height: piece.height, backgroundColor: piece.color, borderRadius: piece.circle ? piece.width / 2 : radius.sm / 2 },
              { opacity: piece.values.opacity, transform: [{ translateX: piece.values.x }, { translateY: piece.values.y }, { rotateZ: rotate }, { scaleX: piece.values.scaleX }] },
            ]}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 100, elevation: 100 },
  piece: { position: 'absolute', top: 0 },
});