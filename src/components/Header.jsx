import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./header.css";

/*
 Uses Google Identity Services for sign-in.
 Requires VITE_GOOGLE_CLIENT_ID in .env
*/

export default function Header() {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [user, setUser] = useState(null);

  useEffect(() => {
    // load Google script
    const id = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!id) return;
    const scriptId = "google-identity";
    if (!document.getElementById(scriptId)) {
      const s = document.createElement("script");
      s.src = "https://accounts.google.com/gsi/client";
      s.id = scriptId;
      s.async = true;
      document.head.appendChild(s);
    }

    // auto-hydrate from session storage
    try {
      const u = sessionStorage.getItem("vplex_user");
      if (u) setUser(JSON.parse(u));
    } catch {}
  }, []);

  // called by Google button library after credential response (we use popup-less auto)
  window.handleCredentialResponse = function (response) {
    // decode JWT locally to get basic profile (no server)
    try {
      const payload = JSON.parse(atob(response.credential.split(".")[1]));
      const profile = {
        id: payload.sub,
        name: payload.name,
        email: payload.email,
        picture: payload.picture,
      };
      setUser(profile);
      try { sessionStorage.setItem("vplex_user", JSON.stringify(profile)); } catch {}
    } catch (e) {
      console.error("GSI parse error", e);
    }
  };

  function onSubmit(e) {
    e?.preventDefault();
    if (!q.trim()) return;
    navigate(`/?q=${encodeURIComponent(q.trim())}`);
  }

  function signOut() {
    setUser(null);
    try { sessionStorage.removeItem("vplex_user"); } catch {}
  }

  return (
    <header className="v-header sticky-top">
      <div className="container header-row">
        <div className="header-left" style={{display:"flex", alignItems:"center", gap:12}}>
          <div className="logo" onClick={() => navigate("/")} style={{cursor:"pointer"}}>
            <div style={{width:40,height:40,background:"linear-gradient(45deg,#ff5f6d,#ffc371)",borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700}}>V</div>
          </div>
          <div style={{fontWeight:700}}>Vplex</div>
        </div>

        <form onSubmit={onSubmit} style={{flex:1, marginLeft:16}}>
          <div style={{display:"flex"}}>
            <input className="v-search" value={q} onChange={(e)=>setQ(e.target.value)} placeholder="Search videos..." />
            <button className="v-btn" type="submit">Search</button>
          </div>
        </form>

        <div style={{display:"flex",alignItems:"center",gap:12}}>
          {user ? (
            <div className="user-box">
              <img src={user.picture} alt={user.name} className="user-pic" />
              <div style={{marginLeft:8}}>
                <div style={{fontSize:13}}>{user.name}</div>
                <button className="link" onClick={signOut} style={{fontSize:12}}>Sign out</button>
              </div>
            </div>
          ) : (
            <div>
              {/* GSI button placeholder: library will render button in this div automatically if initialized */}
              <div id="gsi-button"></div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
