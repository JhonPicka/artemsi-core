import type { ReactNode } from "react";

type Props = {
  title: string;
  message?: string;
  action?: ReactNode;
};

export function EmptyState({ title, message, action }: Props) {
  return (
    <div className="empty-state" role="status">
      <div className="empty-state-title">{title}</div>
      {message ? <p className="empty-state-msg">{message}</p> : null}
      {action ? <div>{action}</div> : null}
    </div>
  );
}
