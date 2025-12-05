const form = document.getElementById("form");
const result = document.getElementById("result");

form.addEventListener("submit", async function (e) {
    e.preventDefault();

    result.textContent = "Đang gửi ...";

    const formData = new FormData(form);

    try {
        const response = await fetch("https://api.web3forms.com/submit", {
            method: "POST",
            body: formData
        });

        const data = await response.json();

        if (data.success) {
            result.style.color = "green";
            result.textContent = "Gửi thành công! Chúng tôi sẽ liên hệ bạn sớm.";
            form.reset();
        } else {
            result.style.color = "red";
            result.textContent = "Gửi thất bại. Vui lòng thử lại!";
        }
    } catch (error) {
        result.style.color = "red";
        result.textContent = "Lỗi kết nối. Thử lại!";
    }
});
