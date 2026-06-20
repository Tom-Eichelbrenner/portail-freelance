"use client";

import { useActionState } from "react";
import { createInvoice, type InvoiceState } from "@/app/actions/stripe";

const initialState: InvoiceState = { error: null, success: null };

interface Props {
  projectId: string;
}

export default function InvoiceForm({ projectId }: Props) {
  const [state, formAction, isPending] = useActionState(
    createInvoice,
    initialState,
  );

  return (
    <div className="mt-4 border border-dashed border-gray-200 rounded-lg p-4">
      <h4 className="text-sm font-semibold mb-3 text-gray-700">
        Envoyer une facture
      </h4>

      <form action={formAction} className="space-y-3">
        <input type="hidden" name="projectId" value={projectId} />

        {state.error && (
          <p className="text-red-600 text-xs bg-red-50 border border-red-200 rounded px-2 py-1.5">
            {state.error}
          </p>
        )}
        {state.success && (
          <p className="text-green-700 text-xs bg-green-50 border border-green-200 rounded px-2 py-1.5">
            {state.success}
          </p>
        )}

        <div className="flex gap-2">
          <div className="w-28">
            <label className="block text-xs font-medium mb-1 text-gray-600">
              Montant (€)
            </label>
            <input
              name="amount"
              type="number"
              min="1"
              step="1"
              required
              placeholder="500"
              className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="flex-1">
            <label className="block text-xs font-medium mb-1 text-gray-600">
              Description
            </label>
            <input
              name="description"
              type="text"
              required
              placeholder="Développement site web — Mai 2026"
              className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="bg-indigo-600 text-white rounded px-3 py-1.5 text-xs font-medium hover:bg-indigo-700 disabled:opacity-50"
        >
          {isPending ? "Envoi…" : "Envoyer la facture"}
        </button>
      </form>
    </div>
  );
}
