// Apex Motors — загружаем машины из data.json и выводим их циклами

let data = {};
let activeBrand = 'mercedes';   // открытая вкладка
let currentCar = null;          // машина, открытая в окне деталей

// Полные названия брендов для заголовка секции и окна
const brandNames = {
  mercedes: 'Mercedes-Benz',
  bmw: 'BMW',
  porsche: 'Porsche'
};

// Названия цветов для подписи «Цвет: ...» в окне деталей
const colorNames = {
  '#0B0B0D': 'Obsidian Black',
  '#C7C9CC': 'Iridium Silver',
  '#2E3A4E': 'Nautic Blue',
  '#5B5D5F': 'Graphite Grey',
  '#F4F5F6': 'Polar White',
  '#4A4E52': 'Selenite Grey',
  '#1C2331': 'Cavansite Blue',
  '#7A2E2E': 'Hyacinth Red',
  '#3A4A3F': 'Forest Green',
  '#1C2A45': 'Tanzanite Blue',
  '#2E5BFF': 'Portimao Blue',
  '#3A9B5C': 'Isle of Man Green',
  '#C7352E': 'Guards Red',
  '#F2C230': 'Racing Yellow',
  '#3A2E4E': 'Amethyst Grey',
  '#1C4532': 'British Racing Green',
  '#4E9BB8': 'Frozen Blue'
};


// ---------- Часть 1. Загрузка данных ----------

axios.get('data/data.json')
  .then(function (response) {
    data = response.data;

    console.log(data);          // проверьте структуру

    initTabs();
    renderCards(activeBrand);   // первый вывод
  })
  .catch(function (error) {
    console.error('Не удалось загрузить data/data.json', error);
    document.querySelector('.cards').innerHTML = `
      <p class="cards-error">
        Не удалось загрузить автомобили. Откройте проект через Live Server.
      </p>
    `;
  });


// ---------- Вспомогательные функции ----------

// 185000 → $185,000
function formatPrice(price) {
  return '$' + price.toLocaleString('en-US');
}

// 1 модель, 2 модели, 5 моделей
function plural(n, one, few, many) {
  const mod10 = n % 10;
  const mod100 = n % 100;

  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few;
  return many;
}

function getColorName(hex) {
  return colorNames[hex.toUpperCase()] || hex;
}


// ---------- Часть 2. Вкладки категорий ----------

function initTabs() {
  const tabs = document.querySelectorAll('.tab');

  for (let i = 0; i < tabs.length; i++) {
    tabs[i].addEventListener('click', function () {
      activeBrand = tabs[i].dataset.brand;

      // Перекрашиваем кнопки: снимаем active со всех, ставим на нажатую
      for (let j = 0; j < tabs.length; j++) {
        tabs[j].classList.remove('active');
      }
      tabs[i].classList.add('active');

      renderCards(activeBrand);
    });
  }
}


// ---------- Часть 3. Сетка карточек ----------

function renderCards(brand) {
  const cars = data[brand];   // квадратные скобки — бренд лежит в переменной
  let html = '';

  for (let i = 0; i < cars.length; i++) {
    const car = cars[i];
    const colorsCount = car.availableColors.length;

    // Бейдж остатка — только для машин, которых осталась одна
    let badge = '';
    if (car.count === 1) {
      badge = '<span class="badge">Осталась 1</span>';
    }

    html = html + `
      <article class="card" style="animation-delay: ${i * 70}ms" onclick="openModal('${brand}', ${i})">
        <div class="card-image">
          <img src="${car.image}" alt="${car.title}" loading="lazy">
          ${badge}
        </div>
        <div class="card-body">
          <h3 class="card-title">${car.title}</h3>
          <p class="card-meta">
            ${colorsCount} ${plural(colorsCount, 'цвет', 'цвета', 'цветов')} · ${car.count} шт. в наличии
          </p>
          <div class="card-bottom">
            <p class="price">${formatPrice(car.price)}</p>
            <button class="btn">Заказать</button>
          </div>
        </div>
      </article>
    `;
  }

  // Одна вставка после цикла — иначе останется только последняя карточка
  document.querySelector('.cards').innerHTML = html;

  document.querySelector('.section-title').textContent = brandNames[brand];
  document.querySelector('.section-count').textContent =
    cars.length + ' ' + plural(cars.length, 'модель', 'модели', 'моделей') + ' в салоне';
}


// ---------- Часть 4. Окно с деталями ----------

const modal = document.getElementById('modal');

function openModal(brand, index) {
  const car = data[brand][index];
  currentCar = car;

  // Кружки цветов — тоже цикл с накоплением
  let colorsHtml = '';

  for (let i = 0; i < car.availableColors.length; i++) {
    const color = car.availableColors[i];

    colorsHtml = colorsHtml + `
      <button class="color-dot"
              style="background: ${color}"
              aria-label="${getColorName(color)}"
              onclick="selectColor(${i})"></button>
    `;
  }

  document.getElementById('modal-img').src = car.image;
  document.getElementById('modal-img').alt = car.title;
  document.getElementById('modal-brand').textContent = brandNames[brand] + ' · 2026';
  document.getElementById('modal-title').textContent = car.title;
  document.getElementById('modal-price').textContent = formatPrice(car.price);
  document.getElementById('modal-desc').textContent = car.description;
  document.getElementById('modal-count').textContent = car.count + ' шт.';
  document.getElementById('modal-colors').innerHTML = colorsHtml;

  selectColor(0);   // по умолчанию выбран первый цвет

  modal.classList.add('open');
  document.body.classList.add('no-scroll');
  document.getElementById('modal-window').focus();
}

function selectColor(index) {
  const dots = document.querySelectorAll('.color-dot');

  for (let i = 0; i < dots.length; i++) {
    dots[i].classList.remove('active');
  }
  dots[index].classList.add('active');

  document.getElementById('modal-color-name').textContent =
    getColorName(currentCar.availableColors[index]);
}

function closeModal() {
  modal.classList.remove('open');
  document.body.classList.remove('no-scroll');
}

// Закрытие: крестик, клик по тёмному фону, клавиша Esc
document.getElementById('modal-close').addEventListener('click', closeModal);

modal.addEventListener('click', function (event) {
  if (event.target === modal) {
    closeModal();
  }
});

document.addEventListener('keydown', function (event) {
  if (event.key === 'Escape' && modal.classList.contains('open')) {
    closeModal();
  }
});

document.getElementById('modal-order').addEventListener('click', function () {
  alert('Заявка на ' + currentCar.title + ' принята!');
  closeModal();
});
