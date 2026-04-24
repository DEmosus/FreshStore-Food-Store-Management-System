import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Alert, Button, Card, Input, Select, Spinner } from "../components/UI";
import { entriesService } from "../services/entries";
import "./EntryForm.css";

const COMMON_ITEMS = [
  "Avocados",
  "Bananas",
  "Carrots",
  "Garlic",
  "Ginger",
  "Green beans",
  "Kale",
  "Lemons",
  "Mangoes",
  "Onions",
  "Oranges",
  "Pineapples",
  "Potatoes",
  "Spinach",
  "Sweet potatoes",
  "Tomatoes",
  "Watermelon",
];

const fmt = (n) =>
  `KSh ${Number(n || 0).toLocaleString("en-KE", { minimumFractionDigits: 2 })}`;

export default function EntryForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [form, setForm] = useState({
    itemName: "",
    customItem: "",
    quantity: "",
    pricePerUnit: "",
    type: "stock",
    date: new Date().toISOString().split("T")[0],
    notes: "",
  });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(isEdit);

  useEffect(() => {
    if (!isEdit) return;
    entriesService
      .getOne(id)
      .then(({ data }) => {
        const e = data.data;
        const isCustom = !COMMON_ITEMS.includes(e.itemName);
        setForm({
          itemName: isCustom ? "custom" : e.itemName,
          customItem: isCustom ? e.itemName : "",
          quantity: String(e.quantity),
          pricePerUnit: String(e.pricePerUnit),
          type: e.type,
          date: new Date(e.date).toISOString().split("T")[0],
          notes: e.notes || "",
        });
      })
      .catch(() => setApiError("Failed to load entry"))
      .finally(() => setFetchLoading(false));
  }, [id, isEdit]);

  const set = (k) => (e) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
    setErrors((er) => ({ ...er, [k]: "" }));
    setApiError("");
  };

  const resolvedItem =
    form.itemName === "custom" ? form.customItem.trim() : form.itemName;
  const total =
    (parseFloat(form.quantity) || 0) * (parseFloat(form.pricePerUnit) || 0);

  const validate = () => {
    const errs = {};
    if (!resolvedItem) errs.itemName = "Please select or enter an item";
    if (!form.quantity || isNaN(form.quantity) || +form.quantity <= 0)
      errs.quantity = "Must be a positive number";
    if (
      form.pricePerUnit === "" ||
      isNaN(form.pricePerUnit) ||
      +form.pricePerUnit < 0
    )
      errs.pricePerUnit = "Must be zero or positive";
    if (!form.date) errs.date = "Date is required";
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }

    setLoading(true);
    const payload = {
      itemName: resolvedItem,
      quantity: parseFloat(form.quantity),
      pricePerUnit: parseFloat(form.pricePerUnit),
      type: form.type,
      date: form.date,
      notes: form.notes,
    };
    try {
      if (isEdit) {
        await entriesService.update(id, payload);
      } else {
        await entriesService.create(payload);
      }
      navigate("/dashboard");
    } catch (err) {
      setApiError(err.response?.data?.message || "Failed to save entry");
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <div className="spinner-center" style={{ paddingTop: "60px" }}>
        <Spinner size={32} />
      </div>
    );
  }

  return (
    <div className="entry-form-page fade-in">
      <div className="entry-form-header">
        <button className="entry-form-back-btn" onClick={() => navigate(-1)}>
          ← Back
        </button>
        <h1 className="entry-form-title">
          {isEdit ? "Edit entry" : "Add new entry"}
        </h1>
        <p className="entry-form-subtitle">
          Record a stock delivery or sales transaction
        </p>
      </div>

      <Card className="entry-form-card">
        {apiError && (
          <div className="entry-form-alert-wrap">
            <Alert>{apiError}</Alert>
          </div>
        )}

        <form className="entry-form-body" onSubmit={handleSubmit}>
          {/* Type toggle */}
          <div>
            <label className="type-toggle-label">Entry type</label>
            <div className="type-toggle">
              {["stock", "sale"].map((t) => {
                const isActive = form.type === t;
                let cls = "type-toggle-btn ";
                if (isActive)
                  cls +=
                    t === "stock"
                      ? "type-toggle-btn-stock-active"
                      : "type-toggle-btn-sale-active";
                else cls += "type-toggle-btn-inactive";
                if (t === "stock") cls += " type-toggle-divider";
                return (
                  <button
                    key={t}
                    type="button"
                    className={cls}
                    onClick={() => setForm((f) => ({ ...f, type: t }))}
                  >
                    {t === "stock" ? "↑ Stock in" : "↓ Sale"}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Item */}
          <div>
            <Select
              label="Item"
              value={form.itemName}
              onChange={set("itemName")}
              error={form.itemName !== "custom" ? errors.itemName : undefined}
            >
              <option value="">Select a fruit or vegetable...</option>
              {COMMON_ITEMS.map((i) => (
                <option key={i} value={i}>
                  {i}
                </option>
              ))}
              <option value="custom">Other (type below)</option>
            </Select>
            {form.itemName === "custom" && (
              <div style={{ marginTop: "8px" }}>
                <Input
                  placeholder="Enter item name"
                  value={form.customItem}
                  onChange={set("customItem")}
                  error={errors.itemName}
                  autoFocus
                />
              </div>
            )}
          </div>

          {/* Qty + Price */}
          <div className="entry-form-two-col">
            <Input
              label="Quantity (kg)"
              type="number"
              placeholder="0"
              min="0.01"
              step="0.1"
              value={form.quantity}
              onChange={set("quantity")}
              error={errors.quantity}
            />
            <Input
              label="Price per kg (KSh)"
              type="number"
              placeholder="0"
              min="0"
              step="1"
              value={form.pricePerUnit}
              onChange={set("pricePerUnit")}
              error={errors.pricePerUnit}
            />
          </div>

          {/* Date */}
          <Input
            label="Date"
            type="date"
            value={form.date}
            onChange={set("date")}
            error={errors.date}
          />

          {/* Notes */}
          <div>
            <label className="entry-form-notes-label">
              Notes{" "}
              <span className="entry-form-notes-optional">(optional)</span>
            </label>
            <textarea
              rows={2}
              className="entry-form-textarea"
              placeholder="e.g. Supplier: Wakulima Market"
              value={form.notes}
              onChange={set("notes")}
            />
          </div>

          {/* Total preview */}
          {total > 0 && (
            <div className="entry-form-total">
              <span className="entry-form-total-label">Calculated total</span>
              <span className="entry-form-total-value">{fmt(total)}</span>
            </div>
          )}

          {/* Actions */}
          <div className="entry-form-actions">
            <Button
              type="submit"
              size="lg"
              loading={loading}
              className="entry-form-submit-btn"
            >
              {isEdit ? "Save changes" : "Submit entry"}
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="lg"
              onClick={() => navigate(-1)}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
