import React from 'react';

export function ModuleShell({ eyebrow, title, subtitle, actions, children }) {
  return (
    <main className="module-page">
      <div className="module-head">
        <div>
          <span className="module-eyebrow">{eyebrow}</span>
          <h1>{title}</h1>
          <p>{subtitle}</p>
        </div>
        <div className="module-head-actions">{actions}</div>
      </div>
      {children}
    </main>
  );
}

export function EmptyState({ children = 'No records available.' }) {
  return <div className="module-empty">{children}</div>;
}
