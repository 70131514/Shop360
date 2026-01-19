/**
 * Regression Tests for Product Catalog Service
 * 
 * Test Suite: Product Catalog Service Regression Tests
 * Purpose: Verify that product catalog functionality works correctly after code changes
 * Coverage: getProductById, getProductsByCategory, subscribeProducts
 */

import {
  getProductById,
  getProductsByCategory,
  subscribeProducts,
  subscribeProductById,
  subscribeFeaturedProducts,
  StoreProduct,
} from '../../src/services/productCatalogService';
import { getDoc, getDocs, onSnapshot, doc, collection, query, where, limit, orderBy } from '@react-native-firebase/firestore';
import { firebaseDb } from '../../src/services/firebase';

// Mock Firebase
jest.mock('@react-native-firebase/firestore');
jest.mock('../../src/services/firebase', () => ({
  firebaseDb: {},
}));

describe('Product Catalog Service - Regression Tests', () => {
  const mockProductData = {
    title: 'Test Product',
    price: 99.99,
    category: 'electronics',
    description: 'A test product',
    thumbnail: 'https://example.com/thumb.jpg',
    images: ['https://example.com/img1.jpg'],
    rating: 4.5,
    discountPercentage: 10,
    stock: 10,
    brand: 'TestBrand',
    modelUrl: 'https://example.com/model.glb',
    isFeatured: true,
    isNewArrival: false,
    isBestSeller: true,
    createdAt: { seconds: 1234567890 },
    updatedAt: { seconds: 1234567890 },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('RT-017: Get Product by ID', () => {
    it('should return product when it exists', async () => {
      (getDoc as jest.Mock).mockResolvedValue({
        exists: () => true,
        id: 'product-1',
        data: () => mockProductData,
      });

      const result = await getProductById('product-1');

      expect(getDoc).toHaveBeenCalledWith(doc(firebaseDb, 'products', 'product-1'));
      expect(result).toEqual({
        id: 'product-1',
        ...mockProductData,
        price: 99.99,
        discountPercentage: 10,
        stock: 10,
        rating: 4.5,
      });
    });

    it('should return null when product does not exist', async () => {
      (getDoc as jest.Mock).mockResolvedValue({
        exists: () => false,
        id: 'non-existent',
        data: () => null,
      });

      const result = await getProductById('non-existent');

      expect(result).toBeNull();
    });

    it('should normalize product data correctly', async () => {
      const productWithMissingFields = {
        title: 'Minimal Product',
        price: 50,
      };

      (getDoc as jest.Mock).mockResolvedValue({
        exists: () => true,
        id: 'product-2',
        data: () => productWithMissingFields,
      });

      const result = await getProductById('product-2');

      expect(result).toEqual({
        id: 'product-2',
        title: 'Minimal Product',
        price: 50,
        category: '',
        description: '',
        thumbnail: '',
        images: [],
        rating: 0,
        discountPercentage: 0,
        stock: 0,
        brand: '',
        modelUrl: undefined,
        isFeatured: false,
        isNewArrival: false,
        isBestSeller: false,
        createdAt: undefined,
        updatedAt: undefined,
      });
    });
  });

  describe('RT-018: Get Products by Category', () => {
    it('should return products filtered by category', async () => {
      const mockProducts = [
        { id: 'product-1', data: () => ({ ...mockProductData, category: 'electronics' }) },
        { id: 'product-2', data: () => ({ ...mockProductData, category: 'electronics' }) },
      ];

      (getDocs as jest.Mock).mockResolvedValue({
        docs: mockProducts,
      });

      const result = await getProductsByCategory({ category: 'electronics' });

      expect(result).toHaveLength(2);
      expect(result[0].category).toBe('electronics');
    });

    it('should exclude specified product ID', async () => {
      const mockProducts = [
        { id: 'product-1', data: () => ({ ...mockProductData, category: 'electronics' }) },
        { id: 'product-2', data: () => ({ ...mockProductData, category: 'electronics' }) },
        { id: 'product-3', data: () => ({ ...mockProductData, category: 'electronics' }) },
      ];

      (getDocs as jest.Mock).mockResolvedValue({
        docs: mockProducts,
      });

      const result = await getProductsByCategory({
        category: 'electronics',
        excludeId: 'product-2',
      });

      expect(result).toHaveLength(2);
      expect(result.find((p) => p.id === 'product-2')).toBeUndefined();
    });

    it('should respect max limit', async () => {
      const mockProducts = Array.from({ length: 5 }, (_, i) => ({
        id: `product-${i}`,
        data: () => ({ ...mockProductData, category: 'electronics' }),
      }));

      (getDocs as jest.Mock).mockResolvedValue({
        docs: mockProducts,
      });

      const result = await getProductsByCategory({
        category: 'electronics',
        max: 5,
      });

      expect(result.length).toBeLessThanOrEqual(5);
      expect(result.length).toBe(5);
    });
  });

  describe('RT-019: Subscribe to Products', () => {
    it('should subscribe to product changes', () => {
      const mockUnsubscribe = jest.fn();
      (onSnapshot as jest.Mock).mockReturnValue(mockUnsubscribe);
      
      const callback = jest.fn();
      const unsubscribe = subscribeProducts(callback);

      expect(onSnapshot).toHaveBeenCalled();
      expect(typeof unsubscribe).toBe('function');
    });

    it('should call callback with normalized products', () => {
      const callback = jest.fn();
      let snapshotCallback: any;

      (onSnapshot as jest.Mock).mockImplementation((q, onNext, onError) => {
        snapshotCallback = onNext;
        return jest.fn();
      });

      subscribeProducts(callback);

      const mockSnapshot = {
        docs: [
          {
            id: 'product-1',
            data: () => mockProductData,
          },
        ],
      };

      snapshotCallback(mockSnapshot);

      expect(callback).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            id: 'product-1',
            title: 'Test Product',
          }),
        ]),
      );
    });
  });

  describe('RT-020: Subscribe to Single Product', () => {
    it('should subscribe to single product changes', () => {
      const callback = jest.fn();
      const unsubscribe = subscribeProductById('product-1', callback);

      expect(onSnapshot).toHaveBeenCalled();
      expect(typeof unsubscribe).toBe('function');
    });

    it('should call callback with null when product is deleted', () => {
      const callback = jest.fn();
      let snapshotCallback: any;

      (onSnapshot as jest.Mock).mockImplementation((ref, onNext, onError) => {
        snapshotCallback = onNext;
        return jest.fn();
      });

      subscribeProductById('product-1', callback);

      const mockSnapshot = {
        exists: () => false,
      };

      snapshotCallback(mockSnapshot);

      expect(callback).toHaveBeenCalledWith(null);
    });
  });

  describe('RT-021: Subscribe to Featured Products', () => {
    it('should filter and return only featured products', () => {
      const callback = jest.fn();
      let snapshotCallback: any;

      (onSnapshot as jest.Mock).mockImplementation((q, onNext, onError) => {
        snapshotCallback = onNext;
        return jest.fn();
      });

      subscribeFeaturedProducts(callback);

      const mockSnapshot = {
        docs: [
          {
            id: 'product-1',
            data: () => ({ ...mockProductData, isFeatured: true }),
          },
          {
            id: 'product-2',
            data: () => ({ ...mockProductData, isFeatured: false }),
          },
          {
            id: 'product-3',
            data: () => ({ ...mockProductData, isFeatured: true }),
          },
        ],
      };

      snapshotCallback(mockSnapshot);

      expect(callback).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ id: 'product-1', isFeatured: true }),
          expect.objectContaining({ id: 'product-3', isFeatured: true }),
        ]),
      );
      expect(callback).not.toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ id: 'product-2' }),
        ]),
      );
    });
  });
});
