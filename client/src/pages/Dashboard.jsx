function Dashboard() {
  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "25px",
        }}
      >
        <h1
          style={{
            fontSize: "28px",
          }}
        >
          Enterprise Dashboard
        </h1>

        <div
          style={{
            background: "#111827",
            padding: "10px 18px",
            borderRadius: "10px",
          }}
        >
          Admin User
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4,1fr)",
          gap: "18px",
          marginBottom: "25px",
        }}
      >
        {[
          {
            title: "Total Inventory",
            value: "1248",
            color: "#2563eb",
          },
          {
            title: "Pending Services",
            value: "18",
            color: "#9333ea",
          },
          {
            title: "Revenue",
            value: "₹2.5L",
            color: "#059669",
          },
          {
            title: "AI Alerts",
            value: "07",
            color: "#ea580c",
          },
        ].map((card) => (
          <div
            key={card.title}
            style={{
              background: card.color,
              padding: "24px",
              borderRadius: "18px",
            }}
          >
            <h3
              style={{
                fontSize: "16px",
                marginBottom: "12px",
              }}
            >
              {card.title}
            </h3>

            <h1
              style={{
                fontSize: "28px",
              }}
            >
              {card.value}
            </h1>
          </div>
        ))}
      </div>

      <div
        style={{
          background: "#111827",
          padding: "25px",
          borderRadius: "20px",
          marginBottom: "25px",
        }}
      >
        <h2
          style={{
            color: "#facc15",
            marginBottom: "18px",
          }}
        >
          AI Insights
        </h2>

        <p style={{ marginBottom: "12px", color: "#cbd5e1" }}>
          AI detected unusual inventory movement in Warehouse B.
        </p>

        <p style={{ marginBottom: "12px", color: "#cbd5e1" }}>
          Revenue prediction for next month is expected to grow by 22%.
        </p>

        <p style={{ color: "#cbd5e1" }}>
          3 systems require urgent maintenance.
        </p>
      </div>

      <div
        style={{
          background: "#111827",
          padding: "25px",
          borderRadius: "20px",
        }}
      >
        <h2 style={{ marginBottom: "18px" }}>
          Recent Activities
        </h2>

        <table
          style={{
            width: "100%",
          }}
        >
          <thead>
            <tr
              style={{
                textAlign: "left",
                color: "#94a3b8",
              }}
            >
              <th>Service</th>
              <th>Status</th>
              <th>Engineer</th>
            </tr>
          </thead>

          <tbody>
            <tr>
              <td>Server Maintenance</td>
              <td>Completed</td>
              <td>Rahul</td>
            </tr>

            <tr>
              <td>Inventory Update</td>
              <td>Pending</td>
              <td>Aman</td>
            </tr>

            <tr>
              <td>AI Analytics Scan</td>
              <td>Running</td>
              <td>System</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Dashboard;