// login page scripts
document.getElementById("loginForm").addEventListener("submit", function (e) {
  e.preventDefault();

  validateForm();
});

function validateForm() {
  var username = document.getElementById("username").value;
  var password = document.getElementById("password").value;

  //validasi username dan password, username dan password bisa diganti sesuai keinginan
  if (username === "Zahra" && password === "05-10-2007") {
    Swal.fire({
      icon: "success",
      title: "Login berhasil!",
      text: "Selamat datang Zahra",
      showConfirmButton: false,
      timer: 1500,
    }).then(function () {
      window.location.reload()
      window.location.href = "birthday.html";
    });
  } else {
    Swal.fire({
      icon: "error",
      title: "Login gagal!",
      text: "Bukan buat lu berarti!",
      confirmButtonText: "Coba lagi",
      confirmButtonColor: "#ff7675",
    });
  }
}