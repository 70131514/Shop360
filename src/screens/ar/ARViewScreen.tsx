import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Linking,
  PermissionsAndroid,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ViroARSceneNavigator } from '@viro-community/react-viro';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { AppText as Text } from '../../components/common/AppText';
import { SPACING } from '../../theme';
import { ModelPlacementARScene, type ARModelKey } from '../../ar/scenes/ModelPlacementARScene';
import { ModelSelectionModal } from '../../components/ar/ModelSelectionModal';
import { getModelInfo } from '../../ar/models/modelConfig';
import { getProductById as getStoreProductById } from '../../services/productCatalogService';

export const ARViewScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  // Keep params optional (ProductDetails passes productId, older code expected product).
  const params = route?.params ?? {};
  const productId: string | undefined = params?.productId ? String(params.productId) : undefined;

  const [cameraGranted, setCameraGranted] = useState<boolean>(Platform.OS === 'ios');
  const [requesting, setRequesting] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<string>(
    Platform.OS === 'ios' ? 'ios-managed' : 'unknown',
  );
  const [trackingState, setTrackingState] = useState<string>('unknown');
  const [trackingReason, setTrackingReason] = useState<string>('');
  const [placementError, setPlacementError] = useState<string>('');
  const lastTrackingUpdateMsRef = useRef<number>(0);
  const lastTrackingStateRef = useRef<string>('unknown');
  const lastTrackingReasonRef = useRef<string>('');
  const [modelKey, setModelKey] = useState<ARModelKey>('shoes');
  const [remoteModelUrl, setRemoteModelUrl] = useState<string>('');
  const [modelPosition, setModelPosition] = useState<[number, number, number]>([0, 0, 0]);
  const [modelRotationY, setModelRotationY] = useState<number>(0);
  const [modelScaleMultiplier, setModelScaleMultiplier] = useState<number>(1);
  const [resetPlaneSelectionKey, setResetPlaneSelectionKey] = useState<number>(0);
  const [planeLocked, setPlaneLocked] = useState<boolean>(false);
  const [placeRequestKey, setPlaceRequestKey] = useState<number>(0);
  const [uiMinimized, setUiMinimized] = useState<boolean>(false);
  const [modelSelectionVisible, setModelSelectionVisible] = useState<boolean>(false);
  const controlsOpacity = useRef(new Animated.Value(1)).current;
  const controlsTranslateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let alive = true;
    if (!productId) {
      setRemoteModelUrl('');
      return () => {
        alive = false;
      };
    }
    getStoreProductById(productId)
      .then((p) => {
        if (alive) {
          setRemoteModelUrl(String(p?.modelUrl ?? ''));
        }
      })
      .catch(() => {
        if (alive) {
          setRemoteModelUrl('');
        }
      });
    return () => {
      alive = false;
    };
  }, [productId]);

  const refreshCameraPermissionState = useCallback(async () => {
    if (Platform.OS !== 'android') {
      setCameraGranted(true);
      setPermissionStatus('ios-managed');
      return true;
    }
    try {
      const already = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.CAMERA);
      setCameraGranted(already);
      setPermissionStatus(already ? 'granted' : 'not-granted');
      return already;
    } catch {
      setCameraGranted(false);
      setPermissionStatus('check-failed');
      return false;
    }
  }, []);

  const requestCameraPermission = useCallback(async () => {
    if (Platform.OS !== 'android') {
      setCameraGranted(true);
      setPermissionStatus('ios-managed');
      return true;
    }

    try {
      setRequesting(true);
      const res = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.CAMERA, {
        title: 'Camera Permission',
        message: 'Shop360 needs access to your camera to use AR.',
        buttonPositive: 'Allow',
        buttonNegative: 'Deny',
      });
      const ok = res === PermissionsAndroid.RESULTS.GRANTED;
      setCameraGranted(ok);
      setPermissionStatus(res);
      return ok;
    } finally {
      setRequesting(false);
    }
  }, []);

  useEffect(() => {
    // Android requires runtime permission; iOS prompts when camera is accessed (ensure Info.plist key exists).
    // First check existing status (covers the case where permission was already granted).
    refreshCameraPermissionState().then((already) => {
      if (!already) {
        requestCameraPermission();
      }
    });
  }, [refreshCameraPermissionState, requestCameraPermission]);

  const initialScene = useMemo(() => ({ scene: ModelPlacementARScene }), []);
  const viroAppProps = useMemo(
    () => ({
      modelKey,
      modelUrl: remoteModelUrl || undefined,
      modelPosition,
      modelRotationY,
      modelScaleMultiplier,
      resetPlaneSelectionKey,
      placeRequestKey,
      onTrackingUpdate: (state: any, reason: any) => {
        const nextState = String(state);
        const nextReason = String(reason ?? '');
        const now = Date.now();

        // Throttle tracking state updates to avoid excessive rerenders that can cause
        // large objects to appear to "drift" (position prop gets re-applied frequently).
        if (
          now - lastTrackingUpdateMsRef.current < 250 &&
          nextState === lastTrackingStateRef.current &&
          nextReason === lastTrackingReasonRef.current
        ) {
          return;
        }

        lastTrackingUpdateMsRef.current = now;
        lastTrackingStateRef.current = nextState;
        lastTrackingReasonRef.current = nextReason;
        setTrackingState(nextState);
        setTrackingReason(nextReason);
      },
      onPlaneSelected: () => {
        setPlaneLocked(true);
      },
      onModelPositionChange: (pos: [number, number, number]) => {
        setModelPosition(pos);
      },
      onPlacementError: (message: string) => {
        setPlacementError(message);
        // auto-clear after a bit
        setTimeout(() => setPlacementError(''), 2500);
      },
    }),
    [
      modelKey,
      remoteModelUrl,
      modelPosition,
      modelRotationY,
      modelScaleMultiplier,
      resetPlaneSelectionKey,
      placeRequestKey,
    ],
  );

  const MOVE_STEP = 0.05; // 5cm per step

  const moveModel = useCallback(
    (axis: 'x' | 'y' | 'z', direction: 1 | -1) => {
      setModelPosition((prev) => {
        const [x, y, z] = prev;
        if (axis === 'x') {
          return [x + direction * MOVE_STEP, y, z];
        }
        if (axis === 'y') {
          return [x, y + direction * MOVE_STEP, z];
        }
        if (axis === 'z') {
          return [x, y, z + direction * MOVE_STEP];
        }
        return prev;
      });
    },
    [MOVE_STEP],
  );

  const resetPosition = useCallback(() => {
    setModelPosition([0, 0, 0]);
  }, []);

  const ROTATE_STEP = 10; // degrees
  const rotateModel = useCallback((direction: 1 | -1) => {
    setModelRotationY((prev) => {
      const next = prev + direction * ROTATE_STEP;
      if (next > 180) {
        return next - 360;
      }
      if (next < -180) {
        return next + 360;
      }
      return next;
    });
  }, []);

  const resetRotation = useCallback(() => {
    setModelRotationY(0);
  }, []);

  const ZOOM_STEP = 0.1; // 10% per step
  const zoom = useCallback((direction: 1 | -1) => {
    setModelScaleMultiplier((prev) => {
      const next = Number((prev + direction * ZOOM_STEP).toFixed(2));
      return Math.max(0.25, Math.min(4, next));
    });
  }, []);

  const resetZoom = useCallback(() => {
    setModelScaleMultiplier(1);
  }, []);

  const resetPlane = useCallback(() => {
    setPlaneLocked(false);
    resetPosition();
    setResetPlaneSelectionKey((k) => k + 1);
    setPlacementError('');
  }, [resetPosition]);

  const placeAtCenter = useCallback(() => {
    // Triggers Figment-style hit test placement from within the AR scene.
    setPlaceRequestKey((k) => k + 1);
  }, []);

  const toggleUIMinimize = useCallback(() => {
    setUiMinimized(!uiMinimized);

    Animated.parallel([
      Animated.timing(controlsOpacity, {
        toValue: uiMinimized ? 1 : 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(controlsTranslateY, {
        toValue: uiMinimized ? 0 : 100,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, [uiMinimized, controlsOpacity, controlsTranslateY]);

  return (
    <View style={styles.container}>
      {cameraGranted ? (
        <ViroARSceneNavigator
          style={styles.arView}
          initialScene={initialScene}
          viroAppProps={viroAppProps}
          autofocus={true}
        />
      ) : (
        <View style={styles.permissionContainer}>
          <Text style={styles.permissionTitle}>Camera access required</Text>
          <Text style={styles.permissionSubtitle}>Please allow camera permission to use AR.</Text>
          <Text style={styles.permissionDebug}>Status: {permissionStatus}</Text>
          <TouchableOpacity
            style={[styles.permissionButton, requesting && styles.permissionButtonDisabled]}
            onPress={requestCameraPermission}
            disabled={requesting}
            activeOpacity={0.9}
          >
            <Text style={styles.permissionButtonText}>
              {requesting ? 'Requesting…' : 'Allow Camera'}
            </Text>
          </TouchableOpacity>

          {permissionStatus === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN && (
            <TouchableOpacity
              style={[styles.permissionButton, styles.permissionButtonSecondary]}
              onPress={() => Linking.openSettings()}
              activeOpacity={0.9}
            >
              <Text style={styles.permissionButtonText}>Open Settings</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={styles.permissionSecondary}
            onPress={() => navigation.goBack()}
            activeOpacity={0.9}
          >
            <Text style={styles.permissionSecondaryText}>Go back</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Overlay UI */}
      <SafeAreaView style={styles.overlay} pointerEvents="box-none">
        {/* Top Header - Always Visible */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.minimizeButton}
            onPress={toggleUIMinimize}
            activeOpacity={0.7}
          >
            <Ionicons name={uiMinimized ? 'chevron-up' : 'chevron-down'} size={20} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.closeButton} onPress={() => navigation.goBack()}>
            <Ionicons name="close" size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Collapsible Controls Panel */}
        <Animated.View
          style={[
            styles.controlsContainer,
            {
              opacity: controlsOpacity,
              transform: [{ translateY: controlsTranslateY }],
            },
          ]}
          pointerEvents={uiMinimized ? 'none' : 'auto'}
        >
          <ScrollView
            style={styles.controlsScroll}
            contentContainerStyle={styles.controlsContent}
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            {/* Status Info - Compact */}
            <View style={styles.statusBar}>
              <View style={styles.statusItem}>
                <Ionicons name="radio" size={12} color="rgba(255,255,255,0.7)" />
                <Text style={styles.statusText}>
                  {trackingState === 'READY' ? 'Ready' : trackingState}
                </Text>
              </View>
              {!!placementError && (
                <View style={[styles.statusItem, styles.statusError]}>
                  <Ionicons name="alert-circle" size={12} color="#ff6b6b" />
                  <Text style={[styles.statusText, styles.statusErrorText]}>{placementError}</Text>
                </View>
              )}
            </View>

            {/* Quick Instruction */}
            <Text style={styles.instructionText}>
              {planeLocked ? 'Drag to adjust placement' : 'Move camera to scan, then tap Place'}
            </Text>

            {/* Model Selection Button */}
            <TouchableOpacity
              style={styles.modelSelectButton}
              onPress={() => setModelSelectionVisible(true)}
              activeOpacity={0.7}
            >
              <Ionicons name="cube" size={18} color="#fff" />
              <Text style={styles.modelSelectButtonText}>
                {getModelInfo(modelKey)?.name || 'Select Model'}
              </Text>
              <Ionicons name="chevron-forward" size={16} color="rgba(255,255,255,0.7)" />
            </TouchableOpacity>

            {/* Main Controls Panel */}
            <View style={styles.controlsPanel}>
              {/* Place Button - Prominent */}
              <TouchableOpacity
                style={styles.placeButton}
                onPress={placeAtCenter}
                activeOpacity={0.7}
              >
                <Ionicons name="locate" size={18} color="#fff" />
                <Text style={styles.placeButtonText}>Place Model</Text>
              </TouchableOpacity>

              {/* Movement Controls */}
              <View style={styles.controlSection}>
                <Text style={styles.sectionTitle}>Position</Text>
                <View style={styles.controlRow}>
                  {/* D-pad (X/Y) */}
                  <View style={styles.dpad}>
                    <TouchableOpacity
                      style={[styles.dpadBtn, styles.dpadUp]}
                      onPress={() => moveModel('y', 1)}
                      activeOpacity={0.75}
                    >
                      <Ionicons name="chevron-up" size={20} color="#fff" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.dpadBtn, styles.dpadLeft]}
                      onPress={() => moveModel('x', -1)}
                      activeOpacity={0.75}
                    >
                      <Ionicons name="chevron-back" size={20} color="#fff" />
                    </TouchableOpacity>
                    <View style={styles.dpadCenter}>
                      <Ionicons name="move" size={14} color="rgba(255,255,255,0.6)" />
                    </View>
                    <TouchableOpacity
                      style={[styles.dpadBtn, styles.dpadRight]}
                      onPress={() => moveModel('x', 1)}
                      activeOpacity={0.75}
                    >
                      <Ionicons name="chevron-forward" size={20} color="#fff" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.dpadBtn, styles.dpadDown]}
                      onPress={() => moveModel('y', -1)}
                      activeOpacity={0.75}
                    >
                      <Ionicons name="chevron-down" size={20} color="#fff" />
                    </TouchableOpacity>
                  </View>

                  {/* Near/Far (Z) */}
                  <View style={styles.stackControls}>
                    <Text style={styles.controlMiniLabel}>Depth</Text>
                    <TouchableOpacity
                      style={styles.pillBtn}
                      onPress={() => moveModel('z', -1)}
                      activeOpacity={0.75}
                    >
                      <Ionicons name="arrow-up" size={16} color="#fff" />
                      <Text style={styles.pillBtnText}>Near</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.pillBtn}
                      onPress={() => moveModel('z', 1)}
                      activeOpacity={0.75}
                    >
                      <Ionicons name="arrow-down" size={16} color="#fff" />
                      <Text style={styles.pillBtnText}>Far</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              {/* Rotation Controls */}
              <View style={styles.controlSection}>
                <View style={styles.rotateHeader}>
                  <Text style={styles.sectionTitle}>Rotation</Text>
                  <Text style={styles.rotateValue}>{Math.round(modelRotationY)}°</Text>
                </View>
                <View style={styles.rotateBtns}>
                  <TouchableOpacity
                    style={styles.iconBtn}
                    onPress={() => rotateModel(-1)}
                    activeOpacity={0.75}
                  >
                    <Ionicons name="return-up-back" size={16} color="#fff" />
                    <Text style={styles.iconBtnText}>Left</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.iconBtn}
                    onPress={resetRotation}
                    activeOpacity={0.75}
                  >
                    <Ionicons name="refresh" size={16} color="#fff" />
                    <Text style={styles.iconBtnText}>Reset</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.iconBtn}
                    onPress={() => rotateModel(1)}
                    activeOpacity={0.75}
                  >
                    <Ionicons name="return-up-forward" size={16} color="#fff" />
                    <Text style={styles.iconBtnText}>Right</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Zoom Controls */}
              <View style={styles.controlSection}>
                <View style={styles.rotateHeader}>
                  <Text style={styles.sectionTitle}>Scale</Text>
                  <Text style={styles.rotateValue}>{Math.round(modelScaleMultiplier * 100)}%</Text>
                </View>
                <View style={styles.rotateBtns}>
                  <TouchableOpacity
                    style={styles.iconBtn}
                    onPress={() => zoom(1)}
                    activeOpacity={0.75}
                  >
                    <Ionicons name="add" size={16} color="#fff" />
                    <Text style={styles.iconBtnText}>In</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.iconBtn} onPress={resetZoom} activeOpacity={0.75}>
                    <Ionicons name="refresh" size={16} color="#fff" />
                    <Text style={styles.iconBtnText}>Reset</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.iconBtn}
                    onPress={() => zoom(-1)}
                    activeOpacity={0.75}
                  >
                    <Ionicons name="remove" size={16} color="#fff" />
                    <Text style={styles.iconBtnText}>Out</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Reset Actions */}
              <View style={styles.footerActions}>
                <TouchableOpacity
                  style={styles.secondaryBtn}
                  onPress={resetPosition}
                  activeOpacity={0.75}
                >
                  <Ionicons name="navigate" size={14} color="#fff" />
                  <Text style={styles.secondaryBtnText}>Reset Pos</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.secondaryBtn}
                  onPress={resetPlane}
                  activeOpacity={0.75}
                >
                  <Ionicons name="scan" size={14} color="#fff" />
                  <Text style={styles.secondaryBtnText}>Reset Plane</Text>
                </TouchableOpacity>
              </View>

              {/* Debug Hints */}
              {trackingReason.includes('INSUFFICIENT_FEATURES') && (
                <Text style={styles.debugHint}>
                  Tip: Try brighter light and aim at textured surfaces
                </Text>
              )}
              {trackingState.includes('UNAVAILABLE') && (
                <Text style={styles.debugHint}>
                  Install "Google Play Services for AR" and try again
                </Text>
              )}
            </View>
          </ScrollView>
        </Animated.View>
      </SafeAreaView>

      {/* Model Selection Modal */}
      <ModelSelectionModal
        visible={modelSelectionVisible}
        selectedModel={modelKey}
        onSelectModel={setModelKey}
        onClose={() => setModelSelectionVisible(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  arView: {
    flex: 1,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'space-between',
  },
  header: {
    paddingHorizontal: SPACING.m,
    paddingTop: SPACING.s,
    paddingBottom: SPACING.xs,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  minimizeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  controlsContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    maxHeight: '75%',
  },
  controlsScroll: {
    flex: 1,
  },
  controlsContent: {
    padding: SPACING.m,
    paddingBottom: SPACING.xl,
  },
  statusBar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: SPACING.s,
    justifyContent: 'center',
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  statusError: {
    backgroundColor: 'rgba(255,107,107,0.2)',
  },
  statusText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 10,
    fontWeight: '600',
  },
  statusErrorText: {
    color: '#ff6b6b',
  },
  instructionText: {
    color: '#fff',
    fontSize: 13,
    marginBottom: SPACING.m,
    textAlign: 'center',
    fontWeight: '600',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  debugHint: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 10,
    marginTop: SPACING.s,
    textAlign: 'center',
    paddingHorizontal: SPACING.m,
    fontStyle: 'italic',
  },
  modelSelectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: SPACING.m,
    paddingVertical: SPACING.s,
    borderRadius: 12,
    marginBottom: SPACING.m,
    gap: 8,
  },
  modelSelectButtonText: {
    flex: 1,
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
  controlsPanel: {
    backgroundColor: 'rgba(0,0,0,0.75)',
    borderRadius: 16,
    padding: SPACING.m,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    backdropFilter: 'blur(10px)',
  },
  controlSection: {
    marginTop: SPACING.m,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  controlRow: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  dpad: {
    width: 120,
    height: 120,
    position: 'relative',
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  dpadBtn: {
    position: 'absolute',
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dpadUp: { top: 6, left: 38 },
  dpadDown: { bottom: 6, left: 38 },
  dpadLeft: { left: 6, top: 38 },
  dpadRight: { right: 6, top: 38 },
  dpadCenter: {
    position: 'absolute',
    left: 38,
    top: 38,
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stackControls: {
    flex: 1,
    gap: 6,
    minWidth: 100,
  },
  controlMiniLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.3,
    marginBottom: 4,
  },
  pillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  pillBtnText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  rotateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  rotateValue: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 11,
    fontWeight: '800',
  },
  rotateBtns: {
    flexDirection: 'row',
    gap: 6,
  },
  iconBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  iconBtnText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
  footerActions: {
    marginTop: SPACING.m,
    flexDirection: 'row',
    gap: 8,
  },
  secondaryBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  secondaryBtnText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 11,
    fontWeight: '700',
  },
  placeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(59,130,246,0.8)',
    borderWidth: 1,
    borderColor: 'rgba(59,130,246,0.9)',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: SPACING.m,
    gap: 8,
  },
  placeButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  permissionContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    backgroundColor: '#000',
  },
  permissionTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
  },
  permissionSubtitle: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 14,
    marginTop: 10,
    marginBottom: 18,
    textAlign: 'center',
  },
  permissionDebug: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
    marginBottom: 12,
  },
  permissionButton: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 999,
    minWidth: 180,
    alignItems: 'center',
  },
  permissionButtonDisabled: {
    opacity: 0.6,
  },
  permissionButtonSecondary: {
    marginTop: 10,
    backgroundColor: 'rgba(255,255,255,0.85)',
  },
  permissionButtonText: {
    color: '#000',
    fontWeight: '800',
    fontSize: 15,
  },
  permissionSecondary: {
    marginTop: 14,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  permissionSecondaryText: {
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '700',
  },
});
