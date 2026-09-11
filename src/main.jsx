// src/main.jsx

import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { onAuthChange, initAuthPersistence } from "./api/USER";

import { UserContext } from "./context/UserContext";

function Root() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribe = null;
    let cancelled = false;

    const init = async () => {
      try {
        await initAuthPersistence();

        if (cancelled) return;

        unsubscribe = onAuthChange((currentUser) => {
          setUser(currentUser);
          setLoading(false);
        });
      } catch (error) {
        console.error("❌ Auth initialization failed:", error);
        setLoading(false);
      }
    };

    init();

    return () => {
      cancelled = true;

      if (unsubscribe) {
        unsubscribe();
        unsubscribe = null;
      }
    };
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser, loading }}>
      <App />
    </UserContext.Provider>
  );
}


// ============================================================
// SINGLE REACT ROOT
// ============================================================

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("❌ Root element #root was not found.");
}

const root = ReactDOM.createRoot(rootElement);

root.render(
  <Root />
);