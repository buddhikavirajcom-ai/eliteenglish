import { Header } from "@/components/layout/header";
import { MaterialLibrary } from "@/components/materials/material-library";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { MaterialItem } from "@/types/lms";

export default async function MaterialsPage() {
  const user = await requireAuth();

  const materialsRaw = await prisma.material.findMany({
    orderBy: [{ category: "asc" }, { createdAt: "desc" }]
  });

  const materials: MaterialItem[] = materialsRaw.map((material) => ({
    id: material.id,
    title: material.title,
    category: material.category,
    description: material.description,
    fileName: material.fileName,
    fileUrl: material.fileUrl,
    createdAt: material.createdAt.toISOString()
  }));

  return (
    <div className="space-y-8">
      <Header
        title="Materials"
        subtitle={user.role === "ADMIN" ? "Admin" : "Student"}
        description="Browse worksheets, stories, and videos from one tidy resource library."
      />
      <MaterialLibrary materials={materials} isAdmin={user.role === "ADMIN"} />
    </div>
  );
}