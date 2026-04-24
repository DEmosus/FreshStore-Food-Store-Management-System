import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Alert,
    Badge,
    Button,
    Card,
    EmptyState,
    Spinner,
    StatCard,
} from "../components/UI";
import { useAuth } from "../context/useAuth";
import { entriesService } from "../services/entries";
import "./Dashboard.css";

const fmt = (n) =>
  `KSh ${Number(n || 0).toLocaleString("en-KE", { minimumFractionDigits: 0 })}`;
const fmtQty = (n) => `${Number(n || 0).toFixed(1)} kg`;
const fmtDate = (d) =>
  new Date(d).toLocaleDateString("en-KE", { day: "2-digit", month: "short" });

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "morning";
  if (h < 18) return "afternoon";
  return "evening";
}

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    entriesService
      .getDashboardStats()
      .then(({ data }) => setStats(data.data))
      .catch(() => setError("Failed to load dashboard data"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="spinner-center" style={{ paddingTop: "60px" }}>
        <Spinner size={32} />
      </div>
    );
  }

  const today = new Date().toLocaleDateString("en-KE", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="fade-in">
      {/* Header */}
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">
            Good {getGreeting()}, {user?.name?.split(" ")[0]}
          </h1>
          <p className="dashboard-date">{today}</p>
        </div>
        <Button onClick={() => navigate("/add-entry")}>+ Add entry</Button>
      </div>

      {error && (
        <div style={{ marginBottom: "20px" }}>
          <Alert>{error}</Alert>
        </div>
      )}

      {/* Stat cards */}
      <div className="dashboard-stats-grid">
        <StatCard
          accent="green"
          label="Total stock value"
          value={fmt(stats?.allTime?.totalStockValue)}
          sub={`${fmtQty(stats?.allTime?.totalStockQty)} received total`}
        />
        <StatCard
          accent="blue"
          label="Total sales revenue"
          value={fmt(stats?.allTime?.totalSalesValue)}
          sub={`${fmtQty(stats?.allTime?.totalSalesQty)} sold total`}
        />
        <StatCard
          accent="amber"
          label="Today's sales"
          value={fmt(stats?.today?.salesValue)}
          sub={
            stats?.today?.salesQty > 0
              ? `${fmtQty(stats.today.salesQty)} today`
              : "No sales today"
          }
          subVariant={stats?.today?.salesValue > 0 ? "up" : "default"}
        />
        <StatCard
          accent={stats?.lowStockItems?.length > 0 ? "red" : "green"}
          label="Low stock alerts"
          value={stats?.lowStockItems?.length || 0}
          sub={
            stats?.lowStockItems?.length > 0
              ? "Items need restocking"
              : "All items well stocked"
          }
          subVariant={stats?.lowStockItems?.length > 0 ? "down" : "up"}
        />
      </div>

      {/* Body */}
      <div className="dashboard-body">
        {/* Recent entries */}
        <Card>
          <div className="dashboard-card-header">
            <h2 className="dashboard-card-title">Recent entries</h2>
            <button
              className="dashboard-view-all-btn"
              onClick={() => navigate("/entries")}
            >
              View all →
            </button>
          </div>

          {!stats?.recentEntries?.length ? (
            <EmptyState
              icon="📦"
              title="No entries yet"
              description="Add your first stock or sale entry to get started."
            />
          ) : (
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th className="align-left">Item</th>
                  <th className="align-left">Type</th>
                  <th className="align-right">Qty (kg)</th>
                  <th className="align-right">Value</th>
                  <th className="align-left">Date</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentEntries.map((e) => (
                  <tr key={e._id}>
                    <td className="fw-medium">{e.itemName}</td>
                    <td>
                      <Badge
                        variant={e.type === "stock" ? "success" : "danger"}
                      >
                        {e.type === "stock" ? "Stock in" : "Sale"}
                      </Badge>
                    </td>
                    <td className="align-right">{e.quantity.toFixed(1)}</td>
                    <td className="align-right mono">{fmt(e.totalValue)}</td>
                    <td className="text-muted">{fmtDate(e.date)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>

        {/* Sidebar */}
        <div className="dashboard-sidebar">
          {/* Low stock */}
          {stats?.lowStockItems?.length > 0 && (
            <Card className="low-stock-card">
              <div className="low-stock-header">
                <p className="low-stock-title">⚠ Low stock</p>
              </div>
              <div className="low-stock-list">
                {stats.lowStockItems.map((item) => (
                  <div key={item._id} className="low-stock-item">
                    <span className="low-stock-item-name">{item._id}</span>
                    <span className="low-stock-item-qty">
                      {item.currentStock.toFixed(1)} kg left
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Inventory snapshot */}
          <Card>
            <div className="inventory-header">
              <h3 className="inventory-title">Inventory snapshot</h3>
            </div>
            <div className="inventory-list">
              {!stats?.inventory?.length ? (
                <p className="inventory-empty">No inventory data</p>
              ) : (
                stats.inventory
                  .filter((i) => i.currentStock > 0)
                  .sort((a, b) => b.currentStock - a.currentStock)
                  .map((item) => {
                    const pct = Math.min(
                      100,
                      (item.currentStock / (item.stockQty || 1)) * 100,
                    );
                    const barClass =
                      pct < 20
                        ? "bar-low"
                        : pct < 40
                          ? "bar-medium"
                          : "bar-good";
                    return (
                      <div key={item._id}>
                        <div className="inventory-item-row">
                          <span className="inventory-item-name">
                            {item._id}
                          </span>
                          <span className="inventory-item-qty">
                            {item.currentStock.toFixed(1)} kg
                          </span>
                        </div>
                        <div className="inventory-bar-track">
                          <div
                            className={`inventory-bar-fill ${barClass}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
