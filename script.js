const POSTS = [
  {
    slug: 'matrix-computation',
    title: 'Matrix Computation Walkthrough',
    date: '2026-01-31',
    summary: 'A quick example of multiplying two small matrices by hand.'
  },
  {
    slug: 'first-steps',
    title: 'First Steps with Fourier Series',
    date: '2025-11-02',
    summary: 'Warm-up notes on decomposing periodic signals.'
  },
  {
    slug: 'graph-walks',
    title: 'Random Walks on Graphs',
    date: '2025-12-14',
    summary: 'A short intuition for transition matrices and steady state.'
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

const renderPostList = (activeSlug) => {
  if (!postList) {
    return;
  }

  postList.innerHTML = POSTS.map((post) => {
    const activeClass = post.slug === activeSlug ? 'active' : '';
    return `
      <a class="${activeClass}" href="posts.html?post=${post.slug}">
        <strong>${post.title}</strong>
        <small>${post.date}</small>
        <span>${post.summary}</span>
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

if (postContent) {
  loadPost();
}
