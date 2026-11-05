export const visualKategori = {
  "makanan-siap-saji": {
    label: "Makanan Siap Saji",
    warna: "hijau",
    ikon: "paket",
  },
  "roti": {
    label: "Roti & Kue",
    warna: "oranye",
    ikon: "roti",
  },
  "bahan-segar": {
    label: "Bahan Segar",
    warna: "biru",
    ikon: "segar",
  },
};

export const labelStatus = {
  tersedia: "Tersedia",
  habis: "Habis",
  berakhir: "Berakhir",
};

export function sisaWaktu(jam) {
  if (jam <= 0) return "Waktu habis";
  if (jam < 24) return `${jam} jam lagi`;
  const hari = Math.floor(jam / 24);
  return `${hari} hari lagi`;
}

export function formatRupiah(angka) {
  if (isNaN(angka)) return "Rp 0";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(angka);
}