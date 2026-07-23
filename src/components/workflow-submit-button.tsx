"use client";

import { useFormStatus } from "react-dom";

type WorkflowSubmitButtonProps = {
  idleLabel: string;
  pendingLabel: string;
};

export function WorkflowSubmitButton({
  idleLabel,
  pendingLabel,
}: WorkflowSubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button className="button-primary" type="submit" disabled={pending}>
      {pending ? pendingLabel : idleLabel}
    </button>
  );
}
