import "./UI.css";

/* ─── Button ─────────────────────────────────────── */
export const Button = ({
  children,
  variant = "primary",
  size = "md",
  loading,
  disabled,
  className = "",
  ...props
}) => (
  <button
    className={`btn btn-${size} btn-${variant} ${className}`}
    disabled={disabled || loading}
    {...props}
  >
    {loading && <Spinner size={14} />}
    {children}
  </button>
);

/* ─── Input ──────────────────────────────────────── */
export const Input = ({ label, error, hint, className = "", ...props }) => (
  <div className="input-group">
    {label && <label className="input-label">{label}</label>}
    <input
      className={`input-field ${error ? "input-error" : ""} ${className}`}
      {...props}
    />
    {error && <span className="input-error-msg">{error}</span>}
    {hint && !error && <span className="input-hint">{hint}</span>}
  </div>
);

/* ─── Select ─────────────────────────────────────── */
export const Select = ({
  label,
  error,
  className = "",
  children,
  ...props
}) => (
  <div className="input-group">
    {label && <label className="input-label">{label}</label>}
    <select
      className={`select-field ${error ? "input-error" : ""} ${className}`}
      {...props}
    >
      {children}
    </select>
    {error && <span className="input-error-msg">{error}</span>}
  </div>
);

/* ─── Badge ──────────────────────────────────────── */
export const Badge = ({ children, variant = "default" }) => (
  <span className={`badge badge-${variant}`}>{children}</span>
);

/* ─── Card ───────────────────────────────────────── */
export const Card = ({ children, className = "", style, ...props }) => (
  <div className={`card ${className}`} style={style} {...props}>
    {children}
  </div>
);

/* ─── Spinner ────────────────────────────────────── */
export const Spinner = ({ size = 20, color = "currentColor" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className="spinner"
  >
    <circle
      cx="12"
      cy="12"
      r="10"
      stroke={color}
      strokeWidth="2.5"
      strokeOpacity="0.2"
    />
    <path
      d="M12 2a10 10 0 0 1 10 10"
      stroke={color}
      strokeWidth="2.5"
      strokeLinecap="round"
    />
  </svg>
);

/* ─── StatCard ───────────────────────────────────── */
export const StatCard = ({
  label,
  value,
  sub,
  subVariant = "default",
  accent,
}) => (
  <Card className={`stat-card ${accent ? `stat-card-accent-${accent}` : ""}`}>
    <p className="stat-label">{label}</p>
    <p className="stat-value">{value}</p>
    {sub && (
      <p
        className={`stat-sub ${subVariant === "up" ? "stat-sub-up" : subVariant === "down" ? "stat-sub-down" : ""}`}
      >
        {sub}
      </p>
    )}
  </Card>
);

/* ─── Alert ──────────────────────────────────────── */
export const Alert = ({ children, variant = "danger" }) => (
  <div className={`alert alert-${variant}`}>{children}</div>
);

/* ─── Empty State ────────────────────────────────── */
export const EmptyState = ({ icon = "📭", title, description }) => (
  <div className="empty-state">
    <div className="empty-state-icon">{icon}</div>
    <p className="empty-state-title">{title}</p>
    {description && <p className="empty-state-desc">{description}</p>}
  </div>
);
