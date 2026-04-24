import { useEffect, useState } from "react";
import {
    Alert,
    Badge,
    Button,
    Card,
    EmptyState,
    Input,
    Select,
    Spinner,
    StatCard,
} from "../components/UI";
import { entriesService } from "../services/entries";
import "./Reports.css";

const fmt = (n) =>
  `KSh ${Number(n || 0).toLocaleString("en-KE", { minimumFractionDigits: 0 })}`;

const defaultStart = () => {
  const d = new Date();
  d.setDate(d.getDate() - 30);
  return d.toISOString().split("T")[0];
};
const todayStr = () => new Date().toISOString().split("T")[0];

export default function Reports() {
  const [filters, setFilters] = useState({
    startDate: defaultStart(),
    endDate: todayStr(),
    type: "",
  });
  const [applied, setApplied] = useState(filters);
  const [data, setData] = useState(null);
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const params = {};
    if (applied.type) params.type = applied.type;
    if (applied.startDate) params.startDate = applied.startDate;
    if (applied.endDate) params.endDate = applied.endDate;

    Promise.all([
      entriesService.getReportStats(params),
      entriesService.getAll(params),
    ])
      .then(([statsRes, entriesRes]) => {
        setData(statsRes.data.data);
        setEntries(entriesRes.data.data);
      })
      .catch(() => setError("Failed to load report data"))
      .finally(() => setLoading(false));
  }, [applied]);

  const setFilter = (k) => (e) =>
    setFilters((f) => ({ ...f, [k]: e.target.value }));
  const apply = () => {
    setLoading(true);
    setApplied({ ...filters });
  };
  const reset = () => {
    const r = { startDate: defaultStart(), endDate: todayStr(), type: "" };
    setFilters(r);
    setLoading(true);
    setApplied(r);
  };

  const totals = entries.reduce(
    (acc, e) => {
      if (e.type === "stock") {
        acc.stockQty += e.quantity;
        acc.stockValue += e.totalValue;
      } else {
        acc.saleQty += e.quantity;
        acc.saleValue += e.totalValue;
      }
      return acc;
    },
    { stockQty: 0, stockValue: 0, saleQty: 0, saleValue: 0 },
  );

  const exportCSV = () => {
    const headers = [
      "Item",
      "Type",
      "Quantity (kg)",
      "Price/kg (KSh)",
      "Total (KSh)",
      "Date",
      "Notes",
    ];
    const rows = entries.map((e) => [
      e.itemName,
      e.type,
      e.quantity.toFixed(2),
      e.pricePerUnit.toFixed(2),
      e.totalValue.toFixed(2),
      new Date(e.date).toLocaleDateString("en-KE"),
      e.notes || "",
    ]);
    const csv = [headers, ...rows]
      .map((r) => r.map((c) => `"${c}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `freshstore-report-${applied.startDate}-to-${applied.endDate}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fade-in">
      {/* Header */}
      <div className="reports-header">
        <div>
          <h1 className="reports-title">Reports</h1>
          <p className="reports-subtitle">Filter and analyse your store data</p>
        </div>
        <Button
          variant="secondary"
          onClick={exportCSV}
          disabled={!entries.length}
        >
          ↓ Export CSV
        </Button>
      </div>

      {/* Filters */}
      <Card className="reports-filters-card">
        <div className="reports-filters-row">
          <div className="reports-filter-field">
            <Input
              label="From"
              type="date"
              value={filters.startDate}
              onChange={setFilter("startDate")}
            />
          </div>
          <div className="reports-filter-field">
            <Input
              label="To"
              type="date"
              value={filters.endDate}
              onChange={setFilter("endDate")}
            />
          </div>
          <div className="reports-filter-field">
            <Select
              label="Type"
              value={filters.type}
              onChange={setFilter("type")}
            >
              <option value="">All types</option>
              <option value="stock">Stock in</option>
              <option value="sale">Sales</option>
            </Select>
          </div>
          <Button onClick={apply} style={{ alignSelf: "flex-end" }}>
            Apply filters
          </Button>
          <Button
            variant="ghost"
            onClick={reset}
            style={{ alignSelf: "flex-end" }}
          >
            Reset
          </Button>
        </div>
      </Card>

      {error && (
        <div style={{ marginBottom: "16px" }}>
          <Alert>{error}</Alert>
        </div>
      )}

      {loading ? (
        <div className="spinner-center">
          <Spinner size={32} />
        </div>
      ) : (
        <>
          {/* Summary stats */}
          <div className="reports-stats-grid">
            <StatCard
              accent="green"
              label="Total stocked"
              value={`${totals.stockQty.toFixed(1)} kg`}
              sub={fmt(totals.stockValue)}
            />
            <StatCard
              accent="red"
              label="Total sold"
              value={`${totals.saleQty.toFixed(1)} kg`}
              sub={fmt(totals.saleValue)}
            />
            <StatCard
              accent="blue"
              label="Net revenue"
              value={fmt(totals.saleValue)}
              sub={`${entries.length} entries in range`}
            />
            <StatCard
              accent="amber"
              label="Remaining stock"
              value={`${Math.max(0, totals.stockQty - totals.saleQty).toFixed(1)} kg`}
              sub="Estimated (stock − sales)"
            />
          </div>

          {/* Per-item summary */}
          {data?.summary?.length > 0 && (
            <Card className="reports-card">
              <div className="reports-card-header">
                <h2 className="reports-card-title">Summary by item</h2>
              </div>
              <table className="reports-table">
                <thead>
                  <tr>
                    <th className="align-left">Item</th>
                    <th className="align-left">Type</th>
                    <th className="align-right">Total qty (kg)</th>
                    <th className="align-right">Avg price/kg</th>
                    <th className="align-right">Total value</th>
                    <th className="align-right">Entries</th>
                  </tr>
                </thead>
                <tbody>
                  {data.summary.map((row, i) => (
                    <tr key={i}>
                      <td className="fw-medium">{row._id.item}</td>
                      <td>
                        <Badge
                          variant={
                            row._id.type === "stock" ? "success" : "danger"
                          }
                        >
                          {row._id.type === "stock" ? "Stock in" : "Sale"}
                        </Badge>
                      </td>
                      <td className="align-right mono">
                        {row.totalQty.toFixed(1)}
                      </td>
                      <td className="align-right mono">{fmt(row.avgPrice)}</td>
                      <td className="align-right mono-bold">
                        {fmt(row.totalValue)}
                      </td>
                      <td className="align-right text-muted">
                        {row.entryCount}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          )}

          {/* Full entry table */}
          <Card>
            <div className="reports-card-header">
              <h2 className="reports-card-title">All entries in range</h2>
              <span className="reports-record-count">
                {entries.length} records
              </span>
            </div>

            {!entries.length ? (
              <EmptyState
                icon="📊"
                title="No data in this range"
                description="Try adjusting the date range or filters above."
              />
            ) : (
              <table className="reports-table">
                <thead>
                  <tr>
                    <th className="align-left">Item</th>
                    <th className="align-left">Type</th>
                    <th className="align-right">Qty (kg)</th>
                    <th className="align-right">Price/kg</th>
                    <th className="align-right">Total</th>
                    <th className="align-left">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map((e) => (
                    <tr key={e._id}>
                      <td className="fw-medium">{e.itemName}</td>
                      <td>
                        <Badge
                          variant={e.type === "stock" ? "success" : "danger"}
                        >
                          {e.type === "stock" ? "Stock" : "Sale"}
                        </Badge>
                      </td>
                      <td className="align-right mono">
                        {e.quantity.toFixed(1)}
                      </td>
                      <td className="align-right mono">
                        {fmt(e.pricePerUnit)}
                      </td>
                      <td className="align-right mono-bold">
                        {fmt(e.totalValue)}
                      </td>
                      <td className="text-muted">
                        {new Date(e.date).toLocaleDateString("en-KE", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan={2}>Totals</td>
                    <td className="align-right mono-bold">
                      {entries.reduce((s, e) => s + e.quantity, 0).toFixed(1)}
                    </td>
                    <td></td>
                    <td className="align-right reports-total-value">
                      {fmt(entries.reduce((s, e) => s + e.totalValue, 0))}
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            )}
          </Card>
        </>
      )}
    </div>
  );
}
