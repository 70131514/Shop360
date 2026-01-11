import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Viro3DObject,
  ViroARScene,
  ViroAmbientLight,
  ViroMaterials,
  ViroNode,
  ViroQuad,
} from '@viro-community/react-viro';

const DEFAULT_POS: [number, number, number] = [0, 0, 0];

type ModelMetrics = {
  scale: [number, number, number];
  localOffset: [number, number, number];
  // Approx. "footprint" size in meters after scale is applied (max of X/Z).
  footprint: number;
};

const DEFAULT_METRICS: ModelMetrics = {
  // "Real size" mode: assume the model file's units are already meters.
  // (If a model was authored in cm/mm and exported without unit conversion, it will look too large;
  // that should be fixed in the asset pipeline, not in AR code.)
  scale: [1, 1, 1],
  localOffset: [0, 0, 0],
  footprint: 0.4,
};

ViroMaterials.createMaterials({
  Shop360PlacementReticleReady: {
    lightingModel: 'Constant',
    diffuseColor: '#2EE59D88',
  },
  Shop360PlacementReticleSearching: {
    lightingModel: 'Constant',
    diffuseColor: '#FFFFFF55',
  },
});

type Props = {
  arSceneNavigator?: {
    viroAppProps?: {
      modelUrl?: string;
      modelPosition?: [number, number, number];
      modelRotationY?: number;
      modelScaleMultiplier?: number;
      onModelPositionChange?: (pos: [number, number, number]) => void;
      onPlacementError?: (message: string) => void;
      onTrackingUpdate?: (state: unknown, reason: unknown) => void;
      onPlaneSelected?: (planeUpdateMap: unknown) => void;
      resetPlaneSelectionKey?: number;
      placeRequestKey?: number;
    };
  };
};

function getModelSource(modelUrl?: string) {
  if (modelUrl && typeof modelUrl === 'string' && modelUrl.trim().length > 0) {
    return { uri: modelUrl.trim() };
  }
  // No fallback - models must be fetched from Firebase Storage
  return null;
}

export const ModelPlacementARScene = (props: Props) => {
  const modelUrl: string | undefined = props?.arSceneNavigator?.viroAppProps?.modelUrl;
  const modelPosition: [number, number, number] =
    props?.arSceneNavigator?.viroAppProps?.modelPosition ?? DEFAULT_POS;
  const modelRotationY: number =
    Number(props?.arSceneNavigator?.viroAppProps?.modelRotationY ?? 0) || 0;
  const modelScaleMultiplier: number = Math.max(
    0.25,
    Math.min(4, Number(props?.arSceneNavigator?.viroAppProps?.modelScaleMultiplier ?? 1) || 1),
  );

  const resetPlaneSelectionKey = props?.arSceneNavigator?.viroAppProps?.resetPlaneSelectionKey ?? 0;
  const placeRequestKey = props?.arSceneNavigator?.viroAppProps?.placeRequestKey ?? 0;

  // Lock plane detection after a plane is selected to reduce jitter from plane refinement.
  const [planeLocked, setPlaneLocked] = useState<boolean>(false);
  const lastResetKeyRef = useRef<number>(resetPlaneSelectionKey);
  const arSceneRef = useRef<any>(null);
  const modelRef = useRef<any>(null);
  const placedNodeRef = useRef<any>(null);

  const source = useMemo(() => getModelSource(modelUrl), [modelUrl]);

  // Keep a stable "last known" position for smoothing drag updates.
  const lastPosRef = useRef<[number, number, number]>(modelPosition);
  useEffect(() => {
    lastPosRef.current = modelPosition;
  }, [modelPosition]);

  // Continuous hit-test preview (Figment-style) for better placement feedback.
  const [previewPos, setPreviewPos] = useState<[number, number, number] | null>(null);
  const [previewStable, setPreviewStable] = useState<boolean>(false);
  const previewHistoryRef = useRef<Array<[number, number, number]>>([]);
  const lastPreviewUpdateMsRef = useRef<number>(0);
  const lastDragUpdateMsRef = useRef<number>(0);

  // Model-agnostic corrections based on bounding box (pivot/centering/grounding + a sane default physical size).
  const [modelMetrics, setModelMetrics] = useState<ModelMetrics>(DEFAULT_METRICS);
  const modelMetricsRef = useRef<ModelMetrics>(DEFAULT_METRICS);

  useEffect(() => {
    // Reset metrics when switching models; will be refined onLoadEnd via bounding box.
    setModelMetrics(DEFAULT_METRICS);
    modelMetricsRef.current = DEFAULT_METRICS;
  }, [modelUrl]);

  useEffect(() => {
    if (lastResetKeyRef.current === resetPlaneSelectionKey) {
      return;
    }
    lastResetKeyRef.current = resetPlaneSelectionKey;

    setPlaneLocked(false);
    setPreviewPos(null);
    setPreviewStable(false);
    previewHistoryRef.current = [];
  }, [resetPlaneSelectionKey]);

  const lastPlaceKeyRef = useRef<number>(placeRequestKey);
  useEffect(() => {
    if (lastPlaceKeyRef.current === placeRequestKey) {
      return;
    }
    lastPlaceKeyRef.current = placeRequestKey;

    const run = async () => {
      try {
        const scene = arSceneRef.current;
        if (!scene?.getCameraOrientationAsync || !scene?.performARHitTestWithRay) {
          return;
        }

        // Place button is the single source of truth: require a surface from the reticle.
        if (!previewPos) {
          props?.arSceneNavigator?.viroAppProps?.onPlacementError?.(
            'No surface found yet. Move your camera to scan until the reticle appears.',
          );
          return;
        }

        // Optional: require stability for large models (prevents “placed but wrong” far away).
        if (!previewStable && modelMetricsRef.current.footprint > 0.6) {
          props?.arSceneNavigator?.viroAppProps?.onPlacementError?.(
            'Surface not stable yet. Keep scanning until the reticle stabilizes, then press Place.',
          );
          return;
        }

        lastPosRef.current = previewPos;
        props?.arSceneNavigator?.viroAppProps?.onModelPositionChange?.(previewPos);
        setPlaneLocked(true);
      } catch {
        // ignore placement failures; user can try again
      }
    };

    run();
  }, [placeRequestKey, previewPos, previewStable, props]);

  const pickBestHit = useCallback((results: any, cameraPos?: [number, number, number]) => {
    if (!Array.isArray(results) || results.length === 0) {
      return null;
    }
    // If the model is "large", don't allow FeaturePoint fallback; it causes visible scale/pose errors.
    const allowFeaturePoints = modelMetricsRef.current.footprint <= 0.6;
    const preferred = allowFeaturePoints
      ? ['ExistingPlaneUsingExtent', 'ExistingPlane', 'FeaturePoint']
      : ['ExistingPlaneUsingExtent', 'ExistingPlane'];
    for (const pref of preferred) {
      for (const r of results) {
        if (r?.type !== pref) {
          continue;
        }
        const p = r?.transform?.position;
        if (!Array.isArray(p) || p.length < 3) {
          continue;
        }
        const hitPos: [number, number, number] = [Number(p[0]), Number(p[1]), Number(p[2])];
        if (hitPos.some((n) => !Number.isFinite(n))) {
          continue;
        }
        if (cameraPos) {
          const d = Math.sqrt(
            (hitPos[0] - cameraPos[0]) ** 2 +
              (hitPos[1] - cameraPos[1]) ** 2 +
              (hitPos[2] - cameraPos[2]) ** 2,
          );
          const maxDist = Math.max(
            3,
            Math.min(10, 10 * (0.8 / Math.max(modelMetricsRef.current.footprint, 0.1))),
          );
          if (d < 0.2 || d > maxDist) {
            continue;
          }
        }
        return hitPos;
      }
    }
    return null;
  }, []);

  const onCameraARHitTest = useCallback(
    (event: any) => {
      if (planeLocked) {
        return;
      }
      const now = Date.now();
      // Throttle to keep React renders cheap.
      if (now - lastPreviewUpdateMsRef.current < 120) {
        return;
      }
      lastPreviewUpdateMsRef.current = now;

      const camPosArr = event?.cameraOrientation?.position;
      const camPos: [number, number, number] | undefined =
        Array.isArray(camPosArr) && camPosArr.length >= 3
          ? [Number(camPosArr[0]), Number(camPosArr[1]), Number(camPosArr[2])]
          : undefined;

      const best = pickBestHit(event?.hitTestResults, camPos);
      setPreviewPos(best);

      if (!best) {
        setPreviewStable(false);
        previewHistoryRef.current = [];
        return;
      }

      const history = previewHistoryRef.current;
      history.push(best);
      if (history.length > 8) {
        history.shift();
      }

      // Simple stability heuristic: last N positions don't drift more than ~3cm.
      const first = history[0];
      const maxDrift = history.reduce((acc, p) => {
        const d = Math.sqrt(
          (p[0] - first[0]) ** 2 + (p[1] - first[1]) ** 2 + (p[2] - first[2]) ** 2,
        );
        return Math.max(acc, d);
      }, 0);

      setPreviewStable(history.length >= 5 && maxDrift < 0.03);
    },
    [pickBestHit, planeLocked],
  );

  const onDrag = useCallback(
    (dragToPos: any) => {
      if (!planeLocked) {
        return;
      }
      if (!Array.isArray(dragToPos) || dragToPos.length < 3) {
        return;
      }
      const nextRaw: [number, number, number] = [
        Number(dragToPos[0]),
        Number(dragToPos[1]),
        Number(dragToPos[2]),
      ];
      if (nextRaw.some((n) => !Number.isFinite(n))) {
        return;
      }

      // Smooth the movement to avoid "teleporting" when Viro emits large deltas.
      const prev = lastPosRef.current;
      const alpha = 0.35;
      const nextSmoothed: [number, number, number] = [
        prev[0] + (nextRaw[0] - prev[0]) * alpha,
        prev[1] + (nextRaw[1] - prev[1]) * alpha,
        prev[2] + (nextRaw[2] - prev[2]) * alpha,
      ];
      lastPosRef.current = nextSmoothed;

      // Update native position immediately for smooth drag, but only sync React state occasionally
      // to avoid fighting Viro's internal drag calculations (common cause of "jumping/zooming").
      placedNodeRef.current?.setNativeProps?.({ position: nextSmoothed });
      const now = Date.now();
      if (now - lastDragUpdateMsRef.current > 60) {
        lastDragUpdateMsRef.current = now;
        props?.arSceneNavigator?.viroAppProps?.onModelPositionChange?.(nextSmoothed);
      }
    },
    [planeLocked, props],
  );

  const applyBoundingBoxCorrections = useCallback(async () => {
    try {
      const box = await modelRef.current?.getBoundingBoxAsync?.();
      let min: any = null;
      let max: any = null;
      if (Array.isArray(box?.min)) {
        min = box.min;
      } else if (box?.minX !== undefined) {
        min = [box.minX, box.minY, box.minZ];
      }

      if (Array.isArray(box?.max)) {
        max = box.max;
      } else if (box?.maxX !== undefined) {
        max = [box.maxX, box.maxY, box.maxZ];
      }

      if (!Array.isArray(min) || !Array.isArray(max) || min.length < 3 || max.length < 3) {
        return;
      }

      const minX = Number(min[0]);
      const minY = Number(min[1]);
      const minZ = Number(min[2]);
      const maxX = Number(max[0]);
      const maxY = Number(max[1]);
      const maxZ = Number(max[2]);
      if (![minX, minY, minZ, maxX, maxY, maxZ].every((n) => Number.isFinite(n))) {
        return;
      }

      // Center object on X/Z and sit on floor (Y=0 in parent node local space).
      const centerX = (minX + maxX) / 2;
      const centerZ = (minZ + maxZ) / 2;

      // Real-size mode: keep original model scale, just compute its physical footprint for gating placement.
      const sizeX = Math.max(0.0001, maxX - minX);
      const sizeZ = Math.max(0.0001, maxZ - minZ);
      const footprint = Math.max(sizeX, sizeZ);

      const next: ModelMetrics = {
        scale: [1, 1, 1],
        localOffset: [-centerX, -minY, -centerZ],
        footprint,
      };
      modelMetricsRef.current = next;
      setModelMetrics(next);
    } catch {
      // ignore
    }
  }, []);

  // Don't render model if no valid source URL from Firebase Storage
  if (!source) {
    return (
      <ViroARScene
        ref={arSceneRef}
        onTrackingUpdated={(state: unknown, reason: unknown) => {
          props?.arSceneNavigator?.viroAppProps?.onTrackingUpdate?.(state, reason);
        }}
        anchorDetectionTypes={[]}
      >
        <ViroAmbientLight color="#ffffff" intensity={600} />
      </ViroARScene>
    );
  }

  return (
    <ViroARScene
      ref={arSceneRef}
      onTrackingUpdated={(state: unknown, reason: unknown) => {
        props?.arSceneNavigator?.viroAppProps?.onTrackingUpdate?.(state, reason);
      }}
      // Detect both horizontal + vertical while scanning; disable once placed to reduce churn.
      anchorDetectionTypes={planeLocked ? [] : ['PlanesHorizontal', 'PlanesVertical']}
      onCameraARHitTest={onCameraARHitTest}
      // Helps users see that AR is actively mapping surfaces (doesn't change detection quality, just visibility).
      displayPointCloud={{ maxPoints: 1200 }}
    >
      <ViroAmbientLight color="#ffffff" intensity={600} />

      {/* Placement reticle: shows where hit-test is landing. */}
      {!planeLocked && previewPos && (
        <ViroNode position={previewPos}>
          <ViroQuad
            rotation={[-90, 0, 0]}
            width={0.08}
            height={0.08}
            materials={
              previewStable ? 'Shop360PlacementReticleReady' : 'Shop360PlacementReticleSearching'
            }
          />
        </ViroNode>
      )}

      {planeLocked && (
        // Placed mode: render in world space (not parented to a plane anchor) to reduce drift.
        <ViroNode
          ref={placedNodeRef}
          position={modelPosition}
          dragType="FixedToPlane"
          dragPlane={{
            // Keep the drag plane horizontal at the model's current Y.
            planePoint: [0, modelPosition[1], 0],
            planeNormal: [0, 1, 0],
            maxDistance: 20,
          }}
          onDrag={onDrag}
        >
          <Viro3DObject
            ref={modelRef}
            source={source}
            type="GLB"
            position={modelMetrics.localOffset}
            scale={[
              modelMetrics.scale[0] * modelScaleMultiplier,
              modelMetrics.scale[1] * modelScaleMultiplier,
              modelMetrics.scale[2] * modelScaleMultiplier,
            ]}
            rotation={[0, modelRotationY, 0]}
            onLoadEnd={applyBoundingBoxCorrections}
          />
        </ViroNode>
      )}
    </ViroARScene>
  );
};
