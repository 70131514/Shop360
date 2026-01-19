// Mock for @react-native-firebase/firestore
const mockDoc = jest.fn();
const mockCollection = jest.fn();
const mockGetDoc = jest.fn();
const mockGetDocs = jest.fn();
const mockSetDoc = jest.fn();
const mockUpdateDoc = jest.fn();
const mockDeleteDoc = jest.fn();
const mockQuery = jest.fn();
const mockWhere = jest.fn();
const mockOrderBy = jest.fn();
const mockLimit = jest.fn();
const mockOnSnapshot = jest.fn();
const mockRunTransaction = jest.fn();
const mockWriteBatch = jest.fn();
const mockIncrement = jest.fn();
const mockServerTimestamp = jest.fn(() => ({ seconds: Date.now() / 1000, nanoseconds: 0 }));

export const getFirestore = jest.fn(() => ({
  collection: mockCollection,
  doc: mockDoc,
}));

export const collection = mockCollection;
export const doc = mockDoc;
export const getDoc = mockGetDoc;
export const getDocs = mockGetDocs;
export const setDoc = mockSetDoc;
export const updateDoc = mockUpdateDoc;
export const deleteDoc = mockDeleteDoc;
export const query = mockQuery;
export const where = mockWhere;
export const orderBy = mockOrderBy;
export const limit = mockLimit;
export const onSnapshot = mockOnSnapshot;
export const runTransaction = mockRunTransaction;
export const writeBatch = mockWriteBatch;
export const increment = mockIncrement;
export const serverTimestamp = mockServerTimestamp;

// Export mocks for use in tests
export const mocks = {
  mockDoc,
  mockCollection,
  mockGetDoc,
  mockGetDocs,
  mockSetDoc,
  mockUpdateDoc,
  mockDeleteDoc,
  mockQuery,
  mockWhere,
  mockOrderBy,
  mockLimit,
  mockOnSnapshot,
  mockRunTransaction,
  mockWriteBatch,
  mockIncrement,
  mockServerTimestamp,
};
