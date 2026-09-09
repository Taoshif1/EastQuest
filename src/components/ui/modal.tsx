"use client";
import { useEffect, useRef } from "react";
/** Native dialog supplies focus containment, background inertness, and Escape handling. */
export function Modal({
  title,
  children,
  onClose,
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    const previous = document.activeElement as HTMLElement | null;
    dialog?.showModal();
    return () => {
      dialog?.close();
      previous?.focus();
    };
  }, []);
  return (
    <dialog
      ref={ref}
      className="quest-dialog"
      aria-label={title}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
    >
      <button
        className="close-button"
        onClick={onClose}
        aria-label="Close dialog"
      >
        ×
      </button>
      {children}
    </dialog>
  );
}
