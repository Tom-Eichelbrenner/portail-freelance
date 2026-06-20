"use client";

import { useActionState } from "react";
import { inviteClient, type InviteState } from "@/app/actions/client";

const initialState: InviteState = { error: null, success: null };

interface Props {
  workspaceId: string;
}

export default function InviteForm({ workspaceId }: Props) {
  const [state, formAction, isPending] = useActionState(
    inviteClient,
    initialState,
  );

  return (
    <div className="border border-gray-200 rounded-lg p-6">
      <h2 className="text-lg font-semibold mb-4">Inviter un client</h2>

      <form action={formAction} className="space-y-4">
        <input type="hidden" name="workspaceId" value={workspaceId} />

        {state.error && (
          <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded px-3 py-2">
            {state.error}
          </p>
        )}

        {state.success && (
          <p className="text-green-700 text-sm bg-green-50 border border-green-200 rounded px-3 py-2">
            {state.success}
          </p>
        )}

        <div>
          <label
            htmlFor="clientName"
            className="block text-sm font-medium mb-1"
          >
            Nom du client
          </label>
          <input
            id="clientName"
            name="clientName"
            type="text"
            required
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label
            htmlFor="clientEmail"
            className="block text-sm font-medium mb-1"
          >
            Email du client
          </label>
          <input
            id="clientEmail"
            name="clientEmail"
            type="email"
            required
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="bg-indigo-600 text-white rounded px-4 py-2 text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
        >
          {isPending ? "Envoi…" : "Envoyer l'invitation"}
        </button>
      </form>
    </div>
  );
}
