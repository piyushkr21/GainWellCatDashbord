import { Link } from "react-router-dom";
import logo from "../assets/logo.png";

function Sidebar() {
  return (
    <div
      style={{
        width: "220px",
        background: "#081028",
        padding: "18px",
        position: "fixed",
        top: 0,
        left: 0,
        height: "100vh",
        overflowY: "auto",
        zIndex: 1000,
      }}
    >
      {/* LOGO */}
      <div
        style={{
          marginBottom: "25px",
          textAlign: "center",
          background: "white",
          padding: "8px",
          borderRadius: "12px",
        }}
      >
        <img
          src={logo}
          alt="Company Logo"
          style={{
            width: "170px",
            height: "60px",
            objectFit: "contain",
          }}
        />
      </div>

      {/* MENU */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "14px",
        }}
      >
        <Link to="/" style={menuStyle}>
          📊 Dashboard
        </Link>

        <Link to="/inventory" style={menuStyle}>
          🏬 Inventory
        </Link>

        <Link to="/services" style={menuStyle}>
          🛠 Services
        </Link>

        <Link to="/analytics" style={menuStyle}>
          📈 Analytics
        </Link>

        <Link to="/reports" style={menuStyle}>
          📑 Reports
        </Link>

        <Link to="/settings" style={menuStyle}>
          ⚙ Settings
        </Link>
      </div>

      {/* SUPPORT BOX */}
      <div
        style={{
          marginTop: "40px",
          background: "#111827",
          padding: "16px",
          borderRadius: "14px",
          textAlign: "center",
        }}
      >
        <h3
          style={{
            color: "white",
            marginBottom: "10px",
            fontSize: "18px",
          }}
        >
          Need Support?
        </h3>

        <p
          style={{
            color: "#94a3b8",
            fontSize: "13px",
            marginBottom: "15px",
          }}
        >
          CAT AI Support Team
        </p>

        <button
          style={{
            width: "100%",
            padding: "12px",
            background: "#facc15",
            border: "none",
            borderRadius: "10px",
            fontWeight: "bold",
            fontSize: "15px",
            cursor: "pointer",
          }}
        >
          Contact Support
        </button>
      </div>
    </div>
  );
}

const menuStyle = {
  background: "#111827",
  color: "white",
  padding: "16px",
  borderRadius: "12px",
  textDecoration: "none",
  fontSize: "17px",
  fontWeight: "600",
};

export default Sidebar;