// src/main.jsx
import React, { useEffect, useState, createContext } from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { onAuthChange, initAuthPersistence } from "../api/userservice"; // ✅ use our service

export const UserContext = createContext(null);

function Root() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      await initAuthPersistence(); // ensures login survives reloads & reinstalls
      const unsubscribe = onAuthChange((currentUser) => {
        setUser(currentUser);
        setLoading(false);
      });
      return unsubscribe;
    };
    const cleanupPromise = init();
    return () => {
      cleanupPromise.then((unsubscribe) => unsubscribe && unsubscribe());
    };
  }, []);

  if (loading)
    return (
      <div style={{ color: "white", textAlign: "center", marginTop: "100px" }}>
        Loading user...
      </div>
    );

  return (
    <UserContext.Provider value={{ user, setUser }}>
      <App />
    </UserContext.Provider>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);
