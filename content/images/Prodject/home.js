function initHome() {
  const sl = document.querySelector('[data-okb-slider]');
  if (sl) {
    if (!sl.dataset.ready) {
      sl.dataset.ready = '1';
    }
  }
  const sliderTrack = sl?.querySelector('.okb-slider__track');
  const dotsContainer = sl?.querySelector('.okb-slider__dots');
  let intervalId;
  const headBadge = document.querySelector('.okb-head .okb-badge');
  const headTitle = document.querySelector('.okb-head h3');
  const wasCard = document.querySelector('.okb-card--was');
  const didCard = document.querySelector('.okb-card--did');
  const resultCard = document.querySelector('.okb-card--result');
  const sidebarBtns = document.querySelectorAll('.okb-icon-btn[data-project]');
  const focusList = document.querySelector('[data-home-focus-list]');
  const servicesList = document.querySelector('[data-home-services-list]');
  const faqList = document.querySelector('[data-home-faq-list]');
  const heroTags = document.querySelector('[data-home-hero-tags]');
  const footerLinks = document.querySelector('[data-home-footer-links]');
  const callbackAria = document.querySelector('[data-home-contact-callback-aria]');

  function getFaqModal() { return document.querySelector('[data-home-faq-modal]'); }
  
  function openFaqModal() {
    const modal = getFaqModal();
    if (modal) {
      modal.hidden = false;
      modal.setAttribute('aria-hidden', 'false');
      modal.classList.add('is-open');
      document.documentElement.classList.add('home-callback-modal-open');
      document.body.classList.add('home-callback-modal-open');
    }
  }
  
  function closeFaqModal() {
    const modal = getFaqModal();
    if (modal) {
      modal.classList.remove('is-open');
      modal.setAttribute('aria-hidden', 'true');
      modal.hidden = true;
      document.documentElement.classList.remove('home-callback-modal-open');
      document.body.classList.remove('home-callback-modal-open');
    }
  }

  if (!window._homeFaqListenerAttached) {
    window._homeFaqListenerAttached = true;
    document.addEventListener('click', function(e) {
      if (e.target.closest('[data-faq-more]')) {
        e.preventDefault();
        openFaqModal();
      }
      if (e.target.closest('[data-home-faq-close]')) {
        e.preventDefault();
        closeFaqModal();
      }
      const modal = getFaqModal();
      if (modal && e.target === modal) {
        closeFaqModal();
      }
    });
  }

  function byPath(obj, path) {
    if (!obj) return undefined;
    if (typeof path !== 'string') return undefined;
    const keys = path.split('.');
    let cur = obj;
    keys.forEach(key => {
      if (cur != null) {
        cur = cur[key];
      }
    });
    return cur;
  }

  function setTextByMap(data) {
    document.querySelectorAll('[data-home-text]').forEach(el => {
      const path = el.getAttribute('data-home-text');
      const value = byPath(data, path);
      if (typeof value === 'string') {
        el.textContent = value;
      }
    });
  }

  function bindServiceChipFlip(root = document) {
    const isTouchLike = window.matchMedia('(hover: none), (pointer: coarse)').matches;
    const chips = root.querySelectorAll('.service-chip--flippable');
    chips.forEach(card => {
      if (card.dataset.flipBound === 'true') return;
      card.dataset.flipBound = 'true';

      if (!isTouchLike) return;

      card.addEventListener('click', () => {
        const next = !card.classList.contains('is-open');
        chips.forEach(other => {
          if (other !== card) other.classList.remove('is-open');
        });
        card.classList.toggle('is-open', next);
      });

      card.addEventListener('keydown', (event) => {
        if (event.key !== 'Enter' && event.key !== ' ') return;
        event.preventDefault();
        card.click();
      });
    });
  }
  
  function renderFaq(data) {
    if (!data.faq || !Array.isArray(data.faq.items) || data.faq.items.length === 0) return;
    const items = data.faq.items;
    
    const dynamicFaqList = document.querySelector('[data-home-faq-list]');
    if (!dynamicFaqList) return;
    
    const faqTitle = dynamicFaqList.querySelector('[data-faq-title]');
    const faqAnswer = dynamicFaqList.querySelector('[data-faq-answer]');
    if (faqTitle && items.length > 0) faqTitle.textContent = items[0].question;
    if (faqAnswer && items.length > 0) faqAnswer.textContent = items[0].answer;
    
    const modalList = document.querySelector('[data-faq-modal-list]');
    if (modalList) {
      modalList.innerHTML = '';
      items.forEach(item => {
        const btn = document.createElement('article');
        btn.className = 'faq-modal-item';
        const h3 = document.createElement('h3');
        h3.textContent = item.question;
        btn.appendChild(h3);
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          const pTitle = document.querySelector('[data-faq-title]');
          const pAnswer = document.querySelector('[data-faq-answer]');
          if (pTitle) pTitle.textContent = item.question;
          if (pAnswer) pAnswer.textContent = item.answer;
          closeFaqModal();
        });
        modalList.appendChild(btn);
      });
    }
  }

  async function loadHomeContent() {
    try {
      const res = await fetch('/images/Prodject/data.json');
      if (!res.ok) {
        console.error('Failed to load home data: ', res.statusText);
        return;
      }
      const data = await res.json();
      
      const dynamicFocusList = document.querySelector('[data-home-focus-list]');
      const dynamicServicesList = document.querySelector('[data-home-services-list]');
      const dynamicHeroTags = document.querySelector('[data-home-hero-tags]');
      const footerLinksE = document.querySelector('[data-home-footer-links]');
      const dynCallbackAria = document.querySelector('[data-home-contact-callback-aria]');
      
      setTextByMap(data);
      
      if (dynamicFocusList && data.focus && Array.isArray(data.focus.cards)) {
        dynamicFocusList.innerHTML = '';
        data.focus.cards.forEach(card => {
          const article = document.createElement('article');
          article.className = 'focus-card';
          const header = document.createElement('div');
          header.className = 'focus-card__header';
          const iconWrap = document.createElement('div');
          const variant = typeof card.iconVariant === 'string' ? card.iconVariant : 'blue';
          iconWrap.className = 'focus-card__icon focus-card__icon--' + variant;
          const icon = document.createElement('span');
          icon.className = 'material-symbols-outlined';
          icon.textContent = typeof card.icon === 'string' ? card.icon : 'inbox_customize';
          iconWrap.appendChild(icon);
          const title = document.createElement('h3');
          title.textContent = typeof card.title === 'string' ? card.title : '';
          const desc = document.createElement('p');
          desc.textContent = typeof card.desc === 'string' ? card.desc : '';
          const result = document.createElement('div');
          result.className = 'focus-card__result';
          const resultIcon = document.createElement('span');
          resultIcon.className = 'material-symbols-outlined';
          resultIcon.textContent = typeof card.resultIcon === 'string' ? card.resultIcon : 'trending_up';
          result.appendChild(resultIcon);
          result.append(' ' + (typeof card.resultText === 'string' ? card.resultText : ''));
          header.appendChild(iconWrap);
          header.appendChild(title);
          article.appendChild(header);
          article.appendChild(desc);
          article.appendChild(result);
          dynamicFocusList.appendChild(article);
        });
      }
      
      if (dynamicServicesList && data.services && Array.isArray(data.services.items)) {
        dynamicServicesList.innerHTML = '';
        const serviceVariants = ['blue', 'purple', 'orange', 'green'];
        data.services.items.forEach((item, index) => {
          const variant = typeof item.iconVariant === 'string'
            ? item.iconVariant
            : serviceVariants[index % serviceVariants.length];
          const article = document.createElement('article');
          article.className = 'service-chip service-chip--flippable service-chip--' + variant;
          article.tabIndex = 0;
          article.setAttribute('role', 'button');
          article.setAttribute(
            'aria-label',
            'Показать описание сервиса ' + (typeof item.title === 'string' ? item.title : ''),
          );
          const inner = document.createElement('div');
          inner.className = 'service-chip__inner';
          const front = document.createElement('div');
          front.className = 'service-chip__face service-chip__face--front';
          const back = document.createElement('div');
          back.className = 'service-chip__face service-chip__face--back';
          const wrap = document.createElement('span');
          const icon = document.createElement('span');
          icon.className = 'material-symbols-outlined';
          icon.textContent = typeof item.icon === 'string' ? item.icon : 'send';
          wrap.appendChild(icon);
          const h3 = document.createElement('h3');
          h3.textContent = typeof item.title === 'string' ? item.title : '';
          const p = document.createElement('p');
          p.textContent = typeof item.backText === 'string' ? item.backText : '';
          front.appendChild(wrap);
          front.appendChild(h3);
          back.appendChild(p);
          inner.appendChild(front);
          inner.appendChild(back);
          article.appendChild(inner);
          dynamicServicesList.appendChild(article);
        });
        bindServiceChipFlip(dynamicServicesList);
      }
      
      renderFaq(data);
      
      if (footerLinksE && data.footer && Array.isArray(data.footer.links)) {
        footerLinksE.innerHTML = '';
        data.footer.links.forEach(link => {
          const a = document.createElement('a');
          a.href = typeof link.href === 'string' ? link.href : '#';
          a.textContent = typeof link.text === 'string' ? link.text : '';
          footerLinksE.appendChild(a);
        });
      }
      
      if (dynCallbackAria && data.contact && typeof data.contact.callbackAria === 'string') {
        dynCallbackAria.setAttribute('aria-label', data.contact.callbackAria);
      }
      
      if (dynamicHeroTags && data.hero && Array.isArray(data.hero.tags)) {
        dynamicHeroTags.innerHTML = '';
        data.hero.tags.forEach(tagText => {
          const span = document.createElement('span');
          span.className = 'tag-capsule';
          span.textContent = String(tagText);
          dynamicHeroTags.appendChild(span);
        });
      }
    } catch (e) {
      console.error('Home load error:', e);
    }
  }

  function startSlider() {
    const sl = document.querySelector('[data-okb-slider]');
    if (!sl) return;
    if (intervalId) clearInterval(intervalId);
    const slides = sl.querySelectorAll('.okb-slider__slide');
    const dots = sl.querySelectorAll('.okb-slider__dots .okb-slider__dot');
    let cur = 0;
    const len = slides.length;
    function go(n) {
      if (slides.length === 0) return;
      slides[cur].classList.remove('okb-slider__slide--active');
      if (dots[cur]) dots[cur].classList.remove('okb-slider__dot--active');
      cur = (n % len + len) % len;
      slides[cur].classList.add('okb-slider__slide--active');
      if (dots[cur]) dots[cur].classList.add('okb-slider__dot--active');
    }
    dots.forEach((d, i) => {
      d.addEventListener('click', () => go(i));
    });
    intervalId = setInterval(() => go(cur + 1), 4000);
  }

  async function loadProject(projectName) {
    try {
      const res = await fetch('/images/Prodject/' + projectName + '/data.json');
      if (!res.ok) throw new Error('Failed to load project');
      const data = await res.json();
      let projectBadge = data.badge;
      let projectTitle = data.title;
      if (data.head) {
        if (typeof data.head.badge === 'string') projectBadge = data.head.badge;
        if (typeof data.head.title === 'string') projectTitle = data.head.title;
      }
      const headBadge = document.querySelector('.okb-head .okb-badge');
      const headTitle = document.querySelector('.okb-head h3');
      if (headBadge && typeof projectBadge === 'string') headBadge.textContent = projectBadge;
      if (headTitle && typeof projectTitle === 'string') headTitle.textContent = projectTitle;
      
      const wasCard = document.querySelector('.okb-card--was');
      const didCard = document.querySelector('.okb-card--did');
      const resultCard = document.querySelector('.okb-card--result');
      if (wasCard) {
        wasCard.querySelector('h4').textContent = data.was.title;
        wasCard.querySelector('.okb-card__sub').textContent = data.was.desc;
      }
      if (didCard) {
        didCard.querySelector('h4').textContent = data.did.title;
        didCard.querySelector('.okb-card__sub').textContent = data.did.desc;
      }
      if (resultCard) {
        resultCard.querySelector('h4').textContent = data.result.title;
        resultCard.querySelector('.okb-card__sub').textContent = data.result.desc;
      }
      
      const sliderTrack = document.querySelector('.okb-slider__track');
      const dotsContainer = document.querySelector('.okb-slider__dots');
      if (sliderTrack) sliderTrack.innerHTML = '';
      if (dotsContainer) dotsContainer.innerHTML = '';
      if (sliderTrack && dotsContainer && Array.isArray(data.slides)) {
        data.slides.forEach((slide, i) => {
          const slideDiv = document.createElement('div');
          slideDiv.className = 'okb-slider__slide' + (i === 0 ? ' okb-slider__slide--active' : '');
          const imgD = document.createElement('img');
          imgD.className = 'okb-slide-img okb-slide-img--dark';
          imgD.src = '/images/Prodject/' + projectName + '/' + slide.dark;
          const imgL = document.createElement('img');
          imgL.className = 'okb-slide-img okb-slide-img--light';
          imgL.src = '/images/Prodject/' + projectName + '/' + slide.light;
          slideDiv.appendChild(imgD);
          slideDiv.appendChild(imgL);
          sliderTrack.appendChild(slideDiv);
          const dot = document.createElement('span');
          dot.className = 'okb-slider__dot' + (i === 0 ? ' okb-slider__dot--active' : '');
          dotsContainer.appendChild(dot);
        });
        startSlider();
      }
    } catch (e) {
      console.error(e);
    }
  }

  document.querySelectorAll('.okb-icon-btn[data-project]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.okb-icon-btn[data-project]').forEach(b => b.classList.remove('okb-icon-btn--active'));
      btn.classList.add('okb-icon-btn--active');
      loadProject(btn.dataset.project);
    });
  });

  const activeBtn = document.querySelector('.okb-icon-btn.okb-icon-btn--active[data-project]');
  if (activeBtn) {
    loadProject(activeBtn.dataset.project);
  } else {
    startSlider();
  }
  bindServiceChipFlip();
  loadHomeContent();
}

document.addEventListener("nav", initHome);
initHome();
