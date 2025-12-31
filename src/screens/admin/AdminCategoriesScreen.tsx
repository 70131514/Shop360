import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { AppText as Text } from '../../components/common/AppText';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { useAppAlert } from '../../contexts/AppAlertContext';
import { subscribeCategories, type StoreCategory } from '../../services/categoryCatalogService';
import { createCategory, deleteCategory, renameCategory } from '../../services/admin/categoryAdminService';
import { subscribeProducts, type StoreProduct } from '../../services/productCatalogService';

export default function AdminCategoriesScreen() {
  const { colors } = useTheme();
  const { isAdmin } = useAuth();
  const { alert } = useAppAlert();
  const navigation = useNavigation<any>();

  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<StoreCategory[]>([]);
  const [products, setProducts] = useState<StoreProduct[]>([]);

  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);

  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  useEffect(() => {
    if (!isAdmin) {
      setLoading(false);
      return;
    }
    let gotCats = false;
    let gotProducts = false;
    const maybeDone = () => {
      if (gotCats && gotProducts) {
        setLoading(false);
      }
    };

    const unsubCats = subscribeCategories(
      (rows) => {
        setCategories(rows);
        gotCats = true;
        maybeDone();
      },
      () => {
        gotCats = true;
        maybeDone();
      },
    );

    const unsubProducts = subscribeProducts(
      (rows) => {
        setProducts(rows);
        gotProducts = true;
        maybeDone();
      },
      () => {
        gotProducts = true;
        maybeDone();
      },
    );

    return () => {
      unsubCats();
      unsubProducts();
    };
  }, [isAdmin]);

  const counts = useMemo(() => {
    const map = new Map<string, number>();
    for (const p of products) {
      const key = String(p.category || '').trim();
      if (!key) continue;
      map.set(key, (map.get(key) ?? 0) + 1);
    }
    return map;
  }, [products]);

  const openCreate = () => {
    setName('');
    setModalOpen(true);
  };

  const onCreate = async () => {
    if (!isAdmin) {
      alert('Not authorized', 'Admin only.');
      return;
    }
    try {
      setSaving(true);
      await createCategory({ name });
      setModalOpen(false);
      setName('');
    } catch (e: any) {
      alert('Could not create category', e?.message ?? 'Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const beginRename = (c: StoreCategory) => {
    setEditId(c.id);
    setEditName(c.name);
  };

  const onRename = async () => {
    if (!editId) return;
    try {
      setSaving(true);
      await renameCategory({ id: editId, name: editName });
      setEditId(null);
      setEditName('');
    } catch (e: any) {
      alert('Could not rename', e?.message ?? 'Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const onDelete = (c: StoreCategory) => {
    alert('Delete category?', `This will remove "${c.name}".`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            setSaving(true);
            await deleteCategory({ id: c.id });
          } catch (e: any) {
            alert('Could not delete', e?.message ?? 'Please try again.');
          } finally {
            setSaving(false);
          }
        },
      },
    ]);
  };

  const openProductsForCategory = (id: string) => {
    navigation.navigate('AdminTabs', { screen: 'ProductsAdmin', params: { category: id } });
  };

  return (
    <SafeAreaView edges={['top']} style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.title, { color: colors.text }]}>Categories</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {isAdmin ? `${categories.length} categories` : 'Admin only'}
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.addBtn, { backgroundColor: colors.primary, opacity: saving ? 0.7 : 1 }]}
          disabled={!isAdmin || saving}
          onPress={openCreate}
        >
          <Ionicons name="add" size={20} color={colors.background} />
        </TouchableOpacity>
      </View>

      {!isAdmin ? (
        <View style={styles.center}>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Not authorized</Text>
        </View>
      ) : loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : categories.length === 0 ? (
        <View style={styles.center}>
          <Text style={[styles.subtitle, { color: colors.text }]}>No categories yet</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary, marginTop: 6 }]}>
            Create one to start organizing products.
          </Text>
          <TouchableOpacity
            style={[styles.primaryBtn, { backgroundColor: colors.primary }]}
            onPress={openCreate}
          >
            <Text style={[styles.primaryBtnText, { color: colors.background }]}>Create category</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={categories}
          keyExtractor={(c) => c.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => {
            const count = counts.get(item.id) ?? 0;
            const isEditing = editId === item.id;
            return (
              <View style={[styles.row, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <TouchableOpacity
                  style={{ flex: 1 }}
                  activeOpacity={0.8}
                  onPress={() => openProductsForCategory(item.id)}
                >
                  <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
                    {item.name}
                  </Text>
                  <Text style={[styles.meta, { color: colors.textSecondary }]} numberOfLines={1}>
                    {item.id} • {count} products
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.iconBtn}
                  onPress={() => (isEditing ? onRename() : beginRename(item))}
                  disabled={saving}
                >
                  <Ionicons name={isEditing ? 'checkmark' : 'create-outline'} size={18} color={colors.textSecondary} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.iconBtn} onPress={() => onDelete(item)} disabled={saving}>
                  <Ionicons name="trash-outline" size={18} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>
            );
          }}
          ListHeaderComponent={
            editId ? (
              <View style={[styles.editBar, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <TextInput
                  value={editName}
                  onChangeText={setEditName}
                  placeholder="New category name"
                  placeholderTextColor={colors.textSecondary}
                  style={[styles.input, { color: colors.text, borderColor: colors.border }]}
                />
                <TouchableOpacity
                  style={[styles.primarySmall, { backgroundColor: colors.primary, opacity: saving ? 0.7 : 1 }]}
                  onPress={onRename}
                  disabled={saving}
                >
                  <Text style={[styles.primarySmallText, { color: colors.background }]}>Save</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.secondarySmall, { borderColor: colors.border }]}
                  onPress={() => {
                    setEditId(null);
                    setEditName('');
                  }}
                  disabled={saving}
                >
                  <Text style={[styles.secondarySmallText, { color: colors.text }]}>Cancel</Text>
                </TouchableOpacity>
              </View>
            ) : null
          }
        />
      )}

      <Modal visible={modalOpen} transparent animationType="fade" onRequestClose={() => setModalOpen(false)}>
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, { backgroundColor: colors.background, borderColor: colors.border }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>New category</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="e.g. sofas"
              placeholderTextColor={colors.textSecondary}
              style={[styles.modalInput, { color: colors.text, borderColor: colors.border }]}
            />
            <View style={styles.modalRow}>
              <TouchableOpacity
                style={[styles.modalBtn, { borderColor: colors.border }]}
                onPress={() => setModalOpen(false)}
                disabled={saving}
              >
                <Text style={[styles.modalBtnText, { color: colors.text }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: colors.primary, opacity: saving ? 0.7 : 1 }]}
                onPress={onCreate}
                disabled={saving}
              >
                <Text style={[styles.modalBtnText, { color: colors.background }]}>
                  {saving ? 'Saving…' : 'Create'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 16, paddingBottom: 8, flexDirection: 'row', alignItems: 'center', gap: 12 },
  title: { fontSize: 24, fontWeight: '800' },
  subtitle: { fontSize: 13, marginTop: 4 },
  addBtn: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  list: { padding: 16, paddingBottom: 100, gap: 10 },
  row: {
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  name: { fontSize: 15, fontWeight: '800' },
  meta: { fontSize: 12, marginTop: 2 },
  iconBtn: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  primaryBtn: { marginTop: 16, paddingHorizontal: 16, paddingVertical: 12, borderRadius: 14 },
  primaryBtnText: { fontSize: 13, fontWeight: '900' },
  editBar: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  primarySmall: { paddingHorizontal: 12, paddingVertical: 10, borderRadius: 12 },
  primarySmallText: { fontSize: 12, fontWeight: '900' },
  secondarySmall: { paddingHorizontal: 12, paddingVertical: 10, borderRadius: 12, borderWidth: 1 },
  secondarySmallText: { fontSize: 12, fontWeight: '900' },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center' },
  modalCard: { width: '90%', borderRadius: 18, borderWidth: 1, padding: 16 },
  modalTitle: { fontSize: 16, fontWeight: '900' },
  modalInput: { marginTop: 12, borderWidth: 1, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10 },
  modalRow: { flexDirection: 'row', gap: 10, marginTop: 12 },
  modalBtn: { flex: 1, borderRadius: 12, paddingVertical: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  modalBtnText: { fontSize: 13, fontWeight: '900' },
});


