<script setup>
import Ikon from "../components/Ikon.vue";
import { ref, watch, onUnmounted, nextTick } from "vue";
import FormPenawaran from "../components/FormPenawaran.vue";
import KartuPenawaran from "../components/KartuPenawaran.vue";
import StatusBaca from "../components/StatusBaca.vue";
import Paginasi from "../components/Paginasi.vue";
import { useBaca } from "../composables/useBaca.js";
import { api, pesanError } from "../lib/api.js";
import { sesi } from "../lib/sesi.js";

const page = ref(1);
const menyimpan = ref(false);
const berhasil = ref(0);
const errorSimpan = ref("");
const pesan = ref("");
const waktu = ref(Date.now());
const sedangEdit = ref(null);
const areaForm = ref(null);
const konflik = ref(false);

async function ubah(penawaran) {
  sedangEdit.value = { ...penawaran };
  konflik.value = false;
  errorSimpan.value = "";
  pesan.value = "";
  await nextTick();
  areaForm.value?.querySelector("#nama")?.focus();
  areaForm.value?.scrollIntoView({ behavior: "auto", block: "start" });
}

async function muatVersiTerbaru() {
  const id = sedangEdit.value?.id;
  if (!id || menyimpan.value) return;
  menyimpan.value = true;
  try {
    const hasil = await api("/api/penawaran/milik-saya/" + id, {
      auth: true,
      signal: controller.signal,
    });
    await ubah(hasil.data);
  } catch (e) {
    if (e.name !== "AbortError") errorSimpan.value = pesanError(e);
  } finally {
    menyimpan.value = false;
  }
}

const timer = setInterval(() => {
  waktu.value = Date.now();
}, 1000);

const controller = new AbortController();
onUnmounted(() => {
  clearInterval(timer);
  controller.abort();
});

const { data, sibuk, error, muat } = useBaca((signal) =>
  api(`/api/penawaran/milik-saya?page=${page.value}&limit=2`, {
    auth: true,
    signal,
  })
);

watch(page, muat, { immediate: true });

async function simpan(body) {
  if (menyimpan.value || sesi.keluar) return;
  menyimpan.value = true;
  errorSimpan.value = "";
  pesan.value = "";
  try {
    const mengedit = Boolean(sedangEdit.value);
    const hasil = await api(
      mengedit ? "/api/penawaran/" + sedangEdit.value.id : "/api/penawaran",
      {
        method: mengedit ? "PUT" : "POST",
        auth: true,
        body,
        signal: controller.signal,
      }
    );
    sedangEdit.value = null;
    berhasil.value++;
    konflik.value = false;
    pesan.value = `Penawaran ${hasil.data.id} berhasil disimpan.`;
    if (page.value !== 1) page.value = 1;
    else await muat();
  } catch (e) {
    if (e.name !== "AbortError") {
      errorSimpan.value = pesanError(e);
      konflik.value = e.code === "OFFER_CHANGED";
    }
  } finally {
    menyimpan.value = false;
  }
}
</script>

<template>
  <section class="container workspace section" aria-labelledby="judul-penyedia">
    <div class="page-heading">
      <div>
        <p class="eyebrow"><Ikon nama="toko" />Ruang usaha Anda</p>
        <h1 id="judul-penyedia">Kelola penawaran usaha saya</h1>
      </div>
    </div>

    <div class="provider-layout">
      <div ref="areaForm" class="provider-form-area">
        <FormPenawaran
          :sibuk="menyimpan || sesi.keluar"
          :berhasil="berhasil"
          :penawaran="sedangEdit"
          @simpan="simpan"
          @batal="sedangEdit = null; errorSimpan = ''; konflik = false;"
        />
        <p v-if="pesan" class="notice notice-success" role="status"><Ikon nama="cek" />{{ pesan }}</p>
        <div v-if="errorSimpan" class="notice notice-error">
          <div>
            <p role="alert">{{ errorSimpan }}</p>
            <button v-if="konflik" type="button" class="button-secondary" @click="muatVersiTerbaru">Muat versi terbaru</button>
          </div>
        </div>
      </div>
    </div>

    <StatusBaca :sibuk="sibuk" :error="error" @ulang="muat" />
    <div v-if="data" class="daftar catalog-grid">
      <KartuPenawaran
        v-for="p in data.data"
        :key="p.id"
        :penawaran="p"
        :waktu-sekarang="waktu"
        :boleh-ubah="!menyimpan"
        @ubah="ubah"
      />
    </div>
    <Paginasi v-if="data" :meta="data.meta" :sibuk="sibuk || menyimpan" @halaman="page = $event" />
  </section>
</template>
