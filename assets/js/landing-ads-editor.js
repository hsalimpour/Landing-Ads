 (function() {
    const restRoot =
        (window.landingAdsData && landingAdsData.restUrl) ||
        (window.wpApiSettings && window.wpApiSettings.root) ||
        '/wp-json/';
    const restNonce =
        (window.landingAdsData && landingAdsData.nonce) ||
        (window.wpApiSettings && window.wpApiSettings.nonce) ||
        '';

    function normalizeText(str) {
        return (str || '')
            .toString()
            .toLowerCase()
            .replace(/ي/g, 'ی')
            .replace(/ك/g, 'ک')
            .trim();
    }

    function ensureStyles() {
        if (document.getElementById('landing-ads-modal-style')) {
            return;
        }
        const style = document.createElement('style');
        style.id = 'landing-ads-modal-style';
        style.textContent = `
            .landing-ads-modal{position:fixed;inset:0;background:rgba(0,0,0,0.35);z-index:100000;display:flex;align-items:center;justify-content:center;}
            .landing-ads-modal__dialog{background:#fff;border-radius:12px;max-width:760px;width:92%;box-shadow:0 10px 40px rgba(0,0,0,0.18);overflow:hidden;font-family:inherit;}
            .landing-ads-modal__head{display:flex;align-items:center;justify-content:space-between;padding:14px 16px;border-bottom:1px solid #e9e9e9;}
            .landing-ads-modal__head h3{margin:0;font-size:16px;font-weight:700;}
            .landing-ads-modal__close{border:none;background:transparent;font-size:20px;cursor:pointer;line-height:1;}
            .landing-ads-modal__body{padding:16px;max-height:60vh;overflow-y:auto;}
            .landing-ads-modal__row{margin-bottom:14px;}
            .landing-ads-modal label{display:block;margin-bottom:6px;font-weight:600;}
            .landing-ads-modal input[type="text"], .landing-ads-modal input[type="number"], .landing-ads-modal select{width:100%;padding:10px;border:1px solid #d9d9d9;border-radius:8px;}
            .landing-ads-modal__search{display:flex;gap:8px;align-items:center;}
            .landing-ads-modal__search button{padding:10px 14px;border:none;background:#111;color:#fff;border-radius:8px;cursor:pointer;font-weight:600;}
            .landing-ads-modal__results{border:1px solid #e6e6e6;border-radius:10px;padding:10px;max-height:220px;overflow-y:auto;}
            .landing-ads-modal__result{display:grid;grid-template-columns:auto 1fr auto;align-items:center;gap:8px;padding:8px 6px;border-bottom:1px solid #f1f1f1;}
            .landing-ads-modal__result:last-child{border-bottom:none;}
            .landing-ads-modal__result a{color:#111;text-decoration:none;font-weight:600;}
            .landing-ads-modal__result a:hover{text-decoration:underline;}
            .landing-ads-modal__meta{color:#888;font-size:12px;}
            .landing-ads-modal__actions{display:flex;gap:10px;justify-content:flex-end;padding:14px 16px;border-top:1px solid #e9e9e9;background:#fafafa;}
            .landing-ads-btn{padding:10px 14px;border-radius:8px;border:none;cursor:pointer;font-weight:700;}
            .landing-ads-btn--primary{background:#111;color:#fff;}
            .landing-ads-btn--ghost{background:#fff;border:1px solid #dcdcdc;}
            .landing-ads-hint{font-size:12px;color:#777;margin-top:4px;}
            .landing-ads-modal__grid{display:grid;grid-template-columns:1fr;gap:10px;}
            @media(min-width:720px){.landing-ads-modal__grid{grid-template-columns:1fr 1fr;}}
        `;
        document.head.appendChild(style);
    }

    function fetchContent(type, term) {
        const endpoint = type === 'post' ? '/wp/v2/posts' : '/wp/v2/pages';
        const url = restRoot.replace(/\/$/, '') + endpoint + '?per_page=20&search=' + encodeURIComponent(term || '');
        const headers = restNonce ? { 'X-WP-Nonce': restNonce } : {};
        return (window.wp && wp.apiFetch)
            ? wp.apiFetch({ path: url.replace(restRoot.replace(/\/$/, ''), ''), headers })
            : fetch(url, { headers }).then(function(res) {
                  if (!res.ok) {
                      throw new Error(res.statusText || 'خطا در دریافت اطلاعات');
                  }
                  return res.json();
              });
    }

    function renderResults(container, items, selectedIds, term) {
        container.innerHTML = '';
        const normalizedTerm = normalizeText(term || '');
        let list = items || [];

        if (normalizedTerm) {
            list = list.filter(function(item) {
                return normalizeText(item.title && item.title.rendered).includes(normalizedTerm);
            });
        }

        if (!list.length) {
            container.innerHTML = '<div class="landing-ads-hint">نتیجه‌ای یافت نشد.</div>';
            return;
        }

        list.forEach(function(item) {
            const row = document.createElement('div');
            row.className = 'landing-ads-modal__result';

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.value = item.id;
            checkbox.checked = selectedIds.includes(item.id);
            checkbox.addEventListener('change', function() {
                if (checkbox.checked && !selectedIds.includes(item.id)) {
                    selectedIds.push(item.id);
                } else if (!checkbox.checked) {
                    const idx = selectedIds.indexOf(item.id);
                    if (idx > -1) {
                        selectedIds.splice(idx, 1);
                    }
                }
            });

            const info = document.createElement('div');
            info.innerHTML = '<a href="' + item.link + '" target="_blank" rel="noopener noreferrer">' + item.title.rendered + '</a>' +
                '<div class="landing-ads-modal__meta">ID: ' + item.id + '</div>';

            const meta = document.createElement('div');
            meta.className = 'landing-ads-modal__meta';

            row.appendChild(checkbox);
            row.appendChild(info);
            row.appendChild(meta);
            container.appendChild(row);
        });
    }

    function openModal(editor) {
        ensureStyles();
        const overlay = document.createElement('div');
        overlay.className = 'landing-ads-modal';

        const dialog = document.createElement('div');
        dialog.className = 'landing-ads-modal__dialog';
        dialog.innerHTML = '' +
            '<div class="landing-ads-modal__head">' +
            '<h3>افزودن شورت‌کد لندینگ</h3>' +
            '<button class="landing-ads-modal__close" aria-label="بستن">×</button>' +
            '</div>' +
            '<div class="landing-ads-modal__body">' +
            '<div class="landing-ads-modal__grid">' +
            '<div class="landing-ads-modal__row">' +
            '<label>جستجو برگه‌ها</label>' +
            '<div class="landing-ads-modal__search">' +
            '<input type="text" class="landing-ads-search-input-page" placeholder="مثال: سئو">' +
            '<button type="button" class="landing-ads-search-btn-page">جستجو</button>' +
            '</div>' +
            '<div class="landing-ads-hint">صفحات (برگه) مورد نظر را انتخاب کنید.</div>' +
            '<div class="landing-ads-modal__results landing-ads-results-page">در حال آماده‌سازی...</div>' +
            '</div>' +
            '<div class="landing-ads-modal__row">' +
            '<label>جستجو نوشته‌ها</label>' +
            '<div class="landing-ads-modal__search">' +
            '<input type="text" class="landing-ads-search-input-post" placeholder="مثال: محتوا">' +
            '<button type="button" class="landing-ads-search-btn-post">جستجو</button>' +
            '</div>' +
            '<div class="landing-ads-hint">نوشته‌های مورد نظر را انتخاب کنید.</div>' +
            '<div class="landing-ads-modal__results landing-ads-results-post">در حال آماده‌سازی...</div>' +
            '</div>' +
            '</div>' +
            '<div class="landing-ads-modal__row">' +
            '<label>تعداد پیش‌فرض (در صورت نبود لیست مشخص)</label>' +
            '<input type="number" min="1" value="3" class="landing-ads-count-input">' +
            '</div>' +
            '<div class="landing-ads-modal__row">' +
            '<label>Target</label>' +
            '<select class="landing-ads-target-input">' +
            '<option value="_self">_self</option>' +
            '<option value="_blank">_blank</option>' +
            '</select>' +
            '</div>' +
            '</div>' +
            '<div class="landing-ads-modal__actions">' +
            '<button type="button" class="landing-ads-btn landing-ads-btn--ghost landing-ads-cancel">انصراف</button>' +
            '<button type="button" class="landing-ads-btn landing-ads-btn--primary landing-ads-insert">درج شورت‌کد</button>' +
            '</div>';

        overlay.appendChild(dialog);
        document.body.appendChild(overlay);

        const resultsPage = dialog.querySelector('.landing-ads-results-page');
        const resultsPost = dialog.querySelector('.landing-ads-results-post');
        const searchInputPage = dialog.querySelector('.landing-ads-search-input-page');
        const searchBtnPage = dialog.querySelector('.landing-ads-search-btn-page');
        const searchInputPost = dialog.querySelector('.landing-ads-search-input-post');
        const searchBtnPost = dialog.querySelector('.landing-ads-search-btn-post');
        const countInput = dialog.querySelector('.landing-ads-count-input');
        const targetInput = dialog.querySelector('.landing-ads-target-input');
        const selectedIds = [];

        function closeModal() {
            document.body.removeChild(overlay);
        }

        dialog.querySelector('.landing-ads-modal__close').addEventListener('click', closeModal);
        dialog.querySelector('.landing-ads-cancel').addEventListener('click', closeModal);

        dialog.querySelector('.landing-ads-insert').addEventListener('click', function() {
            const ids = selectedIds.join(',');
            const count = parseInt(countInput.value, 10);
            const attrs = [];

            if (ids) {
                attrs.push('pages="' + ids + '"');
            }

            if (!isNaN(count) && count > 0) {
                attrs.push('count="' + count + '"');
            }

            const targetVal = targetInput.value === '_blank' ? '_blank' : '_self';
            attrs.push('target="' + targetVal + '"');

            const shortcode = '[landing_ads ' + attrs.join(' ') + ']';
            editor.insertContent(shortcode);
            closeModal();
        });

        function doSearch(type, inputEl, container) {
            container.innerHTML = 'در حال جستجو...';
            const term = inputEl.value || '';
            fetchContent(type, term)
                .then(function(items) {
                    renderResults(container, items, selectedIds, term);
                })
                .catch(function(err) {
                    container.innerHTML = '<div class="landing-ads-hint">خطا: ' + (err.message || err) + '</div>';
                });
        }

        searchBtnPage.addEventListener('click', function() {
            doSearch('page', searchInputPage, resultsPage);
        });
        searchBtnPost.addEventListener('click', function() {
            doSearch('post', searchInputPost, resultsPost);
        });

        // بارگیری اولیه بدون فیلتر
        doSearch('page', searchInputPage, resultsPage);
        doSearch('post', searchInputPost, resultsPost);
    }

    tinymce.PluginManager.add('landing_ads', function(editor) {
        editor.addButton('landing_ads_button', {
            text: 'افزودن کد کوتاه لندینگ',
            icon: false,
            onclick: function() {
                openModal(editor);
            },
        });
    });
})();
