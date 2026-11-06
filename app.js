/* Константы API */
const API_URL = 'https://jsonplaceholder.typicode.com/posts';

/* Ссылки на DOM */
const loadBtn = document.getElementById('loadBtn');
const postForm = document.getElementById('postForm');
const submitBtn = document.getElementById('submitBtn');
const titleInput = document.getElementById('title');
const bodyInput = document.getElementById('body');
const postsList = document.getElementById('postsList');
const emptyState = document.getElementById('emptyState');
const statusMessage = document.getElementById('statusMessage');

/* Вспомогательные функции для UI */
function showMessage(text, type) {
  statusMessage.textContent = text;
  statusMessage.className = `status-message status-message--${type}`;
}

function clearMessage() {
  statusMessage.textContent = '';
  statusMessage.className = 'status-message';
}

function toggleLoading(isLoading, btn) {
  if (isLoading) {
    btn.disabled = true;
    btn.textContent = 'Загрузка...';
  } else {
    btn.disabled = false;
    btn.textContent = btn === loadBtn ? 'Загрузить публикации' : 'Создать публикацию';
  }
}

function renderPosts(posts) {
  postsList.textContent = '';
  
  if (posts.length === 0) {
    emptyState.classList.remove('hidden');
    return;
  }
  emptyState.classList.add('hidden');

  const fragment = document.createDocumentFragment();
  
  posts.forEach(post => {
    const article = document.createElement('article');
    article.className = 'post-item';

    const title = document.createElement('h3');
    title.className = 'post-item__title';
    title.textContent = post.title;

    const body = document.createElement('p');
    body.className = 'post-item__body';
    body.textContent = post.body;

    article.append(title, body);
    fragment.appendChild(article);
  });

  postsList.appendChild(fragment);
}

/* 1. Загрузка публикаций (GET) */
async function loadPosts() {
  clearMessage();
  showMessage('Загрузка публикаций...', 'loading');
  toggleLoading(true, loadBtn);

  try {
    // Временно можно заменить на /postz для проверки обработки ошибки 404
    const response = await fetch(`${API_URL}?_limit=5`);
    
    if (!response.ok) {
      throw new Error(`Ошибка HTTP: ${response.status}`);
    }

    const data = await response.json();
    renderPosts(data);
    showMessage('Публикации успешно загружены!', 'success');
  } catch (error) {
    showMessage(`Не удалось загрузить публикации: ${error.message}`, 'error');
    console.error(error);
  } finally {
    toggleLoading(false, loadBtn);
  }
}

/* 2. Создание публикации (POST) */
async function createPost(event) {
  event.preventDefault();
  clearMessage();

  const title = titleInput.value.trim();
  const body = bodyInput.value.trim();

  if (!title || !body) {
    showMessage('Заголовок и текст не должны быть пустыми.', 'error');
    return;
  }

  toggleLoading(true, submitBtn);
  showMessage('Отправка публикации...', 'loading');

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title: title,
        body: body,
        userId: 1
      })
    });

    if (!response.ok) {
      throw new Error(`Ошибка HTTP: ${response.status}`);
    }

    const data = await response.json();
    
    // Вывод успеха
    showMessage(`Успех! Создана публикация: "${data.title}" (ID: ${data.id})`, 'success');
    
    // Очистка формы
    postForm.reset();

    // Опционально: добавить новую запись в начало списка визуально
    const article = document.createElement('article');
    article.className = 'post-item';
    article.innerHTML = ''; // Очистка на всякий случай
    const titleEl = document.createElement('h3');
    titleEl.className = 'post-item__title';
    titleEl.textContent = data.title;
    const bodyEl = document.createElement('p');
    bodyEl.className = 'post-item__body';
    bodyEl.textContent = data.body;
    article.append(titleEl, bodyEl);
    
    emptyState.classList.add('hidden');
    postsList.prepend(article);

  } catch (error) {
    showMessage(`Ошибка при создании: ${error.message}`, 'error');
    console.error(error);
  } finally {
    toggleLoading(false, submitBtn);
  }
}

/* Инициализация событий */
loadBtn.addEventListener('click', loadPosts);
postForm.addEventListener('submit', createPost);