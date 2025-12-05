const form = document.getElementById("form");
const result = document.getElementById("result");

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    result.innerHTML = "Đang gửi...";
    result.style.color = "black";

    const formData = new FormData(form);

    const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: formData
    });

    const data = await response.json();

    if (response.ok) {
        result.style.color = "green";
        result.innerHTML = "Gửi thành công! Chúng tôi sẽ liên hệ sớm.";
        form.reset();
    } 
    else {
        result.style.color = "red";
        result.innerHTML = "Gửi thất bại: " + data.message;
    }
});
