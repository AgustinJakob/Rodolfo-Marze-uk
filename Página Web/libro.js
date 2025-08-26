const token = "huzLyFuBMWxzaBXmC6h634YzLl69vge4";
const baseId = 269190;
const tableId = 631457;

// Obtener ID desde la URL
const params = new URLSearchParams(window.location.search);
const libroId = params.get("id");

if (libroId) {
  fetch(`https://api.baserow.io/api/database/rows/table/631457/?user_field_names=true`, {
    headers: {
      Authorization: `Token huzLyFuBMWxzaBXmC6h634YzLl69vge4`
    }
  })
  .then(res => res.json())
  .then(data => {
    const libro = data.results.find(row => row["N°CAT"] === libroId);




    if (libro) {
const categoria = libro["Categoría"]?.value || "Sin categoría";
document.getElementById("categoria").innerText = categoria;


      document.getElementById("titulo").textContent = libro.Título;
document.getElementById("autor").textContent = libro["Autor/es"] || "Sin autor";

document.getElementById("editorial").textContent = libro.Editorial || "Sin editorial";
document.getElementById("anio").textContent = libro["Año de Publicación"] || "Sin año";
document.getElementById("estado").innerText = libro.Estado?.value || "Sin estado";
document.getElementById("ubicacion").textContent = `Ubicación: ${libro["Ubicación"] || "No especificada"}`;


const sinopsisContainer = document.getElementById("sinopsis-container");

function crearBloqueSinopsis(texto) {
  if (!texto || texto.trim() === "") return; // no hacemos nada si está vacío

  const bloque = document.createElement("div");
  bloque.classList.add("sinopsis");

  const parrafo = document.createElement("p");
  parrafo.textContent = texto;
  bloque.appendChild(parrafo);

  sinopsisContainer.appendChild(bloque);
}

// Y para insertar todas:
crearBloqueSinopsis(libro.Sinopsis);
crearBloqueSinopsis(libro["Sinopsis 2"]);
crearBloqueSinopsis(libro["Sinopsis 3"]);


      // Imagen
      if (libro["IMG Portada"]?.[0]?.url) {
        const imgUrl = libro["IMG Portada"][0].url;
        document.getElementById("cover-img").src = imgUrl;
      }
    } else {
      alert("No se encontró el libro.");
    }
  })
  .catch(err => {
    console.error("Error al cargar el libro:", err);
  });
} else {
  alert("Falta el ID del libro en la URL.");
}
