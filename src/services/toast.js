export function toast({
    title = "",
    message = "",
    type = "success",
    duration = 3000,
}) {
    // const main = document.getElementById("toast");
    const aLLmain = document.querySelectorAll("#toast");
    const main = aLLmain[aLLmain.length - 1];

    if (main) {
        const toast = document.createElement("div");
        const autoremoveId = setTimeout(function () {
            main.removeChild(toast);
        }, duration + 1000);

        toast.onclick = function (e) {
            if (e.target.closest(".toast_close")) {
                main.removeChild(toast);
                clearTimeout(autoremoveId);
            }
        };

        const colors = {
            success: "#47d864",
            info: "#2f86eb",
            warning: "#ffc021",
            error: "#ff6243",
        };

        const icon = {
            success: "fa fa-check-circle",
            error: "fa fa-times", // Sửa lỗi "errol" thành "error"
            warning: "fa fa-info",
            info: "fa fa-info-circle", // Bổ sung icon cho "info"
        };

        let delay = (duration / 1000).toFixed(2); // Khai báo biến delay trước khi sử dụng

        toast.classList.add("toast", `toast--${type}`);
        toast.innerHTML = `
            <div class="toast_icon">
                <i class="${icon[type] || "fa fa-info-circle"}"></i>
            </div>
            <div class="toast_body">
                <h3 class="toast_title">${title}</h3>
                <p class="toast_msg">${message}</p>
            </div>
            <div class="toast_close">
                <i class="fa fa-times"></i>
            </div>
            <div class="toast__background" style="background-color: ${colors[type] || "#2f86eb"};"></div>
        `;

        toast.style.animation = `slideInLeft ease 0.3s, fadeOut linear 1s ${delay}s forwards`;
        document.body.appendChild(toast);

        main.appendChild(toast);
    }
}
