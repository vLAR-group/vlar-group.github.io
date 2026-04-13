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
  "Zihui Zhang": "https://scholar.google.com/citations?user=jiwazT8AAAAJ",
  "Shenxing Wei": "https://scholar.google.com.hk/citations?user=5RH0zBMAAAAJ",
  "Bowen Cheng": "https://scholar.google.com/citations?user=mmFhKOAAAAAJ&hl=en",
  "Jiahao Chen": "https://github.com/D2Simon"
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
