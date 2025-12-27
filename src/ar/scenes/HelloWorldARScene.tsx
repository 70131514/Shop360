import React from 'react';
import { StyleSheet } from 'react-native';
import {
  ViroARPlaneSelector,
  ViroARScene,
  ViroAmbientLight,
  ViroText,
} from '@viro-community/react-viro';

type Props = {
  arSceneNavigator?: {
    viroAppProps?: {
      onTrackingUpdate?: (state: any, reason: any) => void;
    };
  };
};

export const HelloWorldARScene = (props: Props) => {
  return (
    <ViroARScene
      onTrackingUpdated={(state, reason) => {
        props?.arSceneNavigator?.viroAppProps?.onTrackingUpdate?.(state, reason);
      }}
      displayPointCloud={{ maxPoints: 1000 }}
    >
      <ViroAmbientLight color="#ffffff" intensity={600} />

      {/* Detect a plane and place the text on it */}
      <ViroARPlaneSelector minHeight={0.1} minWidth={0.1}>
        <ViroText
          text="HELLO WORLD"
          position={[0, 0, 0]}
          scale={[0.2, 0.2, 0.2]}
          style={styles.text}
        />
      </ViroARPlaneSelector>
    </ViroARScene>
  );
};

const styles = StyleSheet.create({
  text: {
    fontSize: 60,
    color: '#FFFFFF',
    textAlign: 'center',
    fontWeight: '800',
  },
});


