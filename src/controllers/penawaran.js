
import * as data from "../repositories/penawaran.js";
import {
  idValid,
  halamanValid,
  filterValid,
  penawaranValid,
} from "../lib/api.js";

export async function daftar(req, res) {
  const hasil = await data.daftarPenawaran(
    filterValid(req.query),
    halamanValid(req.query)
  );
  return res.json({ success: true, ...hasil });
}

export async function milikSaya(req, res) {
  const penyediaId =
    req.pengguna?.penyediaId ??
    req.pengguna?.penyedia_id ??
    req.pengguna?.id;
  const { halaman = 1, batas = 10 } = halamanValid(req.query);
  const hasil = await data.daftarPenawaran(
    { ...filterValid(req.query), penyediaId },
    { halaman, batas }
  );
  return res.json({ success: true, data: hasil.data, meta: hasil.meta });
}

export async function detail(req, res) {
  const hasil = await data.bacaPenawaran(idValid(req.params.id));
  return res.json({ success: true, data: hasil });
}

export async function buat(req, res) {
  const penyediaId =
    req.body?.penyediaId ??
    req.pengguna?.penyediaId ??
    req.pengguna?.penyedia_id;
  const hasil = await data.simpanPenawaran(
    penawaranValid({ ...req.body, penyediaId })
  );
  return res
    .status(201)
    .location(`/api/penawaran/${hasil.id}`)
    .json({ success: true, data: hasil });
}

export async function ubah(req, res) {
  const id = idValid(req.params.id);
  const penyediaId =
    req.body?.penyediaId ??
    req.pengguna?.penyediaId ??
    req.pengguna?.penyedia_id;
  const hasil = await data.simpanPenawaran(
    penawaranValid({ ...req.body, penyediaId }),
    id
  );
  return res.json({ success: true, data: hasil });
}

export async function hapus(req, res) {
  await data.hapusPenawaran(idValid(req.params.id));
  return res.status(204).end();
}