"use client";

import { useActionState, useState } from "react";
import { useRouter } from "next/navigation";
import { X, UserPlus, Check } from "lucide-react";
import { inviteClient, type InviteState } from "@/app/actions/client";

const initialState: InviteState = { error: null, success: null };

interface Props {
  workspaceId: string;
  renderTrigger?: (open: () => void) => React.ReactNode;
}

function ModalContent({
  workspaceId,
  onClose,
}: {
  workspaceId: string;
  onClose: () => void;
}) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(
    inviteClient,
    initialState,
  );
  const sent = !!state.success;

  function handleDone() {
    router.refresh();
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-6"
      style={{
        background: "rgba(15,23,42,0.32)",
        animation: "lv-fade 160ms ease-out",
      }}
      onClick={onClose}
    >
      <div
        className="w-[440px] max-w-full rounded-2xl border"
        style={{
          background: "var(--surface-card)",
          borderColor: "var(--border-default)",
          boxShadow: "var(--shadow-lg)",
          animation: "lv-pop 200ms cubic-bezier(0.16,1,0.3,1)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {!sent ? (
          <>
            <div className="flex items-start justify-between p-6 pb-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50">
                  <UserPlus
                    size={20}
                    strokeWidth={2}
                    className="text-indigo-600"
                  />
                </div>
                <div>
                  <div className="text-base font-bold tracking-tight text-slate-900">
                    Inviter un client
                  </div>
                  <div className="mt-0.5 text-[13px] text-slate-500">
                    Il recevra un accès à son portail dédié.
                  </div>
                </div>
              </div>
              <button
                onClick={onClose}
                className="mt-0.5 cursor-pointer text-slate-400 transition-colors hover:text-slate-600"
              >
                <X size={18} strokeWidth={2} />
              </button>
            </div>

            <form action={formAction}>
              <input type="hidden" name="workspaceId" value={workspaceId} />

              <div className="flex flex-col gap-3.5 px-6 pb-1 pt-1">
                {state.error && (
                  <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
                    {state.error}
                  </p>
                )}

                <label className="flex flex-col gap-1.5">
                  <span className="text-[13px] font-semibold text-slate-900">
                    Nom du client ou de la société
                  </span>
                  <input
                    name="clientName"
                    type="text"
                    required
                    placeholder="Studio Atlas"
                    className="h-10 rounded-lg border px-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-colors focus:ring-1"
                    style={{
                      background: "var(--surface-card)",
                      borderColor: "var(--border-default)",
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = "var(--border-focus)";
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor =
                        "var(--border-default)";
                    }}
                  />
                </label>

                <label className="flex flex-col gap-1.5">
                  <span className="text-[13px] font-semibold text-slate-900">
                    Email
                  </span>
                  <input
                    name="clientEmail"
                    type="email"
                    required
                    placeholder="contact@studio-atlas.fr"
                    className="h-10 rounded-lg border px-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-colors"
                    style={{
                      background: "var(--surface-card)",
                      borderColor: "var(--border-default)",
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = "var(--border-focus)";
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor =
                        "var(--border-default)";
                    }}
                  />
                </label>
              </div>

              <div className="flex justify-end gap-2.5 p-6 pt-[18px]">
                <button
                  type="button"
                  onClick={onClose}
                  className="h-10 cursor-pointer rounded-lg border px-4 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
                  style={{ borderColor: "var(--border-default)" }}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="h-10 cursor-pointer rounded-lg bg-indigo-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 disabled:opacity-50"
                >
                  {isPending ? "Envoi…" : "Envoyer l'invitation"}
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="px-7 py-8 text-center">
            <div className="mb-3.5 inline-flex h-[52px] w-[52px] items-center justify-center rounded-full bg-emerald-50">
              <Check size={26} strokeWidth={2.5} className="text-emerald-600" />
            </div>
            <div className="text-[17px] font-bold tracking-tight text-slate-900">
              Invitation envoyée
            </div>
            <div className="mt-1 text-[13.5px] leading-relaxed text-slate-500">
              {state.success}
            </div>
            <div className="mt-5 flex justify-center">
              <button
                onClick={handleDone}
                className="h-10 cursor-pointer rounded-lg bg-indigo-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-indigo-700"
              >
                Terminé
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function InviteModal({ workspaceId, renderTrigger }: Props) {
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);

  return (
    <>
      {renderTrigger ? (
        renderTrigger(handleOpen)
      ) : (
        <button
          onClick={handleOpen}
          className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-lg bg-indigo-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 active:bg-indigo-800"
        >
          <UserPlus size={16} strokeWidth={2} />
          Inviter un client
        </button>
      )}

      {open && (
        <ModalContent
          workspaceId={workspaceId}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}
