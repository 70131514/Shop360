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
import { AppText as Text } from '../../components/common/AppText';
import { SPACING } from '../../theme';
import { HelloWorldARScene } from '../../ar/scenes/HelloWorldARScene';

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

  const initialScene = useMemo(() => ({ scene: HelloWorldARScene }), []);
  const viroAppProps = useMemo(
    () => ({
      onTrackingUpdate: (state: any, reason: any) => {
        setTrackingState(String(state));
        setTrackingReason(String(reason ?? ''));
      },
    }),
    [],
  );

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
