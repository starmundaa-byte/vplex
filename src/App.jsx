import Header from "./Components/Header";
import CategoryBar from "./Components/CategoryBar";
import Video from "./Components/Video"; // if used
import Home from "./pages/Home";
import Watch from "./pages/Watch";      // exact filename Watch.jsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";



/*
 Initialize Google Identity Services button if client id provided.
 This is minimal: it renders the Google sign-in button into #gsi-button
 and sets window.handleCredentialResponse (header sets that handler).
*/
function initGSI() {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  if (!clientId) return;
  // Wait until library loaded
  const waitAndRender = () => {
    if (!window.google?.accounts?.id) {
      setTimeout(waitAndRender, 300);
      return;
    }
    try {
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: window.handleCredentialResponse,
        auto_select: true,
        cancel_on_tap_outside: false,
      });
      window.google.accounts.id.renderButton(
        document.getElementById("gsi-button"),
        { theme: "outline", size: "medium" }
      );
      // optionally prompt automatic sign-in
      window.google.accounts.id.prompt();
    } catch (e) {
      console.error("GSI init error", e);
    }
  };
  waitAndRender();
}

export default function App() {
  useEffect(() => { initGSI(); }, []);
  return (
    <BrowserRouter>
      <Header />
      <CategoryBar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/watch/:id" element={<WatchPage />} />
      </Routes>
    </BrowserRouter>
  );
}
