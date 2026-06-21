"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  FolderOpen,
  Folder,
  Files,
  ReceiptEuro,
  MessageSquare,
  Settings,
  ChevronsUpDown,
} from "lucide-react";
import { logout } from "@/app/actions/auth";

const AVATAR_PALETTE = [
  "#6366f1",
  "#10b981",
  "#f59e0b",
  "#0ea5e9",
  "#8b5cf6",
  "#ec4899",
];

function getAvatar(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const initials = parts
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
  const color =
    AVATAR_PALETTE[(name.charCodeAt(0) || 0) % AVATAR_PALETTE.length];
  return { initials: initials || "?", color };
}

const NAV_ITEMS = [
  {
    href: "/dashboard",
    icon: LayoutDashboard,
    label: "Tableau de bord",
    count: null,
  },
  { href: "/clients", icon: Users, label: "Clients", count: null },
  { href: "/projets", icon: FolderOpen, label: "Projets", count: null },
  { href: "/fichiers", icon: Files, label: "Fichiers", count: null },
  { href: "/livrables", icon: Folder, label: "Livrables", count: null },
  { href: "/factures", icon: ReceiptEuro, label: "Factures", count: null },
  {
    href: "/messages",
    icon: MessageSquare,
    label: "Messages",
    count: null,
  },
  { href: "/settings", icon: Settings, label: "Réglages", count: null },
];

interface Props {
  userName: string;
  plan: string | null;
  workspaceName: string;
}

export default function DashboardSidebar({
  userName,
  plan,
  workspaceName: _workspaceName,
}: Props) {
  const pathname = usePathname();
  const { initials, color } = getAvatar(userName);

  return (
    <aside
      className="flex h-full flex-col"
      style={{
        width: 248,
        flexShrink: 0,
        borderRight: "1px solid var(--border-default)",
        background: "var(--surface-card)",
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-[18px] pb-4 pt-[18px]">
        <div className="flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-md bg-indigo-600">
          <span className="text-xs font-bold leading-none text-white">L</span>
        </div>
        <span className="text-[17px] font-bold tracking-tight text-slate-900">
          Livra
        </span>
      </div>

      {/* Nav */}
      <nav className="flex flex-1 flex-col gap-0.5 px-3 pb-4">
        {NAV_ITEMS.map(({ href, icon: Icon, label, count }) => {
          const active =
            pathname === href ||
            (href !== "/" && pathname.startsWith(href + "/"));
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-[11px] rounded-lg px-2.5 py-[9px] text-[14px] transition-colors ${
                active
                  ? "bg-slate-50 font-semibold text-slate-900"
                  : "font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-700"
              }`}
            >
              <Icon
                size={18}
                strokeWidth={2}
                className={active ? "text-indigo-500" : "text-slate-400"}
              />
              <span className="flex-1">{label}</span>
              {count !== null && (
                <span className="text-xs font-semibold text-slate-400">
                  {count}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User footer */}
      <div style={{ borderTop: "1px solid var(--border-subtle)", padding: 12 }}>
        <div className="flex items-center gap-2.5 px-2 py-1.5">
          <span
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[13px] font-semibold text-white"
            style={{
              background: color,
              boxShadow: "inset 0 0 0 1px rgba(15,23,42,0.06)",
            }}
          >
            {initials}
          </span>
          <div className="min-w-0 flex-1">
            <div className="truncate text-[13.5px] font-semibold text-slate-900">
              {userName}
            </div>
            <div className="text-[12px] text-slate-400">
              {plan
                ? `Plan ${plan.charAt(0).toUpperCase() + plan.slice(1)}`
                : "Plan gratuit"}
            </div>
          </div>
          <form action={logout}>
            <button
              type="submit"
              title="Se déconnecter"
              className="cursor-pointer text-slate-400 transition-colors hover:text-slate-600"
            >
              <ChevronsUpDown size={15} strokeWidth={2} />
            </button>
          </form>
        </div>
      </div>
    </aside>
  );
}
