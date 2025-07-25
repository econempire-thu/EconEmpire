import { useState, useEffect, createContext, useContext } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { auth, db } from "../firebase.config.js";
import { doc, setDoc } from "firebase/firestore";
import {
  initUserDataListener,
  cleanupUserListener,
  getUserData,
} from "../services/userService";

const AuthContext = createContext();

// 24 hours in milliseconds
const SESSION_TIMEOUT = 24 * 60 * 60 * 1000;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check for session timeout and handle auto-logout
  useEffect(() => {
    if (!user) return;

    // Check if login timestamp exists
    const loginTimestamp = localStorage.getItem("loginTimestamp");

    if (loginTimestamp) {
      const currentTime = Date.now();
      const lastLoginTime = parseInt(loginTimestamp, 10);

      // If more than 24 hours have passed, log the user out
      if (currentTime - lastLoginTime > SESSION_TIMEOUT) {
        signOut(auth).catch((error) => {
          console.error("Error signing out after timeout:", error);
        });
        localStorage.removeItem("loginTimestamp");
      }
    } else {
      // Set login timestamp if not exists
      localStorage.setItem("loginTimestamp", Date.now().toString());
    }

    // Schedule a check for timeout
    const intervalId = setInterval(() => {
      const timestamp = localStorage.getItem("loginTimestamp");
      if (timestamp) {
        const currentTime = Date.now();
        const loginTime = parseInt(timestamp, 10);

        if (currentTime - loginTime > SESSION_TIMEOUT) {
          signOut(auth).catch((error) => {
            console.error("Error signing out after timeout:", error);
          });
          localStorage.removeItem("loginTimestamp");
          clearInterval(intervalId);
        }
      }
    }, 60000); // Check every minute

    return () => clearInterval(intervalId);
  }, [user]);

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);

      if (user) {
        try {
          // Set login timestamp when user logs in
          localStorage.setItem("loginTimestamp", Date.now().toString());

          // Initialize user data listener and get initial data
          const initialData = await initUserDataListener();
          setUserData(initialData);
        } catch (error) {
          console.error("Error initializing user data:", error);
          setError(error.message);
        }
      } else {
        // Clean up listener when user logs out
        cleanupUserListener();
        setUserData(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Always keep userData in sync with cache
  useEffect(() => {
    if (user) {
      const intervalId = setInterval(() => {
        const latestUserData = getUserData();
        if (
          latestUserData &&
          JSON.stringify(latestUserData) !== JSON.stringify(userData)
        ) {
          setUserData(latestUserData);
        }
      }, 1000); // Check every second if there are changes

      return () => clearInterval(intervalId);
    }
  }, [user, userData]);

  // Auth methods
  const login = async (email, password) => {
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // Set fresh login timestamp
      localStorage.setItem("loginTimestamp", Date.now().toString());
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  const signup = async (email, password) => {
    setError(null);
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      // Set fresh login timestamp
      localStorage.setItem("loginTimestamp", Date.now().toString());
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  const logout = async () => {
    setError(null);
    try {
      // Clear waiting status if user exists
      if (user) {
        const userDocRef = doc(db, "users", user.uid);
        await setDoc(
          userDocRef,
          {
            isWaiting: false,
          },
          { merge: true },
        );
      }

      cleanupUserListener();
      localStorage.removeItem("loginTimestamp");
      await signOut(auth);
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userData,
        loading,
        error,
        login,
        signup,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};

export default useAuth;
