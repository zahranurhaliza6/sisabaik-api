<script setup>
import Ikon from "../components/Ikon.vue";
import AksiPesanan from "../components/AksiPesanan.vue";
import { formatWaktu } from "../lib/tampilan.js";
import { labelPesanan, labelPembayaran } from "../lib/visual.js";
import { watch } from "vue";
import { useRoute } from "vue-router";
import StatusBaca from "../components/StatusBaca.vue";
import { useBaca } from "../composables/useBaca.js";
import { api } from "../lib/api.js";
import { formatRupiah } from "../lib/tampilan.js";

const route = useRoute();
const { data, sibuk, error, muat, batalkan } = useBaca((signal) =>
  api(`/api/pesanan/${encodeURIComponent(route.params.id)}`, {
    auth: true,
    signal,
  }),
);

watch(() => route.params.id, muat, { immediate: true });

function terubah(p) {
  if (String(route.params.id) !== String(p.id)) return;
  batalkan();
  data.value = { success: true, data: p };
}
</script>

<template>
  <section class="container workspace section" aria-labelledby="judul-detail">
    <RouterLink class="back-link" to="/pesanan">
      <Ikon nama="kiri" />Kembali ke daftar pesanan
    </RouterLink>

    <div class="page-heading">
      <div>
        <p class="eyebrow">Semua rincian dalam satu tempat</p>
        <h1 id="judul-detail">Detail pesanan</h1>
      </div>
      <button type="button" class="button-secondary" :disabled="sibuk" @click="muat">
        <Ikon nama="ulang" />Perbarui status
      </button>
    </div>

    <StatusBaca :sibuk="sibuk" :error="error" @ulang="muat" />

    <article v-if="data" class="order-detail">
      <div class="order-detail-main">
        <div class="order-detail-header">
          <div>
            <span class="icon-tile"><Ikon nama="tas" /></span>
            <h2>Pesanan {{ data.data.id }}</h2>
          </div>
          <span :class="`status-badge status-${data.data.status}`">
            {{ labelPesanan(data.data) }}
          </span>
        </div>

        <ol class="order-progress" aria-label="Tahap pesanan">
          <li :class="{ done: data.data.status !== 'menunggu-konfirmasi' && data.data.status !== 'dibatalkan' }">
            Menunggu konfirmasi
          </li>
          <li :class="{ done: ['dikonfirmasi', 'siap-diambil', 'selesai'].includes(data.data.status) }">
            Diterima penyedia
          </li>
          <li :class="{ done: ['siap-diambil', 'selesai'].includes(data.data.status) }">
            Siap diambil
          </li>
          <li :class="{ done: data.data.status === 'selesai' }">Selesai</li>
        </ol>

        <h3>Rincian makanan</h3>
        <ul class="order-items">
          <li v-for="item in data.data.items" :key="item.penawaranId">
            <span class="icon-tile small-tile"><Ikon nama="paket" /></span>
            <div>
              <strong>{{ item.nama }}</strong>
              <span>{{ item.kuantitas }} {{ item.satuan }} x {{ formatRupiah(item.hargaSatuan) }}</span>
            </div>
            <strong>{{ formatRupiah(item.subtotal) }}</strong>
          </li>
        </ul>

        <div v-if="data.data.alasanPembatalan" class="notice notice-error">
          <div>
            <strong>{{ labelPesanan(data.data) }}</strong>
            <p>{{ data.data.alasanPembatalan }}</p>
          </div>
        </div>

        <AksiPesanan
          :key="data.data.id"
          :pesanan="data.data"
          @terubah="terubah"
          @perbarui="muat"
        />
      </div>

      <aside class="order-total-panel">
        <p class="eyebrow">Ringkasan pemesanan</p>
        <p class="total-label">Total pesanan</p>
        <p class="total-price">{{ formatRupiah(data.data.total) }}</p>
        <hr />
        <p class="payment-label">
          <Ikon nama="aman" />{{ labelPembayaran(data.data) }}
        </p>
      </aside>
    </article>
  </section>
</template>