(() => {
  'use strict';

  const qs = (selector, root = document) => root.querySelector(selector);
  const qsa = (selector, root = document) => [...root.querySelectorAll(selector)];

  const formatDate = (value) => {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return new Intl.DateTimeFormat('ja-JP', {
      timeZone: 'Asia/Tokyo',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(date).replaceAll('/', '.');
  };

  const formatJournalDate = (value) => {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Tokyo',
      month: '2-digit',
      day: '2-digit'
    }).formatToParts(date);
    const month = parts.find((part) => part.type === 'month')?.value;
    const day = parts.find((part) => part.type === 'day')?.value;
    return month && day ? `${month} / ${day}` : '';
  };

  const formatJournalTime = (value) => {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Tokyo',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).format(date).replace(' ', '. ');
  };

  const excerpt = (text, max = 46) => {
    const normalized = String(text ?? '').replace(/\s+/g, ' ').trim();
    if (!normalized) return 'Instagram投稿';
    return normalized.length > max ? `${normalized.slice(0, max)}…` : normalized;
  };

  const firstImage = (post) => {
    if (Array.isArray(post.images) && post.images.length) return post.images[0];
    return post.image || '';
  };

  const createPostCard = (post) => {
    const article = document.createElement('article');
    article.className = 'post-card';

    const link = document.createElement('a');
    link.href = `posts/${encodeURIComponent(post.id)}.html`;
    link.setAttribute('aria-label', `${excerpt(post.title || post.caption, 70)}の記事を読む`);

    const imagePath = firstImage(post);
    if (imagePath) {
      const image = document.createElement('img');
      image.src = imagePath;
      image.alt = '';
      image.width = 800;
      image.height = 800;
      image.loading = 'lazy';
      image.decoding = 'async';
      link.append(image);
    }

    const body = document.createElement('div');
    body.className = 'post-card__body';

    const time = document.createElement('time');
    time.dateTime = post.timestamp || '';
    time.textContent = formatDate(post.timestamp);

    const title = document.createElement('h3');
    title.textContent = excerpt(post.title || post.caption);

    body.append(time, title);
    link.append(body);
    article.append(link);
    return article;
  };

  const createJournalSlide = (post, index) => {
    const panel = document.createElement('article');
    panel.className = 'journal-feature';
    panel.id = `journal-panel-${index}`;
    panel.setAttribute('role', 'tabpanel');
    panel.setAttribute('aria-label', `${index + 1}件目の投稿`);

    const imagePath = firstImage(post);
    const imageWrap = document.createElement('div');
    imageWrap.className = 'journal-feature__media';
    if (imagePath) {
      const image = document.createElement('img');
      image.src = imagePath;
      image.alt = '';
      image.width = 1200;
      image.height = 1200;
      image.decoding = 'async';
      imageWrap.append(image);
    }

    const body = document.createElement('div');
    body.className = 'journal-feature__body';
    const label = document.createElement('p');
    label.className = 'journal-feature__label';
    label.textContent = 'LATEST JOURNAL';
    const date = document.createElement('time');
    date.className = 'journal-feature__date';
    date.dateTime = post.timestamp || '';
    date.textContent = formatDate(post.timestamp);
    const title = document.createElement('h3');
    title.textContent = post.title || excerpt(post.caption, 62);
    const description = document.createElement('p');
    description.className = 'journal-feature__description';
    description.textContent = excerpt(post.caption, 230);
    const link = document.createElement('a');
    link.className = 'journal-feature__link';
    link.href = `posts/${encodeURIComponent(post.id)}.html`;
    link.textContent = '投稿を読む';
    body.append(label, date, title, description, link);
    panel.append(imageWrap, body);
    return panel;
  };

  const createJournalControl = (post, index) => {
    const button = document.createElement('button');
    button.className = 'journal-control';
    button.type = 'button';
    button.setAttribute('role', 'tab');
    button.setAttribute('aria-controls', `journal-panel-${index}`);
    button.setAttribute('aria-selected', index === 0 ? 'true' : 'false');
    button.tabIndex = index === 0 ? 0 : -1;

    const date = document.createElement('time');
    date.className = 'journal-control__date';
    date.dateTime = post.timestamp || '';
    date.textContent = formatJournalDate(post.timestamp);
    const time = document.createElement('span');
    time.className = 'journal-control__time';
    time.textContent = formatJournalTime(post.timestamp);
    const imagePath = firstImage(post);
    const imageWrap = document.createElement('span');
    imageWrap.className = 'journal-control__media';
    if (imagePath) {
      const image = document.createElement('img');
      image.src = imagePath;
      image.alt = '';
      image.width = 600;
      image.height = 600;
      image.loading = 'lazy';
      image.decoding = 'async';
      imageWrap.append(image);
    }
    const title = document.createElement('span');
    title.className = 'journal-control__title';
    title.textContent = post.title || excerpt(post.caption, 42);
    button.setAttribute('aria-label', `${date.textContent} ${title.textContent}を表示`);
    button.append(date, time, imageWrap, title);
    return button;
  };

  const loadPosts = async () => {
    const response = await fetch('assets/data/instagram-posts.json', { cache: 'no-store' });
    if (!response.ok) throw new Error(`Instagram data request failed: ${response.status}`);
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  };

  const renderLatestPosts = async () => {
    const target = qs('[data-instagram-latest]');
    if (!target) return;

    try {
      const posts = await loadPosts();
      if (!posts.length) {
        target.innerHTML = '<p class="empty-state">現在、掲載済みの記事はありません。</p>';
        return;
      }
      const journalPosts = posts.slice(0, 6);
      const main = document.createElement('div');
      main.className = 'journal-main';
      const controls = document.createElement('div');
      controls.className = 'journal-controls';
      controls.setAttribute('role', 'tablist');
      controls.setAttribute('aria-label', '表示する投稿を選ぶ');
      const slides = journalPosts.map((post, index) => createJournalSlide(post, index));
      const buttons = journalPosts.map((post, index) => createJournalControl(post, index));
      main.append(...slides);
      controls.append(...buttons);

      const activate = (nextIndex, focus = false) => {
        slides.forEach((slide, index) => {
          const selected = index === nextIndex;
          slide.hidden = !selected;
          buttons[index].setAttribute('aria-selected', String(selected));
          buttons[index].tabIndex = selected ? 0 : -1;
        });
        if (focus) buttons[nextIndex].focus();
      };

      buttons.forEach((button, index) => {
        button.addEventListener('click', () => activate(index));
        button.addEventListener('keydown', (event) => {
          if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
          event.preventDefault();
          const lastIndex = buttons.length - 1;
          const nextIndex = event.key === 'Home' ? 0
            : event.key === 'End' ? lastIndex
              : (index + (event.key === 'ArrowRight' ? 1 : -1) + buttons.length) % buttons.length;
          activate(nextIndex, true);
        });
      });
      activate(0);
      target.replaceChildren(main, controls);
    } catch (error) {
      console.error(error);
      target.innerHTML = '<p class="empty-state">記事を読み込めませんでした。</p>';
    }
  };

  const renderPostsPage = async () => {
    const target = qs('[data-posts-grid]');
    if (!target) return;

    try {
      const posts = await loadPosts();
      if (!posts.length) {
        target.innerHTML = '<p class="empty-state">現在、掲載済みの記事はありません。</p>';
        return;
      }
      const fragment = document.createDocumentFragment();
      posts.forEach((post) => fragment.append(createPostCard(post)));
      target.replaceChildren(fragment);
    } catch (error) {
      console.error(error);
      target.innerHTML = '<p class="empty-state">記事を読み込めませんでした。</p>';
    }
  };

  const renderPostDetail = async () => {
    const target = qs('[data-post-detail]');
    if (!target) return;

    const id = new URLSearchParams(location.search).get('post');
    if (!id) {
      target.innerHTML = '<p class="empty-state">記事が指定されていません。</p>';
      return;
    }

    try {
      const posts = await loadPosts();
      const post = posts.find((item) => String(item.id) === id);
      if (!post) {
        target.innerHTML = '<p class="empty-state">指定された記事は見つかりませんでした。</p>';
        return;
      }

      const date = document.createElement('time');
      date.className = 'post-detail__date';
      date.dateTime = post.timestamp || '';
      date.textContent = formatDate(post.timestamp);

      const title = document.createElement('h1');
      title.textContent = post.title || excerpt(post.caption, 70);

      const images = Array.isArray(post.images) && post.images.length
        ? post.images
        : (post.image ? [post.image] : []);
      const imagesWrap = document.createElement('div');
      imagesWrap.className = 'post-detail__images';
      images.forEach((path) => {
        const img = document.createElement('img');
        img.src = path;
        img.alt = '';
        img.loading = 'lazy';
        img.decoding = 'async';
        imagesWrap.append(img);
      });

      const caption = document.createElement('div');
      caption.className = 'post-detail__caption prose';
      caption.textContent = post.caption || '';

      const actions = document.createElement('p');
      if (post.permalink) {
        const instagram = document.createElement('a');
        instagram.className = 'button button--primary';
        instagram.href = post.permalink;
        instagram.target = '_blank';
        instagram.rel = 'noopener noreferrer';
        instagram.textContent = 'Instagramで見る';
        actions.append(instagram);
      }

      target.replaceChildren(date, title, imagesWrap, caption, actions);
      document.title = `${post.title || excerpt(post.caption, 40)} | 路地裏チャイニーズ 有馬`;
    } catch (error) {
      console.error(error);
      target.innerHTML = '<p class="empty-state">記事を読み込めませんでした。</p>';
    }
  };

  const setupNavigation = () => {
    const toggle = qs('.menu-toggle');
    const nav = qs('#mobile-nav');
    const backdrop = qs('[data-mobile-nav-backdrop]');
    if (!toggle || !nav || !backdrop) return;

    const close = () => {
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'メニューを開く');
      nav.classList.remove('is-open');
      nav.setAttribute('aria-hidden', 'true');
      backdrop.hidden = true;
      document.body.classList.remove('is-nav-open');
    };

    const open = () => {
      toggle.setAttribute('aria-expanded', 'true');
      toggle.setAttribute('aria-label', 'メニューを閉じる');
      nav.classList.add('is-open');
      nav.setAttribute('aria-hidden', 'false');
      backdrop.hidden = false;
      document.body.classList.add('is-nav-open');
      qs('a', nav)?.focus();
    };

    toggle.addEventListener('click', () => {
      toggle.getAttribute('aria-expanded') === 'true' ? close() : open();
    });
    backdrop.addEventListener('click', close);
    qsa('a', nav).forEach((link) => link.addEventListener('click', close));
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
        close();
        toggle.focus();
      }
    });
  };

  const setupHeaderAndSectionState = () => {
    const header = qs('#site-header');
    const backToTop = qs('[data-back-to-top]');
    const update = () => {
      const scrolled = window.scrollY > 12;
      header?.classList.toggle('is-scrolled', scrolled);
      backToTop?.classList.toggle('is-visible', window.scrollY > 500);
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    backToTop?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

    const links = qsa('.desktop-nav a[href^="#"]');
    const sections = links
      .map((link) => document.getElementById(link.getAttribute('href').slice(1)))
      .filter(Boolean);
    if (!sections.length) return;

    const observer = new IntersectionObserver((entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visible) return;
      links.forEach((link) => {
        const active = link.getAttribute('href') === `#${visible.target.id}`;
        link.classList.toggle('is-active', active);
        if (active) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
    }, { rootMargin: '-25% 0px -60% 0px', threshold: [0, .25, .5] });
    sections.forEach((section) => observer.observe(section));
  };

  const setupPrivacyDialog = () => {
    const dialog = qs('#privacy-dialog');
    if (!(dialog instanceof HTMLDialogElement)) return;
    qsa('[data-open-privacy]').forEach((button) => button.addEventListener('click', () => dialog.showModal()));
    qsa('[data-close-privacy]').forEach((button) => button.addEventListener('click', () => dialog.close()));
    dialog.addEventListener('click', (event) => {
      const rect = dialog.getBoundingClientRect();
      const inside = event.clientX >= rect.left && event.clientX <= rect.right && event.clientY >= rect.top && event.clientY <= rect.bottom;
      if (!inside) dialog.close();
    });
  };

  setupNavigation();
  setupHeaderAndSectionState();
  setupPrivacyDialog();
  renderLatestPosts();
  renderPostsPage();
  renderPostDetail();
})();
