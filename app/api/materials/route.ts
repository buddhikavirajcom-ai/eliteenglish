import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { saveUploadedFile } from "@/lib/uploads";
import { materialSchema } from "@/lib/validators";

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

function forbidden() {
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return unauthorized();
  }

  const materials = await prisma.material.findMany({
    orderBy: [{ category: "asc" }, { createdAt: "desc" }]
  });

  return NextResponse.json(materials);
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return unauthorized();
  }

  if (session.user.role !== "ADMIN") {
    return forbidden();
  }

  try {
    const formData = await request.formData();
    const payload = {
      title: String(formData.get("title") ?? ""),
      category: String(formData.get("category") ?? ""),
      description: String(formData.get("description") ?? "")
    };

    const parsed = materialSchema.safeParse(payload);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: parsed.error.issues[0]?.message ?? "Invalid payload.",
          fieldErrors: parsed.error.flatten().fieldErrors
        },
        { status: 400 }
      );
    }

    const file = formData.get("file");

    if (!(file instanceof File) || file.size === 0) {
      return NextResponse.json({ error: "Upload a file to add a material.", fieldErrors: { file: ["Choose a file."] } }, { status: 400 });
    }

    const uploaded = await saveUploadedFile(file, "materials");

    const material = await prisma.material.create({
      data: {
        title: parsed.data.title,
        category: parsed.data.category,
        description: parsed.data.description,
        fileName: uploaded.fileName,
        fileUrl: uploaded.url,
        createdById: session.user.id
      }
    });

    return NextResponse.json(material, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Unable to upload material." }, { status: 500 });
  }
}