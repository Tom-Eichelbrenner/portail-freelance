import { and, asc, eq, isNull } from "drizzle-orm";
import { requireAuth } from "@/lib/auth";
import { db } from "@/db";
import { clients, messages, projects } from "@/db/schema";
import MessagesView, {
  type ConversationItem,
  type MessageItem,
} from "@/components/dashboard/MessagesView";

const AVATAR_PALETTE = [
  { bg: "var(--indigo-100)", fg: "var(--indigo-700)" },
  { bg: "var(--emerald-100)", fg: "var(--emerald-700)" },
  { bg: "var(--amber-50)", fg: "var(--amber-600)" },
  { bg: "#e0e7ff", fg: "#4338ca" },
  { bg: "var(--slate-100)", fg: "var(--slate-600)" },
];

function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

function fmtTime(date: Date): string {
  const now = new Date();
  const todayDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterdayDay = new Date(todayDay.getTime() - 86400000);
  const msgDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  if (msgDay.getTime() === todayDay.getTime()) {
    return date.toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }
  if (msgDay.getTime() === yesterdayDay.getTime()) {
    return "Hier";
  }
  return date.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
  });
}

export default async function MessagesPage() {
  const { workspace } = await requireAuth();

  const [projectList, allMessages] = await Promise.all([
    db
      .select({
        id: projects.id,
        name: projects.name,
        clientName: clients.name,
        updatedAt: projects.updatedAt,
      })
      .from(projects)
      .innerJoin(clients, eq(clients.id, projects.clientId))
      .where(
        and(eq(projects.workspaceId, workspace.id), isNull(projects.deletedAt)),
      ),
    db
      .select()
      .from(messages)
      .where(eq(messages.workspaceId, workspace.id))
      .orderBy(asc(messages.createdAt)),
  ]);

  // Group messages by project
  const msgByProject = new Map<string, typeof allMessages>();
  for (const msg of allMessages) {
    if (!msgByProject.has(msg.projectId)) msgByProject.set(msg.projectId, []);
    msgByProject.get(msg.projectId)!.push(msg);
  }

  // Only show projects that have at least one message
  const conversations: ConversationItem[] = projectList
    .filter((p) => msgByProject.has(p.id))
    .map((p, i) => {
      const msgs = msgByProject.get(p.id)!;
      const last = msgs[msgs.length - 1];
      const palette = AVATAR_PALETTE[i % AVATAR_PALETTE.length];
      return {
        id: p.id,
        projectName: p.name,
        clientName: p.clientName,
        clientInitials: initials(p.clientName) || "?",
        avBg: palette.bg,
        avFg: palette.fg,
        lastMessage: last.content,
        lastMessageFrom: last.authorType as "freelance" | "client",
        lastMessageTime: fmtTime(last.createdAt),
        _sortKey: last.createdAt.getTime(),
      };
    })
    .sort((a, b) => b._sortKey - a._sortKey)
    .map(({ _sortKey: _sk, ...c }) => c);

  // Build message items per project
  const allMessagesByProject: Record<string, MessageItem[]> = {};
  for (const [projectId, msgs] of msgByProject) {
    allMessagesByProject[projectId] = msgs.map((m) => ({
      id: m.id,
      content: m.content,
      authorType: m.authorType as "freelance" | "client",
      createdAtISO: m.createdAt.toISOString(),
      time: fmtTime(m.createdAt),
    }));
  }

  const defaultActiveId = conversations[0]?.id ?? null;

  return (
    <main className="flex h-full min-w-0 flex-1 overflow-hidden">
      <MessagesView
        conversations={conversations}
        allMessagesByProject={allMessagesByProject}
        defaultActiveId={defaultActiveId}
        accentColor={workspace.accentColor}
      />
    </main>
  );
}
