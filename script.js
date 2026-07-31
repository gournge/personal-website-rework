const POSTS = [
  {
    slug: 'tanaka',
    title: 'Itô–Tanaka Certificates',
    date: '2026-07-31',
    subtitle: 'Neural supermartingale certificates beyond twice-differentiable functions.',
    image: 'tanaka/ideal-example.png',
    imageAlt: 'Ideal reach–avoid certificate and stopped trajectories',
    href: 'tanaka/'
  },
  {
    slug: 'orthogonal-skip-connections',
    title: 'Orthogonal skip connections',
    date: '2026-02-10',
    subtitle: 'Residual connections relax the loss landscape. Can we push further?',
    image: 'posts/loss-landscapes.png',
    imageAlt: 'Loss landscapes of ResNet56 with identity, orthogonal and no skip connections'
  }
];

const themeToggle = document.getElementById('theme-toggle');

if (themeToggle) {
  const root = document.documentElement;
  const themeLabel = themeToggle.querySelector('.theme-label');
  const savedTheme = localStorage.getItem('theme');
  const applyTheme = (theme) => {
    root.setAttribute('data-theme', theme);
    if (themeLabel) {
      themeLabel.textContent = theme === 'dark' ? 'Dark' : 'Light';
    }
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    themeToggle.setAttribute('aria-label', `Switch to ${nextTheme} mode`);
  };

  applyTheme(savedTheme === 'dark' ? 'dark' : 'light');

  themeToggle.addEventListener('click', () => {
    const nextTheme = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    applyTheme(nextTheme);
    localStorage.setItem('theme', nextTheme);
  });
}

const postList = document.getElementById('post-list');
const postContent = document.getElementById('post-content');
const homePostList = document.getElementById('home-post-list');

const setLinksTargetBlank = (scope = document) => {
  scope.querySelectorAll('a[href]:not([data-same-tab])').forEach((link) => {
    link.setAttribute('target', '_blank');

    const relTokens = new Set((link.getAttribute('rel') || '').split(/\s+/).filter(Boolean));
    relTokens.add('noopener');
    relTokens.add('noreferrer');
    link.setAttribute('rel', Array.from(relTokens).join(' '));
  });
};

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
      <a class="post-card" href="${post.href || `posts.html?post=${post.slug}`}">
        <div class="post-card-copy">
          <strong>${post.title}</strong>
          <small>${subtitle}</small>
          <span class="post-card-date">${post.date}</span>
        </div>
        ${imageMarkup}
      </a>
    `;
  }).join('');

  setLinksTargetBlank(homePostList);
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
      <a class="${activeClass}" href="${post.href || `posts.html?post=${post.slug}`}">
        <div class="post-list-copy">
          <strong>${post.title}</strong>
          <small>${subtitle}</small>
          <span>${post.date}</span>
        </div>
        ${imageMarkup}
      </a>
    `;
  }).join('');

  setLinksTargetBlank(postList);
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

  setLinksTargetBlank(postContent);
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
setLinksTargetBlank();

if (postContent) {
  loadPost();
}
