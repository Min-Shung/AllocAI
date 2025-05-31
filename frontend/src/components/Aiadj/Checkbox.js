import React from "react";

export default function Checkbox({ label, checked, onChange }) {
  return (
    <label style={{ display: "block", marginLeft: "1em", marginTop: 5 }}>
      <input type="checkbox" checked={checked} onChange={onChange} />
      {label}
    </label>
  );
}