import type { ReactNode } from "react";

type FormSectionProps = {
  children: ReactNode;
  description?: string;
  title: string;
};

export function FormSection({
  children,
  description,
  title,
}: FormSectionProps) {
  return (
    <section className="form-section">
      <header className="form-section__header">
        <h2>{title}</h2>
        {description && <p>{description}</p>}
      </header>
      <div className="form-section__body">{children}</div>
    </section>
  );
}

type EmptyStateProps = {
  action?: ReactNode;
  description: string;
  title: string;
};

export function EmptyState({
  action,
  description,
  title,
}: EmptyStateProps) {
  return (
    <div className="empty-state">
      <div>
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
      {action && <div className="empty-state__action">{action}</div>}
    </div>
  );
}

type InlineCreatePanelProps = {
  children: ReactNode;
  description: string;
  onClose: () => void;
  title: string;
};

export function InlineCreatePanel({
  children,
  description,
  onClose,
  title,
}: InlineCreatePanelProps) {
  return (
    <section className="inline-create-panel" aria-label={title}>
      <header>
        <div>
          <h3>{title}</h3>
          <p>{description}</p>
        </div>
        <button type="button" className="button-tertiary" onClick={onClose}>
          Close
        </button>
      </header>
      {children}
    </section>
  );
}

type StatusMessageProps = {
  children: ReactNode;
  tone: "error" | "info" | "success";
};

export function StatusMessage({ children, tone }: StatusMessageProps) {
  return (
    <p
      className={`status-message status-message--${tone}`}
      role={tone === "error" ? "alert" : "status"}
    >
      {children}
    </p>
  );
}
