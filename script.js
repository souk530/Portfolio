document.addEventListener('DOMContentLoaded', function() {
    initializePortfolio();
});

let projectsData = {};
let currentPage = 'home';

function initializePortfolio() {
    loadProjects();
    initializeAnimations();
    initializeInteractions();
    initializeRouter();
}

function initializeRouter() {
    window.addEventListener('popstate', handlePopState);
    handleInitialRoute();
}

function handleInitialRoute() {
    const hash = window.location.hash;
    if (hash.startsWith('#project/')) {
        const projectId = hash.replace('#project/', '');
        if (projectsData[projectId]) {
            showProjectDetail(projectId);
        } else {
            showHome();
        }
    } else {
        showHome();
    }
}

function handlePopState(event) {
    const hash = window.location.hash;
    if (hash.startsWith('#project/')) {
        const projectId = hash.replace('#project/', '');
        showProjectDetail(projectId, false);
    } else {
        showHome(false);
    }
}

async function loadProjects() {
    try {
        const response = await fetch('./link.json');
        projectsData = await response.json();
        displayProjects(projectsData);
        
        // Add stagger animation to project cards
        setTimeout(() => {
            animateProjectCards();
        }, 100);
        
    } catch (error) {
        console.error('プロジェクトデータの読み込みに失敗しました:', error);
        document.getElementById('projects').innerHTML = `
            <div class="error-message">
                <p>プロジェクトデータの読み込みに失敗しました。</p>
            </div>
        `;
    }
}

function displayProjects(projects) {
    const projectsContainer = document.getElementById('projects');
    projectsContainer.innerHTML = '';

    for (const [projectId, projectData] of Object.entries(projects)) {
        const projectElement = createProjectCard(projectId, projectData);
        projectsContainer.appendChild(projectElement);
    }
}

function createProjectCard(projectId, projectData) {
    const projectDiv = document.createElement('div');
    projectDiv.className = 'project-card project-item';
    projectDiv.setAttribute('data-project-id', projectId);
    
    // Ensure projectData has all required properties
    const safeProjectData = {
        title: projectData.title || 'タイトル未設定',
        category: projectData.category || 'その他',
        year: projectData.year || '2024',
        description: projectData.description || '説明がありません',
        tags: projectData.tags || [],
        embeddable: projectData.embeddable || false,
        url: projectData.url || '',
        urls: projectData.urls || null
    };
    
    const previewUrl = safeProjectData.url || (safeProjectData.urls ? safeProjectData.urls.main : '');
    const previewSection = createPreviewSection(previewUrl, safeProjectData.title, safeProjectData.embeddable);
    
    projectDiv.innerHTML = `
        ${previewSection}
        <div class="project-content">
            <div class="project-meta">
                <span class="project-category">${safeProjectData.category}</span>
                <span class="project-year">${safeProjectData.year}</span>
            </div>
            <h3 class="project-title">${safeProjectData.title}</h3>
            <p class="project-description">${safeProjectData.description}</p>
            <div class="project-tags">
                ${safeProjectData.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
            </div>
            <div class="project-actions">
                <button class="btn-detail" onclick="showProjectDetail('${projectId}')">
                    詳細を見る
                    <span class="link-arrow">→</span>
                </button>
                ${previewUrl ? `<a href="${previewUrl}" target="_blank" rel="noopener noreferrer" class="btn-external">
                    サイトを開く
                    <span class="external-icon">↗</span>
                </a>` : ''}
            </div>
        </div>
    `;

    // Add interaction listeners
    addProjectInteractions(projectDiv);
    
    return projectDiv;
}

function createPreviewSection(url, projectName, isEmbeddable) {
    if (isEmbeddable && url) {
        return `
            <div class="project-preview" data-url="${url}">
                <iframe src="${url}" loading="lazy" title="${projectName} プレビュー"></iframe>
                <div class="preview-overlay">
                    <span class="preview-label">プレビュー</span>
                    <button class="preview-fullscreen" onclick="openFullscreen('${url}')">
                        <span>⛶</span>
                    </button>
                </div>
            </div>
        `;
    } else {
        return `
            <div class="project-preview preview-blocked">
                <div class="preview-placeholder">
                    <div class="placeholder-icon">🌐</div>
                    <div class="placeholder-text">プレビュー利用不可</div>
                    <div class="placeholder-subtext">詳細ページで確認</div>
                </div>
                <div class="preview-overlay">
                    <span class="preview-label">詳細を見る</span>
                </div>
            </div>
        `;
    }
}

function showProjectDetail(projectId, updateHistory = true) {
    const project = projectsData[projectId];
    if (!project) return;
    
    if (updateHistory) {
        history.pushState({ projectId }, project.title, `#project/${projectId}`);
    }
    
    const detailContainer = document.getElementById('project-detail');
    const previewUrl = project.url || (project.urls ? project.urls.main : '');
    
    // Ensure project has all required properties with fallbacks
    const safeProject = {
        title: project.title || 'タイトル未設定',
        subtitle: project.subtitle || '',
        description: project.description || '説明がありません',
        category: project.category || 'その他',
        year: project.year || '2024',
        status: project.status || '不明',
        embeddable: project.embeddable || false,
        technologies: project.technologies || [],
        features: project.features || [],
        background: project.background || '背景情報がありません',
        challenges: project.challenges || '課題情報がありません',
        solutions: project.solutions || '解決策情報がありません',
        tags: project.tags || [],
        urls: project.urls || null
    };
    
    detailContainer.innerHTML = `
        <div class="detail-hero">
            <div class="detail-preview">
                ${safeProject.embeddable && previewUrl ? 
                    `<iframe src="${previewUrl}" title="${safeProject.title}"></iframe>` :
                    `<div class="detail-placeholder">
                        <div class="placeholder-icon">🌐</div>
                        <div class="placeholder-text">${safeProject.title}</div>
                    </div>`
                }
            </div>
            <div class="detail-info">
                <div class="detail-meta">
                    <span class="detail-category">${safeProject.category}</span>
                    <span class="detail-year">${safeProject.year}</span>
                    <span class="detail-status status-${safeProject.status === '運用中' ? 'active' : 'inactive'}">${safeProject.status}</span>
                </div>
                <h1 class="detail-title">${safeProject.title}</h1>
                <p class="detail-subtitle">${safeProject.subtitle}</p>
                <p class="detail-description">${safeProject.description}</p>
                
                <div class="detail-links">
                    ${previewUrl ? `<a href="${previewUrl}" target="_blank" rel="noopener noreferrer" class="btn-primary">
                        サイトを開く
                        <span class="external-icon">↗</span>
                    </a>` : ''}
                    ${safeProject.urls ? Object.entries(safeProject.urls).map(([name, url]) => 
                        `<a href="${url}" target="_blank" rel="noopener noreferrer" class="btn-secondary">
                            ${name === 'main' ? 'メインサイト' : name === 'survey' ? 'アンケート' : name}
                            <span class="external-icon">↗</span>
                        </a>`
                    ).join('') : ''}
                </div>
            </div>
        </div>
        
        <div class="detail-sections">
            <section class="detail-section">
                <h2>プロジェクト概要</h2>
                <div class="section-content">
                    <div class="overview-grid">
                        <div class="overview-item">
                            <h4>技術スタック</h4>
                            <div class="tech-list">
                                ${safeProject.technologies.map(tech => `<span class="tech-item">${tech}</span>`).join('')}
                            </div>
                        </div>
                        <div class="overview-item">
                            <h4>主な機能</h4>
                            <ul class="feature-list">
                                ${safeProject.features.map(feature => `<li>${feature}</li>`).join('')}
                            </ul>
                        </div>
                    </div>
                </div>
            </section>
            
            <section class="detail-section">
                <h2>開発背景</h2>
                <div class="section-content">
                    <p>${safeProject.background}</p>
                </div>
            </section>
            
            <section class="detail-section">
                <h2>課題と解決策</h2>
                <div class="section-content">
                    <div class="challenge-solution">
                        <div class="challenge">
                            <h4>課題</h4>
                            <p>${safeProject.challenges}</p>
                        </div>
                        <div class="solution">
                            <h4>解決策</h4>
                            <p>${safeProject.solutions}</p>
                        </div>
                    </div>
                </div>
            </section>
            
            <section class="detail-section">
                <h2>タグ</h2>
                <div class="section-content">
                    <div class="detail-tags">
                        ${safeProject.tags.map(tag => `<span class="detail-tag">${tag}</span>`).join('')}
                    </div>
                </div>
            </section>
        </div>
    `;
    
    // Show detail page
    currentPage = 'detail';
    document.getElementById('home-page').classList.remove('active');
    document.getElementById('detail-page').classList.add('active');
    
    // Animate entry
    setTimeout(() => {
        document.getElementById('detail-page').classList.add('loaded');
    }, 50);
}

function showHome(updateHistory = true) {
    if (updateHistory && currentPage !== 'home') {
        history.pushState({}, 'Portfolio', '#');
    }
    
    currentPage = 'home';
    document.getElementById('detail-page').classList.remove('active', 'loaded');
    document.getElementById('home-page').classList.add('active');
}

function toggleNav() {
    // Mobile navigation toggle (if needed later)
    console.log('Navigation toggle');
}

function openFullscreen(url) {
    window.open(url, '_blank', 'noopener,noreferrer');
}

function addProjectInteractions(projectElement) {
    let isPressed = false;
    
    // Mouse/Touch events for clay press effect
    projectElement.addEventListener('mousedown', function(e) {
        if (e.target.tagName === 'A') return;
        isPressed = true;
        this.style.transform = 'translateY(-2px) scale(0.98)';
        this.style.transition = 'all 0.1s ease';
    });
    
    projectElement.addEventListener('mouseup', function() {
        if (isPressed) {
            this.style.transform = '';
            this.style.transition = 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
            isPressed = false;
        }
    });
    
    projectElement.addEventListener('mouseleave', function() {
        if (isPressed) {
            this.style.transform = '';
            this.style.transition = 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
            isPressed = false;
        }
    });
    
    // Touch events
    projectElement.addEventListener('touchstart', function(e) {
        if (e.target.tagName === 'A') return;
        isPressed = true;
        this.style.transform = 'translateY(-2px) scale(0.98)';
        this.style.transition = 'all 0.1s ease';
    });
    
    projectElement.addEventListener('touchend', function() {
        if (isPressed) {
            this.style.transform = '';
            this.style.transition = 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
            isPressed = false;
        }
    });
}

function animateProjectCards() {
    const projectItems = document.querySelectorAll('.project-item');
    
    projectItems.forEach((item, index) => {
        item.style.opacity = '0';
        item.style.transform = 'translateY(30px)';
        item.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
        
        setTimeout(() => {
            item.style.opacity = '1';
            item.style.transform = 'translateY(0)';
        }, index * 150);
    });
}

function initializeAnimations() {
    // Header animation
    const header = document.querySelector('.header-clay');
    if (header) {
        header.style.opacity = '0';
        header.style.transform = 'translateY(-20px)';
        header.style.transition = 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
        
        setTimeout(() => {
            header.style.opacity = '1';
            header.style.transform = 'translateY(0)';
        }, 200);
    }
    
    // Floating elements random movement
    const floatElements = document.querySelectorAll('.float-element');
    floatElements.forEach(element => {
        const randomDelay = Math.random() * 2000;
        const randomDuration = 4000 + Math.random() * 4000;
        
        element.style.animationDelay = randomDelay + 'ms';
        element.style.animationDuration = randomDuration + 'ms';
    });
}

function initializeInteractions() {
    // Add ripple effect to buttons
    const links = document.querySelectorAll('.project-link, .project-main-link');
    
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            createRippleEffect(e, this);
        });
    });
    
    // Scroll animations
    initializeScrollAnimations();
}

function createRippleEffect(event, element) {
    const rect = element.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;
    
    const ripple = document.createElement('span');
    ripple.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        left: ${x}px;
        top: ${y}px;
        background: rgba(251, 191, 36, 0.4);
        border-radius: 50%;
        transform: scale(0);
        animation: ripple 0.6s linear;
        pointer-events: none;
        z-index: 1;
    `;
    
    element.style.position = 'relative';
    element.style.overflow = 'hidden';
    element.appendChild(ripple);
    
    // Add ripple animation keyframes if not exists
    if (!document.querySelector('#ripple-keyframes')) {
        const style = document.createElement('style');
        style.id = 'ripple-keyframes';
        style.textContent = `
            @keyframes ripple {
                to {
                    transform: scale(2);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    setTimeout(() => {
        ripple.remove();
    }, 600);
}

function initializeScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Observe footer
    const footer = document.querySelector('.footer-clay');
    if (footer) {
        footer.style.opacity = '0';
        footer.style.transform = 'translateY(30px)';
        footer.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
        observer.observe(footer);
    }
}

// Add dynamic texture animation
function addDynamicTexture() {
    const textureElements = document.querySelectorAll('.project-card, .single-project, .header-clay');
    
    textureElements.forEach(element => {
        element.addEventListener('mousemove', function(e) {
            const rect = this.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 100;
            const y = ((e.clientY - rect.top) / rect.height) * 100;
            
            this.style.setProperty('--mouse-x', x + '%');
            this.style.setProperty('--mouse-y', y + '%');
        });
    });
}

// Initialize dynamic texture after DOM is loaded
setTimeout(() => {
    addDynamicTexture();
}, 500);