/**
 * LKPD INTERAKTIF DIGITAL KIMIA - SENYAWU TURUNAN ALKANA
 * Frontend Logic, Assessment Engine, and GAS Integration
 */

// --- CONFIGURATION ---
// Tempatkan URL Web App Google Apps Script setelah dipublikasikan (Deploy)
const APPS_SCRIPT_WEB_APP_URL = "https://script.google.com/macros/s/AKfycbwGCx2PxiWFPiWLTxxS3W-bRdaB0M9mY1gUgQhXRkY_BBsTQ2vQvGLP4JzJ0Q_PVXpv/exec";
const KKTP_VALUE = 70;

// Global State
let studentIdentity = {
  nama: "",
  kelas: "",
  noAbsen: "",
  sekolah: "SMA Negeri 2 Samarinda"
};

let evaluationStartTime = null;
let currentSubmissionId = "";

// Kunci Jawaban Soal Objektif Evaluasi Akhir
const EVAL_ANSWER_KEY = {
  ev1: "B",
  ev2: "C",
  ev3: "B",
  ev4: "C",
  ev5: "A",
  ev6: "B",
  ev7: "B",
  ev8: "B",
  ev9: "B",
  ev10: "A"
};

// --- INITIALIZATION ---
document.addEventListener("DOMContentLoaded", () => {
  updateProgressBar();
  evaluationStartTime = new Date();
});

// --- NAVIGATION & TABS ---
function switchTab(tabId) {
  const contents = document.querySelectorAll('.tab-content');
  const navBtns = document.querySelectorAll('.nav-btn');

  contents.forEach(content => content.classList.remove('active'));
  navBtns.forEach(btn => btn.classList.remove('active'));

  const targetTab = document.getElementById(tabId);
  if (targetTab) {
    targetTab.classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Highlight Active Nav Button
  const activeNavBtn = Array.from(navBtns).find(btn => 
    btn.getAttribute('onclick') && btn.getAttribute('onclick').includes(tabId)
  );
  if (activeNavBtn) activeNavBtn.classList.add('active');

  updateProgressBar();
}

function updateProgressBar() {
  const tabs = ['sampul', 'identitas', 'kurikulum', 'materi', 'aktivitas', 'contoh', 'latihan', 'evaluasi', 'refleksi'];
  const activeTab = document.querySelector('.tab-content.active');
  if (activeTab) {
    const index = tabs.indexOf(activeTab.id);
    const progress = ((index + 1) / tabs.length) * 100;
    document.getElementById('progressBar').style.width = `${progress}%`;
  }
}

// --- IDENTITAS PESERTA DIDIK ---
function simpanIdentitas() {
  const nama = document.getElementById('namaLengkap').value.trim();
  const kelas = document.getElementById('kelas').value;
  const noAbsen = document.getElementById('noAbsen').value;

  if (!nama || !kelas || !noAbsen) {
    alert("Harap isi semua kolom identitas wajib!");
    return;
  }

  studentIdentity.nama = nama;
  studentIdentity.kelas = kelas;
  studentIdentity.noAbsen = noAbsen;

  alert(`Identitas tersimpan:\nNama: ${nama}\nKelas: ${kelas}\nNo. Absen: ${noAbsen}`);
  switchTab('kurikulum');
}

// --- TOGGLE PEMBAHASAN CONTOH SOAL ---
function toggleSolution(id) {
  const solElem = document.getElementById(id);
  if (solElem) {
    solElem.classList.toggle('hidden');
  }
}

// --- AKTIVITAS ---
function simpanAktivitas() {
  const feedback = document.getElementById('actFeedback');
  feedback.classList.remove('hidden');
  setTimeout(() => feedback.classList.add('hidden'), 3000);
}

// --- LATIHAN INTERAKTIF (FORMATIF) ---
function periksaLatihan() {
  // Soal 1 PG
  const l1 = document.querySelector('input[name="l1"]:checked');
  const fb1 = document.getElementById('fb_l1');
  if (l1 && l1.value === "B") {
    fb1.innerHTML = "<span style='color:green;'>✓ Benar! Gugus eter adalah -O-</span>";
  } else {
    fb1.innerHTML = "<span style='color:red;'>✗ Salah. Gugus fungsi eter adalah -O- (alkoksi)</span>";
  }

  // Soal 2 BS
  const l2 = document.querySelector('input[name="l2"]:checked');
  const fb2 = document.getElementById('fb_l2');
  if (l2 && l2.value === "BENAR") {
    fb2.innerHTML = "<span style='color:green;'>✓ Tepat sekali!</span>";
  } else {
    fb2.innerHTML = "<span style='color:red;'>✗ Kurang tepat. Pernyataan tersebut BENAR.</span>";
  }

  // Soal 3 Isian
  const l3 = document.getElementById('l3').value.trim().toLowerCase();
  const fb3 = document.getElementById('fb_l3');
  if (l3 === "propanon" || l3 === "2-propanon" || l3 === "aseton") {
    fb3.innerHTML = "<span style='color:green;'>✓ Tepat! Nama IUPAC-nya adalah Propanon.</span>";
  } else {
    fb3.innerHTML = "<span style='color:red;'>✗ Jawaban belum tepat. Ingat gugus -CO- (keton) 3 atom C.</span>";
  }
}

// --- EVALUASI AKHIR & PENILAIAN ---
function hitungSkorEvaluasi() {
  let benar = 0;
  let salah = 0;
  let tidakDijawab = 0;
  const totalObjektif = Object.keys(EVAL_ANSWER_KEY).length;

  for (let key in EVAL_ANSWER_KEY) {
    const selected = document.querySelector(`input[name="${key}"]:checked`);
    if (!selected) {
      tidakDijawab++;
    } else if (selected.value === EVAL_ANSWER_KEY[key]) {
      benar++;
    } else {
      salah++;
    }
  }

  // Formulasi Skor Objektif (Skala 0-100)
  const nilaiAkhir = Math.round((benar / totalObjektif) * 100);
  const statusKetercapaian = nilaiAkhir >= KKTP_VALUE ? "TUNTAS" : "BELUM TUNTAS";

  return {
    totalSoal: totalObjektif,
    benar: benar,
    salah: salah,
    tidakDijawab: tidakDijawab,
    nilaiAkhir: nilaiAkhir,
    status: statusKetercapaian
  };
}

function generateSubmissionId() {
  const timestamp = new Date().getTime();
  const randomStr = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `SUB-${timestamp}-${randomStr}`;
}

function prosesDanKirimEvaluasi() {
  // Validasi Identitas
  if (!studentIdentity.nama || !studentIdentity.kelas || !studentIdentity.noAbsen) {
    alert("Identitas Anda belum lengkap! Silakan isi kembali pada menu Identitas.");
    switchTab('identitas');
    return;
  }

  const hasil = hitungSkorEvaluasi();
  
  // Hitung Durasi Pengerjaan
  const endTime = new Date();
  const durationMinutes = Math.max(1, Math.round((endTime - evaluationStartTime) / 60000));

  currentSubmissionId = generateSubmissionId();

  // Update Tampilan UI Hasil
  document.getElementById('displayScore').innerText = hasil.nilaiAkhir;
  document.getElementById('displayStatus').innerText = hasil.status;
  document.getElementById('displayStatus').style.color = hasil.nilaiAkhir >= KKTP_VALUE ? '#137333' : '#a50e0e';
  document.getElementById('displayBenar').innerText = hasil.benar;
  document.getElementById('displaySalah').innerText = hasil.salah;
  document.getElementById('displayDuration').innerText = `${durationMinutes} Menit`;
  document.getElementById('displaySubmissionId').innerText = currentSubmissionId;

  document.getElementById('resultCard').classList.remove('hidden');

  // Payload untuk Backend GAS
  const payloadData = {
    submissionId: currentSubmissionId,
    nama: studentIdentity.nama,
    kelas: studentIdentity.kelas,
    noAbsen: studentIdentity.noAbsen,
    sekolah: studentIdentity.sekolah,
    mataPelajaran: "Kimia",
    fase: "F",
    materi: "Senyawa Turunan Alkana",
    jumlahSoal: hasil.totalSoal,
    jumlahBenar: hasil.benar,
    jumlahSalah: hasil.salah,
    jumlahKosong: hasil.tidakDijawab,
    nilaiAkhir: hasil.nilaiAkhir,
    statusKetercapaian: hasil.status,
    durasiMenit: durationMinutes,
    uraianJawaban: document.getElementById('evUraian').value.trim()
  };

  kirimKeGoogleSheets(payloadData);
}

function kirimKeGoogleSheets(data) {
  const sendStatus = document.getElementById('sendStatus');
  const btnRetry = document.getElementById('btnRetry');

  sendStatus.className = "alert-box info";
  sendStatus.innerText = "⏳ Sedang Mengirim Hasil Evaluasi ke Google Sheets Guru...";
  btnRetry.classList.add('hidden');

  // Menggunakan Fetch dengan Mode 'no-cors' atau 'cors' tergantung konfigurasi Apps Script
  fetch(APPS_SCRIPT_WEB_APP_URL, {
    method: "POST",
    headers: {
      "Content-Type": "text/plain;charset=utf-8" // Menghindari preflight CORS pada GAS
    },
    body: JSON.stringify(data)
  })
  .then(response => response.json())
  .then(result => {
    if (result.status === "success") {
      sendStatus.className = "alert-box success";
      sendStatus.innerHTML = "✅ <strong>Berhasil Dikirim!</strong> Hasil evaluasi telah tersimpan secara resmi di database server guru.";
    } else {
      throw new Error(result.message || "Gagal menyimpan di database server.");
    }
  })
  .catch(error => {
    console.error("Transmission Error:", error);
    sendStatus.className = "alert-box warning";
    sendStatus.innerHTML = "⚠️ <strong>Gagal Terkoneksi:</strong> Data belum dapat diverifikasi oleh server. Silakan klik tombol di bawah untuk mencoba ulang.";
    btnRetry.classList.remove('hidden');
  });
}

function kirimUlangEvaluasi() {
  if (!currentSubmissionId) return;
  const hasil = hitungSkorEvaluasi();
  const payloadData = {
    submissionId: currentSubmissionId,
    nama: studentIdentity.nama,
    kelas: studentIdentity.kelas,
    noAbsen: studentIdentity.noAbsen,
    sekolah: studentIdentity.sekolah,
    mataPelajaran: "Kimia",
    fase: "F",
    materi: "Senyawa Turunan Alkana",
    jumlahSoal: hasil.totalSoal,
    jumlahBenar: hasil.benar,
    jumlahSalah: hasil.salah,
    jumlahKosong: hasil.tidakDijawab,
    nilaiAkhir: hasil.nilaiAkhir,
    statusKetercapaian: hasil.status,
    durasiMenit: 1,
    uraianJawaban: document.getElementById('evUraian').value.trim()
  };
  kirimKeGoogleSheets(payloadData);
}

function simpanRefleksi() {
  const fb = document.getElementById('refFeedback');
  fb.classList.remove('hidden');
  setTimeout(() => fb.classList.add('hidden'), 3000);
}