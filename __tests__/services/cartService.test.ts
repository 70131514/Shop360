/**
 * Regression Tests for Cart Service
 * 
 * Test Suite: Cart Service Regression Tests
 * Purpose: Verify that cart functionality works correctly after code changes
 * Coverage: addToCart, removeFromCart, setCartItemQuantity, clearCart, guest cart migration
 */

import {
  addToCart,
  removeFromCart,
  setCartItemQuantity,
  clearCart,
  subscribeCart,
  migrateGuestCartToUserCart,
  upsertCartItem,
  CartItem,
} from '../../src/services/cartService';
import { getProductById } from '../../src/services/productCatalogService';
import { getDoc, setDoc, deleteDoc, getDocs, runTransaction, writeBatch, doc, collection, onSnapshot } from '@react-native-firebase/firestore';
import { firebaseAuth } from '../../src/services/firebase';
import * as storage from '../../src/utils/storage';

// Mock dependencies
jest.mock('@react-native-firebase/firestore');
jest.mock('../../src/services/firebase', () => ({
  firebaseAuth: {
    currentUser: null,
  },
  firebaseDb: {},
}));
jest.mock('../../src/services/productCatalogService');
jest.mock('../../src/utils/storage', () => ({
  getCart: jest.fn(),
  storeCart: jest.fn(),
}));

describe('Cart Service - Regression Tests', () => {
  const mockProduct = {
    id: 'product-1',
    title: 'Test Product',
    price: 99.99,
    stock: 10,
    discountPercentage: 0,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (firebaseAuth as any).currentUser = null;
    (getProductById as jest.Mock).mockResolvedValue(mockProduct);
    (storage.getCart as jest.Mock).mockResolvedValue([]);
    (storage.storeCart as jest.Mock).mockResolvedValue(undefined);
  });

  describe('RT-009: Add Item to Cart (Guest)', () => {
    it('should add new item to guest cart successfully', async () => {
      (storage.getCart as jest.Mock).mockResolvedValue([]);

      await addToCart({
        id: 'product-1',
        name: 'Test Product',
        price: 99.99,
        quantity: 1,
      });

      expect(getProductById).toHaveBeenCalledWith('product-1');
      expect(storage.storeCart).toHaveBeenCalled();
    });

    it('should increment quantity if item already exists in cart', async () => {
      const existingCart: CartItem[] = [
        {
          id: 'product-1',
          name: 'Test Product',
          price: 99.99,
          quantity: 2,
        },
      ];
      (storage.getCart as jest.Mock).mockResolvedValue(existingCart);

      await addToCart({
        id: 'product-1',
        name: 'Test Product',
        price: 99.99,
        quantity: 1,
      });

      expect(storage.storeCart).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            id: 'product-1',
            quantity: 3,
          }),
        ]),
      );
    });

    it('should throw error when product is out of stock', async () => {
      (getProductById as jest.Mock).mockResolvedValue({
        ...mockProduct,
        stock: 0,
      });

      await expect(
        addToCart({
          id: 'product-1',
          name: 'Test Product',
          price: 99.99,
          quantity: 1,
        }),
      ).rejects.toThrow('Product is out of stock');
    });

    it('should throw error when quantity exceeds available stock', async () => {
      (getProductById as jest.Mock).mockResolvedValue({
        ...mockProduct,
        stock: 5,
      });

      await expect(
        addToCart({
          id: 'product-1',
          name: 'Test Product',
          price: 99.99,
          quantity: 10,
        }),
      ).rejects.toThrow('Only 5 item(s) available in stock');
    });
  });

  describe('RT-010: Add Item to Cart (Authenticated User)', () => {
    beforeEach(() => {
      (firebaseAuth as any).currentUser = {
        uid: 'user-123',
        email: 'user@example.com',
        emailVerified: true,
      };
    });

    it('should add item to Firestore cart for authenticated user', async () => {
      // Mock doc to return objects with path property
      (doc as jest.Mock).mockImplementation((db, ...pathSegments) => {
        const path = pathSegments.join('/');
        return { path, id: pathSegments[pathSegments.length - 1] };
      });

      (runTransaction as jest.Mock).mockImplementation(async (db, callback) => {
        const tx = {
          get: jest.fn().mockImplementation((ref) => {
            // Check if ref is a product reference by checking its path
            const refPath = ref?.path || '';
            if (refPath.includes('products')) {
              return Promise.resolve({
                exists: () => true,
                data: () => ({
                  price: 99.99,
                  stock: 10,
                  discountPercentage: 0,
                }),
              });
            }
            // For cart references, return empty (doesn't exist yet)
            return Promise.resolve({
              exists: () => false,
              data: () => ({}),
            });
          }),
          set: jest.fn(),
          update: jest.fn(),
        };
        return await callback(tx);
      });

      await addToCart({
        id: 'product-1',
        name: 'Test Product',
        price: 99.99,
        quantity: 1,
      });

      expect(runTransaction).toHaveBeenCalled();
    });

    it('should throw error if user email is not verified', async () => {
      (firebaseAuth as any).currentUser = {
        uid: 'user-123',
        email: 'user@example.com',
        emailVerified: false,
      };

      await expect(
        addToCart({
          id: 'product-1',
          name: 'Test Product',
          price: 99.99,
          quantity: 1,
        }),
      ).rejects.toThrow('Please verify your email to add items to cart');
    });
  });

  describe('RT-011: Remove Item from Cart', () => {
    it('should remove item from guest cart successfully', async () => {
      const existingCart: CartItem[] = [
        {
          id: 'product-1',
          name: 'Test Product',
          price: 99.99,
          quantity: 2,
        },
        {
          id: 'product-2',
          name: 'Another Product',
          price: 49.99,
          quantity: 1,
        },
      ];
      (storage.getCart as jest.Mock).mockResolvedValue(existingCart);

      await removeFromCart('product-1');

      expect(storage.storeCart).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ id: 'product-2' }),
        ]),
      );
      expect(storage.storeCart).toHaveBeenCalledWith(
        expect.not.arrayContaining([
          expect.objectContaining({ id: 'product-1' }),
        ]),
      );
    });

    it('should remove item from Firestore cart for authenticated user', async () => {
      (firebaseAuth as any).currentUser = {
        uid: 'user-123',
        email: 'user@example.com',
        emailVerified: true,
      };

      await removeFromCart('product-1');

      expect(deleteDoc).toHaveBeenCalled();
    });
  });

  describe('RT-012: Set Cart Item Quantity', () => {
    it('should update quantity for existing item in guest cart', async () => {
      const existingCart: CartItem[] = [
        {
          id: 'product-1',
          name: 'Test Product',
          price: 99.99,
          quantity: 2,
        },
      ];
      (storage.getCart as jest.Mock).mockResolvedValue(existingCart);

      await setCartItemQuantity('product-1', 5);

      expect(storage.storeCart).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            id: 'product-1',
            quantity: 5,
          }),
        ]),
      );
    });

    it('should remove item when quantity is set to 0', async () => {
      const existingCart: CartItem[] = [
        {
          id: 'product-1',
          name: 'Test Product',
          price: 99.99,
          quantity: 2,
        },
      ];
      (storage.getCart as jest.Mock).mockResolvedValue(existingCart);

      await setCartItemQuantity('product-1', 0);

      expect(storage.storeCart).toHaveBeenCalledWith([]);
    });

    it('should throw error when quantity exceeds stock', async () => {
      (getProductById as jest.Mock).mockResolvedValue({
        ...mockProduct,
        stock: 3,
      });

      await expect(setCartItemQuantity('product-1', 10)).rejects.toThrow(
        'Only 3 item(s) available in stock',
      );
    });
  });

  describe('RT-013: Clear Cart', () => {
    it('should clear all items from guest cart', async () => {
      const existingCart: CartItem[] = [
        {
          id: 'product-1',
          name: 'Test Product',
          price: 99.99,
          quantity: 2,
        },
      ];
      (storage.getCart as jest.Mock).mockResolvedValue(existingCart);

      await clearCart();

      expect(storage.storeCart).toHaveBeenCalledWith([]);
    });

    it('should clear all items from Firestore cart for authenticated user', async () => {
      (firebaseAuth as any).currentUser = {
        uid: 'user-123',
        email: 'user@example.com',
        emailVerified: true,
      };

      const mockDocs = [
        { ref: doc({}, 'users/user-123/cart/product-1') },
        { ref: doc({}, 'users/user-123/cart/product-2') },
      ];
      (getDocs as jest.Mock).mockResolvedValue({ docs: mockDocs });
      (writeBatch as jest.Mock).mockReturnValue({
        delete: jest.fn(),
        commit: jest.fn().mockResolvedValue(undefined),
      });

      await clearCart();

      expect(getDocs).toHaveBeenCalled();
    });
  });

  describe('RT-014: Guest Cart Migration', () => {
    it('should migrate guest cart items to user cart on login', async () => {
      const guestCart: CartItem[] = [
        {
          id: 'product-1',
          name: 'Test Product',
          price: 99.99,
          quantity: 2,
        },
      ];
      (storage.getCart as jest.Mock).mockResolvedValue(guestCart);
      (firebaseAuth as any).currentUser = {
        uid: 'user-123',
        email: 'user@example.com',
        emailVerified: true,
      };

      // Mock doc to return objects with path property
      (doc as jest.Mock).mockImplementation((db, ...pathSegments) => {
        const path = pathSegments.join('/');
        return { path, id: pathSegments[pathSegments.length - 1] };
      });

      (runTransaction as jest.Mock).mockImplementation(async (db, callback) => {
        const tx = {
          get: jest.fn().mockImplementation((ref) => {
            // Check if ref is a product reference by checking its path
            const refPath = ref?.path || '';
            if (refPath.includes('products')) {
              return Promise.resolve({
                exists: () => true,
                data: () => ({
                  price: 99.99,
                  stock: 10,
                  discountPercentage: 0,
                }),
              });
            }
            // For cart references, return empty (doesn't exist yet)
            return Promise.resolve({
              exists: () => false,
              data: () => ({}),
            });
          }),
          set: jest.fn(),
          update: jest.fn(),
        };
        return await callback(tx);
      });

      await migrateGuestCartToUserCart();

      expect(runTransaction).toHaveBeenCalled();
      expect(storage.storeCart).toHaveBeenCalledWith([]);
    });

    it('should not migrate if user is not authenticated', async () => {
      (firebaseAuth as any).currentUser = null;

      await migrateGuestCartToUserCart();

      expect(runTransaction).not.toHaveBeenCalled();
    });
  });

  describe('RT-015: Cart Subscription', () => {
    it('should subscribe to guest cart changes', async () => {
      (storage.getCart as jest.Mock).mockResolvedValue([]);
      const callback = jest.fn();
      const unsubscribe = subscribeCart(callback);

      // Wait for initial callback
      await new Promise(resolve => setTimeout(resolve, 10));

      expect(typeof unsubscribe).toBe('function');
    });

    it('should subscribe to Firestore cart for authenticated user', () => {
      (firebaseAuth as any).currentUser = {
        uid: 'user-123',
        email: 'user@example.com',
        emailVerified: true,
      };

      (onSnapshot as jest.Mock).mockReturnValue(jest.fn());

      const callback = jest.fn();
      const unsubscribe = subscribeCart(callback);

      expect(typeof unsubscribe).toBe('function');
    });
  });
});
