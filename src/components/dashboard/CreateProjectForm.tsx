"use client";

import { useTransition, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createProject } from "@/app/actions/projects";

interface Client {
  id: string;
  name: string;
}

interface Props {
  clients: Client[];
}

export default function CreateProjectForm({ clients }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    setError(null);
    setSuccess(false);
    startTransition(async () => {
      const result = await createProject(formData);
      if (result.error) {
        setError(result.error);
      } else {
        setSuccess(true);
        formRef.current?.reset();
        router.refresh();
      }
    });
  }

  return (
    <div className="border border-gray-200 rounded-lg p-6">
      <h2 className="text-lg font-semibold mb-4">Nouveau projet</h2>

      <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded px-3 py-2">
            {error}
          </p>
        )}
        {success && (
          <p className="text-green-700 text-sm bg-green-50 border border-green-200 rounded px-3 py-2">
            Projet créé avec succès
          </p>
        )}

        <div>
          <label className="block text-sm font-medium mb-1">Client</label>
          <select
            name="clientId"
            required
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Sélectionner un client</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Nom du projet
          </label>
          <input
            name="name"
            type="text"
            required
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Description{" "}
            <span className="text-gray-400 font-normal">(optionnel)</span>
          </label>
          <textarea
            name="description"
            rows={2}
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
          />
        </div>

        <button
          type="submit"
          disabled={isPending || clients.length === 0}
          className="bg-indigo-600 text-white rounded px-4 py-2 text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
        >
          {isPending ? "Création…" : "Créer le projet"}
        </button>
      </form>
    </div>
  );
}
