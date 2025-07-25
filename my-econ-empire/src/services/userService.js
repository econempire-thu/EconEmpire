import { doc, getDoc, updateDoc, onSnapshot, setDoc } from "firebase/firestore";
import { db, auth } from "../firebase.config.js";

// Cache for user data
let userDataCache = null;
let unsubscribe = null;

/**
 * Initialize user data listener that keeps local cache updated
 * @returns {Promise<Object>} Initial user data
 */
export const initUserDataListener = async () => {
  if (!auth.currentUser) {
    throw new Error("No authenticated user found");
  }

  const userId = auth.currentUser.uid;
  const userRef = doc(db, "users", userId);

  // Clear any existing subscription
  if (unsubscribe) {
    unsubscribe();
  }

  // Set up real-time listener to keep cache updated
  unsubscribe = onSnapshot(
    userRef,
    (doc) => {
      if (doc.exists()) {
        userDataCache = doc.data();
      } else {
        userDataCache = null;
      }
    },
    (error) => {
      console.error("Error listening to user data:", error);
    },
  );

  // Get initial data synchronously
  const docSnap = await getDoc(userRef);
  if (docSnap.exists()) {
    userDataCache = docSnap.data();
    return userDataCache;
  } else {
    // If user document doesn't exist, create it with basic data
    const initialData = {
      userId,
      email: auth.currentUser.email,
      createdAt: new Date(),
    };
    await setDoc(userRef, initialData);
    userDataCache = initialData;
    return initialData;
  }
};

/**
 * Get current user data from cache
 * @returns {Object|null} User data or null if not available
 */
export const getUserData = () => {
  return userDataCache;
};

/**
 * Get a specific field from user data
 * @param {string} field - Field name to retrieve
 * @param {*} defaultValue - Default value if field doesn't exist
 * @returns {*} Field value or default value
 */
export const getUserField = (field, defaultValue = null) => {
  if (!userDataCache) return defaultValue;
  return userDataCache[field] !== undefined
    ? userDataCache[field]
    : defaultValue;
};

/**
 * Update a specific field in user data
 * @param {string} field - Field name to update
 * @param {*} value - New value
 * @returns {Promise<void>}
 */
export const updateUserField = async (field, value) => {
  if (!auth.currentUser) {
    throw new Error("No authenticated user found");
  }

  const userId = auth.currentUser.uid;
  const userRef = doc(db, "users", userId);

  const update = {};
  update[field] = value;

  await updateDoc(userRef, update);
  // Cache will be updated automatically by the listener
};

/**
 * Update multiple fields in user data
 * @param {Object} fields - Object containing field-value pairs to update
 * @returns {Promise<void>}
 */
export const updateUserFields = async (fields) => {
  if (!auth.currentUser) {
    throw new Error("No authenticated user found");
  }

  const userId = auth.currentUser.uid;
  const userRef = doc(db, "users", userId);

  await updateDoc(userRef, fields);
  // Cache will be updated automatically by the listener
};

/**
 * Clean up listener when no longer needed (e.g., on logout)
 */
export const cleanupUserListener = () => {
  if (unsubscribe) {
    unsubscribe();
    unsubscribe = null;
  }
  userDataCache = null;
};
