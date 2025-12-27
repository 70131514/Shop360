import React, { useMemo } from 'react';
import {
  Viro3DObject,
  ViroARPlaneSelector,
  ViroARScene,
  ViroAmbientLight,
} from '@viro-community/react-viro';

export type ARModelKey = 'shoes' | 'hat';

type Props = {
  arSceneNavigator?: {
    viroAppProps?: {
      modelKey?: ARModelKey;
      modelPosition?: [number, number, number];
      onTrackingUpdate?: (state: unknown, reason: unknown) => void;
    };
  };
};

function getModelSource(modelKey: ARModelKey) {
  switch (modelKey) {
    case 'hat':
      return require('../models/hat.glb');
    case 'shoes':
    default:
      return require('../models/shoes.glb');
  }
}

export const ModelPlacementARScene = (props: Props) => {
  const modelKey: ARModelKey = props?.arSceneNavigator?.viroAppProps?.modelKey ?? 'shoes';
  const modelPosition: [number, number, number] = props?.arSceneNavigator?.viroAppProps
    ?.modelPosition ?? [0, 0, 0];

  const source = useMemo(() => getModelSource(modelKey), [modelKey]);

  return (
    <ViroARScene
      onTrackingUpdated={(state: unknown, reason: unknown) => {
        props?.arSceneNavigator?.viroAppProps?.onTrackingUpdate?.(state, reason);
      }}
      displayPointCloud={{ maxPoints: 1000 }}
    >
      <ViroAmbientLight color="#ffffff" intensity={600} />

      {/* Detect only horizontal planes (floors/tables) and place the model on it */}
      <ViroARPlaneSelector minHeight={0.1} minWidth={0.1} alignment="Horizontal">
        <Viro3DObject
          source={source}
          type="GLB"
          position={modelPosition}
          scale={[0.15, 0.15, 0.15]}
          rotation={[0, 0, 0]}
        />
      </ViroARPlaneSelector>
    </ViroARScene>
  );
};
