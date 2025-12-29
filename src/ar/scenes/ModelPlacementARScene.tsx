import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Viro3DObject,
  ViroARPlaneSelector,
  ViroARScene,
  ViroAmbientLight,
  ViroMaterials,
  ViroNode,
  ViroQuad,
} from '@viro-community/react-viro';

export type ARModelKey = 'shoes' | 'hat' | 'sofa';

const DEFAULT_POS: [number, number, number] = [0, 0, 0];

type ModelMetrics = {
  scale: [number, number, number];
  localOffset: [number, number, number];
  // Approx. "footprint" size in meters after scale is applied (max of X/Z).
  footprint: number;
};

const DEFAULT_METRICS: ModelMetrics = {
  scale: [0.15, 0.15, 0.15],
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
      modelKey?: ARModelKey;
      modelPosition?: [number, number, number];
      onModelPositionChange?: (pos: [number, number, number]) => void;
      onTrackingUpdate?: (state: unknown, reason: unknown) => void;
      onPlaneSelected?: (planeUpdateMap: unknown) => void;
      resetPlaneSelectionKey?: number;
      placeRequestKey?: number;
    };
  };
};

function getModelSource(modelKey: ARModelKey) {
  switch (modelKey) {
    case 'hat':
      return require('../models/hat.glb');
    case 'sofa':
      return require('../models/sofa.glb');
    case 'shoes':
    default:
      return require('../models/shoes.glb');
  }
}

export const ModelPlacementARScene = (props: Props) => {
  const modelKey: ARModelKey = props?.arSceneNavigator?.viroAppProps?.modelKey ?? 'shoes';
  const modelPosition: [number, number, number] =
    props?.arSceneNavigator?.viroAppProps?.modelPosition ?? DEFAULT_POS;

  const resetPlaneSelectionKey = props?.arSceneNavigator?.viroAppProps?.resetPlaneSelectionKey ?? 0;
  const placeRequestKey = props?.arSceneNavigator?.viroAppProps?.placeRequestKey ?? 0;

  // Lock plane detection after a plane is selected to reduce jitter from plane refinement.
  const [planeLocked, setPlaneLocked] = useState<boolean>(false);
  const lastResetKeyRef = useRef<number>(resetPlaneSelectionKey);
  const planeSelectorRef = useRef<any>(null);
  const arSceneRef = useRef<any>(null);
  const modelRef = useRef<any>(null);
  const placedNodeRef = useRef<any>(null);

  const source = useMemo(() => getModelSource(modelKey), [modelKey]);

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
  }, [modelKey]);

  useEffect(() => {
    if (lastResetKeyRef.current === resetPlaneSelectionKey) {
      return;
    }
    lastResetKeyRef.current = resetPlaneSelectionKey;

    setPlaneLocked(false);
    setPreviewPos(null);
    setPreviewStable(false);
    previewHistoryRef.current = [];
    // Allow user to select a new plane.
    planeSelectorRef.current?.reset?.();
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

        // Prefer the continuously computed preview position if we have one.
        if (previewPos) {
          lastPosRef.current = previewPos;
          props?.arSceneNavigator?.viroAppProps?.onModelPositionChange?.(previewPos);
          setPlaneLocked(true);
          return;
        }

        // Fallback: Figment-style placement: ray cast from camera forward; pick best hit result.
        const orientation = await scene.getCameraOrientationAsync();
        const results = await scene.performARHitTestWithRay(orientation.forward);

        const origin: [number, number, number] = Array.isArray(orientation?.position)
          ? [orientation.position[0], orientation.position[1], orientation.position[2]]
          : DEFAULT_POS;
        const forward: [number, number, number] = Array.isArray(orientation?.forward)
          ? [orientation.forward[0], orientation.forward[1], orientation.forward[2]]
          : [0, 0, -1];

        // Default: a bit in front of the camera.
        let newPosition: [number, number, number] = [
          origin[0] + forward[0] * 1.2,
          origin[1] + forward[1] * 1.2,
          origin[2] + forward[2] * 1.2,
        ];

        if (Array.isArray(results) && results.length > 0) {
          const isGoodType = (t: any) =>
            t === 'ExistingPlaneUsingExtent' || t === 'ExistingPlane' || t === 'FeaturePoint';

          const distance = (a: [number, number, number], b: [number, number, number]) =>
            Math.sqrt((a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2);

          // Prefer plane hits; fallback to feature points only if needed.
          const preferred = ['ExistingPlaneUsingExtent', 'ExistingPlane', 'FeaturePoint'];
          let found: [number, number, number] | null = null;
          for (const pref of preferred) {
            for (const r of results) {
              if (!isGoodType(r?.type) || r?.type !== pref) {
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
              const d = distance(hitPos, origin);
              // Dynamic max distance: large models shouldn't be placed too far away (error becomes very visible).
              const maxDist = Math.max(
                3,
                Math.min(10, 10 * (0.8 / Math.max(modelMetricsRef.current.footprint, 0.1))),
              );
              if (d > 0.2 && d < maxDist) {
                found = hitPos;
                break;
              }
            }
            if (found) {
              break;
            }
          }
          if (found) {
            newPosition = found;
          }
        }

        lastPosRef.current = newPosition;
        props?.arSceneNavigator?.viroAppProps?.onModelPositionChange?.(newPosition);
        // Consider placement "locked" (we can pause plane anchor updates to reduce jitter).
        setPlaneLocked(true);
      } catch {
        // ignore placement failures; user can try again
      }
    };

    run();
  }, [placeRequestKey, previewPos, props]);

  const pickBestHit = useCallback((results: any, cameraPos?: [number, number, number]) => {
    if (!Array.isArray(results) || results.length === 0) {
      return null;
    }
    const preferred = ['ExistingPlaneUsingExtent', 'ExistingPlane', 'FeaturePoint'];
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

  const extractCenter = useCallback((planeUpdateMap: any): [number, number, number] | null => {
    const c = planeUpdateMap?.center ?? planeUpdateMap?.position ?? planeUpdateMap?.anchorCenter;
    if (Array.isArray(c) && c.length >= 3 && c.every((n) => typeof n === 'number')) {
      return [c[0], c[1], c[2]];
    }
    return null;
  }, []);

  const isValidPlane = useCallback((planeUpdateMap: any) => {
    const width = planeUpdateMap?.width;
    const height = planeUpdateMap?.height;
    if (typeof width !== 'number' || typeof height !== 'number') {
      return false;
    }
    // Dynamic min plane: large models need larger plane extents to look "correct" and reduce drift.
    const minPlane = Math.max(0.05, modelMetricsRef.current.footprint * 0.6);
    return width >= minPlane && height >= minPlane;
  }, []);

  const onPlaneSelected = useCallback(
    (planeUpdateMap: unknown) => {
      const map = planeUpdateMap as any;
      // Prefer the hit-test reticle (world space). Plane selector center is plane-local and can drift.
      const chosen = previewPos ?? extractCenter(map);
      if (!chosen || !isValidPlane(map)) {
        // Ignore accidental taps on "empty" quads before a real plane is ready.
        return;
      }

      lastPosRef.current = chosen;
      props?.arSceneNavigator?.viroAppProps?.onModelPositionChange?.(chosen);
      setPlaneLocked(true);
      props?.arSceneNavigator?.viroAppProps?.onPlaneSelected?.(planeUpdateMap);
    },
    [extractCenter, isValidPlane, previewPos, props],
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

      // Scale any model to a reasonable footprint so far-plane placement is less error-prone.
      const sizeX = Math.max(0.0001, maxX - minX);
      const sizeZ = Math.max(0.0001, maxZ - minZ);
      const footprint = Math.max(sizeX, sizeZ);
      const targetMeters = 0.8;
      const s = targetMeters / footprint;

      const next: ModelMetrics = {
        scale: [s, s, s],
        localOffset: [-centerX, -minY, -centerZ],
        footprint: footprint * s,
      };
      modelMetricsRef.current = next;
      setModelMetrics(next);
    } catch {
      // ignore
    }
  }, []);

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

      {!planeLocked ? (
        // Scanning mode: show tappable plane candidates to help the user "confirm" a surface.
        // Note: we don't render the model inside the plane anchor anymore; placed models render in world space
        // to reduce drifting as plane anchors refine.
        <ViroARPlaneSelector
          ref={planeSelectorRef}
          alignment="Horizontal"
          maxPlanes={15}
          minHeight={0.05}
          minWidth={0.05}
          onPlaneSelected={onPlaneSelected}
        />
      ) : (
        // Placed mode: render in world space (not parented to a plane anchor) to reduce drift.
        <ViroNode ref={placedNodeRef} position={modelPosition}>
          <Viro3DObject
            ref={modelRef}
            source={source}
            type="GLB"
            position={modelMetrics.localOffset}
            scale={modelMetrics.scale}
            rotation={[0, 0, 0]}
            dragType="FixedToPlane"
            dragPlane={{
              planePoint: modelPosition,
              planeNormal: [0, 1, 0],
              maxDistance: 20,
            }}
            onDrag={onDrag}
            onLoadEnd={applyBoundingBoxCorrections}
          />
        </ViroNode>
      )}
    </ViroARScene>
  );
};
