const POSTS = [
  {
    slug: 'orthogonal-skip-connections',
    title: 'Orthogonal skip connections',
    date: '2026-02-10',
    subtitle: 'Residual connections relax the loss landscape. Can we push further?',
    image: 'posts/image.png',
    imageAlt: 'Orthogonal skip connections vs identity skip connections'
  }
];

const themeToggle = document.getElementById('theme-toggle');

if (themeToggle) {
  const root = document.documentElement;
  const savedTheme = localStorage.getItem('theme');

  if (savedTheme) {
    root.setAttribute('data-theme', savedTheme);
  }

  themeToggle.addEventListener('click', () => {
    const nextTheme = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', nextTheme);
    localStorage.setItem('theme', nextTheme);
  });
}

const postList = document.getElementById('post-list');
const postContent = document.getElementById('post-content');
const homePostList = document.getElementById('home-post-list');

const renderHomePostList = () => {
  if (!homePostList) {
    return;
  }

  homePostList.innerHTML = POSTS.map((post) => {
    const subtitle = post.subtitle || post.summary || '';
    const imageMarkup = post.image
      ? `<img class="post-card-image" src="${post.image}" alt="${post.imageAlt || `${post.title} preview`}" loading="lazy" />`
      : '';

    return `
      <a class="post-card" href="posts.html?post=${post.slug}">
        <div class="post-card-copy">
          <strong>${post.title}</strong>
          <small>${subtitle}</small>
        </div>
        ${imageMarkup}
      </a>
    `;
  }).join('');
};

const renderPostList = (activeSlug) => {
  if (!postList) {
    return;
  }

  postList.innerHTML = POSTS.map((post) => {
    const activeClass = post.slug === activeSlug ? 'active' : '';
    const subtitle = post.subtitle || post.summary || '';
    const imageMarkup = post.image
      ? `<img class="post-list-image" src="${post.image}" alt="${post.imageAlt || `${post.title} preview`}" loading="lazy" />`
      : '';

    return `
      <a class="${activeClass}" href="posts.html?post=${post.slug}">
        <div class="post-list-copy">
          <strong>${post.title}</strong>
          <small>${subtitle}</small>
          <span>${post.date}</span>
        </div>
        ${imageMarkup}
      </a>
    `;
  }).join('');
};

const typesetMath = () => {
  if (!postContent) {
    return;
  }

  if (window.MathJax?.typesetPromise) {
    window.MathJax.typesetPromise([postContent]);
  } else {
    setTimeout(typesetMath, 50);
  }
};

const renderMarkdown = (markdown) => {
  if (!postContent) {
    return;
  }

  if (window.marked) {
    window.marked.setOptions({
      mangle: false,
      headerIds: false
    });
    postContent.innerHTML = window.marked.parse(markdown);
  } else {
    postContent.textContent = markdown;
  }

  typesetMath();
};

const loadPost = async () => {
  if (!postContent) {
    return;
  }

  const params = new URLSearchParams(window.location.search);
  const slug = params.get('post') || POSTS[0]?.slug;

  renderPostList(slug);

  const post = POSTS.find((item) => item.slug === slug) || POSTS[0];

  if (!post) {
    postContent.innerHTML = '<h1>No posts yet</h1>';
    return;
  }

  try {
    const response = await fetch(`posts/${post.slug}.md`, { cache: 'no-store' });
    if (!response.ok) {
      throw new Error('Failed to load post.');
    }
    const markdown = await response.text();
    renderMarkdown(markdown);
  } catch (error) {
    postContent.innerHTML = `
      <h1>${post.title}</h1>
      <p>Unable to load this post right now. If you're opening the file locally, try a simple static server.</p>
    `;
  }
};

renderHomePostList();

if (postContent) {
  loadPost();
}
