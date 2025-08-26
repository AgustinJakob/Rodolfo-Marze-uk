const API_URL = "https://api.baserow.io/api/database/rows/table/631459/?user_field_names=true";
const API_TOKEN = "huzLyFuBMWxzaBXmC6h634YzLl69vge4"; // Reemplazalo si lo cambiás

const loginForm = document.getElementById("loginForm");
const errorMsg = document.getElementById("errorMsg");

loginForm.addEventListener("submit", function (event) {
  event.preventDefault();

  const usuarioIngresado = document.getElementById("usuario").value.trim();
  const contrasenaIngresada = document.getElementById("contrasena").value.trim();

  fetch(API_URL, {
    headers: {
      Authorization: `Token ${API_TOKEN}`
    }
  })
    .then(res => res.json())
    .then(data => {
      const usuarios = data.results;

      const usuarioEncontrado = usuarios.find(persona =>
        persona["Usuario"]?.trim() === usuarioIngresado && persona["Contraseña"]?.trim() === contrasenaIngresada
      );

      if (usuarioEncontrado) {
        sessionStorage.setItem("usuarioAutenticado", usuarioIngresado);
        window.location.href = "panel-gestion.html";
      } else {
        errorMsg.style.display = "block";
      }
    })
    .catch(err => {
      console.error("Error al verificar usuario:", err);
      alert("Hubo un problema al verificar los datos.");
    });
});
