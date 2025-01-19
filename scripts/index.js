// login page scripts
document.getElementById("loginForm").addEventListener("submit", function (e) {
  e.preventDefault();

  validateForm();
});

function validateForm() {
  var username = document.getElementById("username").value;
  var password = document.getElementById("password").value;

  //validasi username dan password, username dan password bisa diganti sesuai keinginan
  if (username === "Rany" && password === "x  Sylchester") {
    Swal.fire({
      icon: "success",
      title: "Login berhasil!",
      text: `Selamat datang ${username} `,
      showConfirmButton: false,
      timer: 1500,
    }).then(function () {
      window.location.reload()
      window.location.href = "text.html";
    });
  } else if(username === "Rany" && password === "30-12"){
    Swal.fire({
      icon: "success",
      title: "Login berhasil!",
      text: `Selamat datang ${username} `,
      showConfirmButton: false,
      timer: 1500,
    }).then(function () {
      window.location.reload()
      window.location.href = "text2.html";
    })
  }
  else {
    Swal.fire({
      icon: "error",
      title: "Login gagal!",
      text: "Bukan buat lu berarti!",
      confirmButtonText: "Coba lagi",
      confirmButtonColor: "#ff7675",
    });
  }
}