// ---------- CẤU HÌNH (thay đổi nếu cần) ----------
const WEB3FORMS_KEY = "5dd63054-de7a-4eaf-a9aa-b25bd8f11180";
// Nếu muốn lấy dữ liệu từ Google Sheet, đặt URL CSV ở đây.
// Ví dụ: "https://docs.google.com/spreadsheets/d/SHEET_ID/export?format=csv&gid=0"
const SHEET_CSV_URL = ""; // <-- dán CSV URL nếu bạn publish Google Sheet
// Số job hiển thị trang 1 (pagination simple)
const PAGE_SIZE = 12;
// ------------------------------------------------

const jobsGrid = document.getElementById("jobs-grid");
const searchInput = document.getElementById("search-input");
const filterKcn = document.getElementById("filter-kcn");
const btnRefresh = document.getElementById("btn-refresh");
const noResults = document.getElementById("no-results");
const pagination = document.getElementById("pagination");
const modal = document.getElementById("job-modal");
const modalClose = document.getElementById("modal-close");
const jobDetail = document.getElementById("job-detail");
const modalApply = document.getElementById("modal-apply");
const applyForm = document.getElementById("apply-form");
const formResult = document.getElementById("form-result");

let allJobs = [];      // toàn bộ job
let filtered = [];     // sau khi search/filter
let currentPage = 1;

// dữ liệu mẫu (fallback)
const SAMPLE_JOBS = [
  {company:"Samsung Bắc Ninh",position:"Công nhân lắp ráp",location:"KCN Yên Phong",description:"Tuyển 50 công nhân ca sáng. Yêu cầu sức khỏe tốt.",salary:"10-14 triệu",kcn:"KCN Yên Phong",contact:"Nhận trực tiếp"},
  {company:"Canon Vietnam",position:"Công nhân sản xuất",location:"KCN Quế Võ",description:"Tuyển 30 công nhân, ca 3, không yêu cầu kinh nghiệm.",salary:"9-12 triệu",kcn:"KCN Quế Võ",contact:"Liên hệ phòng nhân sự"},
  {company:"Foxconn",position:"Công nhân kiểm tra chất lượng",location:"KCN Yên Phong",description:"Tuyển 40 công nhân, ca sáng và chiều. Có chỗ ở.",salary:"8-12 triệu",kcn:"KCN Yên Phong",contact:"Xem chi tiết"},
  {company:"Nidec",position:"Công nhân vận hành máy",location:"KCN Tiên Sơn",description:"Tuyển 20 công nhân, có đào tạo.",salary:"9-11 triệu",kcn:"KCN Tiên Sơn",contact:"Liên hệ"},
  {company:"Heesung",position:"Công nhân đóng gói",location:"KCN Yên Phong",description:"Tuyển 25 công nhân, ca sáng.",salary:"8-10 triệu",kcn:"KCN Yên Phong",contact:"Liên hệ"}
];

// helper: parse CSV -> array of objects (assumes first line headers)
function parseCSV(csv){
  const lines = csv.trim().split(/\r?\n/);
  if(lines.length < 2) return [];
  const headers = lines[0].split(",").map(h => h.trim());
  const rows = lines.slice(1);
  const data = rows.map(r => {
    // split but keep commas inside quotes
    const values = r.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || [];
    return headers.reduce((obj, h, i) => {
      let v = values[i] || "";
      v = v.replace(/^"|"$/g,"").trim();
      obj[h] = v;
      return obj;
    }, {});
  });
  return data;
}

async function loadJobs(){
  // nếu có SHEET_CSV_URL, thử fetch từ Google Sheet CSV
  if(SHEET_CSV_URL){
    try{
      const res = await fetch(SHEET_CSV_URL);
      if(!res.ok) throw new Error("CSV fetch failed: " + res.status);
      const text = await res.text();
      const csvData = parseCSV(text);
      // Normalize keys to our fields
      allJobs = csvData.map(row => ({
        company: row.company || row.Company || row.Tên || "",
        position: row.position || row.Position || row.Vị_trí || row.position,
        location: row.location || row.Location || row.Địa_điểm || row.location,
        description: row.description || row.Description || row.Mô_tả || row.description,
        salary: row.salary || row.Salary || row.Lương || "",
        kcn: row.kcn || row.KCN || row.kcn || (row.location || ""),
        contact: row.contact || row.Contact || ""
      }));
    }catch(err){
      console.error("Lỗi tải CSV:", err);
      // fallback to sample
      allJobs = SAMPLE_JOBS.slice();
    }
  } else {
    // no sheet -> use sample
    allJobs = SAMPLE_JOBS.slice();
  }
  filtered = allJobs.slice();
  currentPage = 1;
  renderJobsPage();
}

// render page of jobs
function renderJobsPage(){
  const start = (currentPage-1)*PAGE_SIZE;
  const pageJobs = filtered.slice(start, start + PAGE_SIZE);

  jobsGrid.innerHTML = "";
  if(pageJobs.length === 0){
    noResults.hidden = false;
    pagination.hidden = true;
    return;
  } else {
    noResults.hidden = true;
  }

  pageJobs.forEach((job, idx) => {
    const card = document.createElement("div");
    card.className = "job-card";
    card.innerHTML = `
      <h3>${escapeHtml(job.company)}</h3>
      <div class="meta">${escapeHtml(job.kcn || job.location)} • ${escapeHtml(job.salary || "")}</div>
      <p><strong>${escapeHtml(job.position)}</strong></p>
      <p>${escapeHtml(truncate(job.description, 140))}</p>
      <div class="card-actions">
        <button class="btn btn-outline" data-index="${start + idx}" aria-label="Xem chi tiết">Chi tiết</button>
        <button class="btn btn-primary" data-index="${start + idx}" aria-label="Ứng tuyển">Ứng tuyển</button>
      </div>
    `;
    jobsGrid.appendChild(card);
  });

  // pagination
  const pages = Math.ceil(filtered.length / PAGE_SIZE);
  if(pages > 1){
    pagination.hidden = false;
    pagination.innerHTML = "";
    for(let i=1;i<=pages;i++){
      const btn = document.createElement("button");
      btn.textContent = i;
      btn.className = "btn";
      if(i === currentPage) btn.style.fontWeight = "700";
      btn.addEventListener("click", ()=>{ currentPage = i; renderJobsPage(); window.scrollTo({top:0,behavior:'smooth'}); });
      pagination.appendChild(btn);
    }
  } else {
    pagination.hidden = true;
  }

  // attach events for details/apply
  document.querySelectorAll('.job-card .btn-outline').forEach(b=>{
    b.addEventListener('click', e=>{
      const idx = parseInt(e.currentTarget.getAttribute('data-index'));
      openModal(idx);
    });
  });
  document.querySelectorAll('.job-card .btn-primary').forEach(b=>{
    b.addEventListener('click', e=>{
      const idx = parseInt(e.currentTarget.getAttribute('data-index'));
      // scroll to form and prefill message
      const j = filtered[idx % filtered.length] || allJobs[idx];
      if(j){
        window.scrollTo({ top: document.getElementById('contact-box')?.offsetTop || 0, behavior: 'smooth' });
        // prefill form fields
        applyForm.name.value = "";
        applyForm.phone.value = "";
        applyForm.email.value = "";
        applyForm.message.value = `Ứng tuyển: ${j.position} - ${j.company} (${j.kcn || j.location})`;
      }
    });
  });
}

function openModal(index){
  const job = filtered[index] || allJobs[index];
  if(!job) return;
  jobDetail.innerHTML = `
    <h2>${escapeHtml(job.company)}</h2>
    <p class="meta">${escapeHtml(job.kcn || job.location)} • ${escapeHtml(job.salary || "")}</p>
    <h3>${escapeHtml(job.position)}</h3>
    <p>${escapeHtml(job.description)}</p>
    <p><strong>Liên hệ:</strong> ${escapeHtml(job.contact || "Xem chi tiết trên form")}</p>
  `;
  modal.hidden = false;
}

function closeModal(){ modal.hidden = true; }

// utils
function truncate(s,n){ if(!s) return ""; return s.length>n ? s.slice(0,n-1)+"…" : s; }
function escapeHtml(s){ if(!s) return ""; return String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]); }

// search/filter
function applyFilters(){
  const q = (searchInput.value || "").trim().toLowerCase();
  const kcn = (filterKcn.value || "").trim();
  filtered = allJobs.filter(j=>{
    const hay = ((j.company||"") + " " + (j.position||"") + " " + (j.description||"") + " " + (j.location||"")).toLowerCase();
    const passKcn = kcn ? ((j.kcn || j.location || "").toLowerCase().includes(kcn.toLowerCase())) : true;
    return passKcn && (!q || hay.includes(q));
  });
  currentPage = 1;
  renderJobsPage();
}

// events
searchInput.addEventListener('input', ()=> applyFilters());
filterKcn.addEventListener('change', ()=> applyFilters());
btnRefresh.addEventListener('click', ()=> loadJobs());

document.addEventListener('click', (e)=>{
  if(e.target.id === 'modal-close' || e.target.id === 'modal-close') closeModal();
});
modalClose?.addEventListener('click', closeModal);
modal?.addEventListener('click', (e)=>{ if(e.target === modal) closeModal(); });

// Form submit (Web3Forms via AJAX)
applyForm.addEventListener('submit', async function(e){
  e.preventDefault();
  formResult.style.color = 'black';
  formResult.textContent = 'Đang gửi...';
  const fd = new FormData(applyForm);
  // ensure access_key is present (hidden input in HTML)
  try{
    const resp = await fetch('https://api.web3forms.com/submit', { method:'POST', body: fd });
    const json = await resp.json();
    if(json.success){
      formResult.style.color = 'green';
      formResult.textContent = 'Gửi thành công! Chúng tôi sẽ liên hệ bạn sớm.';
      applyForm.reset();
    } else {
      formResult.style.color = 'red';
      formResult.textContent = 'Gửi không thành công: ' + (json.message || 'Vui lòng thử lại');
      console.warn('web3forms resp', json);
    }
  }catch(err){
    console.error('submit error', err);
    formResult.style.color = 'red';
    formResult.textContent = 'Lỗi kết nối. Vui lòng thử lại.';
  }
});

// init
document.getElementById('year').textContent = new Date().getFullYear();
loadJobs();
