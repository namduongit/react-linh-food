export function showNotification(Question = "") {
  return new Promise((resolve) => {
    const oldDialog = document.getElementById("notification-dialog");
    if (oldDialog) oldDialog.remove();

    const html = document.createElement("dialog");
    html.id = "notification-dialog";
    html.classList.add("dialog");
    html.innerHTML = `
            <h2 id="notification-title">Thông báo</h2>
            <div class="dialog-content">
                <p id="notification-message">${Question}</p>
                <div class="dialog-buttons">
                    <button id="confirm-button">Đồng ý</button>
                    <button id="cancel-button">Huỷ</button>
                </div>
            </div>
        `;
    document.body.appendChild(html);

    html.querySelector("#cancel-button").addEventListener("click", () => {
      resolve(false);
      html.remove();
    });

    html.querySelector("#confirm-button").addEventListener("click", () => {
      resolve(true);
      html.remove();
    });

    html.showModal();
  });
}
