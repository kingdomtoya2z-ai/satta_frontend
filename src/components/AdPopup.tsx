"use client";

import { useEffect, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { XIcon } from "lucide-react";

interface Ad {
  _id: string;
  title: string;
  type: "image" | "video";
  url: string;
}

export default function AdPopup({
  ad,
  onClose,
}: {
  ad: Ad | null;
  onClose: () => void;
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (ad) setOpen(true);
    else setOpen(false);
  }, [ad]);

  function handleClose() {
    setOpen(false);
    onClose();
  }

  return (
    <Dialog.Root open={open} onOpenChange={(o) => { if (!o) handleClose(); }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed top-[50%] left-[50%] z-50 w-full max-w-lg translate-x-[-50%] translate-y-[-50%] rounded-lg bg-card p-4 shadow-xl border border-border data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95">
          <div className="flex items-center justify-between mb-3">
            <Dialog.Title className="text-base font-bold text-foreground">{ad?.title}</Dialog.Title>
            <Dialog.Close className="rounded-xs opacity-70 hover:opacity-100 focus:outline-hidden">
              <XIcon className="size-5" />
              <span className="sr-only">Close</span>
            </Dialog.Close>
          </div>
          <div className="rounded-sm overflow-hidden bg-black/5">
            {ad?.type === "video" ? (
              <video
                src={ad.url}
                autoPlay
                muted
                loop
                playsInline
                controls={false}
                className="w-full max-h-[400px] object-contain"
              />
            ) : (
              <img
                src={ad?.url}
                alt={ad?.title || "Ad"}
                className="w-full max-h-[400px] object-contain"
              />
            )}
          </div>
          <button
            onClick={handleClose}
            className="w-full mt-3 bg-primary text-primary-foreground py-2 text-sm font-bold rounded-sm hover:bg-primary/90 transition-colors"
          >
            Cancel
          </button>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
