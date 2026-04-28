"use client";

import { Bell } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

interface NotificationDTO {
  id: string;
  type: string;
  title: string;
  body: string;
  data: Record<string, unknown> | null;
  readAt: string | null;
  createdAt: string;
}

async function fetchNotifications(): Promise<NotificationDTO[]> {
  const res = await fetch("/api/me/notifications");
  if (!res.ok) throw new Error("Failed to fetch notifications");
  return res.json();
}

async function markRead(id: string): Promise<void> {
  const res = await fetch(`/api/me/notifications/${id}/read`, { method: "POST" });
  if (!res.ok) throw new Error("Failed to mark read");
}

export function NotificationBell() {
  const qc = useQueryClient();

  const { data = [] } = useQuery({
    queryKey: ["notifications"],
    queryFn: fetchNotifications,
    refetchInterval: () => (document.visibilityState === "visible" ? 60_000 : false),
  });

  const mark = useMutation({
    mutationFn: markRead,
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: ["notifications"] });
      const previous = qc.getQueryData<NotificationDTO[]>(["notifications"]);
      qc.setQueryData<NotificationDTO[]>(["notifications"], (old) =>
        old?.map((n) =>
          n.id === id ? { ...n, readAt: new Date().toISOString() } : n,
        ) ?? [],
      );
      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) qc.setQueryData(["notifications"], ctx.previous);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const unread = data.filter((n) => !n.readAt).length;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unread > 0 && (
            <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-medium text-white">
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0">
        <div className="border-b px-4 py-3">
          <h3 className="text-sm font-semibold">Benachrichtigungen</h3>
        </div>
        <div className="max-h-96 overflow-y-auto">
          {data.length === 0 && (
            <p className="px-4 py-6 text-center text-sm text-muted-foreground">
              Noch keine Benachrichtigungen.
            </p>
          )}
          {data.map((n) => (
            <NotificationRow key={n.id} n={n} onClick={() => mark.mutate(n.id)} />
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function NotificationRow({
  n,
  onClick,
}: {
  n: NotificationDTO;
  onClick: () => void;
}) {
  const href = (() => {
    if (n.type.startsWith("booking_") && n.data?.bookingId) {
      return `/bookings/${n.data.bookingId}`;
    }
    if (n.type === "review_prompt" && n.data?.bookingId) {
      return `/bookings/${n.data.bookingId}#review`;
    }
    return "#";
  })();

  return (
    <Link
      href={href}
      onClick={onClick}
      className={`block border-b px-4 py-3 transition-colors hover:bg-gray-50 ${
        n.readAt ? "opacity-60" : "bg-blue-50/40"
      }`}
    >
      <p className="text-sm font-medium">{n.title}</p>
      <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{n.body}</p>
      <p className="mt-1 text-xs text-muted-foreground">
        {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
      </p>
    </Link>
  );
}
