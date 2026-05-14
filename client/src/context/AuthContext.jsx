/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useContext,
  useState,
} from "react";

const AuthContext =
  createContext();

export const AuthProvider = ({
  children,
}) => {
  const [token, setToken] =
    useState(() =>
      localStorage.getItem("token")
    );

  const [user, setUser] =
    useState(() =>
      JSON.parse(
        localStorage.getItem("user") ||
          "null"
      )
    );

  // LOGIN
  const login = (
    newToken,
    newUser
  ) => {
    localStorage.setItem(
      "token",
      newToken
    );
    localStorage.setItem(
      "user",
      JSON.stringify(newUser)
    );

    setToken(newToken);
    setUser(newUser);
  };

  // LOGOUT
  const logout = () => {
    localStorage.removeItem(
      "token"
    );
    localStorage.removeItem(
      "user"
    );

    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        login,
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