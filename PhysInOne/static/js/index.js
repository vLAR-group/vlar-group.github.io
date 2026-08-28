window.HELP_IMPROVE_VIDEOJS = false;

// Personal website links for authors
window.PERSONAL_WEBSITES = {
  "Siyuan Zhou": "https://mt-shark.github.io/ZhouSiyuan/",
  "Hu Cheng": "http://www.ee.cuhk.edu.hk/~hcheng/",
  "Yafei Yang": "https://yafeiy.github.io/",
  "Hongtao Wen": "https://hatimwen.github.io/",
  "Hejun Wang": "https://baiyebutingxuan.github.io/",
  "Bing Wang": "https://www.polyu.edu.hk/en/aae/people/academic-staff/dr-wang-bing/",
  "Bo Yang": "https://yang7879.github.io/",
  "Chuhang Zou": "https://zouchuhang.github.io/",
  "Junwei Jiang": "https://junwei-jiang.github.io/",
  "Ziqi Li": "https://github.com/turswiming",
  "Jinxi Li": "https://scholar.google.com/citations?user=agnxFRoAAAAJ&hl=en",
  "Peng Yun": "https://scholar.google.com.hk/citations?user=alRGtgwAAAAJ",
    "Zihui Zhang": "https://zihui0930.github.io",
  "Shenxing Wei": "https://scholar.google.com.hk/citations?user=5RH0zBMAAAAJ",
  "Bowen Cheng": "https://scholar.google.com/citations?user=mmFhKOAAAAAJ&hl=en",
    "Jiahao Chen": "https://github.com/D2Simon",
    "Chun Ho Yuen": "https://github.com/pych0413"
};

// Contributors functions
function sortPhotosByOrder(photos) {
    const order = window.CONTRIBUTORS_ORDER || [];
    if (order.length === 0) return photos;
    
    // Create a map of name -> photo path
    const photoMap = {};
    photos.forEach(path => {
        const name = extractContributorName(path);
        photoMap[name] = path;
    });
    
    // Build sorted array based on order config
    const sorted = [];
    order.forEach(name => {
        if (photoMap[name]) {
            sorted.push(photoMap[name]);
            delete photoMap[name];
        }
    });
    
    // Append any remaining photos not in order config
    Object.values(photoMap).forEach(path => sorted.push(path));
    
    return sorted;
}

async function initContributors() {
    const grid = document.getElementById('contributors-grid');
    if (!grid) {
        return;
    }

    let photos = [];
    
    if (window.CONTRIBUTORS_MANIFEST && Array.isArray(window.CONTRIBUTORS_MANIFEST.photos)) {
        photos = window.CONTRIBUTORS_MANIFEST.photos;
    } else {
        try {
            const response = await fetch('PhysInOne/static/images/Contributers/manifest.json', { cache: 'no-store' });
            if (!response.ok) {
                throw new Error('contributors manifest not found');
            }
            const manifest = await response.json();
            photos = Array.isArray(manifest.photos) ? manifest.photos : [];
        } catch (error) {
            console.warn('Failed to load contributors manifest:', error);
            grid.innerHTML = '<p class="has-text-centered">No contributors found.</p>';
            return;
        }
    }
    
    // Sort photos by configured order
    const sortedPhotos = sortPhotosByOrder(photos);
    renderContributors(sortedPhotos, grid);
}

function renderContributors(photos, grid) {
    grid.innerHTML = '';
    photos.forEach((photoPath) => {
        const card = document.createElement('article');
        card.className = 'contributor-card';

        const avatarWrap = document.createElement('div');
        avatarWrap.className = 'contributor-avatar-wrap';

        const image = document.createElement('img');
        image.className = 'contributor-avatar';
        // manifest paths are already URL-encoded, don't double-encode
        image.src = photoPath;
        image.alt = 'Contributor photo';
        image.loading = 'lazy';

        const contributorName = extractContributorName(photoPath);
        const personalWebsite = window.PERSONAL_WEBSITES && window.PERSONAL_WEBSITES[contributorName];

        const name = document.createElement('p');
        name.className = 'contributor-name';

        if (personalWebsite) {
            const link = document.createElement('a');
            link.href = personalWebsite;
            link.target = '_blank';
            link.rel = 'noopener';
            link.textContent = contributorName;
            link.style.color = 'inherit';
            link.style.textDecoration = 'none';
            name.appendChild(link);
            // Add hover effect
            link.addEventListener('mouseenter', () => { link.style.color = '#4a90d9'; });
            link.addEventListener('mouseleave', () => { link.style.color = 'inherit'; });
        } else {
            name.textContent = contributorName;
        }

        avatarWrap.appendChild(image);
        card.appendChild(avatarWrap);
        card.appendChild(name);
        grid.appendChild(card);
    });
}

function extractContributorName(path) {
    const parts = path.split('/');
    const filename = parts[parts.length - 1] || '';
    const clean = filename.replace(/\.[^.]+$/, '');
    // Decode URL-encoded names (e.g., %20 -> space)
    try {
        return decodeURIComponent(clean);
    } catch (e) {
        return clean;
    }
}

// Scroll to top functionality
function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// Show/hide scroll to top button
window.addEventListener('scroll', function() {
    const scrollButton = document.querySelector('.scroll-to-top');
    if (scrollButton) {
        if (window.pageYOffset > 300) {
            scrollButton.classList.add('visible');
        } else {
            scrollButton.classList.remove('visible');
        }
    }
});

// Video carousel autoplay when in view
function setupVideoCarouselAutoplay() {
    const carouselVideos = document.querySelectorAll('.results-carousel video');
    
    if (carouselVideos.length === 0) return;
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const video = entry.target;
            if (entry.isIntersecting) {
                video.play().catch(e => {
                    console.log('Autoplay prevented:', e);
                });
            } else {
                video.pause();
            }
        });
    }, {
        threshold: 0.5
    });
    
    carouselVideos.forEach(video => {
        observer.observe(video);
    });
}

document.addEventListener('DOMContentLoaded', function() {
    var options = {
        slidesToScroll: 1,
        slidesToShow: 1,
        loop: true,
        infinite: true,
        autoplay: true,
        autoplaySpeed: 5000,
    };

    if (window.bulmaCarousel) {
        bulmaCarousel.attach('.carousel', options);
    }

    if (window.bulmaSlider) {
        bulmaSlider.attach();
    }
    
    setupVideoCarouselAutoplay();
    initContributors();
});

// ========================================
// Live Hugging Face download statistics
// ========================================

const DOWNLOAD_STATS_REPOSITORIES = [
  { id: 'vLAR/PhysInOne', label: 'vLAR/PhysInOne', shortLabel: 'Main', isMain: true },
  ...Array.from({ length: 16 }, (_, index) => {
    const part = String(index + 1).padStart(2, '0');
    return {
      id: 'PhysInOneP' + part + '/PhysInOneP' + part,
      label: 'PhysInOneP' + part,
      shortLabel: 'P' + part,
      isMain: false
    };
  })
];

const DOWNLOAD_STATS_FALLBACK = [
  { id: 'vLAR/PhysInOne', allTime: 13290, last30Days: 1340 },
  { id: 'PhysInOneP01/PhysInOneP01', allTime: 71050, last30Days: 34493 },
  { id: 'PhysInOneP02/PhysInOneP02', allTime: 80052, last30Days: 41552 },
  { id: 'PhysInOneP03/PhysInOneP03', allTime: 73893, last30Days: 44654 },
  { id: 'PhysInOneP04/PhysInOneP04', allTime: 73995, last30Days: 43596 },
  { id: 'PhysInOneP05/PhysInOneP05', allTime: 70670, last30Days: 41550 },
  { id: 'PhysInOneP06/PhysInOneP06', allTime: 70519, last30Days: 41665 },
  { id: 'PhysInOneP07/PhysInOneP07', allTime: 56326, last30Days: 36665 },
  { id: 'PhysInOneP08/PhysInOneP08', allTime: 57754, last30Days: 37762 },
  { id: 'PhysInOneP09/PhysInOneP09', allTime: 55755, last30Days: 36055 },
  { id: 'PhysInOneP10/PhysInOneP10', allTime: 58132, last30Days: 37951 },
  { id: 'PhysInOneP11/PhysInOneP11', allTime: 53900, last30Days: 36206 },
  { id: 'PhysInOneP12/PhysInOneP12', allTime: 18636, last30Days: 4176 },
  { id: 'PhysInOneP13/PhysInOneP13', allTime: 15496, last30Days: 492 },
  { id: 'PhysInOneP14/PhysInOneP14', allTime: 18991, last30Days: 4585 },
  { id: 'PhysInOneP15/PhysInOneP15', allTime: 15865, last30Days: 7107 },
  { id: 'PhysInOneP16/PhysInOneP16', allTime: 478, last30Days: 478 }
];

const DOWNLOAD_STATS_CACHE_KEY = 'physinone-hf-download-stats-v1';
const DOWNLOAD_STATS_FALLBACK_DATE = 'Aug 28, 2026';
const downloadNumberFormatter = new Intl.NumberFormat();

function isCompleteDownloadStats(rows) {
  if (!Array.isArray(rows) || rows.length !== DOWNLOAD_STATS_REPOSITORIES.length) {
    return false;
  }

  const expectedIds = new Set(DOWNLOAD_STATS_REPOSITORIES.map((repo) => repo.id));
  return rows.every((row) => (
    expectedIds.has(row.id) &&
    Number.isFinite(row.allTime) &&
    Number.isFinite(row.last30Days)
  ));
}

function readDownloadStatsCache() {
  try {
    const cached = JSON.parse(localStorage.getItem(DOWNLOAD_STATS_CACHE_KEY));
    if (cached && isCompleteDownloadStats(cached.rows) && cached.updatedAt) {
      return cached;
    }
  } catch (error) {
    console.warn('Unable to read download statistics cache:', error);
  }
  return null;
}

function writeDownloadStatsCache(rows, updatedAt) {
  try {
    localStorage.setItem(DOWNLOAD_STATS_CACHE_KEY, JSON.stringify({ rows, updatedAt }));
  } catch (error) {
    console.warn('Unable to cache download statistics:', error);
  }
}

function setDownloadStatsStatus(state, message) {
  const dot = document.getElementById('download-live-dot');
  const text = document.getElementById('download-status-text');

  if (dot) {
    dot.className = 'download-live-dot';
    if (state === 'live') dot.classList.add('is-live');
    if (state === 'error') dot.classList.add('is-error');
    if (state === 'loading') dot.classList.add('is-loading');
  }

  if (text) {
    text.textContent = message;
  }
}

function formatDownloadStatsTime(timestamp) {
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(date);
}

function renderDownloadStats(rows) {
  if (!isCompleteDownloadStats(rows)) return;

  const orderedRows = DOWNLOAD_STATS_REPOSITORIES.map((repo) => {
    const stats = rows.find((row) => row.id === repo.id);
    return { ...repo, ...stats };
  });

  const allTime = orderedRows.reduce((sum, row) => sum + row.allTime, 0);
  const last30Days = orderedRows.reduce((sum, row) => sum + row.last30Days, 0);
  const shardAllTime = orderedRows
    .filter((row) => !row.isMain)
    .reduce((sum, row) => sum + row.allTime, 0);

  const allTimeElement = document.getElementById('download-total-all-time');
  const last30DaysElement = document.getElementById('download-total-30d');
  const shardElement = document.getElementById('download-shards-all-time');
  const loadedElement = document.getElementById('download-repositories-loaded');

  if (allTimeElement) allTimeElement.textContent = downloadNumberFormatter.format(allTime);
  if (last30DaysElement) last30DaysElement.textContent = downloadNumberFormatter.format(last30Days);
  if (shardElement) shardElement.textContent = downloadNumberFormatter.format(shardAllTime);
  if (loadedElement) {
    loadedElement.textContent = '';
    loadedElement.append(document.createTextNode(String(orderedRows.length)));
    const denominator = document.createElement('span');
    denominator.className = 'download-metric-denominator';
    denominator.textContent = '/' + DOWNLOAD_STATS_REPOSITORIES.length;
    loadedElement.appendChild(denominator);
  }

  renderDownloadRepositoryCards(orderedRows);
}

function renderDownloadRepositoryCards(rows) {
  const grid = document.getElementById('download-repository-grid');
  if (!grid) return;

  const cards = rows.map((repo) => {
    const card = document.createElement('article');
    card.className = 'download-repository-card' + (repo.isMain ? ' is-main' : '');

    const heading = document.createElement('div');
    heading.className = 'download-repository-name';

    const link = document.createElement('a');
    link.href = 'https://huggingface.co/datasets/' + repo.id;
    link.target = '_blank';
    link.rel = 'noopener';
    link.textContent = repo.label;
    link.title = 'Open ' + repo.label + ' on Hugging Face';

    const tag = document.createElement('span');
    tag.className = 'download-repository-tag';
    tag.textContent = repo.isMain ? 'Main' : 'Complete';

    heading.append(link, tag);

    const values = document.createElement('div');
    values.className = 'download-repository-values';

    const allTime = document.createElement('div');
    allTime.className = 'download-repository-value';
    const allTimeNumber = document.createElement('strong');
    allTimeNumber.textContent = downloadNumberFormatter.format(repo.allTime);
    const allTimeLabel = document.createElement('span');
    allTimeLabel.textContent = 'All time';
    allTime.append(allTimeNumber, allTimeLabel);

    const recent = document.createElement('div');
    recent.className = 'download-repository-value';
    const recentNumber = document.createElement('strong');
    recentNumber.textContent = downloadNumberFormatter.format(repo.last30Days);
    const recentLabel = document.createElement('span');
    recentLabel.textContent = 'Last 30 days';
    recent.append(recentNumber, recentLabel);

    values.append(allTime, recent);
    card.append(heading, values);
    return card;
  });

  grid.replaceChildren(...cards);
}

async function fetchDownloadStats() {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), 12000);

  try {
    const requests = DOWNLOAD_STATS_REPOSITORIES.map(async (repo) => {
      const encodedId = repo.id.split('/').map(encodeURIComponent).join('/');
      const url = 'https://huggingface.co/api/datasets/' + encodedId + '?expand=downloads&expand=downloadsAllTime';
      const response = await fetch(url, {
        headers: { Accept: 'application/json' },
        cache: 'no-store',
        signal: controller.signal
      });

      if (!response.ok) {
        throw new Error(repo.id + ' returned HTTP ' + response.status);
      }

      const payload = await response.json();
      const allTime = Number(payload.downloadsAllTime);
      const last30Days = Number(payload.downloads);

      if (!Number.isFinite(allTime) || !Number.isFinite(last30Days)) {
        throw new Error(repo.id + ' returned invalid download statistics');
      }

      return { id: repo.id, allTime, last30Days };
    });

    const results = await Promise.allSettled(requests);
    const rows = results
      .filter((result) => result.status === 'fulfilled')
      .map((result) => result.value);

    if (!isCompleteDownloadStats(rows)) {
      const failures = results.filter((result) => result.status === 'rejected');
      throw new Error('Only ' + rows.length + '/' + DOWNLOAD_STATS_REPOSITORIES.length + ' repositories responded (' + failures.length + ' failed)');
    }

    return rows;
  } finally {
    window.clearTimeout(timeoutId);
  }
}

async function refreshDownloadStats() {
  const refreshButton = document.getElementById('download-refresh');
  if (refreshButton) {
    refreshButton.disabled = true;
    refreshButton.classList.add('is-refreshing');
  }

  setDownloadStatsStatus('loading', 'Refreshing live statistics from Hugging Face...');

  try {
    const rows = await fetchDownloadStats();
    const updatedAt = new Date().toISOString();
    renderDownloadStats(rows);
    writeDownloadStatsCache(rows, updatedAt);
    setDownloadStatsStatus('live', 'Live from Hugging Face \u00b7 updated ' + formatDownloadStatsTime(updatedAt));
  } catch (error) {
    console.warn('Failed to refresh Hugging Face download statistics:', error);
    const cached = readDownloadStatsCache();
    if (cached) {
      renderDownloadStats(cached.rows);
      setDownloadStatsStatus('error', 'Live refresh unavailable \u00b7 showing data from ' + formatDownloadStatsTime(cached.updatedAt));
    } else {
      renderDownloadStats(DOWNLOAD_STATS_FALLBACK);
      setDownloadStatsStatus('error', 'Live refresh unavailable \u00b7 showing the ' + DOWNLOAD_STATS_FALLBACK_DATE + ' snapshot');
    }
  } finally {
    if (refreshButton) {
      refreshButton.disabled = false;
      refreshButton.classList.remove('is-refreshing');
    }
  }
}

function initDownloadStats() {
  if (!document.getElementById('downloads')) return;

  const cached = readDownloadStatsCache();
  if (cached) {
    renderDownloadStats(cached.rows);
    setDownloadStatsStatus('loading', 'Updating cached statistics from ' + formatDownloadStatsTime(cached.updatedAt) + '...');
  } else {
    renderDownloadStats(DOWNLOAD_STATS_FALLBACK);
  }

  const refreshButton = document.getElementById('download-refresh');
  if (refreshButton) {
    refreshButton.addEventListener('click', refreshDownloadStats);
  }

  refreshDownloadStats();
}

document.addEventListener('DOMContentLoaded', initDownloadStats);
