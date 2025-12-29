import React from 'react';
import { Modal, StyleSheet, TouchableOpacity, View, FlatList } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { AppText as Text } from '../common/AppText';
import { SPACING } from '../../theme';
import { ARModelKey } from '../../ar/scenes/ModelPlacementARScene';
import { AR_MODELS } from '../../ar/models/modelConfig';

interface ModelSelectionModalProps {
  visible: boolean;
  selectedModel: ARModelKey;
  onSelectModel: (modelKey: ARModelKey) => void;
  onClose: () => void;
}

export const ModelSelectionModal: React.FC<ModelSelectionModalProps> = ({
  visible,
  selectedModel,
  onSelectModel,
  onClose,
}) => {
  const handleSelectModel = (modelKey: ARModelKey) => {
    onSelectModel(modelKey);
    onClose();
  };

  const renderModelItem = ({ item }: { item: (typeof AR_MODELS)[0] }) => {
    const isSelected = item.key === selectedModel;
    const iconName = item.icon || 'cube';

    return (
      <TouchableOpacity
        style={[styles.modelItem, isSelected && styles.modelItemSelected]}
        onPress={() => handleSelectModel(item.key)}
        activeOpacity={0.7}
      >
        <View style={[styles.iconContainer, isSelected && styles.iconContainerSelected]}>
          <Ionicons name={iconName} size={32} color={isSelected ? '#000' : '#fff'} />
        </View>
        <View style={styles.modelInfo}>
          <Text style={[styles.modelName, isSelected && styles.modelNameSelected]}>
            {item.name}
          </Text>
          {item.description && (
            <Text style={[styles.modelDescription, isSelected && styles.modelDescriptionSelected]}>
              {item.description}
            </Text>
          )}
        </View>
        {isSelected && <Ionicons name="checkmark-circle" size={24} color="#000" />}
      </TouchableOpacity>
    );
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Select Model</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose} activeOpacity={0.7}>
              <Ionicons name="close" size={24} color="#000" />
            </TouchableOpacity>
          </View>

          {/* Model List */}
          <FlatList
            data={AR_MODELS}
            renderItem={renderModelItem}
            keyExtractor={(item) => item.key}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
    paddingBottom: SPACING.xl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.l,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#000',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    padding: SPACING.m,
  },
  modelItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.m,
    marginBottom: SPACING.s,
    borderRadius: 16,
    backgroundColor: '#F5F5F5',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  modelItemSelected: {
    backgroundColor: '#000',
    borderColor: '#000',
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.m,
  },
  iconContainerSelected: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  modelInfo: {
    flex: 1,
  },
  modelName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
    marginBottom: 4,
  },
  modelNameSelected: {
    color: '#fff',
  },
  modelDescription: {
    fontSize: 12,
    color: '#666',
  },
  modelDescriptionSelected: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
});
