
import { pool } from "../db/pool.js";
import { HttpError } from "../lib/api.js";

function kePenawaran(row) {
  if (!row) return null;
  return {
    id: String(row.id),
    penyediaId: String(row.penyedia_id),
    nama: row.nama,
    kategori: row.kategori,
    hargaNormal: Number(row.harga_normal),
    hargaPenawaran: Number(row.harga_penawaran),
    stok: Number(row.stok),
    satuan: row.satuan,
    status: row.status,
    fotoUrl: row.foto_url ?? row.foto ?? null,
    versi: row.versi !== undefined && row.versi !== null ? String(row.versi) : "0",
    berakhirPada: row.berakhir_pada ?? null,
    dibuatPada: row.dibuat_pada ?? null,
    diperbaruiPada: row.diperbarui_pada ?? null,
  };
}

export async function daftarPenawaran(filter = {}, pagination = { halaman: 1, batas: 10 }) {
  const { halaman = 1, batas = 10 } = pagination;
  const offset = (halaman - 1) * batas;
  const values = [];
  const where = [];

  if (filter.penyediaId) {
    values.push(filter.penyediaId);
    where.push(`penyedia_id = $${values.length}`);
  }
  if (filter.q) {
    values.push(`%${filter.q}%`);
    where.push(`(nama ILIKE $${values.length} OR kategori ILIKE $${values.length})`);
  }
  if (filter.kategori) {
    values.push(filter.kategori);
    where.push(`kategori = $${values.length}`);
  }
  if (filter.status) {
    values.push(filter.status);
    where.push(`status = $${values.length}`);
  }
  if (filter.tersedia) {
    where.push(`stok > 0`);
  }

  const clause = where.length ? `WHERE ${where.join(" AND ")}` : "";

  const countRes = await pool.query(
    `SELECT COUNT(*)::int AS total FROM penawaran ${clause}`,
    values
  );
  const total = countRes.rows[0]?.total ?? 0;

  values.push(batas, offset);
  const rowsRes = await pool.query(
    `SELECT * FROM penawaran ${clause} ORDER BY id DESC LIMIT $${values.length - 1} OFFSET $${values.length}`,
    values
  );

  return {
    data: rowsRes.rows.map(kePenawaran),
    meta: {
      halaman,
      batas,
      total,
      totalHalaman: Math.max(1, Math.ceil(total / batas)),
    },
  };
}

export async function bacaPenawaran(id) {
  const res = await pool.query(`SELECT * FROM penawaran WHERE id = $1`, [id]);
  if (!res.rows[0]) {
    throw new HttpError(404, "NOT_FOUND", "Penawaran tidak ditemukan.");
  }
  return kePenawaran(res.rows[0]);
}

export async function simpanPenawaran(input, id = null) {
  const berakhirPada = input.berakhirPada ?? null;

  if (id) {
    const setFoto =
      input.foto === null ? ", foto_url = NULL" : "";
    const res = await pool.query(
      `UPDATE penawaran
       SET penyedia_id = $1,
           nama = $2,
           kategori = $3,
           harga_normal = $4,
           harga_penawaran = $5,
           stok = $6,
           satuan = $7,
           status = $8,
           berakhir_pada = $9,
           versi = COALESCE(versi, 0) + 1,
           diperbarui_pada = NOW()
           ${setFoto}
       WHERE id = $10
       RETURNING *`,
      [
        input.penyediaId,
        input.nama,
        input.kategori,
        input.hargaNormal,
        input.hargaPenawaran,
        input.stok,
        input.satuan,
        input.status,
        berakhirPada,
        id,
      ]
    );
    if (!res.rows[0]) {
      throw new HttpError(404, "NOT_FOUND", "Penawaran tidak ditemukan.");
    }
    return kePenawaran(res.rows[0]);
  }

  const res = await pool.query(
    `INSERT INTO penawaran (
       penyedia_id, nama, kategori, harga_normal, harga_penawaran,
       stok, satuan, status, berakhir_pada
     )
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     RETURNING *`,
    [
      input.penyediaId,
      input.nama,
      input.kategori,
      input.hargaNormal,
      input.hargaPenawaran,
      input.stok,
      input.satuan,
      input.status,
      berakhirPada,
    ]
  );

  return kePenawaran(res.rows[0]);
}

export async function hapusPenawaran(id) {
  const res = await pool.query(
    `DELETE FROM penawaran WHERE id = $1 RETURNING id`,
    [id]
  );
  if (!res.rows[0]) {
    throw new HttpError(404, "NOT_FOUND", "Penawaran tidak ditemukan.");
  }
}
