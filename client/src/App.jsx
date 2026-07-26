import { useState, useEffect, useMemo } from "react";
import {
  FaBell,
  FaTools,
  FaChartLine,
  FaWarehouse,
  FaUserCog,
  FaTruckMonster,
  FaSearch,
} from "react-icons/fa";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { isSupabaseConfigured, supabase } from "./services/api";
document.body.style.margin = "0";
document.body.style.padding = "0";
document.body.style.overflowX = "hidden";

const STATUS_COLORS = {
  Available: "#22c55e",
  "Low Stock": "#f59e0b",
  Critical: "#ef4444",
  "Service Due": "#a855f7",
  Running: "#2563eb",
  Stopped: "#64748b",
};

const toDayLabel = (value) =>
  new Intl.DateTimeFormat("en-US", {
    weekday: "short",
  }).format(new Date(value));

const lastNDays = (count) => {
  const days = [];

  for (let i = count - 1; i >= 0; i -= 1) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    days.push(date);
  }

  return days;
};

function App() {
  const [loggedIn, setLoggedIn] =
    useState(false);
  const [currentUser, setCurrentUser] =
    useState(null);
  const [email, setEmail] =
    useState("");
  const [password, setPassword] =
    useState("");
  const [error, setError] =
    useState("");
const [activePage, setActivePage] =
  useState("Dashboard");
  const [darkMode, setDarkMode] =
useState(true);
const [showNotifications, setShowNotifications] =
  useState(false);
const [showAddMachine, setShowAddMachine] =
useState(false);
const [machineName, setMachineName] =
useState("");
const [machineLocation, setMachineLocation] =
useState("");
const [emailNotif, setEmailNotif] =
useState(true);
const [machineStock, setMachineStock] =
useState("");
const [machines, setMachines] =
useState([]);
const [services, setServices] =
useState([]);
const [notificationItems, setNotificationItems] =
useState([]);
const [loadingData, setLoadingData] =
useState(false);
const [dataError, setDataError] =
useState("");
const [editIndex, setEditIndex] =
useState(null);

const [editName, setEditName] =
useState("");

const [editStock, setEditStock] =
useState("");
const [editLocation, setEditLocation] =
useState("");

const [showEditModal, setShowEditModal] =
  useState(false);
const [showChat, setShowChat] =
  useState(false);
  const [showSidebar, setShowSidebar] =
  useState(true);
  const [isMobile, setIsMobile] =
  useState(
    window.innerWidth < 768
  );
const [messages, setMessages] =
  useState([
    {
      sender: "ai",
      text: "Hello Admin 👋 How can I help you?",
    },
  ]);
const [input, setInput] =
  useState("");
  const [searchTerm, setSearchTerm] =
  useState("");
useEffect(() => {
  let mounted = true;

  const loadSession = async () => {
    const { data, error } =
      await supabase.auth.getSession();

    if (error) {
      setError(error.message);
      return;
    }

    if (mounted) {
      setLoggedIn(Boolean(data.session));
      setCurrentUser(data.session?.user ?? null);
    }
  };

  loadSession();

  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange(
    (_event, session) => {
      setLoggedIn(Boolean(session));
      setCurrentUser(session?.user ?? null);
    }
  );

  return () => {
    mounted = false;
    subscription.unsubscribe();
  };
}, []);
useEffect(() => {
  const handleResize = () => {
    if (
      window.innerWidth < 768
    ) {
      setIsMobile(true);
      setShowSidebar(false);
    } else {
      setIsMobile(false);
      setShowSidebar(true);
    }
  };
  window.addEventListener(
    "resize",
    handleResize
  );
  handleResize();
  return () =>
    window.removeEventListener(
      "resize",
      handleResize
    );
}, []);

useEffect(() => {
  const loadData = async () => {
    if (!loggedIn || !currentUser?.id) {
      setMachines([]);
      setServices([]);
      setNotificationItems([]);
      return;
    }

    setLoadingData(true);
    setDataError("");

    const [machinesResult, servicesResult, notificationsResult] =
      await Promise.all([
        supabase
          .from("machines")
          .select("*")
          .order("created_at", { ascending: false }),
        supabase
          .from("services")
          .select("*")
          .order("created_at", { ascending: false }),
        supabase
          .from("notifications")
          .select("*")
          .order("created_at", { ascending: false }),
      ]);

    if (machinesResult.error) {
      setDataError(machinesResult.error.message);
    }

    if (servicesResult.error) {
      setDataError(servicesResult.error.message);
    }

    if (notificationsResult.error) {
      setDataError(notificationsResult.error.message);
    }

    setMachines(machinesResult.data ?? []);
    setServices(servicesResult.data ?? []);
    setNotificationItems(notificationsResult.data ?? []);
    setLoadingData(false);
  };

  loadData();
}, [loggedIn, currentUser?.id]);

    const inputStyle = {
  width: "100%",
  padding: "14px",
  borderRadius: "12px",
  border:
    "1px solid #334155",
  background: "#111827",
  color: "white",
  fontSize: "15px",
  marginBottom: "18px",
  outline: "none",
  boxSizing: "border-box",
};

const boxStyle = {
  background: darkMode
    ? "#0f172a"
    : "white",
  borderRadius: "20px",
  padding: "22px",
};

const pageTitle = {
  fontSize: "24px",
  marginBottom: "22px",
  fontWeight: "bold",
};

const tableHead = {
  textAlign: "left",
  color: "#94a3b8",
};

const machineCount = machines.length;
const lowStockCount = machines.filter(
  (machine) => Number(machine.stock) < 5
).length;
const availableMachineCount = machines.filter(
  (machine) => machine.status === "Available"
).length;
const pendingServicesCount = services.filter(
  (service) => service.status !== "Completed"
).length;
const completedServicesCount = services.filter(
  (service) => service.status === "Completed"
).length;
const unreadNotificationCount = notificationItems.filter(
  (notification) => !notification.is_read
).length;
const totalMachineUnits = machines.reduce(
  (sum, machine) => sum + Number(machine.stock || 0),
  0
);
const uniqueLocationCount = new Set(
  machines
    .map((machine) => machine.location)
    .filter(Boolean)
).size;

const serviceTrendData = useMemo(() => {
  const days = lastNDays(7);

  return days.map((day) => {
    const dayKey = day.toISOString().slice(0, 10);

    return {
      day: toDayLabel(day),
      value: services.filter((service) =>
        (service.created_at || "").slice(0, 10) === dayKey
      ).length,
    };
  });
}, [services]);

const statusSummary = useMemo(() => {
  const buckets = {};

  machines.forEach((machine) => {
    const key = machine.status || "Available";
    buckets[key] = (buckets[key] || 0) + 1;
  });

  return Object.entries(buckets).map(([name, value]) => ({
    name,
    value,
  }));
}, [machines]);

const renderServicesPage = () => (
  <div>
    <h1 style={pageTitle}>Service Management</h1>

    <div
      style={{
        display: "grid",
        gridTemplateColumns: isMobile ? "1fr" : "repeat(4,1fr)",
        gap: "14px",
        marginBottom: "24px",
      }}
    >
      <StatCard title="Total Services" value={services.length} color="#2563eb" />
      <StatCard title="Pending" value={pendingServicesCount} color="#9333ea" />
      <StatCard title="Completed" value={completedServicesCount} color="#22c55e" />
      <StatCard title="Machines" value={machineCount} color="#ea580c" />
    </div>

    <div style={boxStyle}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={tableHead}>
            <th style={{ padding: "14px", textAlign: "left" }}>Service</th>
            <th style={{ padding: "14px", textAlign: "left" }}>Machine</th>
            <th style={{ padding: "14px", textAlign: "left" }}>Engineer</th>
            <th style={{ padding: "14px", textAlign: "left" }}>Status</th>
          </tr>
        </thead>
        <tbody>
          {services.length === 0 ? (
            <tr>
              <td colSpan="4" style={{ padding: "18px", color: "#94a3b8" }}>
                No services yet. Seed the services table to show records here.
              </td>
            </tr>
          ) : (
            services.map((service) => {
              const machine = machines.find(
                (item) => item.id === service.machine_id
              );

              return (
                <tr key={service.id} style={{ borderTop: "1px solid #1e293b" }}>
                  <td style={{ padding: "14px" }}>{service.title}</td>
                  <td style={{ padding: "14px" }}>{machine?.name || "Unassigned"}</td>
                  <td style={{ padding: "14px" }}>{service.engineer_name || "Unassigned"}</td>
                  <td style={{ padding: "14px" }}>{service.status}</td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  </div>
);

const renderAnalyticsPage = () => (
  <div>
    <h1 style={pageTitle}>Analytics Dashboard</h1>

    <div
      style={{
        display: "grid",
        gridTemplateColumns: isMobile ? "1fr" : "repeat(3,1fr)",
        gap: "14px",
        marginBottom: "24px",
      }}
    >
      <StatCard title="Machines" value={machineCount} color="#2563eb" />
      <StatCard title="Pending Services" value={pendingServicesCount} color="#9333ea" />
      <StatCard title="Low Stock" value={lowStockCount} color="#ea580c" />
    </div>

    <div
      style={{
        display: "grid",
        gridTemplateColumns: isMobile ? "1fr" : "2fr 1fr",
        gap: "20px",
        marginBottom: "30px",
      }}
    >
      <div style={boxStyle}>
        <h2 style={{ marginBottom: "20px" }}>Service Activity</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={serviceTrendData}>
            <XAxis dataKey="day" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="value" stroke="#facc15" strokeWidth={3} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div style={boxStyle}>
        <h2 style={{ marginBottom: "20px" }}>Machine Status</h2>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie data={statusSummary} dataKey="value" outerRadius={100}>
              {statusSummary.map((entry, index) => (
                <Cell
                  key={entry.name}
                  fill={STATUS_COLORS[entry.name] || COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>

    <div
      style={{
        display: "grid",
        gridTemplateColumns: isMobile ? "1fr" : "repeat(3,1fr)",
        gap: "14px",
      }}
    >
      <div style={boxStyle}>
        <h2>Open Alerts</h2>
        <p style={{ color: "#94a3b8" }}>
          {unreadNotificationCount} unread alerts in Supabase.
        </p>
      </div>

      <div style={boxStyle}>
        <h2>Completed Services</h2>
        <p style={{ color: "#94a3b8" }}>
          {completedServicesCount} completed service records.
        </p>
      </div>

      <div style={boxStyle}>
        <h2>Latest Alert</h2>
        <p style={{ color: "#94a3b8" }}>
          {notificationItems[0]?.message || "No alerts available."}
        </p>
      </div>
    </div>
  </div>
);
   

  /* LOGIN */
  const handleLogin = async () => {
  if (!isSupabaseConfigured) {
    setError(
      "Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your client .env file."
    );
    return;
  }

  try {
    const { data, error } =
      await supabase.auth.signInWithPassword(
        {
          email,
          password,
        }
      );

    if (error) {
      throw error;
    }

    setCurrentUser(data.user ?? null);
    setLoggedIn(true);
    setError("");
  } catch (err) {
    setError(
      err.message || "Login Failed"
    );
  }
};

const handleRegister = async () => {
  if (!isSupabaseConfigured) {
    setError(
      "Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your client .env file."
    );
    return;
  }

  try {
    const { data, error } =
      await supabase.auth.signUp({
        email,
        password,
      });

    if (error) {
      throw error;
    }

    setCurrentUser(data.user ?? null);
    setError(
      data.session
        ? ""
        : "Account created. If email confirmation is enabled, check your inbox before signing in."
    );
    setLoggedIn(Boolean(data.session));
  } catch (err) {
    setError(
      err.message || "Registration Failed"
    );
  }
};
  
  /* CHART DATA */

  const data = [
    { day: "Mon", value: 200 },
    { day: "Tue", value: 500 },
    { day: "Wed", value: 350 },
    { day: "Thu", value: 800 },
    { day: "Fri", value: 650 },
    { day: "Sat", value: 950 },
    { day: "Sun", value: 700 },
  ];

  const pieData = [
    { name: "Running", value: 70 },
    { name: "Service", value: 20 },
    { name: "Stopped", value: 10 },
  ];

  const COLORS = [
    "#22c55e",
    "#facc15",
    "#ef4444",
  ];

  /* LOGIN PAGE */

  if (!loggedIn) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          justifyContent:
            "center",
          alignItems: "center",
          position: "relative",
          overflow: "hidden",
          background:
            "linear-gradient(to right,#020617,#0f172a,#1e1b4b)",
          fontFamily: "Arial",
        }}
      >
        {/* AI CHATBOT */}

<div
  style={{
    position: "fixed",
    bottom: "30px",
    right: "30px",
    zIndex: 999,
  }}
>
  {showChat && (
    <div
      style={{
        width: "350px",
        height: "500px",
        background: "#111827",
        borderRadius: "20px",
        marginBottom: "15px",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        boxShadow:
          "0 0 30px rgba(0,0,0,0.5)",
      }}
    >
      {/* HEADER */}

      <div
        style={{
          padding: "16px",
          background: "#2563eb",
          fontWeight: "bold",
        }}
      >
        CAT AI Assistant
      </div>

      {/* MESSAGES */}

      <div
        style={{
          flex: 1,
          padding: "14px",
          overflowY: "auto",
        }}
      >
        {messages.map(
          (msg, index) => (
            <div
              key={index}
              style={{
                display: "flex",
                justifyContent:
                  msg.sender === "user"
                    ? "flex-end"
                    : "flex-start",

                marginBottom: "12px",
              }}
            >
              <div
                style={{
                  background:
                    msg.sender === "user"
                      ? "#2563eb"
                      : "#1e293b",

                  padding: "10px 14px",

                  borderRadius: "14px",

                  maxWidth: "80%",
                }}
              >
                {msg.text}
              </div>
            </div>
          )
        )}
      </div>

      {/* INPUT */}

      <div
        style={{
          display: "flex",
          padding: "12px",
          gap: "10px",
          borderTop:
            "1px solid #334155",
        }}
      >
        <input
          type="text"
          placeholder="Ask AI..."
          value={input}
          onChange={(e) =>
            setInput(
              e.target.value
            )
          }
          style={{
            flex: 1,
            padding: "12px",
            borderRadius: "10px",
            border: "none",
            outline: "none",
            background: "#1e293b",
            color: "white",
          }}
        />

        <button
          onClick={() => {
            if (!input) return;

            const userMessage = {
              sender: "user",
              text: input,
            };

            let aiReply =
              "AI is analyzing your request.";

            if (
              input
                .toLowerCase()
                .includes("inventory")
            ) {
              aiReply =
                "Inventory levels are stable.";
            }

            if (
              input
                .toLowerCase()
                .includes("service")
            ) {
              aiReply =
                "3 machine services are pending.";
            }

            if (
              input
                .toLowerCase()
                .includes("revenue")
            ) {
              aiReply =
                "Revenue increased by 22% this month.";
            }

            const aiMessage = {
              sender: "ai",
              text: aiReply,
            };

            setMessages([
              ...messages,
              userMessage,
              aiMessage,
            ]);

            setInput("");
          }}
          style={{
            background: "#22c55e",
            border: "none",
            padding: "12px 16px",
            borderRadius: "10px",
            color: "white",
            cursor: "pointer",
          }}
        >
          Send
        </button>
      </div>
      
    </div>
  )}

  {/* FLOAT BUTTON */}

  <button
    onClick={() =>
      setShowChat(!showChat)
    }
    style={{
      width: "65px",
      height: "65px",
      borderRadius: "50%",
      border: "none",
      background: "#2563eb",
      color: "white",
      fontSize: "28px",
      cursor: "pointer",
      boxShadow:
        "0 0 20px rgba(37,99,235,0.5)",
    }}
  >
    🤖
  </button>
</div>
        {/* MACHINE */}

        <div
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            overflow: "hidden",
          }}
        >
          <img
            src="/src/assets/excavator.png"
            alt="machine"
            style={{
              position:
                "absolute",
              width: "1500px",
              bottom: "-100px",
              left: "-100px",
              opacity: "0.18",
              filter:
                "blur(1px)",
              animation:
                "machineMove 4s ease-in-out infinite",
            }}
          />
        </div>

        {/* ANIMATION */}

        <style>
          {`
            @keyframes machineMove {

              0% {
                transform:
                  translateY(0px)
                  rotate(0deg);
              }

              25% {
                transform:
                  translateY(-10px)
                  rotate(0.5deg);
              }

              50% {
                transform:
                  translateY(0px)
                  rotate(0deg);
              }

              75% {
                transform:
                  translateY(-8px)
                  rotate(-0.5deg);
              }

              100% {
                transform:
                  translateY(0px)
                  rotate(0deg);
              }
            }
          `}
        </style>

        {/* LOGIN BOX */}

        <div
          style={{
            width: "430px",
            background:
              "rgba(8,16,40,0.95)",
            padding: "40px",
            borderRadius: "24px",
            backdropFilter:
              "blur(10px)",
            zIndex: 2,
            boxShadow:
              "0 0 50px rgba(0,0,0,0.6)",
          }}
        >
          {/* LOGO */}

          <div
            style={{
              textAlign: "center",
              marginBottom: "30px",
            }}
          >
            <img
              src="/src/assets/logo.png"
              alt="logo"
              style={{
                width: "240px",
                borderRadius: "10px",
              }}
            />
          </div>

          <p
            style={{
              textAlign: "center",
              color: "#cbd5e1",
              marginBottom: "30px",
              fontSize: "15px",
            }}
          >
            AI Powered Enterprise
            Dashboard
          </p>

          {/* EMAIL */}

          <input
            type="email"
            placeholder="Enter Email"
            value={email}
            onChange={(e) =>
              setEmail(
                e.target.value
              )
            }
            style={inputStyle}
          />

          {/* PASSWORD */}

          <input
            type="password"
            placeholder="Enter Password"
            value={password}
            onChange={(e) =>
              setPassword(
                e.target.value
              )
            }
            style={inputStyle}
          />

          {/* ERROR */}

          {error && (
            <p
              style={{
                color:
                  "#ef4444",
                marginBottom:
                  "15px",
                fontSize: "14px",
              }}
            >
              {error}
            </p>
          )}

          {/* BUTTON */}

          <button
            onClick={handleLogin}
            style={{
              width: "100%",
              padding: "14px",
              border: "none",
              borderRadius: "14px",
              background:
                "linear-gradient(to right,#facc15,#f59e0b)",
              fontSize: "16px",
              fontWeight: "bold",
              cursor: "pointer",
            }}
          >
            Login to Dashboard
          </button>

          <button
            onClick={handleRegister}
            style={{
              width: "100%",
              marginTop: "12px",
              padding: "14px",
              border: "1px solid #334155",
              borderRadius: "14px",
              background: "transparent",
              color: "white",
              fontSize: "16px",
              fontWeight: "bold",
              cursor: "pointer",
            }}
          >
            Register
          </button>
        </div>
      </div>
    );
  }

  /* PAGE */
  const exportPDF = () => {
  const doc = new jsPDF();

  doc.setFontSize(20);

  doc.text(
    "Inventory Report",
    14,
    20
  );

  const tableColumn = [
    "Machine",
    "Location",
    "Stock",
    "Status",
  ];

  const tableRows = [];

  machines.forEach((machine) => {
    const machineData = [
      machine.name,
      machine.location || "",
      machine.stock,
      machine.status,
    ];

    tableRows.push(machineData);
  });

  autoTable(doc, {
    head: [tableColumn],
    body: tableRows,
    startY: 30,
  });

  doc.save(
    "inventory-report.pdf"
  );
};
  const renderPage = () => {
    switch (activePage) {
      case "Services":
       return renderServicesPage();
  return (
    <div>
      <h1 style={pageTitle}>
        Service Management
      </h1>

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            isMobile
              ? "1fr"
              : "repeat(3,1fr)",

          gap: "20px",
        }}
      >
        <div style={boxStyle}>
          <h2>
            CAT Excavator
          </h2>

          <p
            style={{
              color: "#94a3b8",
            }}
          >
            Next Service:
            12 June
          </p>

          <button
            style={{
              marginTop: "15px",
              background:
                "#facc15",
              border: "none",
              padding:
                "10px 14px",
              borderRadius:
                "10px",
              fontWeight:
                "bold",
              cursor: "pointer",
            }}
          >
            Schedule Service
          </button>
        </div>

        <div style={boxStyle}>
          <h2>
            CAT Loader
          </h2>

          <p
            style={{
              color: "#ef4444",
            }}
          >
            Service Overdue
          </p>

          <button
            style={{
              marginTop: "15px",
              background:
                "#ef4444",
              color: "white",
              border: "none",
              padding:
                "10px 14px",
              borderRadius:
                "10px",
              fontWeight:
                "bold",
              cursor: "pointer",
            }}
          >
            Service Now
          </button>
        </div>

        <div style={boxStyle}>
          <h2>
            CAT Bulldozer
          </h2>

          <p
            style={{
              color: "#22c55e",
            }}
          >
            Recently Serviced
          </p>

          <button
            style={{
              marginTop: "15px",
              background:
                "#22c55e",
              color: "white",
              border: "none",
              padding:
                "10px 14px",
              borderRadius:
                "10px",
              fontWeight:
                "bold",
              cursor: "pointer",
            }}
          >
            View Report
          </button>
        </div>
      </div>
    </div>
  );
  case "Analytics":
    return renderAnalyticsPage();
  return (
    <div>
      <h1 style={pageTitle}>
        Analytics Dashboard
      </h1>

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            isMobile
              ? "1fr"
              : "2fr 1fr",

          gap: "20px",
          marginBottom: "30px",
        }}
      >
        <div style={boxStyle}>
          <h2
            style={{
              marginBottom: "20px",
            }}
          >
            Revenue Growth
          </h2>

          <ResponsiveContainer
            width="100%"
            height={300}
          >
            <LineChart data={data}>
              <XAxis dataKey="day" />

              <YAxis />

              <Tooltip />

              <Line
                type="monotone"
                dataKey="value"
                stroke="#facc15"
                strokeWidth={3}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div style={boxStyle}>
          <h2
            style={{
              marginBottom: "20px",
            }}
          >
            Machine Health
          </h2>

          <ResponsiveContainer
            width="100%"
            height={300}
          >
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                outerRadius={100}
              >
                {pieData.map(
                  (entry, index) => (
                    <Cell
                      key={index}
                      fill={
                        COLORS[index]
                      }
                    />
                  )
                )}
              </Pie>

              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            isMobile
              ? "1fr"
              : "repeat(3,1fr)",

          gap: "20px",
        }}
      >
        <div style={boxStyle}>
          <h2>
            AI Prediction
          </h2>

          <p
            style={{
              color: "#94a3b8",
            }}
          >
            Revenue may increase
            by 22% next month.
          </p>
        </div>

        <div style={boxStyle}>
          <h2>
            Fuel Usage
          </h2>

          <p
            style={{
              color: "#94a3b8",
            }}
          >
            Fuel consumption
            decreased by 8%.
          </p>
        </div>

        <div style={boxStyle}>
          <h2>
            Machine Alerts
          </h2>

          <p
            style={{
              color: "#ef4444",
            }}
          >
            3 machines require
            urgent maintenance.
          </p>
        </div>
      </div>
    </div>
  );
case "Settings":

return (
  <div>
    <h1 style={pageTitle}>
      Settings
    </h1>

    <p
      style={{
        color: "#94a3b8",
        marginBottom: "30px",
      }}
    >
      Manage your account,
      preferences and system
      configuration
    </p>

    <div
      style={{
        display: "grid",

        gridTemplateColumns:
          isMobile
            ? "1fr"
            : "repeat(3, 1fr)",

        gap: "20px",
      }}
    >
      {/* PROFILE */}

<div style={boxStyle}>
  <h2
    style={{
      marginBottom: "20px",
    }}
  >
    Profile Settings
  </h2>

  <input
    placeholder="Full Name"
    style={inputStyle}
  />

  <input
    placeholder="Email Address"
    style={inputStyle}
  />

  <input
    placeholder="Company"
    style={inputStyle}
  />

  <button
    style={{
      background: "#facc15",
      border: "none",
      padding: "12px 18px",
      borderRadius: "10px",
      fontWeight: "bold",
      cursor: "pointer",
      marginTop: "10px",
    }}
  >
    Save Profile
  </button>
</div>
      {/* SECURITY */}
      <div style={boxStyle}>
  <h2
    style={{
      marginBottom: "25px",
    }}
  >
    Security Settings
  </h2>

  <div
    style={{
      display: "flex",
      justifyContent: "space-between",
      marginBottom: "20px",
    }}
  >
    <span>Change Password</span>
    <span>›</span>
  </div>

  <div
    style={{
      display: "flex",
      justifyContent: "space-between",
      marginBottom: "20px",
    }}
  >
    <span>
      Two Factor Authentication
    </span>

    <button
      style={{
        background: "#facc15",
        border: "none",
        padding: "8px 15px",
        borderRadius: "20px",
        fontWeight: "bold",
      }}
    >
      ON
    </button>
  </div>

  <div
    style={{
      marginBottom: "20px",
      color: "#94a3b8",
    }}
  >
    Last Login
    <br />
    07 June 2026
    10:30 AM
  </div>

  <div
    style={{
      marginBottom: "25px",
      color: "#94a3b8",
    }}
  >
    Active Devices:
    3 Devices
  </div>
  <button
    style={{
      background: "#facc15",
      border: "none",
      padding: "12px 18px",
      borderRadius: "10px",
      fontWeight: "bold",
      cursor: "pointer",
    }}
  >
    Update Security
  </button>
</div>
    {/* NOTIFICATIONS */}

<div style={boxStyle}>
  <h2
    style={{
      marginBottom: "20px",
    }}
  >
    Notification Preferences
  </h2>

  <div
    style={{
      display: "flex",
      justifyContent:
        "space-between",

      marginBottom: "20px",
    }}
  >
    <span>
      Email Notifications
    </span>
  <button
  onClick={() =>
    setEmailNotif(!emailNotif)
  }
  style={{
    background: emailNotif
      ? "#facc15"
      : "#64748b",
    border: "none",
    padding: "8px 15px",
    borderRadius: "20px",
    fontWeight: "bold",
  }}
>
  {emailNotif ? "ON" : "OFF"}
</button>
  </div>

  <div
    style={{
      display: "flex",
      justifyContent:
        "space-between",

      marginBottom: "20px",
    }}
  >
    <span>
      Machine Alerts
    </span>

    <button
      style={{
        background: "#facc15",
        border: "none",
        width: "55px",
        height: "30px",
        borderRadius: "20px",
        cursor: "pointer",
        fontWeight: "bold",
      }}
    >
      ON
    </button>
  </div>

  <div
    style={{
      display: "flex",
      justifyContent:
        "space-between",
    }}
  >
    <span>
      Service Reminders
    </span>

    <button
      style={{
        background: "#475569",
        color: "white",
        border: "none",
        width: "55px",
        height: "30px",
        borderRadius: "20px",
        cursor: "pointer",
        fontWeight: "bold",
      }}
    >
      OFF
    </button>
  </div>
</div>
      {/* AI */}
      <div style={boxStyle}>
  <h2
    style={{
      marginBottom: "25px",
    }}
  >
    AI Assistant Settings
  </h2>

  <div
    style={{
      display: "flex",
      justifyContent: "space-between",
      marginBottom: "20px",
    }}
  >
    <span>AI Assistant</span>

    <button
      style={{
        background: "#facc15",
        border: "none",
        padding: "8px 15px",
        borderRadius: "20px",
        fontWeight: "bold",
      }}
    >
      ON
    </button>
  </div>

  <div
    style={{
      display: "flex",
      justifyContent: "space-between",
      marginBottom: "20px",
    }}
  >
    <span>Predictive Maintenance</span>

    <button
      style={{
        background: "#facc15",
        border: "none",
        padding: "8px 15px",
        borderRadius: "20px",
        fontWeight: "bold",
      }}
    >
      ON
    </button>
  </div>

  <div
    style={{
      display: "flex",
      justifyContent: "space-between",
      marginBottom: "20px",
    }}
  >
    <span>Smart Notifications</span>

    <button
      style={{
        background: "#facc15",
        border: "none",
        padding: "8px 15px",
        borderRadius: "20px",
        fontWeight: "bold",
      }}
    >
      ON
    </button>
  </div>

  <div
    style={{
      display: "flex",
      justifyContent: "space-between",
      marginBottom: "25px",
    }}
  >
    <span>Auto Report Generation</span>

    <button
      style={{
        background: "#64748b",
        border: "none",
        padding: "8px 15px",
        borderRadius: "20px",
        color: "white",
        fontWeight: "bold",
      }}
    >
      OFF
    </button>
  </div>

  <button
    style={{
      background: "#facc15",
      border: "none",
      padding: "12px 18px",
      borderRadius: "10px",
      fontWeight: "bold",
      cursor: "pointer",
    }}
  >
    Save AI Settings
  </button>
</div>
{/* THEME */}

<div style={boxStyle}>
  <h2
    style={{
      marginBottom: "20px",
    }}
  >
    Theme & Appearance
  </h2>

  {/* DARK MODE */}

  <div
    style={{
      display: "flex",
      justifyContent:
        "space-between",

      alignItems: "center",

      marginBottom: "25px",
    }}
  >
    <span>
      Dark Mode
    </span>
  <button
  onClick={() =>
    setDarkMode(!darkMode)
  }
  style={{
    background: darkMode
      ? "#facc15"
      : "#64748b",
    border: "none",
    padding: "8px 15px",
    borderRadius: "20px",
    fontWeight: "bold",
    cursor: "pointer",
  }}
>
  {darkMode ? "ON" : "OFF"}
</button>
  </div>

  {/* COLORS */}

  <p
    style={{
      marginBottom: "15px",
      color: "#94a3b8",
    }}
  >
    Primary Color
  </p>

  <div
    style={{
      display: "flex",
      gap: "12px",
      marginBottom: "25px",
    }}
  >
    <div
      style={{
        width: "25px",
        height: "25px",
        borderRadius: "50%",
        background: "#facc15",
        cursor: "pointer",
      }}
    ></div>

    <div
      style={{
        width: "25px",
        height: "25px",
        borderRadius: "50%",
        background: "#2563eb",
        cursor: "pointer",
      }}
    ></div>

    <div
      style={{
        width: "25px",
        height: "25px",
        borderRadius: "50%",
        background: "#22c55e",
        cursor: "pointer",
      }}
    ></div>

    <div
      style={{
        width: "25px",
        height: "25px",
        borderRadius: "50%",
        background: "#a855f7",
        cursor: "pointer",
      }}
    ></div>

    <div
      style={{
        width: "25px",
        height: "25px",
        borderRadius: "50%",
        background: "#ef4444",
        cursor: "pointer",
      }}
    ></div>
  </div>

  {/* DROPDOWN */}

  <select
    style={{
      ...inputStyle,
      marginBottom: "20px",
    }}
  >
    <option>
      Compact Sidebar
    </option>

    <option>
      Full Sidebar
    </option>
  </select>

  <button
    style={{
      background: "#facc15",
      border: "none",
      padding: "12px 18px",
      borderRadius: "10px",
      fontWeight: "bold",
      cursor: "pointer",
    }}
  >
    Save Appearance
  </button>
</div>
 {/* SYSTEM */}

<div style={boxStyle}>
  <h2
    style={{
      marginBottom: "20px",
    }}
  >
    System Information
  </h2>

  {/* SERVER */}

  <div
    style={{
      marginBottom: "20px",
    }}
  >
    <p
      style={{
        marginBottom: "8px",
      }}
    >
      Server Status
    </p>

    <div
      style={{
        color: "#22c55e",
        fontWeight: "bold",
      }}
    >
      ● Online
    </div>
  </div>
  {/* DATABASE */}
  <div
    style={{
      marginBottom: "20px",
    }}
  >
    <p
      style={{
        marginBottom: "8px",
      }}
    >
      Database
    </p>
    <div
      style={{
        color: "#22c55e",
        fontWeight: "bold",
      }}
    >
      ● Connected
    </div>
  </div>
  {/* STORAGE */}
  <div
    style={{
      marginBottom: "15px",
    }}
  >
    <p
      style={{
        marginBottom: "10px",
      }}
    >
      Storage Usage
    </p>
    <div
      style={{
        width: "100%",
        height: "14px",
        background: "#1e293b",
        borderRadius: "10px",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          width: "72%",
          height: "100%",
          background: "#facc15",
        }}
      ></div>
    </div>
    <p
      style={{
        marginTop: "8px",
        color: "#94a3b8",
        fontSize: "14px",
      }}
    >
      72% Used
    </p>
  </div>
  {/* VERSION */}
  <div
    style={{
      marginTop: "20px",
      color: "#94a3b8",
      fontSize: "14px",
    }}
  >
    App Version: v2.4.1
  </div>
</div>
</div>
    {/* DANGER ZONE */}
    <div
      style={{
        ...boxStyle,
        marginTop: "20px",
        border:
          "1px solid red",
      }}
    >
      <h2
        style={{
          color: "#ef4444",
        }}
      >
        Danger Zone
      </h2>
      <p
        style={{
          color: "#94a3b8",
        }}
      >
        Reset all settings to
        default.
      </p>
      <button
        style={{
          marginTop: "15px",
          background: "red",
          border: "none",
          padding: "12px 16px",
          borderRadius: "10px",
          color: "white",
          cursor: "pointer",
        }}
      >
        Reset All Settings
      </button>
    </div>
  </div>
);
      case "Inventory":
        return (
          <div>
<div
  style={{
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "30px",
  }}
>
  <div>
    <h1 style={pageTitle}>
      Inventory Management
    </h1>

    <p
      style={{
        color: "#94a3b8",
        marginTop: "-10px",
      }}
    >
      Track and manage all your machines
    </p>
  </div>

  <div
    style={{
      display: "flex",
      gap: "15px",
      alignItems: "center",
    }}
  >
    <input
      placeholder="Search machines..."
      value={searchTerm}
      onChange={(e) =>
      setSearchTerm(
      e.target.value
  )
}
      style={{
        padding: "12px 18px",
        background: "#0f172a",
        border: "1px solid #334155",
        borderRadius: "12px",
        color: "white",
        outline: "none",
        width: "250px",
      }}
    />
    <button
  onClick={() =>
    setShowAddMachine(true)
  }
  style={{
    background: "#facc15",
    border: "none",
    padding: "12px 18px",
    borderRadius: "12px",
    fontWeight: "bold",
    cursor: "pointer",
  }}
>
  + Add Machine
</button>
<button
  onClick={exportPDF}
  style={{
    background: "#2563eb",
    border: "none",
    padding: "12px 18px",
    borderRadius: "12px",
    fontWeight: "bold",
    cursor: "pointer",
    color: "white",
  }}
>
  Export PDF
</button>
  </div>
</div>
{dataError && (
  <div
    style={{
      marginBottom: "18px",
      color: "#f87171",
    }}
  >
    {dataError}
  </div>
)}
{loadingData && (
  <div style={{ marginBottom: "18px", color: "#94a3b8" }}>
    Loading live data from Supabase...
  </div>
)}
<div
  style={{
    display: "grid",
    gridTemplateColumns:
      isMobile
        ? "1fr"
        : "repeat(4,1fr)",

    gap: "20px",
    marginBottom: "30px",
  }}
>
  <div style={boxStyle}>
    <h3
      style={{
        color: "#94a3b8",
      }}
    >
      Total Machines
    </h3>

    <h1>{machineCount}</h1>

    <p
      style={{
        color: "#64748b",
      }}
    >
      All machines
    </p>
  </div>

  <div style={boxStyle}>
    <h3
      style={{
        color: "#facc15",
      }}
    >
      Units in Stock
    </h3>

    <h1>{totalMachineUnits}</h1>

    <p
      style={{
        color: "#64748b",
      }}
    >
      Need attention
    </p>
  </div>

  <div style={boxStyle}>
    <h3
      style={{
        color: "#22c55e",
      }}
    >
      Available
    </h3>

    <h1>{availableMachineCount}</h1>

    <p
      style={{
        color: "#64748b",
      }}
    >
      Ready to use
    </p>
  </div>

  <div style={boxStyle}>
    <h3
      style={{
        color: "#a855f7",
      }}
    >
      Locations
    </h3>

    <h1>{uniqueLocationCount}</h1>

    <p
      style={{
        color: "#64748b",
      }}
    >
      Active sites
    </p>
  </div>
</div>
            <div style={boxStyle}>
              <table
                style={{
                  width: "100%",
                }}
              >
                <thead>
<tr style={tableHead}>
<th
style={{
  padding: "18px 10px",
  textAlign: "left",
  color: "#94a3b8",
  fontSize: "15px",
}}
>
  Machine
</th>
<th
style={{
  padding: "18px 10px",
  textAlign: "left",
  color: "#94a3b8",
  fontSize: "15px",
}}
>
  Location
</th>
<th
style={{
  padding: "18px 10px",
  textAlign: "left",
  color: "#94a3b8",
  fontSize: "15px",
}}
>Stock</th>
<th 
style={{
  padding: "18px 10px",
  textAlign: "left",
  color: "#94a3b8",
  fontSize: "15px",
}}
>Status</th>
<th
style={{
  padding: "18px 10px",
  textAlign: "left",
  color: "#94a3b8",
  fontSize: "15px",
}}
>Action</th>
                  </tr>
                </thead>
                <tbody>
           {machines
  .filter((machine) =>
    machine.name
      .toLowerCase()
      .includes(
        searchTerm.toLowerCase()
      )
  )
  .map(
           (machine, index) => (
      <tr
  key={index}
  style={{
    borderBottom:
      "1px solid #1e293b",

    transition: "0.3s",
  }}
>
<td
  style={{
    padding: "22px 10px",
  }}
>
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: "14px",
    }}
  >
    <img
      src="/src/assets/excavator.png"
      alt="machine"
      style={{
        width: "55px",
        height: "55px",
        objectFit: "contain",
        background: "#0f172a",
        padding: "8px",
        borderRadius: "12px",
      }}
    />

    <div>
      <div
        style={{
          fontWeight: "bold",
          marginBottom: "4px",
        }}
      >
        {machine.name}
      </div>

      <div
        style={{
          color: "#94a3b8",
          fontSize: "13px",
        }}
      >
        {machine.location || "Unassigned location"}
      </div>
    </div>
  </div>
</td>
<td
  style={{
    padding: "22px 10px",
  }}
>
  {machine.location || "—"}
</td>
<td
  style={{
    padding: "22px 10px",
  }}
>
  {machine.stock}
</td>
        <td>
  <span
    style={{
      background:
        machine.status ===
        "Available"
          ? "rgba(34,197,94,0.2)"
          : "rgba(239,68,68,0.2)",

      color:
        machine.status ===
        "Available"
          ? "#4ade80"
          : "#f87171",

      padding: "8px 14px",

      borderRadius: "999px",

      fontSize: "14px",

      fontWeight: "bold",
    }}
  >
    {machine.status}
  </span>
</td>
        <td>
          <button
            onClick={async () => {
            const machineToDelete = machines[index];
            const { error } = await supabase
              .from("machines")
              .delete()
              .eq("id", machineToDelete.id);

            if (error) {
              setDataError(error.message);
              return;
            }

            setMachines(
              machines.filter((_, i) => i !== index)
            );
          }}
            style={{
              background:
                "#dc2626",

              border: "none",

              padding:
                "8px 12px",

              borderRadius:
                "8px",

              color: "white",

              cursor: "pointer",

              marginRight:
                "10px",

              marginBottom:
                "8px",
            }}
          >
            Delete
          </button>
  <button
  onClick={() => {
    setEditIndex(index);
    setEditName(machine.name);
    setEditStock(machine.stock);
            setEditLocation(machine.location || "");
            setShowEditModal(true);
          }}
  style={{
    background: "#2563eb",
    border: "none",
    padding: "10px 14px",
    borderRadius: "10px",
    color: "white",
    cursor: "pointer",
  }}
>
  Edit
</button>
        </td>
      </tr>
    )
  )}
</tbody>
              </table>
            </div>
    {showEditModal && (
  <div
    style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      background:
        "rgba(0,0,0,0.7)",

      display: "flex",
      justifyContent: "center",
      alignItems: "center",

      zIndex: 999,
    }}
  >
  
    <div
      style={{
        background: "#111827",
        padding: "30px",
        borderRadius: "20px",
        width: "400px",
      }}
    >
  <button
  onClick={() =>
  setShowEditModal(false)
  }
  style={{  
    background: "red",
    border: "none",
    color: "white",
    padding: "8px 12px",
    borderRadius: "8px",
    cursor: "pointer",
    float: "right",
  }}
>
  X
</button>
      <h2
        style={{
          marginBottom: "20px",
        }}
      >
        Edit Machine
      </h2>
<input
  placeholder="Machine Name"
  value={editName}
  onChange={(e) =>
    setEditName(
      e.target.value
    )
  }
  style={inputStyle}
/>

     <input
  placeholder="Stock"
  value={editStock}
  onChange={(e) =>
    setEditStock(
      e.target.value
    )
  }
  style={inputStyle}
/>

      <input
        placeholder="Location"
         value={editLocation}
         onChange={(e) =>
           setEditLocation(e.target.value)
         }
         style={inputStyle}
       />
       <button
  onClick={async () => {
    const targetMachine = machines[editIndex];

    if (!targetMachine) {
      return;
    }

    const nextStatus =
      Number(editStock) < 5
        ? "Low Stock"
        : "Available";

    const { error } = await supabase
      .from("machines")
      .update({
        name: editName,
        stock: Number(editStock),
        location: editLocation,
        status: nextStatus,
      })
      .eq("id", targetMachine.id);

    if (error) {
      setDataError(error.message);
      return;
    }

    setMachines(
      machines.map((machine, index) =>
        index === editIndex
          ? {
              ...machine,
              name: editName,
              stock: Number(editStock),
              location: editLocation,
              status: nextStatus,
            }
          : machine
      )
    );

    setShowEditModal(false);
  }}

  style={{
    width: "100%",
    background: "#2563eb",
    border: "none",
    padding: "14px",
    borderRadius: "10px",
    color: "white",
    fontWeight: "bold",
    cursor: "pointer",
    marginTop: "15px",
  }}
>
  Update Machine
</button>
    </div>
  </div>
)}

{showAddMachine && (
  <div
    style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      background:
        "rgba(0,0,0,0.7)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 999,
    }}
  >
    <div
      style={{
        background: "#111827",
        padding: "30px",
        borderRadius: "20px",
        width: "400px",
      }}
    > 

      <h2
        style={{
          marginBottom: "20px",
        }}
      >
        Add Machine
      </h2>

      <input
        placeholder="Machine Name"
        value={machineName}
        onChange={(e) =>
          setMachineName(
            e.target.value
          )
        }
        style={inputStyle}
      />

      <input
        placeholder="Stock"
        value={machineStock}
        onChange={(e) =>
          setMachineStock(
            e.target.value
          )
        }
        style={inputStyle}
      />

      <input
        placeholder="Location"
        value={machineLocation}
        onChange={(e) =>
          setMachineLocation(e.target.value)
        }
        style={inputStyle}
      />

      <button
        onClick={async () => {
          const nextStatus =
            Number(machineStock) < 5
              ? "Low Stock"
              : "Available";

          const payload = {
            name: machineName.trim(),
            stock: Number(machineStock),
            location: machineLocation.trim(),
            status: nextStatus,
            created_by: currentUser?.id ?? null,
          };

          const { data, error } = await supabase
            .from("machines")
            .insert(payload)
            .select()
            .single();

          if (error) {
            setDataError(error.message);
            return;
          }

          setMachines([data, ...machines]);

          setMachineName("");
          setMachineStock("");
          setMachineLocation("");

          setShowAddMachine(false);
        }}
        style={{
          width: "100%",
          background: "#22c55e",
          border: "none",
          padding: "14px",
          borderRadius: "10px",
          color: "white",
          fontWeight: "bold",
          cursor: "pointer",
          marginTop: "15px",
        }}
      >
        Add Machine
      </button>
    </div>
  </div>
)}
</div>
);
default:
        return (
          <div>
            {/* TOPBAR */}
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "10px",
                justifyContent:
                  "space-between",
                alignItems:
                "center",
                marginBottom:
                  "30px",
              }}
            >
              <div>
                <div
               onClick={() =>
              setShowSidebar(
              !showSidebar
          )
   }
  style={{
  fontSize: "28px",
  cursor: "pointer",
  marginBottom: "15px",
  display: isMobile
    ? "block"
    : "none",
}}
  className="menu-btn"
>
  ☰
               </div>
                <h1
                  style={{
                    fontSize:
                      "28px",
                    marginBottom:
                      "5px",
                  }}
                >
                  Enterprise Dashboard
                </h1>
                <p
                  style={{
                    color:
                      "#94a3b8",
                    fontSize:
                      "14px",
                  }}
                >
                  Welcome back,
                  {currentUser?.email?.split("@")[0] ||
                    "user"}
                </p>
              </div>

              {/* RIGHT */}

              <div
                style={{
                  display: "flex",
                  alignItems:
                    "center",
                  gap: "18px",
                }}
              >
{showNotifications && (
  <div
    style={{
      position: "absolute",
      top: "70px",
      right: isMobile
        ? "20px"
        : "40px",

      width: "280px",

      background:
        "#111827",

      borderRadius: "14px",

      padding: "14px",

      boxShadow:
        "0 0 20px rgba(0,0,0,0.4)",

      zIndex: 999,
    }}
  >
    <h3
      style={{
        marginBottom: "12px",
      }}
    >
      Notifications
    </h3>

    {notificationItems.map(
      (item, index) => (
        <div
          key={index}
          style={{
            padding: "10px",
            borderBottom:
              "1px solid #1f2937",

            fontSize: "14px",
          }}
        >
          {item.message}
        </div>
      )
    )}
  </div>
)}
                {/* SEARCH */}

                <div
                 style={{
  width: isMobile
    ? "100%"
    : "260px",

  background:
    "#111827",

  padding:
    "8px 14px",

  borderRadius:
    "12px",

  display:
    "flex",

  alignItems:
    "center",

  gap: "10px",
}}
                >
                  <FaSearch
                    size={14}
                  />

                  <input
                    placeholder="Search..."
                    style={{
                      background:
                        "transparent",
                      border:
                        "none",
                      color:
                        "white",
                      outline:
                        "none",
                      fontSize:
                        "14px",
                    }}
                  />
                </div>
<div
  style={{
    position: "relative",
    cursor: "pointer",
  }}

  onClick={() =>
    setShowNotifications(
      !showNotifications
    )
  }
>
  <FaBell size={22} />

  <div
    style={{
      position: "absolute",
      top: "-8px",
      right: "-8px",
      background: "red",
      color: "white",
      borderRadius: "50%",
      width: "18px",
      height: "18px",
      fontSize: "11px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontWeight: "bold",
    }}
  >
    {unreadNotificationCount}
  </div>
</div>
                {/* USER */}
                <div
                  style={{
                    background:
                      "#111827",
                    padding:
                      "10px 16px",
                    borderRadius:
                      "12px",
                    fontSize:
                      "14px",
                  }}
                >
                  {currentUser?.email ||
                    "Admin User"}
                </div>

                {/* LOGOUT */}

                <button
                  onClick={async () => {
                    await supabase.auth.signOut();
                    setLoggedIn(false);
                    setCurrentUser(null);
                  }}
                  style={{
                    background:
                      "#dc2626",
                    color:
                      "white",
                    border:
                      "none",
                    padding:
                      "10px 16px",
                    borderRadius:
                      "10px",
                    cursor:
                      "pointer",
                    fontSize:
                      "14px",
                  }}
                >
                  Logout
                </button>
              </div>
            </div>

            {/* CARDS */}

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                isMobile
                 ? "1fr"
                : "repeat(4, 1fr)",
                gap: "14px",
                marginBottom:
                  "30px",
              }}
            >
              <StatCard
                title="Total Machines"
                value={machineCount}
                color="#2563eb"
              />

              <StatCard
                title="Pending Services"
                value={pendingServicesCount}
                color="#9333ea"
              />

              <StatCard
                title="Low Stock"
                value={lowStockCount}
                color="#059669"
              />

              <StatCard
                title="Alerts"
                value={unreadNotificationCount}
                color="#ea580c"
              />
            </div>

            {/* CHARTS */}

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                isMobile
                ? "1fr"
                : "2fr 1fr",
                gap: "14px",
                marginBottom:
                  "30px",
              }}
            >
              {/* LINE */}

              <div style={boxStyle}>
                <h2
                  style={{
                    marginBottom:
                      "18px",
                    fontSize:
                      "20px",
                  }}
                >
                  Service Activity
                </h2>

                <ResponsiveContainer
                  width="100%"
                  height={240}
                >
                  <LineChart data={serviceTrendData}>
                    <XAxis dataKey="day" />

                    <YAxis />

                    <Tooltip />

                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="#facc15"
                      strokeWidth={
                        3
                      }
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* PIE */}

              <div style={boxStyle}>
                <h2
                  style={{
                    marginBottom:
                      "18px",
                    fontSize:
                      "20px",
                  }}
                >
                  Machine Status
                </h2>

                <ResponsiveContainer
                  width="100%"
                  height={240}
                >
                  <PieChart>
                    <Pie
                      data={
                        statusSummary
                      }
                      dataKey="value"
                      outerRadius={
                        90
                      }
                    >
                      {statusSummary.map(
                        (
                          entry,
                          index
                        ) => (
                          <Cell
                            key={
                              index
                            }
                            fill={
                              STATUS_COLORS[
                                entry.name
                              ] || COLORS[index % COLORS.length]
                            }
                          />
                        )
                      )}
                    </Pie>

                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* AI */}

            <div style={boxStyle}>
              <h2
                style={{
                  color:
                    "#facc15",
                  marginBottom:
                    "18px",
                  fontSize:
                    "22px",
                }}
              >
                AI Insights
              </h2>

              <p
                style={{
                  marginBottom:
                    "12px",
                  color:
                    "#cbd5e1",
                  fontSize:
                    "14px",
                }}
              >
                Machines below stock threshold:{" "}
                {lowStockCount}.
              </p>

              <p
                style={{
                  marginBottom:
                    "12px",
                  color:
                    "#cbd5e1",
                  fontSize:
                    "14px",
                }}
              >
                Pending service jobs: {pendingServicesCount}.
              </p>

              <p
                style={{
                  color:
                    "#cbd5e1",
                  fontSize:
                    "14px",
                }}
              >
                Latest alert:{" "}
                {notificationItems[0]?.message ||
                  "No alerts right now."}
              </p>
            </div>

            {/* MACHINES */}

            <h2
              style={{
                marginBottom:
                  "20px",
                marginTop:
                  "30px",
                fontSize:
                  "22px",
              }}
            >
              Live Machine Monitoring
            </h2>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: isMobile ? "1fr" : "repeat(3,1fr)",
                gap: "14px",
              }}
            >
              {machines.slice(0, 3).map((machine) => (
                <MachineCard
                  key={machine.id}
                  name={machine.name}
                  status={machine.status}
                  stock={machine.stock}
                  location={machine.location || "—"}
                />
              ))}
            </div>
          </div>
        );
            }
  };
 /* MAIN */

return (
  <div
    style={{
      display: "flex",
      minHeight: "100vh",
      background: darkMode
       ? "#020617"
       : "#f8fafc",
      color: darkMode
       ? "white"
       : "#0f172a",
      fontFamily: "Arial",
    }}
  >
    {/* SIDEBAR */}
  {isMobile && showSidebar && (
  <div
    onClick={() =>
      setShowSidebar(false)
    }
    style={{
      position: "fixed",
      top: 0,
      left: 0,
      zIndex: 999,
      width: "100%",
      height: "100%",
      background:
        "rgba(0,0,0,0.5)",
      zIndex: 999,
    }}
  />
)}
  <div
  style={{
  width: "252px",
  background: "#020617",
  position:
    isMobile
      ? "fixed"
      : "fixed",
  left:
    isMobile
      ? showSidebar
        ? "0"
        : "-260px"
      : "0",
  top: 0,
  height: "100vh",
  transition: "0.3s",
  overflow: "hidden",
  zIndex: 1000,
  flexShrink: 0,
}}
    >
      {/* LOGO */}

      <div
        style={{
          marginBottom: "40px",
          textAlign: "center",
        }}
      >
        <img
          src="/src/assets/logo.png"
          alt="logo"
          style={{
            width: "170px",
            borderRadius: "10px",
          }}
        />
      </div>

      {/* MENU */}

      <SidebarItem
        icon={<FaChartLine />}
        text="Dashboard"
        active={activePage === "Dashboard"}
        onClick={() => setActivePage("Dashboard")}
      />

      <SidebarItem
        icon={<FaWarehouse />}
        text="Inventory"
        active={activePage === "Inventory"}
        onClick={() => setActivePage("Inventory")}
      />

      <SidebarItem
        icon={<FaTools />}
        text="Services"
        active={activePage === "Services"}
        onClick={() => setActivePage("Services")}
      />

      <SidebarItem
        icon={<FaTruckMonster />}
        text="Analytics"
        active={activePage === "Analytics"}
        onClick={() => setActivePage("Analytics")}
      />

      <SidebarItem
        icon={<FaUserCog />}
        text="Settings"
        active={activePage === "Settings"}
        onClick={() => setActivePage("Settings")}
      />

      {/* SUPPORT */}

      <div
        style={{
          marginTop: "40px",
          background: "#111827",
          padding: "16px",
          borderRadius: "18px",
          textAlign: "center",
        }}
      >
        <h3
          style={{
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
            background: "#facc15",
            border: "none",
            padding: "10px",
            width: "100%",
            borderRadius: "10px",
            fontWeight: "bold",
            cursor: "pointer",
            fontSize: "14px",
          }}
        >
          Contact Support
        </button>
      </div>
    </div>

    {/* CONTENT */}

    <div
   style={{
  flex: 1,
  padding: "18px",

  marginLeft:
    isMobile
      ? "0px"
      : "252px",

  height: "100vh",

  overflowY: "auto",
  overflowX: "hidden",

  transition: "0.3s",
}}
>
      {renderPage()}
    </div>
  </div>
);
/* SIDEBAR */

function SidebarItem({
  icon,
  text,
  active,
  onClick,
  }) {

  return (
    <div
      onClick={onClick}
      style={{
        background: active
          ? "#facc15"
          : "#111827",

        color: active
          ? "black"
          : "white",

        padding: "14px",

        borderRadius: "12px",

        marginBottom: "14px",

        display: "flex",

        alignItems:
          "center",

        gap: "10px",

        fontWeight: "600",

        fontSize: "15px",

        cursor: "pointer",

        transition:
          "0.3s",
      }}
    >
      {icon}
      {text}
    </div>
  );
}
function NotificationItem({
  title,
  message,
  color,
}) {
  return (
    <div
      style={{
        background: "#1e293b",
        padding: "14px",
        borderRadius: "12px",
        marginBottom: "12px",
        borderLeft: `5px solid ${color}`,
      }}
    >
      <h4
        style={{
          marginBottom: "6px",
          fontSize: "15px",
        }}
      >
        {title}
      </h4>

      <p
        style={{
          fontSize: "13px",
          color: "#cbd5e1",
        }}
      >
        {message}
      </p>
    </div>
  );
}
/* MACHINE */

function MachineCard({
  name,
  status,
  stock,
  location,
}) {
  return (
    <div
      style={{
        background: "#111827",
        padding: "18px",
        borderRadius: "18px",
      }}
    >
      <img
        src="/src/assets/excavator.png"
        alt="machine"
        style={{
          width: "100%",
          height: "130px",
          objectFit:
            "contain",
          marginBottom:
            "15px",
        }}
      />

      <h2
        style={{
          marginBottom:
            "12px",
          fontSize: "20px",
        }}
      >
        {name}
      </h2>

      <p
        style={{
          marginBottom:
            "8px",
          color: "#cbd5e1",
          fontSize: "14px",
        }}
      >
        Status : {status}
      </p>

      <p
        style={{
          marginBottom:
            "8px",
          color: "#cbd5e1",
          fontSize: "14px",
        }}
      >
        Stock : {stock}
      </p>

      <p
        style={{
          color: "#cbd5e1",
          fontSize: "14px",
        }}
      >
        Location : {location}
      </p>
    </div>
  );
}

/* CARD */
function StatCard({
  title,
  value,
  color,
}) {
  const [count, setCount] =
    useState(0);

  useEffect(() => {



    let start = 0;
    const end = parseInt(
      value.toString().replace(/\D/g, "")
    );



    if (start === end) return;
    let duration = 1200;
    let increment =
      end / (duration / 20);
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        start = end;
        clearInterval(timer);
      }
      setCount(
        Math.floor(start)
      );
    }, 20);
    return () =>
      clearInterval(timer);
  }, [value]);
  return (
    <div
      style={{
        background: color,
        padding: "16px",
        borderRadius: "18px",
        transition: "0.3s",
        cursor: "pointer",
      }}
    >
      <h3
        style={{
          marginBottom: "12px",
          fontSize: "16px",
          fontWeight: "500",
        }}
      >
        {title}
      </h3>

      <h1
        style={{
          fontSize: "24px",
          fontWeight: "bold",
        }}
      >
        {String(value).includes("₹")
          ? `₹${count}L`
          : count}
      </h1>
    </div>
  );
}
/* STYLES */
}
export default App;