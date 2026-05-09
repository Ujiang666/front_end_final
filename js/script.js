// 轮播图功能
function initCarousel() {
  const slides = document.querySelectorAll(".carousel-slide");
  const indicators = document.querySelectorAll(".indicator");
  const prevBtn = document.querySelector(".carousel-prev");
  const nextBtn = document.querySelector(".carousel-next");

  if (!slides.length || !indicators.length) return;

  let currentIndex = 0;
  const slideCount = slides.length;

  function showSlide(index) {
    slides.forEach((slide, i) => {
      slide.classList.remove("active");
      indicators[i].classList.remove("active");
    });
    slides[index].classList.add("active");
    indicators[index].classList.add("active");
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
    prevBtn.addEventListener("click", () => {
      clearInterval(autoplayInterval);
      prevSlide();
      autoplayInterval = setInterval(nextSlide, 4000);
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener("click", () => {
      clearInterval(autoplayInterval);
      nextSlide();
      autoplayInterval = setInterval(nextSlide, 4000);
    });
  }

  indicators.forEach((indicator, index) => {
    indicator.addEventListener("click", () => {
      clearInterval(autoplayInterval);
      currentIndex = index;
      showSlide(currentIndex);
      autoplayInterval = setInterval(nextSlide, 4000);
    });
  });
}

// 展开/收起功能
function initExpandButtons() {
  const expandBtns = document.querySelectorAll(".expand-btn");

  expandBtns.forEach((btn) => {
    btn.addEventListener("click", function () {
      const description = this.previousElementSibling;
      if (description.classList.contains("expanded")) {
        description.classList.remove("expanded");
        this.textContent = "展开";
      } else {
        description.classList.add("expanded");
        this.textContent = "收起";
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
    a: "啊阿吖嗄锕",
    b: "八巴伯扮邦保北贝比必布不部步",
    c: "擦参苍操曹测侧层此次从粗窜措错",
    d: "搭打大呆带丹当道得灯低底地弟点电定东斗独读肚端对队多夺",
    e: "额俄罗斯鳄诶",
    f: "发法番方芳房非分佛夫服福抚府复负附覆",
    g: "嘎嘎高歌个给根工功共狗构谷股骨故固挂乖管光广贵桂国过",
    h: "哈孩海汉好合和何荷黑很红后护虎沪滑化划话环黄灰回活火或货获",
    i: "i",
    j: "击机积基及级几记济既继季加叫角街教节杰洁结姐救JU",
    k: "卡咖开康烤靠科可克刻空口苦裤快块夸跨",
    l: "拉啦辣来蓝老乐累理力历连梁良两量亮辽疗聊了列林零领六龙楼路露绿陆旅率略",
    m: "妈马吗嘛满慢忙猫毛冒贸梅每美妹门们迷米密免面民明命母木目拿哪那娜纳乃奶男呢能你nian娘宁牛农女暖诺",
    o: "哦欧",
    p: "拍派攀配片票漂飘贫品普",
    q: "七期戚妻其奇骑起弃气汽器恰洽前钱强墙悄桥巧切且侵亲秋球求区曲去趣全群",
    r: "然让绕热任认日荣容肉如入软锐润",
    s: "撒萨赛三桑扫色沙山伤商少社设舍射涉摄身深神审甚渗石时使始世市事室视收手守首寿受数书树双谁水顺思死四似松宋送诉肃速算虽随碎岁所",
    t: "他她它台太态弹谈汤糖逃桃特疼提体天田条铁听停通同头图土团推腿托外部玩完万往网望忘危为位文问屋五武舞务物X相",
    x: "西希息习系细夏先显想项响像向校笑效些协写谢新鑫心辛星兴刑行形型姓休修秀袖需徐许",
    y: "丫压呀押鸭牙芽牙岩延言研演阳央养样药要耀也夜叶业一伊医依衣姨移遗仪宜已以亿义易艺译异伊因银音引印英影永用由游有友又右予预域欲",
    z: "扎咱杂在再早枣造噪责增扎渣闸咋张着找照者这真正政郑知之职直植止至治中钟州周洲主著柱住祝注驻转专砖赚妆追坠准子字自总走足租族阻组祖钻最昨左作坐座做",
  };

  // 转换中文为拼音首字母
  function getPinyinInitial(text) {
    let result = "";
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
      console.log("开始加载电影数据...");

      // 从douban_top250.json文件读取数据
      const response = await fetch("../json/douban_top250.json");

      // 检查响应状态
      if (!response.ok) {
        throw new Error(`HTTP错误: ${response.status} ${response.statusText}`);
      }

      // 解析JSON数据
      const rawData = await response.json();

      // 验证数据格式
      if (!Array.isArray(rawData)) {
        throw new Error("JSON数据格式错误：不是数组");
      }

      if (rawData.length === 0) {
        throw new Error("JSON数据为空");
      }

      // 处理数据，确保所有属性完整
      movies = rawData.map((movie, index) => {
        const rank = parseInt(movie["排名"]) || index + 1;
        const title = movie["电影名称"] || movie.title || "未知电影";

        // 生成图片路径，格式为：xxx_电影名字.jpg
        const rankStr = rank.toString().padStart(3, "0");
        const imageFileName = `${rankStr}_${title}.jpg`;
        const imagePath = `../images/Douban_Top250_Covers/${imageFileName}`;

        // 确保所有必要属性存在
        const processedMovie = {
          ...movie,
          rank: rank,
          title: title,
          director: movie["导演"] || movie.director || "",
          cast: movie["主演"] || movie.cast || movie.actors || "",
          rating: parseFloat(movie["评分"]) || parseFloat(movie.rating) || 0,
          ratingCount:
            parseInt(movie["评分人数"]) ||
            parseInt(movie.ratingCount) ||
            parseInt(movie.reviews_count) ||
            0,
          quote: movie["引言"] || movie.quote || "",
          detailLink: movie["详情链接"] || movie.detailLink || "",
          year: movie["上映年份"] || movie.year || "",
          country: movie["国家"] || movie.country || "",
          genres:
            movie["类别"] || movie.genres || movie.genre?.split(" ") || [],
          imageLink: movie["图片链接"] || movie.imageLink || "",
          imagePath: imagePath,
          imageFileName: imageFileName,
          pinyin: getPinyinInitial(title),
          pinyinInitial: getPinyinInitial(title).charAt(0),
        };

        return processedMovie;
      });

      dataLoaded = true;
      console.log("成功加载电影数据，共", movies.length, "部电影");
      return movies;
    } catch (error) {
      console.error("加载电影数据失败:", error);
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
    isLoaded: () => dataLoaded,
  };
}

// 电影榜单功能
function initMovieRankings() {
  const rankingsList = document.getElementById("rankings-list");
  const paginationNumbers = document.querySelector(".pagination-numbers");
  const prevPageBtn = document.getElementById("prev-page");
  const nextPageBtn = document.getElementById("next-page");
  const loading = document.getElementById("loading");
  const searchInput = document.getElementById("movie-search");
  const searchBtn = document.querySelector(".search-btn");
  const clearBtn = document.getElementById("clear-search");
  const searchResultCount = document.getElementById("search-result-count");
  const filterBtns = document.querySelectorAll(".filter-btn");

  let movies = [];
  let filteredMovies = [];
  let currentPage = 1;
  const moviesPerPage = 25;
  let totalPages = 10;
  let filters = {
    genre: "all",
    rating: "all",
    year: "all",
    country: "all",
    ratingCount: "all",
    rank: "all",
  };
  let combinationMode = "and"; // 'and' 或 'or'
  let searchTerm = "";
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
    const safeKeyword = keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`(${safeKeyword})`, "gi");
    return text.replace(regex, '<span class="highlight">$1</span>');
  }

  // 应用筛选
  function applyFilters() {
    const startTime = performance.now();

    filteredMovies = movies.filter((movie) => {
      const conditions = [];

      // 搜索筛选
      if (searchTerm) {
        const titleMatch =
          movie.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          movie.pinyin?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          movie.pinyinInitial === searchTerm.toLowerCase().charAt(0);

        const directorMatch = movie.director
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase());
        const castMatch = movie.cast
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase());

        conditions.push(titleMatch || directorMatch || castMatch);
      }

      // 类型筛选
      if (filters.genre !== "all") {
        const genres = Array.isArray(movie.genres)
          ? movie.genres
          : (movie.genres || "").split(" ");
        conditions.push(genres.includes(filters.genre));
      }

      // 评分筛选
      if (filters.rating !== "all") {
        const rating = parseFloat(movie.rating);
        let ratingMatch = false;
        switch (filters.rating) {
          case "9+":
            ratingMatch = rating >= 9;
            break;
          case "8-9":
            ratingMatch = rating >= 8 && rating < 9;
            break;
          case "7-8":
            ratingMatch = rating >= 7 && rating < 8;
            break;
        }
        conditions.push(ratingMatch);
      }

      // 年份筛选
      if (filters.year !== "all" && movie.year) {
        const year = parseInt(movie.year);
        let yearMatch = false;
        switch (filters.year) {
          case "2020-":
            yearMatch = year >= 2020;
            break;
          case "2010-2019":
            yearMatch = year >= 2010 && year <= 2019;
            break;
          case "2000-2009":
            yearMatch = year >= 2000 && year <= 2009;
            break;
          case "1990-1999":
            yearMatch = year >= 1990 && year <= 1999;
            break;
          case "1990-":
            yearMatch = year < 1990;
            break;
        }
        conditions.push(yearMatch);
      }

      // 国家/地区筛选
      if (filters.country !== "all") {
        conditions.push(movie.country === filters.country);
      }

      // 评分人数筛选
      if (filters.ratingCount !== "all") {
        const count = parseInt(movie.ratingCount);
        let countMatch = false;
        switch (filters.ratingCount) {
          case "100万+":
            countMatch = count >= 1000000;
            break;
          case "50万-100万":
            countMatch = count >= 500000 && count < 1000000;
            break;
          case "10万-50万":
            countMatch = count >= 100000 && count < 500000;
            break;
          case "10万-":
            countMatch = count < 100000;
            break;
        }
        conditions.push(countMatch);
      }

      // 排名范围筛选
      if (filters.rank !== "all") {
        const rank = movie.rank;
        let rankMatch = false;
        switch (filters.rank) {
          case "top50":
            rankMatch = rank <= 50;
            break;
          case "top100":
            rankMatch = rank <= 100;
            break;
          case "top150":
            rankMatch = rank <= 150;
            break;
          case "top200":
            rankMatch = rank <= 200;
            break;
        }
        conditions.push(rankMatch);
      }

      // 应用筛选组合逻辑
      if (conditions.length === 0) {
        return true;
      }

      if (combinationMode === "and") {
        return conditions.every((condition) => condition);
      } else {
        return conditions.some((condition) => condition);
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
        searchResultCount.textContent = "";
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
      rankingsList.innerHTML =
        '<p style="text-align: center; padding: 40px;">没有找到符合条件的电影</p>';
      return;
    }

    rankingsList.innerHTML = pageMovies
      .map((movie) => {
        // 生成星级评分
        const rating = parseFloat(movie.rating);
        const fullStars = Math.floor(rating);
        const halfStar = rating - fullStars >= 0.5;
        let starsHtml = "";
        for (let i = 0; i < 5; i++) {
          if (i < fullStars) {
            starsHtml += "★";
          } else if (i === fullStars && halfStar) {
            starsHtml += "★";
          } else {
            starsHtml += "☆";
          }
        }

        // 模拟引用语数据
        const quotes = [
          "希望让人自由。",
          "风华绝代。",
          "生命就像一盒巧克力，结果往往出人意料。",
          "有些鸟儿是关不住的。",
          "真正的爱情是永恒的。",
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
                        <p class="ranking-actors">主演：${highlightText(movie.cast || "暂无", searchTerm)}</p>
                        <p class="ranking-genre-year">${movie.year || "未知"} / ${movie.country || "未知"} / ${Array.isArray(movie.genres) ? movie.genres.join(" ") : movie.genres || "未知"}</p>
                        <div class="ranking-rating">
                            <span class="stars">${starsHtml}</span>
                            <span class="rating-score">${movie.rating}</span>
                            <span class="rating-votes">${movie.ratingCount}人评价</span>
                        </div>
                        ${movie.quote ? `<p class="ranking-quote">${movie.quote}</p>` : ""}
                        ${movie.detailLink ? `<a href="${movie.detailLink}" target="_blank" rel="noopener noreferrer" class="detail-link">查看详情</a>` : ""}
                    </div>
                </div>
            `;
      })
      .join("");

    // 添加点击事件
    const items = rankingsList.querySelectorAll(".ranking-item");
    items.forEach((item) => {
      item.addEventListener("click", function () {
        if (selectedItem) {
          selectedItem.classList.remove("selected");
        }
        this.classList.add("selected");
        selectedItem = this;
      });
    });
  }

  // 渲染分页控件
  function renderPagination() {
    if (!paginationNumbers) return;

    paginationNumbers.innerHTML = "";

    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      const pageBtn = document.createElement("button");
      pageBtn.className = `pagination-number ${i === currentPage ? "active" : ""}`;
      pageBtn.textContent = i;
      pageBtn.addEventListener("click", () => {
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
    searchBtn.addEventListener("click", () => {
      searchTerm = searchInput.value.trim();
      currentPage = 1;
      searchCache.clear();
      applyFilters();
    });
  }

  if (searchInput) {
    searchInput.addEventListener("input", handleSearch);
    searchInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        searchTerm = searchInput.value.trim();
        currentPage = 1;
        searchCache.clear();
        applyFilters();
      }
    });
  }

  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      searchInput.value = "";
      searchTerm = "";
      currentPage = 1;
      searchCache.clear();
      applyFilters();
      clearBtn.style.display = "none";
    });
  }

  // 监听搜索输入框显示/隐藏清除按钮
  if (searchInput) {
    searchInput.addEventListener("input", () => {
      if (clearBtn) {
        clearBtn.style.display = searchInput.value ? "block" : "none";
      }
    });
  }

  filterBtns.forEach((btn) => {
    btn.addEventListener("click", function () {
      const filterType = this.dataset.filter;
      const filterValue = this.dataset.value;

      // 移除同组其他按钮的活跃状态
      const siblings = this.parentElement.querySelectorAll(".filter-btn");
      siblings.forEach((sibling) => sibling.classList.remove("active"));

      // 添加当前按钮的活跃状态
      this.classList.add("active");

      // 更新筛选条件
      filters[filterType] = filterValue;
      currentPage = 1;
      searchCache.clear();
      applyFilters();
    });
  });

  // 监听筛选组合模式切换
  const combinationRadios = document.querySelectorAll(
    'input[name="combination"]',
  );
  combinationRadios.forEach((radio) => {
    radio.addEventListener("change", function () {
      combinationMode = this.value;
      currentPage = 1;
      searchCache.clear();
      applyFilters();
    });
  });

  // 保存筛选条件
  const saveFiltersBtn = document.getElementById("save-filters");
  if (saveFiltersBtn) {
    saveFiltersBtn.addEventListener("click", function () {
      const filterState = {
        filters: filters,
        combinationMode: combinationMode,
        searchTerm: searchTerm,
      };
      localStorage.setItem("movieFilters", JSON.stringify(filterState));
      alert("筛选条件已保存");
    });
  }

  // 加载筛选条件
  const loadFiltersBtn = document.getElementById("load-filters");
  if (loadFiltersBtn) {
    loadFiltersBtn.addEventListener("click", function () {
      const savedFilters = localStorage.getItem("movieFilters");
      if (savedFilters) {
        const filterState = JSON.parse(savedFilters);
        filters = filterState.filters;
        combinationMode = filterState.combinationMode || "and";
        searchTerm = filterState.searchTerm || "";

        // 更新搜索输入框
        if (searchInput) {
          searchInput.value = searchTerm;
          if (clearBtn) {
            clearBtn.style.display = searchTerm ? "block" : "none";
          }
        }

        // 更新筛选按钮状态
        document.querySelectorAll(".filter-btn").forEach((btn) => {
          const filterType = btn.dataset.filter;
          const filterValue = btn.dataset.value;
          if (filters[filterType] === filterValue) {
            btn.classList.add("active");
          } else {
            btn.classList.remove("active");
          }
        });

        // 更新组合模式
        document.querySelector(
          `input[name="combination"][value="${combinationMode}"]`,
        ).checked = true;

        currentPage = 1;
        searchCache.clear();
        applyFilters();
        alert("筛选条件已加载");
      } else {
        alert("没有保存的筛选条件");
      }
    });
  }

  // 重置所有筛选条件
  const resetFiltersBtn = document.getElementById("reset-filters");
  if (resetFiltersBtn) {
    resetFiltersBtn.addEventListener("click", function () {
      // 重置筛选条件
      filters = {
        genre: "all",
        rating: "all",
        year: "all",
        country: "all",
        ratingCount: "all",
        rank: "all",
      };
      combinationMode = "and";
      searchTerm = "";

      // 更新搜索输入框
      if (searchInput) {
        searchInput.value = "";
        if (clearBtn) {
          clearBtn.style.display = "none";
        }
      }

      // 更新筛选按钮状态
      document.querySelectorAll(".filter-btn").forEach((btn) => {
        if (btn.dataset.value === "all") {
          btn.classList.add("active");
        } else {
          btn.classList.remove("active");
        }
      });

      // 更新组合模式
      document.querySelector('input[name="combination"][value="and"]').checked =
        true;

      currentPage = 1;
      searchCache.clear();
      applyFilters();
      alert("所有筛选条件已重置");
    });
  }

  if (prevPageBtn) {
    prevPageBtn.addEventListener("click", () => {
      if (currentPage > 1) {
        currentPage--;
        renderMovies();
        renderPagination();
      }
    });
  }

  if (nextPageBtn) {
    nextPageBtn.addEventListener("click", () => {
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
      loading.style.display = "flex";
    }

    try {
      movies = await movieData.loadMovies();
      applyFilters();
    } catch (error) {
      console.error("初始化电影数据失败:", error);
      if (rankingsList) {
        rankingsList.innerHTML = `<p style="text-align: center; padding: 40px; color: #e50914;">加载电影数据失败：${error.message}</p>`;
      }
    } finally {
      if (loading) {
        loading.style.display = "none";
      }
    }
  }

  init();
}

function initactors() {
  const source1 = [
    "../images/actors/a1-stage-photo1.jpg",
    "../images/actors/a1-stage-photo2.jpg",
    "../images/actors/a1-stage-photo3.jpg",
    "../images/actors/a1-stage-photo3.jpg",
    "../images/actors/a1-stage-photo4.jpg",
    "../images/actors/a1-stage-photo5.jpg",
    "../images/actors/a1-stage-photo6.jpg",
    "../images/actors/a1-stage-photo7.jpg",
    "../images/actors/a1-stage-photo8.jpg",
    "../images/actors/a1-stage-photo9.jpg",
    "../images/actors/a1-stage-photo10.jpg",
  ];
  const source2 = [
    "../images/actors/a2-stage-photo1.jpg",
    "../images/actors/a2-stage-photo2.jpg",
    "../images/actors/a2-stage-photo3.jpg",
    "../images/actors/a2-stage-photo4.jpg",
  ];
  function initCarousel2(imgid, sources, interval = 2000) {
    let index = 0;
    document.getElementById(imgid).src = sources[index];
    setInterval(function () {
      index++;
      if (index >= sources.length) {
        index = 0;
      }
      document.getElementById(imgid).src = sources[index];
    }, interval);
  }
  initCarousel2("stage-photo1", source1);
  initCarousel2("stage-photo2", source2);

  const actorbios = document.querySelectorAll(".actor-bio");
  actorbios.forEach((bio) => {
    const toggleText = bio.querySelector(".toggle-text");
    const textContent = bio.querySelector(".bio-text");
    toggleText.addEventListener("click", () => {
      textContent.classList.toggle("expanded");

      toggleText.textContent = textContent.classList.contains("expanded")
        ? "收起"
        : "展开";
    });
  });

  // 找到每一个独立演员分页区块
  const actorSections = document.querySelectorAll(".actor-movies-module");

  actorSections.forEach((container) => {
    // 当前区块内部去找页面、按钮
    const pages = container.querySelectorAll(".movie-page");
    const prevBtn = container.querySelector(".prev-btn");
    const nextBtn = container.querySelector(".next-btn");
    const pageInfo = container.querySelector(".page-info");

    let currentPage = 1;
    const totalPages = pages.length;

    function showPage(pageNum) {
      pages.forEach((page) => page.classList.remove("active"));
      const targetPage = container.querySelector(
        `.movie-page[data-page="${pageNum}"]`,
      );
      if (targetPage) {
        targetPage.classList.add("active");
      }
      pageInfo.textContent = `${pageNum}/${totalPages}`;
      prevBtn.classList.toggle("disabled", pageNum === 1);
      nextBtn.classList.toggle("disabled", pageNum === totalPages);
    }

    prevBtn.addEventListener("click", function () {
      if (currentPage > 1) {
        currentPage--;
        showPage(currentPage);
      }
    });

    nextBtn.addEventListener("click", function () {
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
document.addEventListener("DOMContentLoaded", function () {
  initCarousel();
  initExpandButtons();
  initMovieRankings();
  initactors();
});

// ======================
// test.html 四个板块交互逻辑
// ======================
/* ============================================================
   趣味小功能 - 全部交互逻辑
============================================================ */
    (function () {

      /* ──────────────────────────────────────────────
         1. 电影主角性格小测试（增强版）
      ────────────────────────────────────────────── */
      const testQuestions = [
        {
          q: "遇到人生困境，你的第一反应是？",
          ans: [
            { t: "默默坚持，用行动说话", type: "阿甘" },
            { t: "保持乐观，想办法突破现状", type: "楚门" },
            { t: "沉住气，相信自己能慢慢成长", type: "千寻" },
            { t: "冷静分析，用智慧找到出路", type: "钢铁侠" },
          ],
        },
        {
          q: "好友陷入危机，你会怎么做？",
          ans: [
            { t: "不顾一切，第一个冲上去", type: "阿甘" },
            { t: "先稳住情绪，再一起想办法", type: "千寻" },
            { t: "快速制定计划，有条不紊解决", type: "钢铁侠" },
            { t: "一直陪在身边，给他勇气", type: "楚门" },
          ],
        },
        {
          q: "你最向往的生活状态是？",
          ans: [
            { t: "简单真诚，活在当下", type: "阿甘" },
            { t: "自由真实，活出真实的自己", type: "楚门" },
            { t: "不断成长，看见更好的自己", type: "千寻" },
            { t: "创造改变，让世界因我不同", type: "钢铁侠" },
          ],
        },
        {
          q: "被人误解时，你通常会？",
          ans: [
            { t: "不解释，用后来的行动证明", type: "阿甘" },
            { t: "难过，但自己消化后调整好", type: "千寻" },
            { t: "直接把真相说清楚", type: "楚门" },
            { t: "用实力和成果让对方闭嘴", type: "钢铁侠" },
          ],
        },
        {
          q: "你最欣赏自己的哪个特质？",
          ans: [
            { t: "善良、执着，永不放弃", type: "阿甘" },
            { t: "勇敢、真实，追求自由", type: "楚门" },
            { t: "温柔、坚韧，越挫越勇", type: "千寻" },
            { t: "聪明、自信，天生领袖", type: "钢铁侠" },
          ],
        },
      ];

      const charData = {
        阿甘: {
          emoji: "🏃",
          name: "阿甘  ·  Forrest Gump",
          desc: "你如《阿甘正传》中的阿甘——善良纯粹，用不懈的坚持打动世界。生活的复杂对你而言只有一个答案：一直跑下去。",
          tags: ["善良", "执着", "真诚", "不屈"],
          film: "《阿甘正传》(1994)",
        },
        楚门: {
          emoji: "🌅",
          name: "楚门  ·  Truman Burbank",
          desc: "你如《楚门的世界》中的楚门——对真实的渴望让你勇敢跨越所有边界。即使整个世界都是布景，你也要找到那扇真正的门。",
          tags: ["自由", "勇敢", "好奇", "求真"],
          film: "《楚门的世界》(1998)",
        },
        千寻: {
          emoji: "🌸",
          name: "千寻  ·  Chihiro",
          desc: "你如《千与千寻》中的千寻——温柔却无比坚强。面对陌生与恐惧，你选择一步一步往前走，在成长中放出耀眼的光。",
          tags: ["温柔", "坚强", "成长", "善良"],
          film: "《千与千寻》(2001)",
        },
        钢铁侠: {
          emoji: "⚙️",
          name: "托尼·斯塔克  ·  Iron Man",
          desc: "你如《钢铁侠》中的托尼·斯塔克——聪明、自信，天生的问题解决者。你相信用智慧和创造力可以改变一切局面。",
          tags: ["聪明", "自信", "创造", "担当"],
          film: "《钢铁侠》(2008)",
        },
      };

      let quizCurrent = 0;
      let quizScore = { 阿甘: 0, 楚门: 0, 千寻: 0, 钢铁侠: 0 };

      function renderQuestion() {
        const q = testQuestions[quizCurrent];
        const total = testQuestions.length;
        const pct = (quizCurrent / total) * 100;

        document.getElementById("quizProgressFill").style.width = pct + "%";
        document.getElementById("quizCounter").textContent = `第 ${quizCurrent + 1} 题 / 共 ${total} 题`;
        document.getElementById("quizQuestion").textContent = q.q;

        const wrap = document.getElementById("quizOptions");
        wrap.innerHTML = "";
        q.ans.forEach((item) => {
          const btn = document.createElement("button");
          btn.className = "quiz-option-btn";
          btn.textContent = item.t;
          btn.onclick = () => selectAnswer(item.type);
          wrap.appendChild(btn);
        });

        document.getElementById("quizResult").classList.remove("show");
        document.getElementById("quizQuestion").style.display = "";
        document.getElementById("quizOptions").style.display = "";
      }

      function selectAnswer(type) {
        quizScore[type]++;
        quizCurrent++;
        if (quizCurrent < testQuestions.length) {
          renderQuestion();
        } else {
          showResult();
        }
      }

      function showResult() {
        document.getElementById("quizProgressFill").style.width = "100%";
        document.getElementById("quizQuestion").style.display = "none";
        document.getElementById("quizOptions").style.display = "none";
        document.getElementById("quizCounter").textContent = "测试完成 ✓";

        let maxType = "阿甘";
        for (let t in quizScore) {
          if (quizScore[t] > quizScore[maxType]) maxType = t;
        }
        const c = charData[maxType];
        document.getElementById("resultEmoji").textContent = c.emoji;
        document.getElementById("resultName").textContent = c.name;
        document.getElementById("resultDesc").textContent = c.desc;
        document.getElementById("resultTags").innerHTML =
          c.tags.map((t) => `<span class="result-tag">${t}</span>`).join("") +
          `<span class="result-tag" style="border-color:rgba(245,197,24,0.3);color:var(--gold);background:rgba(245,197,24,0.08)">${c.film}</span>`;

        document.getElementById("quizResult").classList.add("show");
      }

      window.restartQuiz = function () {
        quizCurrent = 0;
        quizScore = { 阿甘: 0, 楚门: 0, 千寻: 0, 钢铁侠: 0 };
        renderQuestion();
      };

      renderQuestion();

      /* ──────────────────────────────────────────────
         2. 电影冷知识（分类 + 翻页）
      ────────────────────────────────────────────── */
      const factsData = [
        { text: "《泰坦尼克号》中杰克为萝丝画裸像的那只手，其实是导演詹姆斯·卡梅隆亲手画的。", source: "《泰坦尼克号》1997", cat: "制作秘辛" },
        { text: "《盗梦空间》里那条经典的旋转走廊，是剧组耗资100万美元真实搭建的可360°旋转机械装置。", source: "《盗梦空间》2010", cat: "制作秘辛" },
        { text: "《黑客帝国》里那道绿色代码雨，其实是导演沃卓斯基将寿司食谱扫描后反转得来的字符。", source: "《黑客帝国》1999", cat: "制作秘辛" },
        { text: "《闪灵》里那场血潮戏共使用了超过9000加仑假血，并前后拍摄了3天才完成。", source: "《闪灵》1980", cat: "制作秘辛" },
        { text: "《星际穿越》中的黑洞「卡冈图雅」，是由天体物理学家精确计算后渲染的，研究成果还发表成了学术论文。", source: "《星际穿越》2014", cat: "科学冷知" },
        { text: "《阿凡达》里纳威人使用的语言，是语言学家保罗·弗罗默为影片专门创造的，拥有完整语法体系。", source: "《阿凡达》2009", cat: "科学冷知" },
        { text: "《侏罗纪公园》中霸王龙的咆哮声，是由小狗、企鹅和老虎的叫声混合而成的。", source: "《侏罗纪公园》1993", cat: "科学冷知" },
        { text: "《教父》里那只猫是开拍前游荡在片场的流浪猫，马龙·白兰度随手抱起后就直接开拍了，完全是临时发挥。", source: "《教父》1972", cat: "趣味花絮" },
        { text: "《阿甘正传》中那根羽毛飘落的开场镜头，是完全由电脑动画合成的，而非实拍。", source: "《阿甘正传》1994", cat: "趣味花絮" },
        { text: "《疯狂动物城》里反应极慢的树懒「闪电」，其配音演员实际上语速极快，为了配合角色刻意放慢。", source: "《疯狂动物城》2016", cat: "趣味花絮" },
        { text: "《龙猫》里的公交车站戏份只在日本映映版中出现，宫崎骏说那是他最喜欢的场景之一。", source: "《龙猫》1988", cat: "趣味花絮" },
        { text: "《指环王》中咕噜的所有动作与表情，都由演员安迪·瑟金斯通过动作捕捉完成，开创了这一技术的先河。", source: "《指环王》2001", cat: "制作秘辛" },
        { text: "《肖申克的救赎》中安迪逃跑时爬过的臭水沟，全长约500英尺，蒂姆·罗宾斯实际在里面爬行了多个小时。", source: "《肖申克的救赎》1994", cat: "制作秘辛" },
        { text: "《楚门的世界》里那整片大海，其实是一个巨型摄影棚内的蓝色背景与风浪机组合，片场在加拿大。", source: "《楚门的世界》1998", cat: "制作秘辛" },
        { text: "《千与千寻》里汤婆婆的澡堂，原型参考了日本道后温泉本馆，但宫崎骏将其进行了大量改造创作。", source: "《千与千寻》2001", cat: "趣味花絮" },
        { text: "《复仇者联盟4》最终决战场景中，有超过700名视觉效果艺术家参与制作，历时3年完成后期。", source: "《复仇者联盟4》2019", cat: "制作秘辛" },
        { text: "《寻梦环游记》导演李·昂克里奇为了创作这部电影，花了六年时间深入研究墨西哥文化和亡灵节习俗。", source: "《寻梦环游记》2017", cat: "科学冷知" },
        { text: "《小丑》2019版中亚瑟标志性的笑声，是杰昆·菲尼克斯耗费数月刻意练习的，据说练习期间他吓到了不少剧组人员。", source: "《小丑》2019", cat: "趣味花絮" },
        { text: "《这个杀手不太冷》里里昂那盆万年青，象征着他在充满暴力的生活中唯一纯净的希望，该植物在片尾被种入土地。", source: "《这个杀手不太冷》1994", cat: "趣味花絮" },
        { text: "《搏击俱乐部》中有大量仅出现一帧的隐藏画面，导演大卫·芬奇在DVD花絮中专门列出了彩蛋清单。", source: "《搏击俱乐部》1999", cat: "趣味花絮" },
      ];

      const factCategories = ["全部", ...new Set(factsData.map((f) => f.cat))];
      let factCurrentCat = "全部";
      let factFiltered = [...factsData];
      let factIndex = 0;

      function buildFactTabs() {
        const wrap = document.getElementById("factTabs");
        wrap.innerHTML = "";
        factCategories.forEach((cat) => {
          const btn = document.createElement("button");
          btn.className = "fact-tab" + (cat === factCurrentCat ? " active" : "");
          btn.textContent = cat;
          btn.onclick = () => {
            factCurrentCat = cat;
            factFiltered = cat === "全部" ? [...factsData] : factsData.filter((f) => f.cat === cat);
            factIndex = 0;
            renderFact();
            buildFactTabs();
          };
          wrap.appendChild(btn);
        });
      }

      function renderFact() {
        const f = factFiltered[factIndex];
        const el = document.getElementById("factText");
        el.style.opacity = 0;
        setTimeout(() => {
          el.textContent = f.text;
          el.style.opacity = 1;
          document.getElementById("factSource").textContent = "— " + f.source;
          document.getElementById("factIndex").textContent = `${factIndex + 1} / ${factFiltered.length}`;
        }, 200);
      }

      window.nextFact = function () {
        factIndex = (factIndex + 1) % factFiltered.length;
        renderFact();
      };
      window.prevFact = function () {
        factIndex = (factIndex - 1 + factFiltered.length) % factFiltered.length;
        renderFact();
      };

      buildFactTabs();
      renderFact();

      /* ──────────────────────────────────────────────
         3. 随机选片器（老虎机动画 + 心情筛选）
      ────────────────────────────────────────────── */
      const moviePool = [
        { title: "《肖申克的救赎》", mood: ["励志", "经典"], year: 1994, genre: "剧情" },
        { title: "《阿甘正传》", mood: ["励志", "温情"], year: 1994, genre: "剧情" },
        { title: "《盗梦空间》", mood: ["烧脑", "刺激"], year: 2010, genre: "科幻" },
        { title: "《星际穿越》", mood: ["烧脑", "温情"], year: 2014, genre: "科幻" },
        { title: "《楚门的世界》", mood: ["励志", "经典"], year: 1998, genre: "剧情" },
        { title: "《千与千寻》", mood: ["温情", "治愈"], year: 2001, genre: "动画" },
        { title: "《龙猫》", mood: ["治愈", "温情"], year: 1988, genre: "动画" },
        { title: "《寻梦环游记》", mood: ["温情", "治愈"], year: 2017, genre: "动画" },
        { title: "《哈尔的移动城堡》", mood: ["治愈", "温情"], year: 2004, genre: "动画" },
        { title: "《这个杀手不太冷》", mood: ["经典", "刺激"], year: 1994, genre: "动作" },
        { title: "《搏击俱乐部》", mood: ["烧脑", "刺激"], year: 1999, genre: "剧情" },
        { title: "《禁闭岛》", mood: ["烧脑", "刺激"], year: 2010, genre: "悬疑" },
        { title: "《记忆碎片》", mood: ["烧脑"], year: 2000, genre: "悬疑" },
        { title: "《七宗罪》", mood: ["烧脑", "刺激"], year: 1995, genre: "悬疑" },
        { title: "《霸王别姬》", mood: ["经典"], year: 1993, genre: "剧情" },
        { title: "《大话西游》", mood: ["温情", "经典"], year: 1995, genre: "喜剧" },
        { title: "《重庆森林》", mood: ["治愈", "经典"], year: 1994, genre: "剧情" },
        { title: "《花样年华》", mood: ["治愈", "经典"], year: 2000, genre: "剧情" },
        { title: "《指环王：护戒使者》", mood: ["刺激", "经典"], year: 2001, genre: "奇幻" },
        { title: "《哈利·波特与魔法石》", mood: ["治愈", "励志"], year: 2001, genre: "奇幻" },
        { title: "《疯狂动物城》", mood: ["励志", "治愈"], year: 2016, genre: "动画" },
        { title: "《泰坦尼克号》", mood: ["温情", "经典"], year: 1997, genre: "剧情" },
        { title: "《少年派的奇幻漂流》", mood: ["励志", "烧脑"], year: 2012, genre: "剧情" },
        { title: "《我不是药神》", mood: ["励志", "经典"], year: 2018, genre: "剧情" },
        { title: "《哪吒之魔童降世》", mood: ["励志", "刺激"], year: 2019, genre: "动画" },
      ];

      const moods = ["全部", "励志", "治愈", "温情", "烧脑", "刺激", "经典"];
      let activeMood = "全部";
      let slotRunning = false;

      function buildMoodFilter() {
        const row = document.getElementById("moodFilterRow");
        row.innerHTML = "";
        moods.forEach((m) => {
          const btn = document.createElement("button");
          btn.className = "mood-btn" + (m === activeMood ? " active" : "");
          btn.textContent = m;
          btn.onclick = () => {
            activeMood = m;
            document.querySelectorAll(".mood-btn").forEach((b) => b.classList.remove("active"));
            btn.classList.add("active");
          };
          row.appendChild(btn);
        });
      }

      window.spinSlot = function () {
        if (slotRunning) return;
        slotRunning = true;
        const btn = document.getElementById("spinBtn");
        btn.disabled = true;

        const pool = activeMood === "全部" ? moviePool : moviePool.filter((m) => m.mood.includes(activeMood));
        if (!pool.length) {
          document.getElementById("slotItem").textContent = "该心情下暂无电影~";
          slotRunning = false; btn.disabled = false; return;
        }

        const wrap = document.getElementById("slotWrap");
        const total = 25;
        let count = 0;
        const chosen = pool[Math.floor(Math.random() * pool.length)];

        const interval = setInterval(() => {
          const rnd = pool[Math.floor(Math.random() * pool.length)];
          wrap.innerHTML = `<div class="slot-item">${rnd.title}</div>`;
          count++;
          if (count >= total) {
            clearInterval(interval);
            wrap.innerHTML = `<div class="slot-item" style="color:var(--gold);font-weight:700">${chosen.title}</div>`;
            document.getElementById("slotMeta").innerHTML =
              `<span style="color:#888">${chosen.year} · ${chosen.genre}</span>`;
            slotRunning = false;
            btn.disabled = false;
          }
        }, 80);
      };

      buildMoodFilter();

      /* ──────────────────────────────────────────────
         4. 电影台词竞猜
      ────────────────────────────────────────────── */
      const quotes = [
        { text: "生活就像一盒巧克力，你永远不知道下一颗是什么味道。", answer: "《阿甘正传》", options: ["《阿甘正传》", "《楚门的世界》", "《当幸福来敲门》", "《美丽人生》"] },
        { text: "有些鸟儿是关不住的，它们的羽毛太鲜亮了。", answer: "《肖申克的救赎》", options: ["《肖申克的救赎》", "《飞越疯人院》", "《美丽心灵》", "《死亡诗社》"] },
        { text: "我们来到这个世界，不是为了符合别人的期望。", answer: "《千与千寻》", options: ["《龙猫》", "《千与千寻》", "《哈尔的移动城堡》", "《侧耳倾听》"] },
        { text: "人们不问事情为什么会发生，只问什么时候会结束。", answer: "《美丽人生》", options: ["《辛德勒的名单》", "《美丽人生》", "《钢琴师》", "《大屠杀》"] },
        { text: "你是否能接受在你最黑暗的时刻，上帝就是你的敌人？", answer: "《禁闭岛》", options: ["《七宗罪》", "《禁闭岛》", "《沉默的羔羊》", "《搏击俱乐部》"] },
        { text: "我们都是在别人故事里的配角，都是在自己故事里的主角。", answer: "《楚门的世界》", options: ["《楚门的世界》", "《记忆碎片》", "《致命ID》", "《蝴蝶效应》"] },
        { text: "过去的事已经过去，未来的事还未来临，我只活在当下。", answer: "《花样年华》", options: ["《重庆森林》", "《2046》", "《花样年华》", "《阿飞正传》"] },
        { text: "理解一件事物不代表认同它，认同它不代表要成为它。", answer: "《搏击俱乐部》", options: ["《搏击俱乐部》", "《记忆碎片》", "《禁闭岛》", "《七宗罪》"] },
      ];

      let quoteIdx = 0;
      let quoteUsed = [];
      let quoteScoreVal = 0;
      let quoteTotalVal = 0;
      let quoteAnswered = false;

      function getNextQuote() {
        if (quoteUsed.length >= quotes.length) quoteUsed = [];
        let idx;
        do { idx = Math.floor(Math.random() * quotes.length); } while (quoteUsed.includes(idx));
        quoteUsed.push(idx);
        return idx;
      }

      function loadQuote() {
        quoteAnswered = false;
        quoteIdx = getNextQuote();
        const q = quotes[quoteIdx];
        document.getElementById("quoteText").textContent = q.text;
        document.getElementById("quoteFeedback").textContent = "";
        document.getElementById("nextQuoteBtn").style.display = "none";

        const opts = document.getElementById("quoteOptions");
        opts.innerHTML = "";
        // 随机打乱选项顺序
        const shuffled = [...q.options].sort(() => Math.random() - 0.5);
        shuffled.forEach((opt) => {
          const btn = document.createElement("button");
          btn.className = "quote-opt-btn";
          btn.textContent = opt;
          btn.onclick = () => checkQuote(opt, q.answer, btn);
          opts.appendChild(btn);
        });
      }

      function checkQuote(chosen, answer, btn) {
        if (quoteAnswered) return;
        quoteAnswered = true;
        quoteTotalVal++;
        const fb = document.getElementById("quoteFeedback");
        if (chosen === answer) {
          quoteScoreVal++;
          btn.classList.add("correct");
          fb.style.color = "#81c784";
          fb.textContent = "✓ 答对了！你真是个影迷！";
        } else {
          btn.classList.add("wrong");
          fb.style.color = "#e57373";
          fb.textContent = `✗ 答错了，正确答案是 ${answer}`;
          // 高亮正确项
          document.querySelectorAll(".quote-opt-btn").forEach((b) => {
            if (b.textContent === answer) b.classList.add("correct");
          });
        }
        document.querySelectorAll(".quote-opt-btn").forEach((b) => (b.disabled = true));
        document.getElementById("quoteScore").textContent = quoteScoreVal;
        document.getElementById("quoteTotal").textContent = quoteTotalVal;
        document.getElementById("nextQuoteBtn").style.display = "inline-flex";
      }

      window.nextQuote = function () { loadQuote(); };
      window.resetQuoteGame = function () {
        quoteScoreVal = 0; quoteTotalVal = 0; quoteUsed = [];
        document.getElementById("quoteScore").textContent = "0";
        document.getElementById("quoteTotal").textContent = "0";
        loadQuote();
      };

      loadQuote();

      /* ──────────────────────────────────────────────
         5. 今日心情推荐
      ────────────────────────────────────────────── */
      const moodRecos = [
        {
          emoji: "😄", label: "开心",
          title: "想笑得更开心",
          reason: "心情本就不错，再来点欢乐加倍！这几部充满趣味与温情的电影，能让你笑得合不拢嘴。",
          movies: ["《疯狂动物城》", "《大话西游》", "《哪吒之魔童降世》", "《寻梦环游记》"],
        },
        {
          emoji: "😔", label: "低落",
          title: "需要一点温柔治愈",
          reason: "心情低落时，不如让电影陪伴你。这些温暖的故事会悄悄告诉你：一切都会好起来的。",
          movies: ["《千与千寻》", "《龙猫》", "《哈尔的移动城堡》", "《阿甘正传》"],
        },
        {
          emoji: "😤", label: "烦躁",
          title: "来点肾上腺素",
          reason: "烦透了吗？不如找部节奏紧张的电影发泄一下，把烦恼抛诸脑后！",
          movies: ["《盗梦空间》", "《速度与激情》", "《复仇者联盟4》", "《这个杀手不太冷》"],
        },
        {
          emoji: "🤔", label: "无聊",
          title: "来一场烧脑之旅",
          reason: "百无聊赖？这些让人摸不着头脑却欲罢不能的悬疑神作，保证你看完还想再看一遍。",
          movies: ["《禁闭岛》", "《记忆碎片》", "《搏击俱乐部》", "《七宗罪》"],
        },
        {
          emoji: "💕", label: "思念",
          title: "关于爱与陪伴",
          reason: "思念某个人时，这些关于爱与遗失的电影，会让那种情感变得更加清晰而美好。",
          movies: ["《花样年华》", "《泰坦尼克号》", "《重庆森林》", "《爱在黎明破晓前》"],
        },
        {
          emoji: "🌟", label: "充电",
          title: "来点力量与激励",
          reason: "想从电影里汲取能量出发？这几部关于坚持、梦想和突破的故事，是最好的充电站。",
          movies: ["《肖申克的救赎》", "《当幸福来敲门》", "《楚门的世界》", "《我不是药神》"],
        },
      ];

      function buildMoodGrid() {
        const grid = document.getElementById("moodGrid");
        grid.innerHTML = "";
        moodRecos.forEach((m, i) => {
          const tile = document.createElement("div");
          tile.className = "mood-tile";
          tile.innerHTML = `<span class="mood-tile-emoji">${m.emoji}</span><span class="mood-tile-label">${m.label}</span>`;
          tile.onclick = () => {
            document.querySelectorAll(".mood-tile").forEach((t) => t.classList.remove("selected"));
            tile.classList.add("selected");
            showMoodReco(m);
          };
          grid.appendChild(tile);
        });
      }

      function showMoodReco(m) {
        const card = document.getElementById("moodRecoCard");
        document.getElementById("moodRecoTitle").textContent = m.emoji + " " + m.title;
        document.getElementById("moodRecoReason").textContent = m.reason;
        document.getElementById("moodRecoMovies").innerHTML = m.movies
          .map((mv) => `<span class="mood-reco-movie-tag">${mv}</span>`)
          .join("");
        card.classList.add("show");
      }

      buildMoodGrid();

      /* ──────────────────────────────────────────────
         6. 留言投稿
      ────────────────────────────────────────────── */
      let messages = JSON.parse(localStorage.getItem("cinemaMessages") || "[]");

      function renderMessages() {
        const list = document.getElementById("messageList");
        if (!messages.length) {
          list.innerHTML = '<div class="msg-empty">还没有留言，快来第一个推荐吧！</div>';
          return;
        }
        list.innerHTML = messages
          .map(
            (m, i) => `
          <div class="msg-item" id="msgItem${i}">
            <div class="msg-item-header">
              <div>
                <span class="msg-user">${m.name}</span>
                <span style="color:rgba(255,255,255,0.2);margin:0 6px">·</span>
                <span class="msg-movie">${m.movie}</span>
              </div>
              <span class="msg-time">${m.time}</span>
            </div>
            ${m.reason ? `<div class="msg-reason">${m.reason}</div>` : ""}
            <div class="msg-like-row">
              <button class="msg-like-btn${m.liked ? " liked" : ""}" onclick="toggleLike(${i})">
                ${m.liked ? "❤️" : "🤍"} ${m.likes}
              </button>
            </div>
          </div>
        `
          )
          .join("");
      }

      window.toggleLike = function (i) {
        if (messages[i].liked) {
          messages[i].liked = false;
          messages[i].likes--;
        } else {
          messages[i].liked = true;
          messages[i].likes++;
        }
        localStorage.setItem("cinemaMessages", JSON.stringify(messages));
        renderMessages();
      };

      window.submitMessage = function () {
        const name = document.getElementById("userName").value.trim();
        const movie = document.getElementById("movieName").value.trim();
        const reason = document.getElementById("reason").value.trim();
        if (!name || !movie) { alert("请填写昵称和电影名！"); return; }

        const now = new Date();
        const time = `${now.getMonth() + 1}/${now.getDate()} ${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;
        messages.unshift({ name, movie: `《${movie}》`, reason, time, likes: 0, liked: false });
        localStorage.setItem("cinemaMessages", JSON.stringify(messages));
        document.getElementById("userName").value = "";
        document.getElementById("movieName").value = "";
        document.getElementById("reason").value = "";
        renderMessages();
      };

      renderMessages();

    })();