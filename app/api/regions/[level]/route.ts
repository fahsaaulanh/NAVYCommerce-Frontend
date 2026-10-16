import { BackendApiError } from "@/lib/api/server";
import { getSession } from "@/lib/auth/session";
import { regionApi } from "@/features/regions/api/region-api";
import { isRegionLevel, regionParents } from "@/features/regions/types/region";

const json = (value: unknown, status = 200) => Response.json(value, {
  status, headers: { "Cache-Control": "private, no-store" },
});

export async function GET(request: Request, { params }: { params: Promise<{ level: string }> }) {
  const user = await getSession();
  if (!user) return json({ message: "Sesi berakhir. Silakan masuk kembali." }, 401);
  if (user.role !== "Customer") return json({ message: "Akun ini tidak memiliki akses alamat Customer." }, 403);
  const { level } = await params;
  if (!isRegionLevel(level)) return json({ message: "Endpoint wilayah tidak ditemukan." }, 404);
  const parent = level === "provinces" ? null : regionParents[level];
  const parentCode = parent ? new URL(request.url).searchParams.get(parent.parameter) : null;
  if (parent && (!parentCode || !parent.pattern.test(parentCode)))
    return json({ message: "Pilih wilayah induk yang valid." }, 400);
  try {
    return json(await regionApi.getOptions(level, parentCode ?? undefined));
  } catch (error) {
    if (!(error instanceof BackendApiError)) throw error;
    return json({ message: error.status === 401 ? "Sesi berakhir. Silakan masuk kembali."
      : "Daftar wilayah belum dapat dimuat. Silakan coba kembali." }, error.status);
  }
}
