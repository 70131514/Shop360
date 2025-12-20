import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { useAppAlert } from '../../contexts/AppAlertContext';
import { getProductById, upsertProduct } from '../../services/admin/productAdminService';

type Params = { id?: string };

export default function AdminProductEditScreen() {
  const { colors } = useTheme();
  const { isAdmin } = useAuth();
  const { alert } = useAppAlert();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { id } = (route.params ?? {}) as Params;

  const isEdit = !!id;
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('0');
  const [stock, setStock] = useState('0');
  const [thumbnail, setThumbnail] = useState('');
  const [brand, setBrand] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (!isAdmin) {
      return;
    }
    if (!isEdit) {
      return;
    }
    let alive = true;
    const load = async () => {
      try {
        setLoading(true);
        const p = await getProductById(id!);
        if (!alive || !p) {
          return;
        }
        setTitle(p.title ?? '');
        setCategory(p.category ?? '');
        setPrice(String(p.price ?? 0));
        setStock(String(p.stock ?? 0));
        setThumbnail(p.thumbnail ?? '');
        setBrand(p.brand ?? '');
        setDescription(p.description ?? '');
      } catch {
        // ignore
      } finally {
        if (alive) setLoading(false);
      }
    };
    load();
    return () => {
      alive = false;
    };
  }, [isAdmin, isEdit, id]);

  const numericPrice = useMemo(() => Number(price || 0), [price]);
  const numericStock = useMemo(() => Number(stock || 0), [stock]);

  const onSave = async () => {
    if (!isAdmin) {
      alert('Not authorized', 'Admin only.');
      return;
    }
    if (!title.trim()) {
      alert('Missing title', 'Please enter a product title.');
      return;
    }
    if (!category.trim()) {
      alert('Missing category', 'Please enter a category.');
      return;
    }
    if (!Number.isFinite(numericPrice) || numericPrice < 0) {
      alert('Invalid price', 'Please enter a valid price.');
      return;
    }

    try {
      setSaving(true);
      const savedId = await upsertProduct({
        id: id ?? undefined,
        title: title.trim(),
        category: category.trim(),
        price: numericPrice,
        stock: Number.isFinite(numericStock) ? Math.max(0, Math.floor(numericStock)) : 0,
        thumbnail: thumbnail.trim(),
        brand: brand.trim(),
        description: description.trim(),
      });
      alert('Saved', 'Product has been saved.');
      navigation.goBack();
      return savedId;
    } catch (e: any) {
      alert('Save failed', e?.message ?? 'Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView edges={['top']} style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>{isEdit ? 'Edit Product' : 'New Product'}</Text>
      </View>

      {!isAdmin ? (
        <View style={styles.center}>
          <Text style={[styles.help, { color: colors.textSecondary }]}>Not authorized</Text>
        </View>
      ) : loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : (
        <View style={styles.form}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Title</Text>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="Product title"
            placeholderTextColor={colors.textSecondary}
            style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
          />

          <Text style={[styles.label, { color: colors.textSecondary }]}>Category</Text>
          <TextInput
            value={category}
            onChangeText={setCategory}
            placeholder="e.g. shoes"
            placeholderTextColor={colors.textSecondary}
            style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
          />

          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Price</Text>
              <TextInput
                value={price}
                onChangeText={setPrice}
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor={colors.textSecondary}
                style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Stock</Text>
              <TextInput
                value={stock}
                onChangeText={setStock}
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor={colors.textSecondary}
                style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
              />
            </View>
          </View>

          <Text style={[styles.label, { color: colors.textSecondary }]}>Thumbnail URL</Text>
          <TextInput
            value={thumbnail}
            onChangeText={setThumbnail}
            placeholder="https://..."
            placeholderTextColor={colors.textSecondary}
            style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
          />

          <Text style={[styles.label, { color: colors.textSecondary }]}>Brand</Text>
          <TextInput
            value={brand}
            onChangeText={setBrand}
            placeholder="Brand (optional)"
            placeholderTextColor={colors.textSecondary}
            style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
          />

          <Text style={[styles.label, { color: colors.textSecondary }]}>Description</Text>
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder="Description (optional)"
            placeholderTextColor={colors.textSecondary}
            multiline
            style={[
              styles.input,
              styles.textArea,
              { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text },
            ]}
          />

          <TouchableOpacity
            style={[styles.saveBtn, { backgroundColor: colors.primary, opacity: saving ? 0.7 : 1 }]}
            onPress={onSave}
            disabled={saving}
          >
            <Text style={[styles.saveText, { color: colors.background }]}>{saving ? 'Saving…' : 'Save'}</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 16, paddingBottom: 8 },
  title: { fontSize: 22, fontWeight: '800' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  help: { fontSize: 13 },
  form: { padding: 16, gap: 10 },
  label: { fontSize: 12, fontWeight: '700' },
  input: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14 },
  textArea: { minHeight: 90, textAlignVertical: 'top' },
  row: { flexDirection: 'row', gap: 10 },
  saveBtn: { marginTop: 6, borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
  saveText: { fontSize: 14, fontWeight: '800' },
});


