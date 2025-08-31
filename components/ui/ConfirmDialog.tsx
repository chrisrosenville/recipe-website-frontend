"use client";

import { useEffect, useRef } from "react";
import Modal from "./Modal";

type ConfirmDialogProps = {
  open: boolean;
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  confirmVariant?: "danger" | "primary";
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
};

export default function ConfirmDialog({
  open,
  title = "Are you sure?",
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  confirmVariant = "primary",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const confirmRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (open) confirmRef.current?.focus();
  }, [open]);

  return (
    <Modal
      open={open}
      onClose={onCancel}
      title={title}
      description={description}
      footer={
        <>
          <button
            className="rounded-md border border-gray-300 px-3 py-2 text-sm"
            onClick={onCancel}
          >
            {cancelText}
          </button>
          <button
            ref={confirmRef}
            className={
              confirmVariant === "danger"
                ? "rounded-md bg-red-600 px-3 py-2 text-sm font-medium text-white"
                : "rounded-md bg-gray-900 px-3 py-2 text-sm font-medium text-white"
            }
            onClick={() => void onConfirm()}
          >
            {confirmText}
          </button>
        </>
      }
    />
  );
}
