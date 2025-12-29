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
      anchorDetectionTypes={['PlanesHorizontal']}
    >
      <ViroAmbientLight color="#ffffff" intensity={600} />

      {/* Detect a plane and place the text on it */}
      <ViroARPlaneSelector alignment="Horizontal" maxPlanes={3} minHeight={0.2} minWidth={0.2}>
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


