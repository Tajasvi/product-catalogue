import { useEffect, useRef, type MouseEvent } from "react";
import type { Product } from "../types.js";
import { EnquiryForm } from "./EnquiryForm.js";

interface EnquiryModalProps {
  product: Product;
  onClose: () => void;
}

export function EnquiryModal({ product, onClose }: EnquiryModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    if (typeof dialog.showModal === "function") {
      dialog.showModal();
    } else {
      dialog.setAttribute("open", "");
    }
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }
    };
    document.addEventListener("keydown", closeOnEscape);

    return () => {
      document.removeEventListener("keydown", closeOnEscape);
      document.body.style.overflow = previousOverflow;
      if (dialog.open && typeof dialog.close === "function") {
        dialog.close();
      }
    };
  }, [onClose]);

  function closeFromBackdrop(event: MouseEvent<HTMLDialogElement>) {
    if (event.target === event.currentTarget) {
      onClose();
    }
  }

  return (
    <dialog
      ref={dialogRef}
      className="enquiry-modal"
      aria-label={`Enquire about ${product.title}`}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          event.preventDefault();
          onClose();
        }
      }}
      onClick={closeFromBackdrop}
    >
      <div className="enquiry-modal__surface">
        <button
          className="enquiry-modal__close"
          type="button"
          onClick={onClose}
          aria-label="Close enquiry form"
        >
          <span aria-hidden="true">×</span>
        </button>
        <EnquiryForm product={product} />
      </div>
    </dialog>
  );
}

