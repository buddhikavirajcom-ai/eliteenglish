import { Header } from "@/components/layout/header";
import { MessageBoard } from "@/components/messages/message-board";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { AnnouncementItem } from "@/types/lms";

export default async function MessagesPage() {
  const user = await requireAuth();

  const messagesRaw = await prisma.announcement.findMany({
    orderBy: {
      createdAt: "desc"
    }
  });

  const messages: AnnouncementItem[] = messagesRaw.map((message) => ({
    id: message.id,
    title: message.title,
    message: message.message,
    createdAt: message.createdAt.toISOString()
  }));

  return (
    <div className="space-y-8">
      <Header
        title={user.role === "ADMIN" ? "Messages" : "Notices"}
        subtitle={user.role === "ADMIN" ? "Admin" : "Student"}
        description="Keep families updated with simple announcements that are easy to scan and revisit."
      />
      <MessageBoard messages={messages} isAdmin={user.role === "ADMIN"} />
    </div>
  );
}