import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Linking,
  PermissionsAndroid,
  Platform,
  SafeAreaView,
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

export const ARViewScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  // Keep params optional (ProductDetails passes productId, older code expected product).
  // This screen currently only renders a demo AR scene ("HELLO WORLD").
  const _params = route?.params ?? {};

  const [cameraGranted, setCameraGranted] = useState<boolean>(Platform.OS === 'ios');
  const [requesting, setRequesting] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<string>(
    Platform.OS === 'ios' ? 'ios-managed' : 'unknown',
  );
  const [trackingState, setTrackingState] = useState<string>('unknown');
  const [trackingReason, setTrackingReason] = useState<string>('');
  const [modelKey, setModelKey] = useState<ARModelKey>('shoes');
  const [modelPosition, setModelPosition] = useState<[number, number, number]>([0, 0, 0]);

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
      modelPosition,
      onTrackingUpdate: (state: any, reason: any) => {
        setTrackingState(String(state));
        setTrackingReason(String(reason ?? ''));
      },
    }),
    [modelKey, modelPosition],
  );

  const MOVE_STEP = 0.05; // 5cm per step

  const moveModel = useCallback(
    (axis: 'x' | 'y' | 'z', direction: 1 | -1) => {
      setModelPosition((prev) => {
        const [x, y, z] = prev;
        if (axis === 'x') return [x + direction * MOVE_STEP, y, z];
        if (axis === 'y') return [x, y + direction * MOVE_STEP, z];
        if (axis === 'z') return [x, y, z + direction * MOVE_STEP];
        return prev;
      });
    },
    [MOVE_STEP],
  );

  const resetPosition = useCallback(() => {
    setModelPosition([0, 0, 0]);
  }, []);

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
          <Text style={styles.permissionSubtitle}>
            Please allow camera permission to use AR.
          </Text>
          <Text style={styles.permissionDebug}>Status: {permissionStatus}</Text>
          <TouchableOpacity
            style={[styles.permissionButton, { opacity: requesting ? 0.6 : 1 }]}
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
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeButton} onPress={() => navigation.goBack()}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.controls} pointerEvents="box-none">
          <Text style={styles.instructionText}>Move your camera to find a flat surface.</Text>
          <Text style={styles.debugText}>
            Tracking: {trackingState}
            {trackingReason ? ` (${trackingReason})` : ''}
          </Text>
          <View style={styles.modelRow}>
            <TouchableOpacity
              style={[styles.modelChip, modelKey === 'shoes' && styles.modelChipActive]}
              onPress={() => setModelKey('shoes')}
              activeOpacity={0.85}
            >
              <Text style={[styles.modelChipText, modelKey === 'shoes' && styles.modelChipTextActive]}>
                Shoes
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modelChip, modelKey === 'hat' && styles.modelChipActive]}
              onPress={() => setModelKey('hat')}
              activeOpacity={0.85}
            >
              <Text style={[styles.modelChipText, modelKey === 'hat' && styles.modelChipTextActive]}>
                Hat
              </Text>
            </TouchableOpacity>
          </View>

          {/* Position Controls */}
          <View style={styles.positionControls}>
            <Text style={styles.positionLabel}>Position Controls</Text>
            <View style={styles.positionGrid}>
              {/* Up/Down (Y axis) */}
              <View style={styles.positionColumn}>
                <TouchableOpacity
                  style={styles.positionButton}
                  onPress={() => moveModel('y', 1)}
                  activeOpacity={0.7}
                >
                  <Ionicons name="arrow-up" size={20} color="#fff" />
                  <Text style={styles.positionButtonText}>Up</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.positionButton}
                  onPress={() => moveModel('y', -1)}
                  activeOpacity={0.7}
                >
                  <Ionicons name="arrow-down" size={20} color="#fff" />
                  <Text style={styles.positionButtonText}>Down</Text>
                </TouchableOpacity>
              </View>

              {/* Left/Right (X axis) */}
              <View style={styles.positionColumn}>
                <TouchableOpacity
                  style={styles.positionButton}
                  onPress={() => moveModel('x', -1)}
                  activeOpacity={0.7}
                >
                  <Ionicons name="arrow-back" size={20} color="#fff" />
                  <Text style={styles.positionButtonText}>Left</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.positionButton}
                  onPress={() => moveModel('x', 1)}
                  activeOpacity={0.7}
                >
                  <Ionicons name="arrow-forward" size={20} color="#fff" />
                  <Text style={styles.positionButtonText}>Right</Text>
                </TouchableOpacity>
              </View>

              {/* Forward/Backward (Z axis) */}
              <View style={styles.positionColumn}>
                <TouchableOpacity
                  style={styles.positionButton}
                  onPress={() => moveModel('z', -1)}
                  activeOpacity={0.7}
                >
                  <Ionicons name="remove" size={20} color="#fff" />
                  <Text style={styles.positionButtonText}>Forward</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.positionButton}
                  onPress={() => moveModel('z', 1)}
                  activeOpacity={0.7}
                >
                  <Ionicons name="add" size={20} color="#fff" />
                  <Text style={styles.positionButtonText}>Backward</Text>
                </TouchableOpacity>
              </View>
            </View>
            <TouchableOpacity style={styles.resetButton} onPress={resetPosition} activeOpacity={0.7}>
              <Ionicons name="refresh" size={16} color="#fff" />
              <Text style={styles.resetButtonText}>Reset Position</Text>
            </TouchableOpacity>
          </View>

          {trackingState.includes('UNAVAILABLE') && (
            <Text style={styles.debugHint}>
              Tip: Install/update “Google Play Services for AR (ARCore)” and try again.
            </Text>
          )}
        </View>
      </SafeAreaView>
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
    padding: SPACING.m,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  controls: {
    padding: SPACING.l,
    alignItems: 'center',
    paddingBottom: SPACING.xxl,
  },
  instructionText: {
    color: '#fff',
    fontSize: 16,
    marginBottom: SPACING.l,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  debugText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    marginTop: 6,
  },
  debugHint: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 11,
    marginTop: 6,
    textAlign: 'center',
    paddingHorizontal: 14,
  },
  modelRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  modelChip: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
  },
  modelChipActive: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderColor: 'rgba(255,255,255,0.9)',
  },
  modelChipText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    fontWeight: '800',
  },
  modelChipTextActive: {
    color: '#000',
  },
  positionControls: {
    marginTop: 16,
    padding: 12,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 12,
    width: '100%',
    maxWidth: 320,
  },
  positionLabel: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 10,
    textAlign: 'center',
  },
  positionGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: 8,
  },
  positionColumn: {
    flex: 1,
    gap: 8,
  },
  positionButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 60,
  },
  positionButtonText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
    marginTop: 4,
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginTop: 10,
    gap: 6,
  },
  resetButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
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
