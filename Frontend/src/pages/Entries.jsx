import { useCallback, useEffect, useState, useTransition } from "react";
import { useNavigate } from "react-router-dom";
import {
    Alert,
    Badge,
    Button,
    Card,
    EmptyState,
    Input,
    Select,
    Spinner,
} from "../components/UI";
import { entriesService } from "../services/entries";
import "./Entries.css";

const fmt = (n) =>
  `KSh ${Number(n || 0).toLocaleString("en-KE", { minimumFractionDigits: 0 })}`;
const fmtDate = (d) =>
  new Date(d).toLocaleDateString("en-KE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

const RIGHT_COLS = ["Qty (kg)", "Price/kg", "Total"];

export default function Entries() {
  const navigate = useNavigate();

  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(null);
  const [filters, setFilters] = useState({
    type: "",
    itemName: "",
    startDate: "",
    endDate: "",
  });

  const [isPending, startTransition] = useTransition();

  const load = useCallback(() => {
    const params = {};
    if (filters.type) params.type = filters.type;
    if (filters.itemName) params.itemName = filters.itemName;
    if (filters.startDate) params.startDate = filters.startDate;
    if (filters.endDate) params.endDate = filters.endDate;

    startTransition(() => setLoading(true));

    entriesService
      .getAll(params)
      .then(({ data }) => setEntries(data.data))
      .catch(() => setError("Failed to load entries"))
      .finally(() => setLoading(false));
  }, [filters]);

  useEffect(() => {
    load();
  }, [load]);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this entry? This cannot be undone.")) return;
    setDeleting(id);
    try {
      await entriesService.remove(id);
      setEntries((es) => es.filter((e) => e._id !== id));
    } catch {
      setError("Failed to delete entry");
    } finally {
      setDeleting(null);
    }
  };

  const setFilter = (k) => (e) =>
    setFilters((f) => ({ ...f, [k]: e.target.value }));

  const isLoading = loading || isPending;

  return (
    <div className="fade-in">
      <div className="entries-header">
        <div>
          <h1 className="entries-title">Entries</h1>
          <p className="entries-subtitle">All stock and sales records</p>
        </div>
        <Button onClick={() => navigate("/add-entry")}>+ Add entry</Button>
      </div>

      <Card className="entries-filters-card">
        <div className="entries-filters-row">
          <div className="entries-filter-field">
            <Select
              label="Type"
              value={filters.type}
              onChange={setFilter("type")}
            >
              <option value="">All types</option>
              <option value="stock">Stock in</option>
              <option value="sale">Sale</option>
            </Select>
          </div>
          <div className="entries-filter-field-wide">
            <Input
              label="Item search"
              placeholder="e.g. Mangoes"
              value={filters.itemName}
              onChange={setFilter("itemName")}
            />
          </div>
          <div className="entries-filter-field">
            <Input
              label="From"
              type="date"
              value={filters.startDate}
              onChange={setFilter("startDate")}
            />
          </div>
          <div className="entries-filter-field">
            <Input
              label="To"
              type="date"
              value={filters.endDate}
              onChange={setFilter("endDate")}
            />
          </div>
          <Button
            variant="ghost"
            onClick={() =>
              setFilters({ type: "", itemName: "", startDate: "", endDate: "" })
            }
            style={{ alignSelf: "flex-end" }}
          >
            Clear
          </Button>
        </div>
      </Card>

      {error && (
        <div style={{ marginBottom: "16px" }}>
          <Alert>{error}</Alert>
        </div>
      )}

      <Card>
        {isLoading ? (
          <div className="spinner-center">
            <Spinner />
          </div>
        ) : !entries.length ? (
          <EmptyState
            icon="📝"
            title="No entries found"
            description="Try adjusting your filters or add a new entry."
          />
        ) : (
          <table className="entries-table">
            <thead>
              <tr>
                {[
                  "Item",
                  "Type",
                  "Qty (kg)",
                  "Price/kg",
                  "Total",
                  "Date",
                  "Notes",
                  "",
                ].map((h) => (
                  <th
                    key={h}
                    className={
                      RIGHT_COLS.includes(h) ? "align-right" : "align-left"
                    }
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {entries.map((e) => (
                <tr key={e._id}>
                  <td className="fw-medium">{e.itemName}</td>
                  <td>
                    <Badge variant={e.type === "stock" ? "success" : "danger"}>
                      {e.type === "stock" ? "Stock in" : "Sale"}
                    </Badge>
                  </td>
                  <td className="align-right mono">{e.quantity.toFixed(1)}</td>
                  <td className="align-right mono">{fmt(e.pricePerUnit)}</td>
                  <td className="align-right mono-bold">{fmt(e.totalValue)}</td>
                  <td className="text-muted">{fmtDate(e.date)}</td>
                  <td className="text-ellipsis">{e.notes || "—"}</td>
                  <td>
                    <div className="entries-row-actions">
                      <button
                        className="entries-edit-btn"
                        onClick={() => navigate(`/entries/${e._id}/edit`)}
                      >
                        Edit
                      </button>
                      <button
                        className="entries-delete-btn"
                        onClick={() => handleDelete(e._id)}
                        disabled={deleting === e._id}
                      >
                        {deleting === e._id ? "…" : "Delete"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      {entries.length > 0 && (
        <p className="entries-count">
          {entries.length} {entries.length === 1 ? "entry" : "entries"} shown
        </p>
      )}
    </div>
  );
}
