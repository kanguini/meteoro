export type ActionState = { ok?: boolean; error?: string; message?: string };

export function AdminHead({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <header className="admin-head">
      <div>
        <h1 className="admin-head__title">{title}</h1>
        {description && <p className="admin-head__sub">{description}</p>}
      </div>
      {actions && <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>{actions}</div>}
    </header>
  );
}

export function Field({
  label,
  name,
  defaultValue,
  hint,
  type = 'text',
  required,
  placeholder,
}: {
  label: string;
  name: string;
  defaultValue?: string | null;
  hint?: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <div className="adm-field">
      <label className="adm-field__label" htmlFor={name}>
        {label}
      </label>
      <input
        className="adm-input"
        id={name}
        name={name}
        type={type}
        defaultValue={defaultValue ?? ''}
        required={required}
        placeholder={placeholder}
      />
      {hint && <span className="adm-field__hint">{hint}</span>}
    </div>
  );
}

export function TextArea({
  label,
  name,
  defaultValue,
  hint,
  rows = 4,
}: {
  label: string;
  name: string;
  defaultValue?: string | null;
  hint?: string;
  rows?: number;
}) {
  return (
    <div className="adm-field">
      <label className="adm-field__label" htmlFor={name}>
        {label}
      </label>
      <textarea className="adm-textarea" id={name} name={name} rows={rows} defaultValue={defaultValue ?? ''} />
      {hint && <span className="adm-field__hint">{hint}</span>}
    </div>
  );
}

export function Panel({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <section className="admin-panel">
      {title && <h2 className="admin-panel__title">{title}</h2>}
      {children}
    </section>
  );
}

export function Empty({ children }: { children: React.ReactNode }) {
  return <p className="adm-empty">{children}</p>;
}
