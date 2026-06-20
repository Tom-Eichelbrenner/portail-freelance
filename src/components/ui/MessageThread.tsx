"use client";

import { useTransition, useRef } from "react";
import { useRouter } from "next/navigation";
import { postMessage } from "@/app/actions/messages";

interface Message {
  id: string;
  content: string;
  authorType: string;
  createdAt: string;
}

interface Props {
  projectId: string;
  initialMessages: Message[];
  viewerType: "freelance" | "client";
}

export default function MessageThread({
  projectId,
  initialMessages,
  viewerType,
}: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.set("projectId", projectId);
    startTransition(async () => {
      const result = await postMessage(formData);
      if (!result.error) {
        formRef.current?.reset();
        router.refresh();
      }
    });
  }

  return (
    <div className="mt-3">
      <p className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">
        Messages
      </p>

      <div className="space-y-2 mb-3 max-h-52 overflow-y-auto">
        {initialMessages.length === 0 && (
          <p className="text-gray-400 text-xs">Aucun message pour le moment.</p>
        )}
        {initialMessages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.authorType === viewerType ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-xs lg:max-w-sm px-3 py-2 rounded-xl text-sm leading-snug ${
                msg.authorType === viewerType
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
      </div>

      <form ref={formRef} onSubmit={handleSubmit} className="flex gap-2">
        <textarea
          name="content"
          required
          rows={2}
          placeholder="Votre message…"
          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />
        <button
          type="submit"
          disabled={isPending}
          className="bg-indigo-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 self-end"
        >
          {isPending ? "…" : "Envoyer"}
        </button>
      </form>
    </div>
  );
}
