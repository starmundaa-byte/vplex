import React, { useState } from "react";
import "./categorybar.css";

const CATS = ["All","Music","Gaming","News","Live","Comedy","Sports","Education","Tech"];

export default function CategoryBar({ onSelect }) {
  const [active, setActive] = useState("All");
  function choose(c) {
    setActive(c);
    if (onSelect) onSelect(c);
    // navigate by query could be implemented by parent; we keep simple
  }
  return (
    <div className="v-catbar">
      <div className="container scroll-x">
        {CATS.map(c => (
          <button key={c} className={`cat-btn ${c===active?"active":""}`} onClick={()=>choose(c)}>{c}</button>
        ))}
      </div>
    </div>
  );
}
