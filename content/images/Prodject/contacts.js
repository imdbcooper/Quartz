function initContacts() {
  const central = document.querySelector('.contacts-central');
  if (!central) return;
  
  if (central.dataset.initialized) return;
  central.dataset.initialized = 'true';

  function byPath(obj, path) {
    if (!obj) return undefined;
    const keys = path.split('.');
    let cur = obj;
    keys.forEach(key => {
      if (cur != null) cur = cur[key];
    });
    return cur;
  }

  function setTextByMap(data) {
    document.querySelectorAll('[data-contacts-text]').forEach(el => {
      const path = el.getAttribute('data-contacts-text');
      const value = byPath(data, path);
      if (typeof value === 'string') {
        el.textContent = value;
      }
    });
  }

  async function loadContactsContent() {
    try {
      const res = await fetch('/images/Prodject/contacts.json');
      if (!res.ok) return;
      const data = await res.json();

      setTextByMap(data);

      const heroTags = document.querySelector('[data-contacts-hero-tags]');
      if (heroTags && data.hero && Array.isArray(data.hero.tags)) {
        heroTags.innerHTML = '';
        data.hero.tags.forEach(tag => {
          const span = document.createElement('span');
          span.className = 'contacts-tag';
          span.textContent = tag;
          heroTags.appendChild(span);
        });
      }

      const channelsGrid = document.querySelector('[data-contacts-channels-grid]');
      if (channelsGrid && data.fastContact && Array.isArray(data.fastContact.channels)) {
        channelsGrid.innerHTML = '';
        data.fastContact.channels.forEach(ch => {
          const a = document.createElement('a');
          a.href = ch.href;
          a.className = 'contacts-channel' + (ch.type === 'telegram' ? ' contacts-channel--primary' : '');
          a.setAttribute('aria-label', 'Связаться в ' + ch.label);
          
          const icon = document.createElement('span');
          icon.className = 'contacts-channel__icon material-symbols-outlined';
          icon.textContent = ch.icon;
          
          const copy = document.createElement('div');
          copy.className = 'contacts-channel__copy';
          const label = document.createElement('span');
          label.className = 'contacts-channel__label';
          label.textContent = ch.label;
          const value = document.createElement('strong');
          value.className = 'contacts-channel__value';
          value.textContent = ch.value;
          copy.appendChild(label);
          copy.appendChild(value);
          
          const arrow = document.createElement('span');
          arrow.className = 'contacts-channel__arrow material-symbols-outlined';
          arrow.textContent = 'arrow_forward';
          
          a.appendChild(icon);
          a.appendChild(copy);
          a.appendChild(arrow);
          channelsGrid.appendChild(a);
        });
      }

      const stepsGrid = document.querySelector('[data-contacts-steps-grid]');
      if (stepsGrid && data.workflow && Array.isArray(data.workflow.steps)) {
        stepsGrid.innerHTML = '';
        data.workflow.steps.forEach(step => {
          const art = document.createElement('article');
          art.className = 'contacts-step-card';
          
          const top = document.createElement('div');
          top.className = 'contacts-step-card__top';
          const num = document.createElement('span');
          num.className = 'contacts-step-card__number';
          num.textContent = step.num;
          const icon = document.createElement('span');
          icon.className = 'material-symbols-outlined';
          icon.textContent = step.icon;
          top.appendChild(num);
          top.appendChild(icon);
          
          const h3 = document.createElement('h3');
          h3.textContent = step.title;
          const p = document.createElement('p');
          p.textContent = step.desc;
          
          art.appendChild(top);
          art.appendChild(h3);
          art.appendChild(p);
          stepsGrid.appendChild(art);
        });
      }

      const faqList = document.querySelector('[data-contacts-faq-list]');
      if (faqList && data.faq && Array.isArray(data.faq.items)) {
        faqList.innerHTML = '';
        data.faq.items.forEach(item => {
          const det = document.createElement('details');
          det.className = 'contacts-faq-item';
          const sum = document.createElement('summary');
          sum.textContent = item.question;
          const icon = document.createElement('span');
          icon.className = 'material-symbols-outlined';
          icon.textContent = 'expand_more';
          sum.appendChild(icon);
          const p = document.createElement('p');
          p.textContent = item.answer;
          det.appendChild(sum);
          det.appendChild(p);
          faqList.appendChild(det);
        });
      }
      
      const tgLinks = document.querySelectorAll('[data-contacts-link-tg]');
      tgLinks.forEach(l => l.href = data.hero.tgLink);
      const emailLinks = document.querySelectorAll('[data-contacts-link-email]');
      emailLinks.forEach(l => l.href = data.hero.emailLink);

    } catch (e) {
      console.error('Contacts load error:', e);
    }
  }

  loadContactsContent();
}

document.addEventListener("nav", initContacts);
initContacts();
