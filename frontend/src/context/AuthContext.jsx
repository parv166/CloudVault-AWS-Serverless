import {
  useCallback,
  useEffect,
  useState,
} from "react";

import { AuthContext } from "./auth-context.js";

import {
  confirmSignUp as amplifyConfirmSignUp,
  getCurrentUser,
  resendSignUpCode as amplifyResendSignUpCode,
  signIn as amplifySignIn,
  signOut as amplifySignOut,
  signUp as amplifySignUp,
} from "aws-amplify/auth";

import { authConfigured } from "../config/amplify.js";

function requireConfiguration() {
  if (!authConfigured) {
    throw new Error(
      "CloudVault authentication is not configured. Cognito settings are required.",
    );
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    if (!authConfigured) {
      setUser(null);
      return null;
    }

    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
      return currentUser;
    } catch {
      setUser(null);
      return null;
    }
  }, []);

  useEffect(() => {
    let active = true;

    async function restoreSession() {
      if (!authConfigured) {
        setLoading(false);
        return;
      }

      try {
        const currentUser = await getCurrentUser();

        if (active) {
          setUser(currentUser);
        }
      } catch {
        if (active) {
          setUser(null);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    restoreSession();

    return () => {
      active = false;
    };
  }, []);

  const signUp = async (email, password) => {
    requireConfiguration();

    return amplifySignUp({
      username: email.trim().toLowerCase(),
      password,
      options: {
        userAttributes: {
          email: email.trim().toLowerCase(),
        },
      },
    });
  };

  const confirmSignUp = async (email, confirmationCode) => {
    requireConfiguration();

    return amplifyConfirmSignUp({
      username: email.trim().toLowerCase(),
      confirmationCode: confirmationCode.trim(),
    });
  };

  const resendSignUpCode = async (email) => {
    requireConfiguration();

    return amplifyResendSignUpCode({
      username: email.trim().toLowerCase(),
    });
  };

  const signIn = async (email, password) => {
    requireConfiguration();

    const result = await amplifySignIn({
      username: email.trim().toLowerCase(),
      password,
    });

    if (result.nextStep.signInStep === "DONE") {
      await refreshUser();
    }

    return result;
  };

  const signOut = async () => {
    requireConfiguration();

    await amplifySignOut();
    setUser(null);
  };

  const value = {
    user,
    loading,
    authConfigured,
    signUp,
    confirmSignUp,
    resendSignUpCode,
    signIn,
    signOut,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
