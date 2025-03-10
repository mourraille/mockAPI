import { createContext, useContext, useEffect, useState } from "react";
import {
  GoogleAuthProvider,
  OAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { auth } from "../config/firebase";

const AuthContext = createContext();

// Helper function to save user to the database
const saveUserToDatabase = async (user) => {
  try {
    const apiUrl = import.meta.env.PROD
      ? "https://apimock.mourraille.com"
      : "http://localhost:3021";

    // Get provider ID (google.com, apple.com, etc.)
    const providerId = user.providerData[0]?.providerId || "unknown";

    await fetch(`${apiUrl}/users`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        provider: providerId,
      }),
    });
  } catch (error) {
    console.error("Error saving user to database:", error);
  }
};

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Sign in with Google
  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      // User is automatically saved to database in the onAuthStateChanged listener
      return result.user;
    } catch (error) {
      console.error("Google Sign In Error:", error);
      throw error;
    }
  };

  // Sign in with Apple
  const signInWithApple = async () => {
    const provider = new OAuthProvider("apple.com");
    try {
      const result = await signInWithPopup(auth, provider);
      // User is automatically saved to database in the onAuthStateChanged listener
      return result.user;
    } catch (error) {
      console.error("Apple Sign In Error:", error);
      throw error;
    }
  };

  // Sign out
  const logout = () => {
    return signOut(auth);
  };

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);

      // Save user to database when they sign in
      if (user) {
        await saveUserToDatabase(user);
      }

      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    signInWithGoogle,
    signInWithApple,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
