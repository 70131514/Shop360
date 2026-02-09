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
  deleteProduct,
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
  const [isNewArrival, setIsNewArrival] = useState(false);
  const [isBestSeller, setIsBestSeller] = useState(false);

  // Existing (remote) assets
  const [images, setImages] = useState<string[]>([]);
  const [modelUrl, setModelUrl] = useState<string>('');

  // Newly picked (local) assets to upload on save
  const [pendingImages, setPendingImages] = useState<PickedLocalFile[]>([]);
  const [pendingModel, setPendingModel] = useState<PickedLocalFile | null>(null);

  const [categories, setCategories] = useState<StoreCategory[]>([]);
  const [categoryPickerOpen, setCategoryPickerOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

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
        setIsNewArrival(Boolean((p as any).isNewArrival ?? false));
        setIsBestSeller(Boolean((p as any).isBestSeller ?? false));
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

  const pickImages = async () => {
    try {
      const currentTotal = images.length + pendingImages.length;
      const maxAllowed = 5;
      const remainingSlots = maxAllowed - currentTotal;

      if (remainingSlots <= 0) {
        alert('Maximum images reached', `You can upload up to ${maxAllowed} images per product.`);
        return;
      }

      const res = await DocumentPicker.pick({
        type: [DocumentPicker.types.images],
        allowMultiSelection: true,
        copyTo: 'cachesDirectory',
      });

      const files: PickedLocalFile[] = res.map((r: any) => ({
        uri: r.fileCopyUri ?? r.uri,
        name: r.name,
      }));

      // Limit to remaining slots
      const filesToAdd = files.slice(0, remainingSlots);
      if (files.length > remainingSlots) {
        alert(
          'Some images not added',
          `Only ${remainingSlots} image(s) added. Maximum ${maxAllowed} images allowed.`,
        );
      }

      setPendingImages([...pendingImages, ...filesToAdd]);
    } catch (e: any) {
      if (DocumentPicker.isCancel(e)) {
        return;
      }
      alert('Pick failed', e?.message ?? 'Could not pick images.');
    }
  };

  const removeExistingImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);
  };

  const removePendingImage = (index: number) => {
    const newPending = pendingImages.filter((_, i) => i !== index);
    setPendingImages(newPending);
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

    const totalImages = images.length + pendingImages.length;
    if (totalImages === 0) {
      alert('Missing images', 'Please pick at least one product image (1-5 images required).');
      return;
    }
    if (totalImages > 5) {
      alert('Too many images', 'Maximum 5 images allowed per product.');
      return;
    }

    try {
      setSaving(true);

      // Use a stable id for Storage paths when creating a new product.
      // This ensures all images/models are stored under the same product ID folder
      const productId = id ?? generateNewProductId();

      // Combine existing images with newly uploaded ones
      let nextImages = [...images]; // Keep existing images
      if (pendingImages.length > 0) {
        // Upload new images to Firebase Storage under images/{productId}/
        const uploaded: string[] = [];
        for (const f of pendingImages) {
          const { downloadUrl } = await uploadProductImage({ productId, file: f });
          uploaded.push(downloadUrl);
        }
        // Add new images to existing ones
        nextImages = [...nextImages, ...uploaded];
      }
      // First image becomes thumbnail
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
        isNewArrival,
        isBestSeller,
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

  const handleDelete = async () => {
    if (!isAdmin || !id) {
      return;
    }

    alert(
      'Delete Product?',
      `"${title || 'this product'}" will be removed from the app, Firestore, and Firebase Storage. ` +
        `Users who had it in cart or wishlist will be notified. ` +
        `Deletion is blocked if the product is in an active (processing/shipped) order. This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setDeleting(true);
              await deleteProduct(id);
              alert('Deleted', 'Product has been deleted from the app, Firestore, and Storage.');
              navigation.goBack();
            } catch (e: any) {
              alert('Delete failed', e?.message ?? 'Please try again.');
            } finally {
              setDeleting(false);
            }
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView
      edges={['top']}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            style={[styles.headerButton, { backgroundColor: colors.surface }]}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={22} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.text }]}>
            {isEdit ? 'Edit Product' : 'New Product'}
          </Text>
        </View>
        {isEdit && id && (
          <TouchableOpacity
            style={[styles.deleteButton, { backgroundColor: '#FF3B30' }]}
            onPress={handleDelete}
            disabled={deleting}
          >
            <Ionicons name="trash-outline" size={20} color="#FFF" />
          </TouchableOpacity>
        )}
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
              <View style={styles.flex1}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>
                  Product Images (1-5 required)
                </Text>
                <Text style={[styles.assetMeta, { color: colors.textSecondary, marginTop: 2 }]}>
                  {images.length + pendingImages.length} / 5 images
                </Text>
              </View>
              <TouchableOpacity
                onPress={pickImages}
                disabled={images.length + pendingImages.length >= 5}
                style={[
                  styles.assetBtn,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                    opacity: images.length + pendingImages.length >= 5 ? 0.5 : 1,
                  },
                ]}
              >
                <Text style={[styles.assetBtnText, { color: colors.text }]}>Add images</Text>
              </TouchableOpacity>
            </View>

            {/* Existing Images (from Firestore) */}
            {images.length > 0 && (
              <View style={styles.imageSection}>
                <Text style={[styles.imageSectionLabel, { color: colors.textSecondary }]}>
                  Existing Images
                </Text>
                <View style={styles.assetPreviewRow}>
                  {images.map((url, index) => (
                    <View key={`existing-${index}`} style={styles.imageItemContainer}>
                      <Image source={{ uri: url }} style={styles.assetThumb} />
                      <TouchableOpacity
                        style={[styles.removeImageBtn, { backgroundColor: '#FF3B30' }]}
                        onPress={() => removeExistingImage(index)}
                      >
                        <Ionicons name="close" size={14} color="#FFF" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Pending Images (newly picked, not yet uploaded) */}
            {pendingImages.length > 0 && (
              <View style={styles.imageSection}>
                <Text style={[styles.imageSectionLabel, { color: colors.textSecondary }]}>
                  New Images (will be uploaded)
                </Text>
                <View style={styles.assetPreviewRow}>
                  {pendingImages.map((file, index) => (
                    <View key={`pending-${index}`} style={styles.imageItemContainer}>
                      <Image source={{ uri: file.uri }} style={styles.assetThumb} />
                      <TouchableOpacity
                        style={[styles.removeImageBtn, { backgroundColor: '#FF3B30' }]}
                        onPress={() => removePendingImage(index)}
                      >
                        <Ionicons name="close" size={14} color="#FFF" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Empty state */}
            {images.length === 0 && pendingImages.length === 0 && (
              <View style={styles.emptyImageState}>
                <Ionicons name="images-outline" size={32} color={colors.textSecondary} />
                <Text style={[styles.emptyImageText, { color: colors.textSecondary }]}>
                  No images selected
                </Text>
                <Text style={[styles.emptyImageSubtext, { color: colors.textSecondary }]}>
                  Add 1-5 product images
                </Text>
              </View>
            )}
          </View>

          <View style={styles.assetsCard}>
            <View style={styles.assetsHeader}>
              <View style={styles.flex1}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>
                  AR Model (.glb) - Optional
                </Text>
                <Text style={[styles.assetMeta, { color: colors.textSecondary, marginTop: 2 }]}>
                  {modelUrl || pendingModel ? '1 model' : 'No model (AR will use defaults)'}
                </Text>
              </View>
              <TouchableOpacity
                onPress={pickModel}
                disabled={!!pendingModel}
                style={[
                  styles.assetBtn,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                    opacity: pendingModel ? 0.5 : 1,
                  },
                ]}
              >
                <Text style={[styles.assetBtnText, { color: colors.text }]}>
                  {modelUrl ? 'Replace' : pendingModel ? 'Selected' : 'Pick model'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Show existing model */}
            {modelUrl && !pendingModel && (
              <View style={styles.modelPreviewContainer}>
                <View
                  style={[
                    styles.modelPreview,
                    { backgroundColor: colors.surface, borderColor: colors.border },
                  ]}
                >
                  <Ionicons name="cube" size={24} color={colors.primary} />
                  <Text style={[styles.modelPreviewText, { color: colors.text }]} numberOfLines={1}>
                    Model uploaded
                  </Text>
                </View>
                <TouchableOpacity
                  style={[styles.removeModelBtn, { backgroundColor: '#FF3B30' }]}
                  onPress={() => setModelUrl('')}
                >
                  <Ionicons name="trash-outline" size={16} color="#FFF" />
                </TouchableOpacity>
              </View>
            )}

            {/* Show pending model */}
            {pendingModel && (
              <View style={styles.modelPreviewContainer}>
                <View
                  style={[
                    styles.modelPreview,
                    { backgroundColor: colors.surface, borderColor: colors.border },
                  ]}
                >
                  <Ionicons name="cube-outline" size={24} color={colors.primary} />
                  <Text style={[styles.modelPreviewText, { color: colors.text }]} numberOfLines={1}>
                    {pendingModel.name}
                  </Text>
                </View>
                <TouchableOpacity
                  style={[styles.removeModelBtn, { backgroundColor: '#FF3B30' }]}
                  onPress={() => setPendingModel(null)}
                >
                  <Ionicons name="close" size={16} color="#FFF" />
                </TouchableOpacity>
              </View>
            )}
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

            <View style={[styles.featuredRow, { marginTop: 16 }]}>
              <View style={styles.flex1}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>
                  New Arrival
                </Text>
                <Text style={[styles.featuredHint, { color: colors.textSecondary }]}>
                  Show in New Arrivals section
                </Text>
              </View>
              <TouchableOpacity
                style={[
                  styles.toggleSwitch,
                  {
                    backgroundColor: isNewArrival ? colors.primary : colors.surface,
                    borderColor: isNewArrival ? colors.primary : colors.border,
                  },
                ]}
                onPress={() => setIsNewArrival(!isNewArrival)}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.toggleThumb,
                    {
                      backgroundColor: colors.background,
                      transform: [{ translateX: isNewArrival ? 20 : 0 }],
                    },
                  ]}
                />
              </TouchableOpacity>
            </View>

            <View style={[styles.featuredRow, { marginTop: 16 }]}>
              <View style={styles.flex1}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>
                  Best Seller
                </Text>
                <Text style={[styles.featuredHint, { color: colors.textSecondary }]}>
                  Show in Best Sellers section
                </Text>
              </View>
              <TouchableOpacity
                style={[
                  styles.toggleSwitch,
                  {
                    backgroundColor: isBestSeller ? colors.primary : colors.surface,
                    borderColor: isBestSeller ? colors.primary : colors.border,
                  },
                ]}
                onPress={() => setIsBestSeller(!isBestSeller)}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.toggleThumb,
                    {
                      backgroundColor: colors.background,
                      transform: [{ translateX: isBestSeller ? 20 : 0 }],
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    paddingBottom: 8,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: { fontSize: 22, fontWeight: '800', flex: 1 },
  deleteButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
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
  imageSection: {
    marginTop: 12,
    gap: 8,
  },
  imageSectionLabel: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  imageItemContainer: {
    position: 'relative',
  },
  removeImageBtn: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  emptyImageState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
    gap: 8,
  },
  emptyImageText: {
    fontSize: 14,
    fontWeight: '600',
  },
  emptyImageSubtext: {
    fontSize: 12,
  },
  modelPreviewContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
  },
  modelPreview: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  modelPreviewText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
  },
  removeModelBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
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
