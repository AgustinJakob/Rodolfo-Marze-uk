const grid = document.getElementById('bookGrid');
const categoryMenu = document.getElementById('categoryMenu');
const dropdownToggle = document.querySelector('.dropdown-toggle');

let allBooks = [];

// Función para mezclar aleatoriamente (Fisher-Yates)
function mezclarArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// Función para mostrar libros
function showBooks(filteredBooks) {
  grid.innerHTML = '';
  filteredBooks.forEach(libro => {
    const card = document.createElement("a");
    card.className = "book-card";
    card.href = `libro.html?id=${libro["N°CAT"]}`;

    card.innerHTML = `
      <div class="cover">
        <img src="${libro["IMG Portada"]?.[0]?.url || 'ruta-a-imagen-default.jpg'}" alt="${libro.Título}">
      </div>
      <div class="title-box">
        <span class="title">${libro.Título}</span>
      </div>
    `;
    grid.appendChild(card);
  });
}

// Obtener todos los libros y categorías
fetch("https://api.baserow.io/api/database/rows/table/631457/?user_field_names=true", {
  headers: {
    Authorization: "Token huzLyFuBMWxzaBXmC6h634YzLl69vge4"
  }
})
.then(response => response.json())
.then(data => {
  allBooks = data.results;
  showBooksByPage(allBooks, 1, false); // false = no filtrado → mezcla aleatoria

  const categoriasSet = new Set();

  allBooks.forEach(libro => {
    const categorias = libro["Categoría"];
    if (Array.isArray(categorias)) {
      categorias.forEach(cat => {
        const value = typeof cat === 'object' ? cat?.value : cat;
        if (value) categoriasSet.add(value);
      });
    } else if (typeof categorias === 'string') {
      categoriasSet.add(categorias);
    }
  });

  const categoriasUnicas = Array.from(categoriasSet);

  categoriasUnicas.forEach(categoria => {
    const catBtn = document.createElement('button');
    catBtn.textContent = categoria || "Sin categoría";
    catBtn.className = 'category-option';
    catBtn.onclick = () => {
      const librosFiltrados = allBooks.filter(libro => {
        const cats = libro["Categoría"];
        if (!cats) return false;

        if (Array.isArray(cats)) {
          return cats.some(cat => (cat?.value || cat) === categoria);
        } else {
          return cats === categoria;
        }
      });

      showBooksByPage(librosFiltrados, 1, true); // true = filtrado → no mezcla
      categoryMenu.classList.remove('show');
      dropdownToggle.textContent = `${categoria} ▼`;
    };
    categoryMenu.appendChild(catBtn);
  });

  // Botón para mostrar todos
  const resetBtn = document.createElement('button');
  resetBtn.textContent = 'Mostrar todos';
  resetBtn.className = 'category-option';
  resetBtn.onclick = () => {
    showBooksByPage(allBooks, 1, false); // false = mezcla aleatoria
    categoryMenu.classList.remove('show');
    dropdownToggle.textContent = 'Categorías ▼';
  };
  categoryMenu.appendChild(resetBtn);
});

// Mostrar / ocultar menú al hacer clic
dropdownToggle.addEventListener('click', () => {
  categoryMenu.classList.toggle('show');
});

// Cerrar menú si se hace clic fuera
document.addEventListener('click', function(event) {
  if (!event.target.closest('.dropdown')) {
    categoryMenu.classList.remove('show');
  }
});

const searchInput = document.getElementById('searchInput');
const suggestionsBox = document.getElementById('suggestionsBox');
const searchBtn = document.querySelector('.search-btn');

function normalize(texto) {
  return texto.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function filtrarLibrosPorBusqueda(texto) {
  const textoNormalizado = normalize(texto);
  return allBooks.filter(libro => {
    const titulo = normalize(libro.Título || "");
    const autor = normalize(libro.Autor || "");
    const categorias = Array.isArray(libro["Categoría"]) ?
      libro["Categoría"].map(cat => normalize(cat?.value || cat)).join(" ") :
      normalize(libro["Categoría"] || "");

    return titulo.includes(textoNormalizado) ||
           autor.includes(textoNormalizado) ||
           categorias.includes(textoNormalizado);
  });
}

function mostrarSugerencias(texto) {
  suggestionsBox.innerHTML = "";
  if (!texto.trim()) {
    suggestionsBox.style.display = "none";
    return;
  }

  const textoNormalizado = normalize(texto);
  const sugerencias = [];

  allBooks.forEach(libro => {
    const titulo = libro.Título || "";
    const autor = libro.Autor || "";
    const categorias = Array.isArray(libro["Categoría"]) ? 
      libro["Categoría"].map(cat => cat?.value || cat) :
      [libro["Categoría"] || ""];

    if (normalize(titulo).includes(textoNormalizado)) {
      sugerencias.push(titulo);
    }

    if (normalize(autor).includes(textoNormalizado)) {
      sugerencias.push(autor);
    }

    categorias.forEach(cat => {
      if (normalize(cat).includes(textoNormalizado)) {
        sugerencias.push(cat);
      }
    });
  });

  const unicas = [...new Set(sugerencias)].slice(0, 6);
  if (unicas.length === 0) {
    suggestionsBox.style.display = "none";
    return;
  }

  unicas.forEach(item => {
    const div = document.createElement('div');
    div.textContent = item;
    div.className = 'suggestion-item';
    div.onclick = () => {
      searchInput.value = item;
      suggestionsBox.style.display = "none";
      const resultados = filtrarLibrosPorBusqueda(item);
      showBooksByPage(resultados, 1, true);
    };
    suggestionsBox.appendChild(div);
  });

  suggestionsBox.style.display = "block";
}

searchInput.addEventListener('input', () => {
  mostrarSugerencias(searchInput.value);
});

searchInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    const resultados = filtrarLibrosPorBusqueda(searchInput.value);
    showBooksByPage(resultados, 1, true);
    suggestionsBox.style.display = "none";
  }
});

searchBtn.addEventListener('click', () => {
  const resultados = filtrarLibrosPorBusqueda(searchInput.value);
  showBooksByPage(resultados, 1, true);
  suggestionsBox.style.display = "none";
});

document.addEventListener('click', (e) => {
  if (!e.target.closest('.search-container')) {
    suggestionsBox.style.display = 'none';
  }
});

let currentPage = 1;
const booksPerPage = 48;
const paginationContainer = document.createElement('div');
paginationContainer.className = 'pagination';
document.querySelector('.main-content').appendChild(paginationContainer);

// Mostrar libros por página (con mezcla opcional)
function showBooksByPage(bookList, page = 1, isFiltered = false) {
  currentPage = page;
  let listaParaMostrar = isFiltered ? [...bookList] : mezclarArray([...bookList]);
  const start = (page - 1) * booksPerPage;
  const end = start + booksPerPage;
  const booksToShow = listaParaMostrar.slice(start, end);
  showBooks(booksToShow);
  renderPagination(bookList.length, page, isFiltered);
}

// Generar los botones de paginación
function renderPagination(totalBooks, currentPage, isFiltered = false) {
  const totalPages = Math.ceil(totalBooks / booksPerPage);
  paginationContainer.innerHTML = '';

  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement('button');
    btn.textContent = i;
    btn.className = 'page-btn';
    if (i === currentPage) btn.classList.add('active');
    btn.onclick = () => showBooksByPage(allBooks, i, isFiltered);
    paginationContainer.appendChild(btn);
  }
}

// Animaciones de transición de página
const links = document.querySelectorAll('.transicion-link');
links.forEach(link => {
  link.addEventListener('click', function (e) {
    e.preventDefault();
    const cards = document.querySelectorAll('.book-card');
    cards.forEach((card, index) => {
      card.classList.remove('animate-in');
      card.classList.add('animate-out');
      card.style.animationDelay = `${index * 20}ms`;
    });
    const destino = this.href;
    setTimeout(() => {
      window.location.href = destino;
    }, 600);
  });
});
