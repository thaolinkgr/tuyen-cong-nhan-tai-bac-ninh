// Danh sách nhà máy
const jobs = [
  { company: "Nhà máy Samsung Thái Nguyên", position: "Công nhân lắp ráp", location: "KCN Yên Phong, Bắc Ninh", description: "Tuyển 50 công nhân ca sáng, yêu cầu chăm chỉ, sức khỏe tốt." },
  { company: "Nhà máy Canon", position: "Công nhân sản xuất", location: "KCN Quế Võ, Bắc Ninh", description: "Tuyển 30 công nhân ca 3, không yêu cầu kinh nghiệm." },
  { company: "Nhà máy Foxconn", position: "Công nhân kiểm tra chất lượng", location: "KCN Yên Phong, Bắc Ninh", description: "Tuyển 40 công nhân, ca sáng và chiều." },
  { company: "Nhà máy Nidec", position: "Công nhân vận hành máy", location: "KCN Tiên Sơn, Bắc Ninh", description: "Tuyển 20 công nhân, có đào tạo nội bộ." },
  { company: "Nhà máy Heesung", position: "Công nhân đóng gói", location: "KCN Yên Phong, Bắc Ninh", description: "Tuyển 25 công nhân, ca sáng, không yêu cầu kinh nghiệm." }
];

// Render danh sách nhà máy
const jobsGrid = document.getElementById('jobs-grid');
jobs.forEach(job => {
  const div = document.createElement('div');
  div.className = 'job-card';
  div.innerHTML = `<h3>${job.company}</h3>
                   <p><strong>Vị trí:</strong> ${job.position}</p>
                   <p><strong>Địa điểm:</strong> ${job.location}</p>
                   <p>${job.description}</p>`;
  jobsGrid.appendChild(div);
});

// Form gửi thông tin qua Web3Forms
const form = document.getElementById('contact-form');
const msg = document.getElementById('success-msg');

form.addEventListener('submit', async function(e){
  e.preventDefault();
  msg.style.color = 'black';
  msg.textContent = 'Đang gửi...';

  const data = new FormData(form);

  // Thêm access_key của bạn từ Web3Forms
  data.append('access_key', '5dd63054-de7a-4eaf-a9aa-b25bd8f11180');

  try {
    const response = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      body: data,
      headers: { 'Accept': 'application/json' }
    });

    if(response.ok){
      msg.style.color = 'green';
      msg.textContent = "Cảm ơn, chúng tôi sẽ liên hệ với bạn!";
      form.reset();
    } else {
      msg.style.color = 'red';
      msg.textContent = "Gửi không thành công, thử lại sau.";
    }
  } catch (error) {
    msg.style.color = 'red';
    msg.textContent = 'Lỗi mạng hoặc không thể kết nối.';
    console.error(error);
  }
});
