(function() {
    function initSliders() {
        var wraps = document.querySelectorAll('.landing-ads-wrap');
        var isMobile = window.innerWidth <= 768;

        wraps.forEach(function(wrap) {
            var cards = wrap.querySelectorAll('.landing-ads-card');
            if (!cards.length) {
                return;
            }

            // اگر از قبل فعال شده و هنوز موبایل است، رد شو
            if (isMobile && wrap.dataset.sliderInit === '1') {
                return;
            }

            // اگر قبلا فعال بوده و حالا دسکتاپ شد، پاکسازی
            if (!isMobile && wrap.dataset.sliderInit === '1') {
                destroySlider(wrap);
                return;
            }

            if (isMobile && cards.length > 1) {
                activateSlider(wrap, cards);
            } else if (!isMobile && wrap.dataset.sliderInit === '1') {
                destroySlider(wrap);
            }
        });
    }

    function activateSlider(wrap, cards) {
        wrap.dataset.sliderInit = '1';
        var index = 0;

        cards.forEach(function(card, idx) {
            card.classList.toggle('is-active', idx === 0);
        });

        var nav = document.createElement('div');
        nav.className = 'landing-ads-slider-nav';
        var prevBtn = document.createElement('button');
        prevBtn.type = 'button';
        prevBtn.innerText = '‹';
        var nextBtn = document.createElement('button');
        nextBtn.type = 'button';
        nextBtn.innerText = '›';
        nav.appendChild(prevBtn);
        nav.appendChild(nextBtn);
        wrap.appendChild(nav);

        function updateButtons() {
            prevBtn.disabled = index === 0;
            nextBtn.disabled = index === cards.length - 1;
        }

        function setSlide(newIndex) {
            if (newIndex < 0 || newIndex >= cards.length) {
                return;
            }
            cards[index].classList.remove('is-active');
            index = newIndex;
            cards[index].classList.add('is-active');
            updateButtons();
        }

        prevBtn.addEventListener('click', function() {
            setSlide(index - 1);
        });
        nextBtn.addEventListener('click', function() {
            setSlide(index + 1);
        });

        updateButtons();
    }

    function destroySlider(wrap) {
        wrap.dataset.sliderInit = '';
        var cards = wrap.querySelectorAll('.landing-ads-card');
        cards.forEach(function(card) {
            card.classList.remove('is-active');
            card.style.display = '';
        });
        var nav = wrap.querySelector('.landing-ads-slider-nav');
        if (nav) {
            nav.remove();
        }
    }

    document.addEventListener('DOMContentLoaded', initSliders);
    window.addEventListener('resize', debounce(initSliders, 200));

    function debounce(fn, wait) {
        var t;
        return function() {
            clearTimeout(t);
            t = setTimeout(fn, wait);
        };
    }
})();
