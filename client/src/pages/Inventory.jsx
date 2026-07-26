import { useState } from "react";

function Inventory() {
  const [search, setSearch] = useState("");

const [showModal, setShowModal] =
  useState(false);

const [machineName, setMachineName] =
  useState("");

const [machineStock, setMachineStock] =
  useState("");

const [machineLocation, setMachineLocation] =
  useState("");

const [machineStatus, setMachineStatus] =
  useState("Available");

const [machines, setMachines] =
  useState([
    {
      id: 1,
      name: "CAT Excavator",
      stock: 4,
      status: "Low Stock",
      location: "Jamshedpur",
    },

    {
      id: 2,
      name: "CAT Loader",
      stock: 12,
      status: "Available",
      location: "Ranchi",
    },

    {
      id: 3,
      name: "CAT Bulldozer",
      stock: 8,
      status: "Available",
      location: "Patna",
    },

    {
      id: 4,
      name: "Hydraulic Pump",
      stock: 2,
      status: "Critical",
      location: "Kolkata",
    },
  ]);
  const filteredMachines =
    machines.filter((machine) =>
      machine.name
        .toLowerCase()
        .includes(search.toLowerCase())
    );

  return (
    <div>
      {/* TOP */}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "25px",
        }}
      >
        <div>
          <h1
            style={{
              fontSize: "24px",
              marginBottom: "6px",
            }}
          >
            Inventory Management
          </h1>

          <p
            style={{
              color: "#94a3b8",
              fontSize: "14px",
            }}
          >
            Manage all machine inventory
          </p>
        </div>

        <button
  onClick={() =>
    setShowModal(true)
  }
  style={{
    background: "#facc15",
    border: "none",
    padding: "12px 18px",
    borderRadius: "10px",
    fontWeight: "bold",
    cursor: "pointer",
  }}
>
  + Add Machine
</button>
      </div>

      {/* SEARCH */}

      <input
        type="text"
        placeholder="Search machines..."
        value={search}
        onChange={(e) =>
          setSearch(e.target.value)
        }
        style={{
          width: "100%",
          padding: "14px",
          borderRadius: "12px",
          border: "1px solid #334155",
          background: "#111827",
          color: "white",
          marginBottom: "25px",
          outline: "none",
          fontSize: "14px",
        }}
      />
{/* MODAL */}

{showModal && (
  <div
    style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      background: "rgba(0,0,0,0.7)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 999,
    }}
  >
    <div
      style={{
        width: "400px",
        background: "#111827",
        padding: "25px",
        borderRadius: "20px",
      }}
    >
      <h2
        style={{
          marginBottom: "20px",
        }}
      >
        Add New Machine
      </h2>

      <input
        type="text"
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
        type="number"
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
        type="text"
        placeholder="Location"
        value={machineLocation}
        onChange={(e) =>
          setMachineLocation(
            e.target.value
          )
        }
        style={inputStyle}
      />

      <select
        value={machineStatus}
        onChange={(e) =>
          setMachineStatus(
            e.target.value
          )
        }
        style={inputStyle}
      >
        <option>
          Available
        </option>

        <option>
          Low Stock
        </option>

        <option>
          Critical
        </option>
      </select>

      <div
        style={{
          display: "flex",
          gap: "12px",
          marginTop: "20px",
        }}
      >
        <button
          onClick={() => {
            const newMachine = {
              id: Date.now(),
              name: machineName,
              stock: machineStock,
              status: machineStatus,
              location:
                machineLocation,
            };

            setMachines([
              ...machines,
              newMachine,
            ]);

            setShowModal(false);

            setMachineName("");

            setMachineStock("");

            setMachineLocation("");

            setMachineStatus(
              "Available"
            );
          }}
          style={{
            flex: 1,
            background: "#22c55e",
            border: "none",
            padding: "12px",
            borderRadius: "10px",
            color: "white",
            fontWeight: "bold",
            cursor: "pointer",
          }}
        >
          Add
        </button>

        <button
          onClick={() =>
            setShowModal(false)
          }
          style={{
            flex: 1,
            background: "#dc2626",
            border: "none",
            padding: "12px",
            borderRadius: "10px",
            color: "white",
            fontWeight: "bold",
            cursor: "pointer",
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
)}
      {/* TABLE */}

      <div
        style={{
          background: "#111827",
          borderRadius: "20px",
          padding: "20px",
          overflowX: "auto",
        }}
      >
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
          }}
        >
          <thead>
            <tr
              style={{
                color: "#94a3b8",
                textAlign: "left",
              }}
            >
              <th style={tableHead}>
                Machine
              </th>

              <th style={tableHead}>
                Stock
              </th>

              <th style={tableHead}>
                Status
              </th>

              <th style={tableHead}>
                Location
              </th>
              <th style={tableHead}>
                Action
              </th>
            </tr>
          </thead>

          <tbody>
  {filteredMachines.map(
    (machine) => (
      <tr
        key={machine.id}
        style={{
          borderTop:
            "1px solid #1e293b",
        }}
      >
        <td style={tableData}>
          {machine.name}
        </td>

        <td style={tableData}>
          {machine.stock}
        </td>

        <td style={tableData}>
          <span
            style={{
              background:
                machine.status ===
                "Available"
                  ? "#14532d"
                  : machine.status ===
                    "Low Stock"
                  ? "#78350f"
                  : "#7f1d1d",

              color: "white",

              padding:
                "6px 12px",

              borderRadius:
                "20px",

              fontSize: "12px",
            }}
          >
            {machine.status}
          </span>
        </td>

        <td style={tableData}>
          {machine.location}
        </td>

        <td style={tableData}>
          <button
            onClick={() => {
              const updatedMachines =
                machines.filter(
                  (m) =>
                    m.id !==
                    machine.id
                );

              setMachines(
                updatedMachines
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
            }}
          >
            Delete
          </button>

          <button
            style={{
              background:
                "#2563eb",

              border: "none",

              padding:
                "8px 12px",

              borderRadius:
                "8px",

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
    </div>
  );
}

const tableHead = {
  padding: "14px",
};

const tableData = {
  padding: "18px 14px",
};
const inputStyle = {
  width: "100%",
  padding: "12px",
  marginBottom: "14px",
  borderRadius: "10px",
  border: "1px solid #334155",
  background: "#1e293b",
  color: "white",
  outline: "none",
};
export default Inventory;