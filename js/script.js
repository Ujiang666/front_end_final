// 轮播图功能
function initCarousel() {
    const slides = document.querySelectorAll('.carousel-slide');
    const indicators = document.querySelectorAll('.indicator');
    const prevBtn = document.querySelector('.carousel-prev');
    const nextBtn = document.querySelector('.carousel-next');
    let currentIndex = 0;
    const slideCount = slides.length;

    function showSlide(index) {
        slides.forEach((slide, i) => {
            slide.classList.remove('active');
            indicators[i].classList.remove('active');
        });
        slides[index].classList.add('active');
        indicators[index].classList.add('active');
    }

    function nextSlide() {
        currentIndex = (currentIndex + 1) % slideCount;
        showSlide(currentIndex);
    }

    function prevSlide() {
        currentIndex = (currentIndex - 1 + slideCount) % slideCount;
        showSlide(currentIndex);
    }

    // 自动轮播
    let autoplayInterval = setInterval(nextSlide, 4000);

    // 事件监听
    prevBtn.addEventListener('click', () => {
        clearInterval(autoplayInterval);
        prevSlide();
        autoplayInterval = setInterval(nextSlide, 4000);
    });

    nextBtn.addEventListener('click', () => {
        clearInterval(autoplayInterval);
        nextSlide();
        autoplayInterval = setInterval(nextSlide, 4000);
    });

    indicators.forEach((indicator, index) => {
        indicator.addEventListener('click', () => {
            clearInterval(autoplayInterval);
            currentIndex = index;
            showSlide(currentIndex);
            autoplayInterval = setInterval(nextSlide, 4000);
        });
    });
}

// 经典电影页面的展开/收起功能
function initExpandButtons() {
    const expandBtns = document.querySelectorAll('.expand-btn');
    
    expandBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const descriptionText = this.previousElementSibling;
            
            if (descriptionText.classList.contains('expanded')) {
                descriptionText.classList.remove('expanded');
                this.textContent = '展开';
            } else {
                descriptionText.classList.add('expanded');
                this.textContent = '收起';
            }
        });
    });
}

// 电影搜索功能
function initSearch() {
    const searchInput = document.getElementById('movie-search');
    const searchBtn = document.querySelector('.search-btn');
    const rankingItems = document.querySelectorAll('.ranking-item');
    
    function searchMovies() {
        const searchTerm = searchInput.value.toLowerCase();
        
        rankingItems.forEach(item => {
            const movieTitle = item.querySelector('.ranking-title').textContent.toLowerCase();
            if (movieTitle.includes(searchTerm)) {
                item.style.display = 'flex';
            } else {
                item.style.display = 'none';
            }
        });
    }
    
    if (searchBtn) {
        searchBtn.addEventListener('click', searchMovies);
    }
    
    if (searchInput) {
        searchInput.addEventListener('input', searchMovies);
    }
}

// 筛选功能
function initFilters() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    
    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // 移除同组其他按钮的活跃状态
            const parent = this.parentElement;
            const siblings = parent.querySelectorAll('.filter-btn');
            siblings.forEach(sibling => sibling.classList.remove('active'));
            
            // 添加当前按钮的活跃状态
            this.classList.add('active');
            
            // 这里可以添加实际的筛选逻辑
            console.log('筛选:', this.textContent);
        });
    });
}

// 页面加载完成后初始化所有功能
document.addEventListener('DOMContentLoaded', function() {
    initCarousel();
    initExpandButtons();
    initSearch();
    initFilters();
});