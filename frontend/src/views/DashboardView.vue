<script setup>
import { computed, onMounted } from "vue";
import { sesi } from "../lib/sesi.js";
import Ikon from "../components/Ikon.vue";
import StatusBaca from "../components/StatusBaca.vue";
import { useBaca } from "../composables/useBaca.js";
import { api } from "../lib/api.js";
import { formatRupiah, formatWaktu } from "../lib/tampilan.js";

const bilangan = new Intl.NumberFormat("id-ID");
const angka = (teks) => bilangan.format(BigInt(teks));
const uang = (teks) => formatRupiah(BigInt(teks));

const { data, sibuk, error, muat } = useBaca((signal) =>
  api("/api/dashboard", { auth: true, signal }),
);

onMounted(muat);

const pembeli = computed(
  () => (data.value?.data.peran ?? sesi.pengguna?.peran) === "pembeli",
);

const metrik = computed(() =>
  !data.value
    ? []
    : pembeli.value
    ? [
        { key: "jumlahPesananTotal", nama: "Pesanan saya", ikon: "tas", hint: "Seluruh riwayat." },
        { key: "jumlahBerjalan", nama: "Pesanan berjalan", ikon: "jam", hint: "Menunggu, diterima, atau siap." },
        { key: "totalBelanja", nama: "Total belanja selesai", ikon: "grafik", uang: true, utama: true, hint: "Makanan diambil." },
        { key: "penghematanPembeli", nama: "Penghematan saya", ikon: "daun", uang: true, hint: "Selisih harga normal." },
        { key: "unitTersalurkan", nama: "Unit makanan diambil", ikon: "paket", hint: "Jumlah porsi." },
        { key: "jumlahDibatalkan", nama: "Dibatalkan / ditolak", ikon: "info", hint: "Pesanan ditutup." },
      ]
    : [
        { key: "jumlahPesananTotal", nama: "Pesanan total", ikon: "tas", hint: "Seluruh riwayat pesanan usaha." },
        { key: "jumlahMenunggu", nama: "Perlu konfirmasi", ikon: "jam", hint: "Menunggu keputusan." },
        { key: "pendapatanDiterima", nama: "Pendapatan diterima", ikon: "grafik", uang: true, utama: true, hint: "Pembayaran tercatat." },
        { key: "unitTersalurkan", nama: "Unit tersalurkan", ikon: "paket", hint: "Porsi diserahkan." },
        { key: "nilaiNormalTersalurkan", nama: "Nilai stok terselamatkan", ikon: "daun", uang: true, hint: "Harga normal." },
        { key: "diskonDiberikan", nama: "Penghematan pembeli", ikon: "pengguna", uang: true, hint: "Diskon total." },
      ],
);
</script>

<template>
  <section class="container workspace section" aria-labelledby="judul-dashboard">
    <div class="page-heading">
      <div>
        <p class="eyebrow"><Ikon nama="grafik" />Angka aktivitas Anda</p>
        <h1 id="judul-dashboard">{{ pembeli ? "Dashboard pembeli" : "Dashboard usaha saya" }}</h1>
      </div>
      <button type="button" class="button-secondary" :disabled="sibuk" @click="muat">
        <Ikon nama="ulang" />Perbarui dashboard
      </button>
    </div>

    <StatusBaca :sibuk="sibuk" :error="error" @ulang="muat" />

    <div v-if="data">
      <div class="dashboard-scope">
        <span class="outline-pill"><Ikon nama="pengguna" />{{ data.data.cakupan }}</span>
        <p>Dihitung <time :datetime="data.data.dihitungPada">{{ formatWaktu(data.data.dihitungPada) }}</time></p>
      </div>

      <dl class="metrik metric-grid">
        <div
          v-for="m in metrik"
          :key="m.key"
          class="metric-card"
          :class="{ 'metric-highlight': m.utama }"
        >
          <dt>
            <span class="icon-tile"><Ikon :nama="m.ikon" /></span>
            <span class="metric-label">{{ m.nama }}</span>
          </dt>
          <dd>
            <strong class="metric-value">
              {{ m.uang ? uang(data.data[m.key]) : angka(data.data[m.key]) }}
            </strong>
            <p>{{ m.hint }}</p>
          </dd>
        </div>
      </dl>
    </div>
  </section>
</template>