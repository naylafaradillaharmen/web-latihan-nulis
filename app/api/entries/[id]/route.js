import { NextResponse } from "next/server";
import { getDb } from "../../../../lib/db";
import { getUserFromRequest } from "../../../../lib/auth";

export async function DELETE(req, { params }) {
  try {
    const authData = getUserFromRequest(req);
    if (!authData) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    if (!id) {
      return NextResponse.json({ error: "ID catatan diperlukan." }, { status: 400 });
    }

    const db = getDb();
    const result = db.prepare("DELETE FROM entries WHERE id = ? AND user_id = ?").run(id, authData.uid);

    if (result.changes === 0) {
      return NextResponse.json(
        { error: "Catatan tidak ditemukan atau sudah dihapus." },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, deletedId: id });
  } catch (error) {
    console.error("DELETE entry error:", error);
    return NextResponse.json(
      { error: "Gagal menghapus catatan dari database lokal." },
      { status: 500 }
    );
  }
}
