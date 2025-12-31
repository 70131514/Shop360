import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { AppText as Text } from '../../components/common/AppText';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { useAppAlert } from '../../contexts/AppAlertContext';
import DocumentPicker from 'react-native-document-picker';
import {
  generateNewProductId,
  getProductById,
  upsertProduct,
} from '../../services/admin/productAdminService';
import type { PickedLocalFile } from '../../services/storageService';
import { uploadProductImage, uploadProductModel } from '../../services/storageService';
import { subscribeCategories, type StoreCategory } from '../../services/categoryCatalogService';

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
  const [category, setCategory] = useState(''); // category id (slug)
  const [price, setPrice] = useState('0');
  const [stock, setStock] = useState('0');
  const [brand, setBrand] = useState('');
  const [description, setDescription] = useState('');
  const [rating, setRating] = useState('0');
  const [discountPercentage, setDiscountPercentage] = useState('0');
  const [isFeatured, setIsFeatured] = useState(false);

  // Existing (remote) assets
  const [images, setImages] = useState<string[]>([]);
  const [modelUrl, setModelUrl] = useState<string>('');

  // Newly picked (local) assets to upload on save
  const [pendingImages, setPendingImages] = useState<PickedLocalFile[]>([]);
  const [pendingModel, setPendingModel] = useState<PickedLocalFile | null>(null);

  const [categories, setCategories] = useState<StoreCategory[]>([]);
  const [categoryPickerOpen, setCategoryPickerOpen] = useState(false);

  useEffect(() => {
    if (!isAdmin) {
      return;
    }
    const unsub = subscribeCategories(
      (rows) => setCategories(rows),
      () => setCategories([]),
    );
    return unsub;
  }, [isAdmin]);

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
        const rawImages = (p as any).images;
        const remoteImages = Array.isArray(rawImages) ? (rawImages as string[]) : [];
        let nextImages: string[] = [];
        if (remoteImages.length > 0) {
          nextImages = remoteImages;
        } else if (p.thumbnail) {
          nextImages = [p.thumbnail];
        }
        setImages(nextImages);
        setBrand(p.brand ?? '');
        setDescription(p.description ?? '');
        setRating(String((p as any).rating ?? 0));
        setDiscountPercentage(String((p as any).discountPercentage ?? 0));
        setModelUrl(String((p as any).modelUrl ?? ''));
        setIsFeatured(Boolean((p as any).isFeatured ?? false));
      } catch {
        // ignore
      } finally {
        if (alive) {
          setLoading(false);
        }
      }
    };
    load();
    return () => {
      alive = false;
    };
  }, [isAdmin, isEdit, id]);

  const numericPrice = useMemo(() => Number(price || 0), [price]);
  const numericStock = useMemo(() => Number(stock || 0), [stock]);
  const numericRating = useMemo(() => Number(rating || 0), [rating]);
  const numericDiscount = useMemo(() => Number(discountPercentage || 0), [discountPercentage]);

  const selectedCategoryName = useMemo(() => {
    const c = categories.find((x) => x.id === category);
    return c?.name ?? '';
  }, [categories, category]);

  const categoryLabel = useMemo(() => {
    if (category) {
      return selectedCategoryName || category;
    }
    if (categories.length === 0) {
      return 'No categories yet — create one';
    }
    return 'Select category';
  }, [categories.length, category, selectedCategoryName]);

  const modelMetaText = useMemo(() => {
    if (pendingModel?.name) {
      return `Selected: ${pendingModel.name}`;
    }
    if (modelUrl) {
      return 'Model uploaded';
    }
    return 'No model selected (AR will use default demos)';
  }, [pendingModel?.name, modelUrl]);

  const pickImages = async () => {
    try {
      const res = await DocumentPicker.pick({
        type: [DocumentPicker.types.images],
        allowMultiSelection: true,
        copyTo: 'cachesDirectory',
      });
      const files: PickedLocalFile[] = res.map((r: any) => ({
        uri: r.fileCopyUri ?? r.uri,
        name: r.name,
      }));
      setPendingImages(files);
    } catch (e: any) {
      if (DocumentPicker.isCancel(e)) {
        return;
      }
      alert('Pick failed', e?.message ?? 'Could not pick images.');
    }
  };

  const pickModel = async () => {
    try {
      const r: any = await DocumentPicker.pickSingle({
        type: [DocumentPicker.types.allFiles],
        copyTo: 'cachesDirectory',
      });
      const name = String(r?.name ?? '');
      if (!name.toLowerCase().endsWith('.glb')) {
        alert('Invalid model', 'Please select a .glb model file.');
        return;
      }
      setPendingModel({ uri: r.fileCopyUri ?? r.uri, name: r.name });
    } catch (e: any) {
      if (DocumentPicker.isCancel(e)) {
        return;
      }
      alert('Pick failed', e?.message ?? 'Could not pick model.');
    }
  };

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
      alert('Missing category', 'Please select a category.');
      return;
    }
    if (!categories.some((c) => c.id === category.trim())) {
      alert('Invalid category', 'Please select a valid category from your managed list.');
      return;
    }
    if (!Number.isFinite(numericPrice) || numericPrice < 0) {
      alert('Invalid price', 'Please enter a valid price.');
      return;
    }
    if (!brand.trim()) {
      alert('Missing brand', 'Please enter a brand.');
      return;
    }
    if (!description.trim()) {
      alert('Missing description', 'Please enter a description.');
      return;
    }
    if (!Number.isFinite(numericRating) || numericRating < 0 || numericRating > 5) {
      alert('Invalid rating', 'Rating must be a number from 0 to 5.');
      return;
    }
    if (!Number.isFinite(numericDiscount) || numericDiscount < 0 || numericDiscount > 100) {
      alert('Invalid discount', 'Discount must be a number from 0 to 100.');
      return;
    }

    const hasAnyImages = pendingImages.length > 0 || images.length > 0;
    if (!hasAnyImages) {
      alert('Missing images', 'Please pick at least one product image.');
      return;
    }

    try {
      setSaving(true);

      // Use a stable id for Storage paths when creating a new product.
      const productId = id ?? generateNewProductId();

      let nextImages = images;
      if (pendingImages.length > 0) {
        const uploaded: string[] = [];
        for (const f of pendingImages) {
          const { downloadUrl } = await uploadProductImage({ productId, file: f });
          uploaded.push(downloadUrl);
        }
        nextImages = uploaded;
      }
      const thumbnail = nextImages[0] ?? '';

      let nextModelUrl = modelUrl;
      if (pendingModel) {
        const { downloadUrl } = await uploadProductModel({ productId, file: pendingModel });
        nextModelUrl = downloadUrl;
      }

      const savedId = await upsertProduct({
        id: productId,
        title: title.trim(),
        category: category.trim(),
        price: numericPrice,
        stock: Number.isFinite(numericStock) ? Math.max(0, Math.floor(numericStock)) : 0,
        thumbnail,
        images: nextImages,
        rating: numericRating,
        discountPercentage: numericDiscount,
        brand: brand.trim(),
        description: description.trim(),
        modelUrl: nextModelUrl,
        isFeatured,
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
    <SafeAreaView
      edges={['top']}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>
          {isEdit ? 'Edit Product' : 'New Product'}
        </Text>
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
        <ScrollView contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">
          <Text style={[styles.label, { color: colors.textSecondary }]}>Title</Text>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="Product title"
            placeholderTextColor={colors.textSecondary}
            style={[
              styles.input,
              { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text },
            ]}
          />

          <Text style={[styles.label, { color: colors.textSecondary }]}>Category</Text>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => setCategoryPickerOpen(true)}
            style={[styles.picker, { backgroundColor: colors.surface, borderColor: colors.border }]}
          >
            <Text
              style={[styles.pickerText, { color: category ? colors.text : colors.textSecondary }]}
              numberOfLines={1}
            >
              {categoryLabel}
            </Text>
            <Ionicons name="chevron-down" size={18} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => navigation.navigate('AdminCategories')}
            style={[styles.manageCatBtn, { borderColor: colors.border }]}
          >
            <Ionicons name="albums-outline" size={16} color={colors.textSecondary} />
            <Text style={[styles.manageCatText, { color: colors.textSecondary }]}>
              Manage categories
            </Text>
          </TouchableOpacity>

          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Price</Text>
              <TextInput
                value={price}
                onChangeText={setPrice}
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor={colors.textSecondary}
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                    color: colors.text,
                  },
                ]}
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
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                    color: colors.text,
                  },
                ]}
              />
            </View>
          </View>

          <View style={styles.assetsCard}>
            <View style={styles.assetsHeader}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Images</Text>
              <TouchableOpacity
                onPress={pickImages}
                style={[
                  styles.assetBtn,
                  { backgroundColor: colors.surface, borderColor: colors.border },
                ]}
              >
                <Text style={[styles.assetBtnText, { color: colors.text }]}>Pick images</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.assetPreviewRow}>
              {(pendingImages.length > 0 ? pendingImages.map((p) => p.uri) : images)
                .slice(0, 6)
                .map((u) => (
                  <Image key={u} source={{ uri: u }} style={styles.assetThumb} />
                ))}
              {(pendingImages.length > 0 ? pendingImages.length : images.length) > 6 && (
                <View
                  style={[
                    styles.assetMore,
                    { backgroundColor: colors.surface, borderColor: colors.border },
                  ]}
                >
                  <Text style={[styles.assetMoreText, { color: colors.textSecondary }]}>
                    +{(pendingImages.length > 0 ? pendingImages.length : images.length) - 6}
                  </Text>
                </View>
              )}
            </View>
          </View>

          <View style={styles.assetsCard}>
            <View style={styles.assetsHeader}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>AR Model (.glb)</Text>
              <TouchableOpacity
                onPress={pickModel}
                style={[
                  styles.assetBtn,
                  { backgroundColor: colors.surface, borderColor: colors.border },
                ]}
              >
                <Text style={[styles.assetBtnText, { color: colors.text }]}>Pick model</Text>
              </TouchableOpacity>
            </View>
            <Text style={[styles.assetMeta, { color: colors.textSecondary }]} numberOfLines={1}>
              {modelMetaText}
            </Text>
          </View>

          <Text style={[styles.label, { color: colors.textSecondary }]}>Brand</Text>
          <TextInput
            value={brand}
            onChangeText={setBrand}
            placeholder="Brand"
            placeholderTextColor={colors.textSecondary}
            style={[
              styles.input,
              { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text },
            ]}
          />

          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Rating (0–5)</Text>
              <TextInput
                value={rating}
                onChangeText={setRating}
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor={colors.textSecondary}
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                    color: colors.text,
                  },
                ]}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>
                Discount % (0–100)
              </Text>
              <TextInput
                value={discountPercentage}
                onChangeText={setDiscountPercentage}
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor={colors.textSecondary}
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                    color: colors.text,
                  },
                ]}
              />
            </View>
          </View>

          {/* Featured Product Toggle */}
          <View style={styles.featuredSection}>
            <View style={styles.featuredRow}>
              <View style={styles.flex1}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>
                  Featured Product
                </Text>
                <Text style={[styles.featuredHint, { color: colors.textSecondary }]}>
                  Show this product on the home screen
                </Text>
              </View>
              <TouchableOpacity
                style={[
                  styles.toggleSwitch,
                  {
                    backgroundColor: isFeatured ? colors.primary : colors.surface,
                    borderColor: isFeatured ? colors.primary : colors.border,
                  },
                ]}
                onPress={() => setIsFeatured(!isFeatured)}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.toggleThumb,
                    {
                      backgroundColor: colors.background,
                      transform: [{ translateX: isFeatured ? 20 : 0 }],
                    },
                  ]}
                />
              </TouchableOpacity>
            </View>
          </View>

          <Text style={[styles.label, { color: colors.textSecondary }]}>Description</Text>
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder="Description"
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
            <Text style={[styles.saveText, { color: colors.background }]}>
              {saving ? 'Saving…' : 'Save'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      )}

      <Modal
        visible={categoryPickerOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setCategoryPickerOpen(false)}
      >
        <View style={styles.modalBackdrop}>
          <View
            style={[
              styles.modalCard,
              { backgroundColor: colors.background, borderColor: colors.border },
            ]}
          >
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Select category</Text>
              <TouchableOpacity
                onPress={() => setCategoryPickerOpen(false)}
                style={styles.modalClose}
              >
                <Ionicons name="close" size={22} color={colors.text} />
              </TouchableOpacity>
            </View>

            {categories.length === 0 ? (
              <View style={styles.modalEmpty}>
                <Text style={[styles.modalHint, { color: colors.textSecondary }]}>
                  No categories yet. Create one first.
                </Text>
                <TouchableOpacity
                  style={[styles.modalPrimary, { backgroundColor: colors.primary }]}
                  onPress={() => {
                    setCategoryPickerOpen(false);
                    navigation.navigate('AdminCategories');
                  }}
                >
                  <Text style={[styles.modalPrimaryText, { color: colors.background }]}>
                    Go to Categories
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <ScrollView style={styles.modalScroll}>
                {categories.map((c) => {
                  const selected = c.id === category;
                  return (
                    <TouchableOpacity
                      key={c.id}
                      activeOpacity={0.85}
                      onPress={() => {
                        setCategory(c.id);
                        setCategoryPickerOpen(false);
                      }}
                      style={[
                        styles.modalRow,
                        {
                          borderColor: colors.border,
                          backgroundColor: selected ? colors.surface : 'transparent',
                        },
                      ]}
                    >
                      <View style={styles.flex1}>
                        <Text style={[styles.modalRowTitle, { color: colors.text }]}>{c.name}</Text>
                        <Text style={[styles.modalRowMeta, { color: colors.textSecondary }]}>
                          {c.id}
                        </Text>
                      </View>
                      {selected && <Ionicons name="checkmark" size={18} color={colors.primary} />}
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 16, paddingBottom: 8 },
  title: { fontSize: 22, fontWeight: '800' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  help: { fontSize: 13 },
  form: { padding: 16, gap: 10, paddingBottom: 40 },
  label: { fontSize: 12, fontWeight: '700' },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  textArea: { minHeight: 90, textAlignVertical: 'top' },
  row: { flexDirection: 'row', gap: 10 },
  saveBtn: { marginTop: 6, borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
  saveText: { fontSize: 14, fontWeight: '800' },
  assetsCard: { gap: 10, paddingVertical: 6 },
  assetsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  assetBtn: { borderWidth: 1, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12 },
  assetBtnText: { fontSize: 12, fontWeight: '800' },
  assetPreviewRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  assetThumb: { width: 54, height: 54, borderRadius: 10, backgroundColor: '#00000010' },
  assetMore: {
    width: 54,
    height: 54,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  assetMoreText: { fontSize: 12, fontWeight: '800' },
  assetMeta: { fontSize: 12, fontWeight: '600' },
  picker: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  pickerText: { fontSize: 14, fontWeight: '700', flex: 1 },
  manageCatBtn: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  manageCatText: { fontSize: 12, fontWeight: '800' },
  featuredSection: {
    paddingVertical: 8,
  },
  featuredRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  featuredHint: {
    fontSize: 11,
    marginTop: 2,
  },
  toggleSwitch: {
    width: 50,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    padding: 2,
    justifyContent: 'center',
  },
  toggleThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  flex1: { flex: 1 },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCard: { width: '92%', borderRadius: 18, borderWidth: 1, padding: 14 },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  modalTitle: { fontSize: 16, fontWeight: '900' },
  modalClose: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalHint: { fontSize: 13, fontWeight: '700' },
  modalPrimary: { marginTop: 12, borderRadius: 12, paddingVertical: 12, alignItems: 'center' },
  modalPrimaryText: { fontSize: 13, fontWeight: '900' },
  modalRow: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 10,
  },
  modalRowTitle: { fontSize: 14, fontWeight: '900' },
  modalRowMeta: { fontSize: 12, marginTop: 2, fontWeight: '700' },
  modalEmpty: { paddingVertical: 10 },
  modalScroll: { maxHeight: 360 },
});
