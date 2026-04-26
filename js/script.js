// 轮播图功能
function initCarousel() {
    const slides = document.querySelectorAll('.carousel-slide');
    const indicators = document.querySelectorAll('.indicator');
    const prevBtn = document.querySelector('.carousel-prev');
    const nextBtn = document.querySelector('.carousel-next');
    
    if (!slides.length || !indicators.length) return;
    
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

    let autoplayInterval = setInterval(nextSlide, 4000);

    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            clearInterval(autoplayInterval);
            prevSlide();
            autoplayInterval = setInterval(nextSlide, 4000);
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            clearInterval(autoplayInterval);
            nextSlide();
            autoplayInterval = setInterval(nextSlide, 4000);
        });
    }

    indicators.forEach((indicator, index) => {
        indicator.addEventListener('click', () => {
            clearInterval(autoplayInterval);
            currentIndex = index;
            showSlide(currentIndex);
            autoplayInterval = setInterval(nextSlide, 4000);
        });
    });
}

// 展开/收起功能
function initExpandButtons() {
    const expandBtns = document.querySelectorAll('.expand-btn');
    
    expandBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const description = this.previousElementSibling;
            if (description.classList.contains('expanded')) {
                description.classList.remove('expanded');
                this.textContent = '展开';
            } else {
                description.classList.add('expanded');
                this.textContent = '收起';
            }
        });
    });
}

// 电影数据处理功能
function initMovieData() {
    let movies = [];
    let dataLoaded = false;
    
    // 拼音首字母映射表
    const pinyinMap = {
        'a': '啊阿吖嗄锕', 'b': '八巴伯扮邦保北贝比必布不部步',
        'c': '擦参苍操曹测侧层此次从粗窜措错',
        'd': '搭打大呆带丹当道得灯低底地弟点电定东斗独读肚端对队多夺',
        'e': '额俄罗斯鳄诶',
        'f': '发法番方芳房非分佛夫服福抚府复负附覆',
        'g': '嘎嘎高歌个给根工功共狗构谷股骨故固挂乖管光广贵桂国过',
        'h': '哈孩海汉好合和何荷黑很红后护虎沪滑化划话环黄灰回活火或货获',
        'i': 'i',
        'j': '击机积基及级几记济既继季加叫角街教节杰洁结姐救JU',
        'k': '卡咖开康烤靠科可克刻空口苦裤快块夸跨',
        'l': '拉啦辣来蓝老乐累理力历连梁良两量亮辽疗聊了列林零领六龙楼路露绿陆旅率略',
        'm': '妈马吗嘛满慢忙猫毛冒贸梅每美妹门们迷米密免面民明命母木目拿哪那娜纳乃奶男呢能你nian娘宁牛农女暖诺',
        'o': '哦欧',
        'p': '拍派攀配片票漂飘贫品普',
        'q': '七期戚妻其奇骑起弃气汽器恰洽前钱强墙悄桥巧切且侵亲秋球求区曲去趣全群',
        'r': '然让绕热任认日荣容肉如入软锐润',
        's': '撒萨赛三桑扫色沙山伤商少社设舍射涉摄身深神审甚渗石时使始世市事室视收手守首寿受数书树双谁水顺思死四似松宋送诉肃速算虽随碎岁所',
        't': '他她它台太态弹谈汤糖逃桃特疼提体天田条铁听停通同头图土团推腿托外部玩完万往网望忘危为位文问屋五武舞务物X相',
        'x': '西希息习系细夏先显想项响像向校笑效些协写谢新鑫心辛星兴刑行形型姓休修秀袖需徐许',
        'y': '丫压呀押鸭牙芽牙岩延言研演阳央养样药要耀也夜叶业一伊医依衣姨移遗仪宜已以亿义易艺译异伊因银音引印英影永用由游有友又右予预域欲',
        'z': '扎咱杂在再早枣造噪责增扎渣闸咋张着找照者这真正政郑知之职直植止至治中钟州周洲主著柱住祝注驻转专砖赚妆追坠准子字自总走足租族阻组祖钻最昨左作坐座做'
    };
    
    // 转换中文为拼音首字母
    function getPinyinInitial(text) {
        let result = '';
        for (let char of text) {
            const code = char.charCodeAt(0);
            if (code >= 0x4e00 && code <= 0x9fa5) {
                for (let [initial, chars] of Object.entries(pinyinMap)) {
                    if (chars.includes(char)) {
                        result += initial;
                        break;
                    }
                }
            } else if (/[a-zA-Z]/.test(char)) {
                result += char.toLowerCase();
            }
        }
        return result;
    }
    
    // 加载电影数据
    async function loadMovies() {
        if (dataLoaded) return movies;
        
        try {
            console.log('开始加载电影数据...');
            
            // 从douban_top250.json文件读取数据
            const response = await fetch('../json/douban_top250.json');
            
            // 检查响应状态
            if (!response.ok) {
                throw new Error(`HTTP错误: ${response.status} ${response.statusText}`);
            }
            
            // 解析JSON数据
            const rawData = await response.json();
            
            // 验证数据格式
            if (!Array.isArray(rawData)) {
                throw new Error('JSON数据格式错误：不是数组');
            }
            
            if (rawData.length === 0) {
                throw new Error('JSON数据为空');
            }
            
            // 处理数据，确保所有属性完整
            movies = rawData.map((movie, index) => {
                const rank = parseInt(movie['排名']) || index + 1;
                const title = movie['电影名称'] || movie.title || '未知电影';
                
                // 生成图片路径，格式为：xxx_电影名字.jpg
                const rankStr = rank.toString().padStart(3, '0');
                const imageFileName = `${rankStr}_${title}.jpg`;
                const imagePath = `../images/Douban_Top250_Covers/${imageFileName}`;
                
                // 确保所有必要属性存在
                const processedMovie = {
                    ...movie,
                    rank: rank,
                    title: title,
                    director: movie['导演'] || movie.director || '',
                    cast: movie['主演'] || movie.cast || movie.actors || '',
                    rating: parseFloat(movie['评分']) || parseFloat(movie.rating) || 0,
                    ratingCount: parseInt(movie['评分人数']) || parseInt(movie.ratingCount) || parseInt(movie.reviews_count) || 0,
                    quote: movie['引言'] || movie.quote || '',
                    detailLink: movie['详情链接'] || movie.detailLink || '',
                    year: movie['上映年份'] || movie.year || '',
                    country: movie['国家'] || movie.country || '',
                    genres: movie['类别'] || movie.genres || movie.genre?.split(' ') || [],
                    imageLink: movie['图片链接'] || movie.imageLink || '',
                    imagePath: imagePath,
                    imageFileName: imageFileName,
                    pinyin: getPinyinInitial(title),
                    pinyinInitial: getPinyinInitial(title).charAt(0)
                };
                
                return processedMovie;
            });
            
            dataLoaded = true;
            console.log('成功加载电影数据，共', movies.length, '部电影');
            return movies;
            
        } catch (error) {
            console.error('加载电影数据失败:', error);
            throw error;
        }
    }
    
    // 获取电影数据的方法
    async function getMovies() {
        if (!dataLoaded) {
            await loadMovies();
        }
        return movies;
    }
    
    // 暴露方法
    return {
        loadMovies,
        getMovies,
        isLoaded: () => dataLoaded
    };
}

// 电影榜单功能
function initMovieRankings() {
    const rankingsList = document.getElementById('rankings-list');
    const paginationNumbers = document.querySelector('.pagination-numbers');
    const prevPageBtn = document.getElementById('prev-page');
    const nextPageBtn = document.getElementById('next-page');
    const loading = document.getElementById('loading');
    const searchInput = document.getElementById('movie-search');
    const searchBtn = document.querySelector('.search-btn');
    const clearBtn = document.getElementById('clear-search');
    const searchResultCount = document.getElementById('search-result-count');
    const filterBtns = document.querySelectorAll('.filter-btn');
    
    let movies = [];
    let filteredMovies = [];
    let currentPage = 1;
    const moviesPerPage = 25;
    let totalPages = 10;
    let filters = {
        genre: 'all',
        rating: 'all',
        year: 'all',
        country: 'all',
        ratingCount: 'all',
        rank: 'all'
    };
    let combinationMode = 'and'; // 'and' 或 'or'
    let searchTerm = '';
    let selectedItem = null;
    let searchCache = new Map();
    const SEARCH_DEBOUNCE = 150;
    
    // 初始化电影数据
    const movieData = initMovieData();
    
    // 防抖函数
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
    
    // 高亮文本
    function highlightText(text, keyword) {
        if (!keyword || !text) return text;
        const safeKeyword = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`(${safeKeyword})`, 'gi');
        return text.replace(regex, '<span class="highlight">$1</span>');
    }
    
    // 应用筛选
    function applyFilters() {
        const startTime = performance.now();
        
        filteredMovies = movies.filter(movie => {
            const conditions = [];
            
            // 搜索筛选
            if (searchTerm) {
                const titleMatch = movie.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                  movie.pinyin?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                  movie.pinyinInitial === searchTerm.toLowerCase().charAt(0);
                
                const directorMatch = movie.director?.toLowerCase().includes(searchTerm.toLowerCase());
                const castMatch = movie.cast?.toLowerCase().includes(searchTerm.toLowerCase());
                
                conditions.push(titleMatch || directorMatch || castMatch);
            }
            
            // 类型筛选
            if (filters.genre !== 'all') {
                const genres = Array.isArray(movie.genres) ? movie.genres : (movie.genres || '').split(' ');
                conditions.push(genres.includes(filters.genre));
            }
            
            // 评分筛选
            if (filters.rating !== 'all') {
                const rating = parseFloat(movie.rating);
                let ratingMatch = false;
                switch (filters.rating) {
                    case '9+':
                        ratingMatch = rating >= 9;
                        break;
                    case '8-9':
                        ratingMatch = rating >= 8 && rating < 9;
                        break;
                    case '7-8':
                        ratingMatch = rating >= 7 && rating < 8;
                        break;
                }
                conditions.push(ratingMatch);
            }
            
            // 年份筛选
            if (filters.year !== 'all' && movie.year) {
                const year = parseInt(movie.year);
                let yearMatch = false;
                switch (filters.year) {
                    case '2020-':
                        yearMatch = year >= 2020;
                        break;
                    case '2010-2019':
                        yearMatch = year >= 2010 && year <= 2019;
                        break;
                    case '2000-2009':
                        yearMatch = year >= 2000 && year <= 2009;
                        break;
                    case '1990-1999':
                        yearMatch = year >= 1990 && year <= 1999;
                        break;
                    case '1990-':
                        yearMatch = year < 1990;
                        break;
                }
                conditions.push(yearMatch);
            }
            
            // 国家/地区筛选
            if (filters.country !== 'all') {
                conditions.push(movie.country === filters.country);
            }
            
            // 评分人数筛选
            if (filters.ratingCount !== 'all') {
                const count = parseInt(movie.ratingCount);
                let countMatch = false;
                switch (filters.ratingCount) {
                    case '100万+':
                        countMatch = count >= 1000000;
                        break;
                    case '50万-100万':
                        countMatch = count >= 500000 && count < 1000000;
                        break;
                    case '10万-50万':
                        countMatch = count >= 100000 && count < 500000;
                        break;
                    case '10万-':
                        countMatch = count < 100000;
                        break;
                }
                conditions.push(countMatch);
            }
            
            // 排名范围筛选
            if (filters.rank !== 'all') {
                const rank = movie.rank;
                let rankMatch = false;
                switch (filters.rank) {
                    case 'top50':
                        rankMatch = rank <= 50;
                        break;
                    case 'top100':
                        rankMatch = rank <= 100;
                        break;
                    case 'top150':
                        rankMatch = rank <= 150;
                        break;
                    case 'top200':
                        rankMatch = rank <= 200;
                        break;
                }
                conditions.push(rankMatch);
            }
            
            // 应用筛选组合逻辑
            if (conditions.length === 0) {
                return true;
            }
            
            if (combinationMode === 'and') {
                return conditions.every(condition => condition);
            } else {
                return conditions.some(condition => condition);
            }
        });
        
        // 重新计算总页数
        totalPages = Math.ceil(filteredMovies.length / moviesPerPage);
        currentPage = Math.min(currentPage, Math.max(1, totalPages));
        
        // 更新搜索结果数量
        if (searchResultCount) {
            if (searchTerm) {
                searchResultCount.textContent = `找到 ${filteredMovies.length} 部符合条件的电影`;
            } else {
                searchResultCount.textContent = '';
            }
        }
        
        renderMovies();
        renderPagination();
        
        const endTime = performance.now();
        console.log(`筛选耗时: ${endTime - startTime}ms`);
    }
    
    // 渲染电影列表
    function renderMovies() {
        if (!rankingsList) return;
        
        const startIndex = (currentPage - 1) * moviesPerPage;
        const endIndex = startIndex + moviesPerPage;
        const pageMovies = filteredMovies.slice(startIndex, endIndex);
        
        if (pageMovies.length === 0) {
            rankingsList.innerHTML = '<p style="text-align: center; padding: 40px;">没有找到符合条件的电影</p>';
            return;
        }
        
        rankingsList.innerHTML = pageMovies.map(movie => {
            // 生成星级评分
            const rating = parseFloat(movie.rating);
            const fullStars = Math.floor(rating);
            const halfStar = rating - fullStars >= 0.5;
            let starsHtml = '';
            for (let i = 0; i < 5; i++) {
                if (i < fullStars) {
                    starsHtml += '★';
                } else if (i === fullStars && halfStar) {
                    starsHtml += '★';
                } else {
                    starsHtml += '☆';
                }
            }
            
            // 模拟引用语数据
            const quotes = [
                "希望让人自由。",
                "风华绝代。",
                "生命就像一盒巧克力，结果往往出人意料。",
                "有些鸟儿是关不住的。",
                "真正的爱情是永恒的。"
            ];
            const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
            
            return `
                <div class="ranking-item" data-rank="${movie.rank}">
                    <div class="ranking-number">${movie.rank}</div>
                    <div class="poster-container">
                        <a href="${movie.detailLink}" target="_blank" rel="noopener noreferrer">
                            <img 
                                src="${movie.imagePath}" 
                                alt="${movie.title}" 
                                class="ranking-poster"
                                data-fallback="${movie.imageLink || `../images/ranking${movie.rank}.jpg`}"
                                onError="this.onerror=null; const fallback = this.getAttribute('data-fallback'); if(fallback) { this.src = fallback; this.removeAttribute('data-fallback'); } else { this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22100%22 height=%22150%22 viewBox=%220 0 100 150%22%3E%3Crect width=%22100%22 height=%22150%22 fill=%22%23333%22/%3E%3Ctext x=%2250%22 y=%2280%22 text-anchor=%22middle%22 fill=%22%23666%22 font-size=%2212%22%3E暂无海报%3C/text%3E%3C/svg%3E'; }"
                            >
                        </a>
                    </div>
                    <div class="ranking-info">
                        <h4 class="ranking-title">
                            ${highlightText(movie.title, searchTerm)}
                        </h4>
                        <p class="ranking-director">导演：${highlightText(movie.director, searchTerm)}</p>
                        <p class="ranking-actors">主演：${highlightText(movie.cast || '暂无', searchTerm)}</p>
                        <p class="ranking-genre-year">${movie.year || '未知'} / ${movie.country || '未知'} / ${Array.isArray(movie.genres) ? movie.genres.join(' ') : movie.genres || '未知'}</p>
                        <div class="ranking-rating">
                            <span class="stars">${starsHtml}</span>
                            <span class="rating-score">${movie.rating}</span>
                            <span class="rating-votes">${movie.ratingCount}人评价</span>
                        </div>
                        ${movie.quote ? `<p class="ranking-quote">${movie.quote}</p>` : ''}
                        ${movie.detailLink ? `<a href="${movie.detailLink}" target="_blank" rel="noopener noreferrer" class="detail-link">查看详情</a>` : ''}
                    </div>
                </div>
            `;
        }).join('');
        
        // 添加点击事件
        const items = rankingsList.querySelectorAll('.ranking-item');
        items.forEach(item => {
            item.addEventListener('click', function() {
                if (selectedItem) {
                    selectedItem.classList.remove('selected');
                }
                this.classList.add('selected');
                selectedItem = this;
            });
        });
    }
    
    // 渲染分页控件
    function renderPagination() {
        if (!paginationNumbers) return;
        
        paginationNumbers.innerHTML = '';
        
        const maxVisiblePages = 5;
        let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
        
        if (endPage - startPage < maxVisiblePages - 1) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }
        
        for (let i = startPage; i <= endPage; i++) {
            const pageBtn = document.createElement('button');
            pageBtn.className = `pagination-number ${i === currentPage ? 'active' : ''}`;
            pageBtn.textContent = i;
            pageBtn.addEventListener('click', () => {
                currentPage = i;
                renderMovies();
                renderPagination();
            });
            paginationNumbers.appendChild(pageBtn);
        }
        
        // 更新上一页/下一页按钮状态
        if (prevPageBtn) {
            prevPageBtn.disabled = currentPage === 1;
        }
        if (nextPageBtn) {
            nextPageBtn.disabled = currentPage === totalPages;
        }
    }
    
    // 处理搜索
    const handleSearch = debounce(() => {
        searchTerm = searchInput.value.trim();
        currentPage = 1;
        searchCache.clear();
        applyFilters();
    }, SEARCH_DEBOUNCE);
    
    // 事件监听
    if (searchBtn) {
        searchBtn.addEventListener('click', () => {
            searchTerm = searchInput.value.trim();
            currentPage = 1;
            searchCache.clear();
            applyFilters();
        });
    }
    
    if (searchInput) {
        searchInput.addEventListener('input', handleSearch);
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                searchTerm = searchInput.value.trim();
                currentPage = 1;
                searchCache.clear();
                applyFilters();
            }
        });
    }
    
    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            searchInput.value = '';
            searchTerm = '';
            currentPage = 1;
            searchCache.clear();
            applyFilters();
            clearBtn.style.display = 'none';
        });
    }
    
    // 监听搜索输入框显示/隐藏清除按钮
    if (searchInput) {
        searchInput.addEventListener('input', () => {
            if (clearBtn) {
                clearBtn.style.display = searchInput.value ? 'block' : 'none';
            }
        });
    }
    
    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const filterType = this.dataset.filter;
            const filterValue = this.dataset.value;
            
            // 移除同组其他按钮的活跃状态
            const siblings = this.parentElement.querySelectorAll('.filter-btn');
            siblings.forEach(sibling => sibling.classList.remove('active'));
            
            // 添加当前按钮的活跃状态
            this.classList.add('active');
            
            // 更新筛选条件
            filters[filterType] = filterValue;
            currentPage = 1;
            searchCache.clear();
            applyFilters();
        });
    });
    
    // 监听筛选组合模式切换
    const combinationRadios = document.querySelectorAll('input[name="combination"]');
    combinationRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            combinationMode = this.value;
            currentPage = 1;
            searchCache.clear();
            applyFilters();
        });
    });
    
    // 保存筛选条件
    const saveFiltersBtn = document.getElementById('save-filters');
    if (saveFiltersBtn) {
        saveFiltersBtn.addEventListener('click', function() {
            const filterState = {
                filters: filters,
                combinationMode: combinationMode,
                searchTerm: searchTerm
            };
            localStorage.setItem('movieFilters', JSON.stringify(filterState));
            alert('筛选条件已保存');
        });
    }
    
    // 加载筛选条件
    const loadFiltersBtn = document.getElementById('load-filters');
    if (loadFiltersBtn) {
        loadFiltersBtn.addEventListener('click', function() {
            const savedFilters = localStorage.getItem('movieFilters');
            if (savedFilters) {
                const filterState = JSON.parse(savedFilters);
                filters = filterState.filters;
                combinationMode = filterState.combinationMode || 'and';
                searchTerm = filterState.searchTerm || '';
                
                // 更新搜索输入框
                if (searchInput) {
                    searchInput.value = searchTerm;
                    if (clearBtn) {
                        clearBtn.style.display = searchTerm ? 'block' : 'none';
                    }
                }
                
                // 更新筛选按钮状态
                document.querySelectorAll('.filter-btn').forEach(btn => {
                    const filterType = btn.dataset.filter;
                    const filterValue = btn.dataset.value;
                    if (filters[filterType] === filterValue) {
                        btn.classList.add('active');
                    } else {
                        btn.classList.remove('active');
                    }
                });
                
                // 更新组合模式
                document.querySelector(`input[name="combination"][value="${combinationMode}"]`).checked = true;
                
                currentPage = 1;
                searchCache.clear();
                applyFilters();
                alert('筛选条件已加载');
            } else {
                alert('没有保存的筛选条件');
            }
        });
    }
    
    // 重置所有筛选条件
    const resetFiltersBtn = document.getElementById('reset-filters');
    if (resetFiltersBtn) {
        resetFiltersBtn.addEventListener('click', function() {
            // 重置筛选条件
            filters = {
                genre: 'all',
                rating: 'all',
                year: 'all',
                country: 'all',
                ratingCount: 'all',
                rank: 'all'
            };
            combinationMode = 'and';
            searchTerm = '';
            
            // 更新搜索输入框
            if (searchInput) {
                searchInput.value = '';
                if (clearBtn) {
                    clearBtn.style.display = 'none';
                }
            }
            
            // 更新筛选按钮状态
            document.querySelectorAll('.filter-btn').forEach(btn => {
                if (btn.dataset.value === 'all') {
                    btn.classList.add('active');
                } else {
                    btn.classList.remove('active');
                }
            });
            
            // 更新组合模式
            document.querySelector('input[name="combination"][value="and"]').checked = true;
            
            currentPage = 1;
            searchCache.clear();
            applyFilters();
            alert('所有筛选条件已重置');
        });
    }
    
    if (prevPageBtn) {
        prevPageBtn.addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                renderMovies();
                renderPagination();
            }
        });
    }
    
    if (nextPageBtn) {
        nextPageBtn.addEventListener('click', () => {
            if (currentPage < totalPages) {
                currentPage++;
                renderMovies();
                renderPagination();
            }
        });
    }
    
    // 初始化加载数据
    async function init() {
        if (loading) {
            loading.style.display = 'flex';
        }
        
        try {
            movies = await movieData.loadMovies();
            applyFilters();
        } catch (error) {
            console.error('初始化电影数据失败:', error);
            if (rankingsList) {
                rankingsList.innerHTML = `<p style="text-align: center; padding: 40px; color: #e50914;">加载电影数据失败：${error.message}</p>`;
            }
        } finally {
            if (loading) {
                loading.style.display = 'none';
            }
        }
    }
    
    init();
}

function initactors(){
    const source1=["../images/actors/a1-stage-photo1.jpg", "../images/actors/a1-stage-photo2.jpg", "../images/actors/a1-stage-photo3.jpg", "../images/actors/a1-stage-photo3.jpg", "../images/actors/a1-stage-photo4.jpg", "../images/actors/a1-stage-photo5.jpg", "../images/actors/a1-stage-photo6.jpg", "../images/actors/a1-stage-photo7.jpg", "../images/actors/a1-stage-photo8.jpg", "../images/actors/a1-stage-photo9.jpg", "../images/actors/a1-stage-photo10.jpg"];
    const source2=["../images/actors/a2-stage-photo1.jpg","../images/actors/a2-stage-photo2.jpg","../images/actors/a2-stage-photo3.jpg","../images/actors/a2-stage-photo4.jpg"];
    function initCarousel2(imgid,sources,interval=2000){
        let index=0;
        document.getElementById(imgid).src=sources[index];
        setInterval(function(){
            index++;
            if(index>=sources.length){
                index=0;
            }
            document.getElementById(imgid).src=sources[index];
        },interval);

    }
    initCarousel2("stage-photo1",source1);
    initCarousel2("stage-photo2",source2);


    const actorbios = document.querySelectorAll('.actor-bio');
    actorbios.forEach(bio => {
        const toggleText = bio.querySelector('.toggle-text');
        const textContent=bio.querySelector('.bio-text');
        toggleText.addEventListener('click', () => {
        textContent.classList.toggle('expanded');

        toggleText.textContent = textContent.classList.contains('expanded') ? '收起' : '展开';
        });
    });




    // 找到每一个独立演员分页区块
    const actorSections = document.querySelectorAll('.actor-movies-module');

    actorSections.forEach(container => {
        // 当前区块内部去找页面、按钮
        const pages = container.querySelectorAll('.movie-page');
        const prevBtn = container.querySelector('.prev-btn');
        const nextBtn = container.querySelector('.next-btn');
        const pageInfo = container.querySelector('.page-info');

        let currentPage = 1;
        const totalPages = pages.length;

        function showPage(pageNum) {
            pages.forEach(page => page.classList.remove('active'));
            const targetPage = container.querySelector(`.movie-page[data-page="${pageNum}"]`);
            if(targetPage){
                targetPage.classList.add('active');
            }
            pageInfo.textContent = `${pageNum}/${totalPages}`;
            prevBtn.classList.toggle('disabled', pageNum === 1);
            nextBtn.classList.toggle('disabled', pageNum === totalPages);
        }

        prevBtn.addEventListener('click', function () {
            if (currentPage > 1) {
                currentPage--;
                showPage(currentPage);
            }
        });

        nextBtn.addEventListener('click', function () {
            if (currentPage < totalPages) {
                currentPage++;
                showPage(currentPage);
            }
        });

        // 初始显示第一页
        showPage(1);
    });

}


// 页面加载完成后初始化所有功能
document.addEventListener('DOMContentLoaded', function() {
    initCarousel();
    initExpandButtons();
    initMovieRankings();
    initactors();
});
