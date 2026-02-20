/**
 * Gallery Rendering
 * 
 * Gallery rendering and visualization
 */

import {
  Gallery,
  MediaItem,
  GalleryRenderOptions,
  GalleryRenderResult,
  GallerySettings,
} from './types';

export class GalleryRenderer {
  /**
   * Render gallery to HTML
   */
  renderGallery(gallery: Gallery, options: GalleryRenderOptions): GalleryRenderResult {
    const startTime = Date.now();
    
    // Determine which layout to use
    const layout = options.layout || gallery.layout;
    
    // Generate HTML based on layout
    let html: string;
    let css: string;
    let javascript: string;

    switch (layout) {
      case 'grid':
        ({ html, css, javascript } = this.renderGridGallery(gallery, options));
        break;
      case 'masonry':
        ({ html, css, javascript } = this.renderMasonryGallery(gallery, options));
        break;
      case 'carousel':
        ({ html, css, javascript } = this.renderCarouselGallery(gallery, options));
        break;
      case 'slideshow':
        ({ html, css, javascript } = this.renderSlideshowGallery(gallery, options));
        break;
      default:
        ({ html, css, javascript } = this.renderGridGallery(gallery, options));
    }

    const renderTime = Date.now() - startTime;

    return {
      html,
      css,
      javascript,
      mediaItems: gallery.mediaItems,
      renderTime,
    };
  }

  /**
   * Render grid gallery
   */
  private renderGridGallery(gallery: Gallery, options: GalleryRenderOptions): {
    html: string;
    css: string;
    javascript: string;
  } {
    const settings = gallery.settings;
    const columns = settings.columns;
    const spacing = settings.spacing;
    
    // Generate HTML
    let html = `<div class="gallery-grid" id="${options.containerId || 'gallery'}">\n`;
    
    for (const item of gallery.mediaItems.slice(0, settings.maxItems)) {
      html += this.renderMediaItem(item, settings, options);
    }
    
    html += `</div>`;

    // Generate CSS
    const css = `
.gallery-grid {
  display: grid;
  grid-template-columns: repeat(${columns}, 1fr);
  gap: ${spacing}px;
  margin: 0 auto;
  max-width: 100%;
}

.gallery-item {
  position: relative;
  overflow: hidden;
  border-radius: 8px;
  background: ${options.theme === 'dark' ? '#2d3748' : '#f7fafc'};
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.gallery-item:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

.gallery-item img {
  width: 100%;
  height: auto;
  display: block;
  transition: transform 0.3s ease;
}

.gallery-item:hover img {
  transform: scale(1.05);
}

.gallery-item-content {
  padding: 12px;
}

.gallery-item-title {
  font-weight: 600;
  margin-bottom: 4px;
  color: ${options.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
}

.gallery-item-description {
  font-size: 0.875rem;
  color: ${options.theme === 'dark' ? '#a0aec0' : '#718096'};
  margin-bottom: 8px;
}

.gallery-item-meta {
  font-size: 0.75rem;
  color: ${options.theme === 'dark' ? '#718096' : '#a0aec0'};
  display: flex;
  justify-content: space-between;
}

.gallery-item-type {
  text-transform: uppercase;
  font-weight: 600;
  letter-spacing: 0.05em;
}

${options.customStyles || ''}
`;

    // Generate JavaScript
    const javascript = this.generateGalleryJavaScript(options, settings);

    return { html, css, javascript };
  }

  /**
   * Render masonry gallery
   */
  private renderMasonryGallery(gallery: Gallery, options: GalleryRenderOptions): {
    html: string;
    css: string;
    javascript: string;
  } {
    const settings = gallery.settings;
    
    // Generate HTML
    let html = `<div class="gallery-masonry" id="${options.containerId || 'gallery'}">\n`;
    
    for (const item of gallery.mediaItems.slice(0, settings.maxItems)) {
      html += this.renderMediaItem(item, settings, options);
    }
    
    html += `</div>`;

    // Generate CSS
    const css = `
.gallery-masonry {
  column-count: ${settings.columns};
  column-gap: ${settings.spacing}px;
  margin: 0 auto;
  max-width: 100%;
}

.gallery-item {
  break-inside: avoid;
  margin-bottom: ${settings.spacing}px;
  position: relative;
  overflow: hidden;
  border-radius: 8px;
  background: ${options.theme === 'dark' ? '#2d3748' : '#f7fafc'};
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.gallery-item:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

.gallery-item img {
  width: 100%;
  height: auto;
  display: block;
  transition: transform 0.3s ease;
}

.gallery-item:hover img {
  transform: scale(1.05);
}

.gallery-item-content {
  padding: 12px;
}

.gallery-item-title {
  font-weight: 600;
  margin-bottom: 4px;
  color: ${options.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
}

.gallery-item-description {
  font-size: 0.875rem;
  color: ${options.theme === 'dark' ? '#a0aec0' : '#718096'};
  margin-bottom: 8px;
}

.gallery-item-meta {
  font-size: 0.75rem;
  color: ${options.theme === 'dark' ? '#718096' : '#a0aec0'};
  display: flex;
  justify-content: space-between;
}

.gallery-item-type {
  text-transform: uppercase;
  font-weight: 600;
  letter-spacing: 0.05em;
}

${options.customStyles || ''}
`;

    // Generate JavaScript
    const javascript = this.generateGalleryJavaScript(options, settings);

    return { html, css, javascript };
  }

  /**
   * Generate gallery JavaScript
   */
  private generateGalleryJavaScript(options: GalleryRenderOptions, settings: GallerySettings): string {
    return `
document.addEventListener('DOMContentLoaded', function() {
  const gallery = document.getElementById('${options.containerId || 'gallery'}');
  
  if (!gallery) return;
  
  // Lazy loading
  if (${options.lazyLoad}) {
    const lazyImages = gallery.querySelectorAll('img[data-src]');
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
          observer.unobserve(img);
        }
      });
    });
    
    lazyImages.forEach(img => imageObserver.observe(img));
  }
  
  // Lightbox functionality
  if (${settings.enableLightbox}) {
    gallery.addEventListener('click', function(e) {
      const item = e.target.closest('.gallery-item');
      if (item) {
        const img = item.querySelector('img');
        if (img) {
          openLightbox(img.src, item.querySelector('.gallery-item-title')?.textContent || '');
        }
      }
    });
  }
  
  function openLightbox(src, title) {
    // Lightbox implementation would go here
    console.log('Opening lightbox for:', src, title);
  }
});
`;
  }

  /**
   * Render carousel gallery
   */
  private renderCarouselGallery(gallery: Gallery, options: GalleryRenderOptions): {
    html: string;
    css: string;
    javascript: string;
  } {
    const settings = gallery.settings;
    
    // Generate HTML
    let html = `
<div class="gallery-carousel" id="${options.containerId || 'gallery'}">
  <div class="carousel-container">
    <div class="carousel-track">\n`;
    
    for (const item of gallery.mediaItems.slice(0, settings.maxItems)) {
      html += `<div class="carousel-slide">${this.renderMediaItem(item, settings, options)}</div>\n`;
    }
    
    html += `</div>
  </div>`;
    
    if (options.showControls) {
      html += `
  <button class="carousel-prev" aria-label="Previous">‹</button>
  <button class="carousel-next" aria-label="Next">›</button>`;
    }
    
    if (options.showPagination) {
      html += `
  <div class="carousel-pagination"></div>`;
    }
    
    html += `</div>`;

    // Generate CSS
    const css = `
.gallery-carousel {
  position: relative;
  max-width: 100%;
  margin: 0 auto;
  overflow: hidden;
}

.carousel-container {
  overflow: hidden;
}

.carousel-track {
  display: flex;
  transition: transform ${settings.transitionSpeed}ms ease;
}

.carousel-slide {
  flex: 0 0 100%;
  max-width: 100%;
}

.gallery-item {
  margin: 0 auto;
  max-width: 800px;
  border-radius: 8px;
  background: ${options.theme === 'dark' ? '#2d3748' : '#f7fafc'};
  overflow: hidden;
}

.gallery-item img {
  width: 100%;
  height: auto;
  display: block;
}

.gallery-item-content {
  padding: 20px;
}

.gallery-item-title {
  font-weight: 600;
  margin-bottom: 8px;
  color: ${options.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
  font-size: 1.25rem;
}

.gallery-item-description {
  font-size: 1rem;
  color: ${options.theme === 'dark' ? '#a0aec0' : '#718096'};
  margin-bottom: 12px;
}

.carousel-prev,
.carousel-next {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(0, 0, 0, 0.5);
  color: white;
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  font-size: 1.5rem;
  cursor: pointer;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
}

.carousel-prev:hover,
.carousel-next:hover {
  background: rgba(0, 0, 0, 0.8);
}

.carousel-prev {
  left: 10px;
}

.carousel-next {
  right: 10px;
}

.carousel-pagination {
  display: flex;
  justify-content: center;
  margin-top: 20px;
  gap: 8px;
}

.carousel-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: ${options.theme === 'dark' ? '#4a5568' : '#cbd5e0'};
  border: none;
  cursor: pointer;
  padding: 0;
}

.carousel-dot.active {
  background: ${options.theme === 'dark' ? '#63b3ed' : '#3182ce'};
}

${options.customStyles || ''}
`;

    // Generate JavaScript for carousel
    const javascript = this.generateCarouselJavaScript(options, settings);

    return { html, css, javascript };
  }

  /**
   * Generate carousel JavaScript
   */
  private generateCarouselJavaScript(options: GalleryRenderOptions, settings: GallerySettings): string {
    return `
document.addEventListener('DOMContentLoaded', function() {
  const carousel = document.getElementById('${options.containerId || 'gallery'}');
  if (!carousel) return;
  
  const track = carousel.querySelector('.carousel-track');
  const slides = Array.from(carousel.querySelectorAll('.carousel-slide'));
  const prevButton = carousel.querySelector('.carousel-prev');
  const nextButton = carousel.querySelector('.carousel-next');
  const pagination = carousel.querySelector('.carousel-pagination');
  
  let currentSlide = 0;
  const slideCount = slides.length;
  
  // Create pagination dots
  if (pagination && ${options.showPagination}) {
    for (let i = 0; i < slideCount; i++) {
      const dot = document.createElement('button');
      dot.className = 'carousel-dot' + (i === 0 ? ' active' : '');
      dot.setAttribute('aria-label', 'Go to slide ' + (i + 1));
      dot.addEventListener('click', () => goToSlide(i));
      pagination.appendChild(dot);
    }
  }
  
  // Update carousel position
  function updateCarousel() {
    if (track) {
      track.style.transform = 'translateX(-' + (currentSlide * 100) + '%)';
    }
    
    // Update active slide
    slides.forEach((slide, index) => {
      slide.classList.toggle('active', index === currentSlide);
    });
    
    // Update pagination dots
    if (pagination) {
      const dots = pagination.querySelectorAll('.carousel-dot');
      dots.forEach((dot, index) => {
        dot.classList.toggle('active', index === currentSlide);
      });
    }
  }
  
  // Go to specific slide
  function goToSlide(index) {
    currentSlide = (index + slideCount) % slideCount;
    updateCarousel();
  }
  
  // Next slide
  function nextSlide() {
    goToSlide(currentSlide + 1);
  }
  
  // Previous slide
  function prevSlide() {
    goToSlide(currentSlide - 1);
  }
  
  // Event listeners
  if (prevButton) {
    prevButton.addEventListener('click', prevSlide);
  }
  
  if (nextButton) {
    nextButton.addEventListener('click', nextSlide);
  }
  
  // Auto-play if enabled
  if (${settings.autoPlay}) {
    setInterval(nextSlide, 3000);
  }
  
  // Initialize
  updateCarousel();
});
`;
  }

  /**
   * Render individual media item
   */
  private renderMediaItem(item: MediaItem, settings: GallerySettings, options: GalleryRenderOptions): string {
    const lazyAttr = options.lazyLoad ? `data-src="${item.url}"` : `src="${item.url}"`;
    const altText = item.metadata.altText || item.metadata.title || item.filename;
    
    let html = `<div class="gallery-item" data-id="${item.id}" data-type="${item.type}">\n`;
    
    // Media element
    if (item.type === 'image') {
      html += `  <img ${lazyAttr} alt="${altText}" loading="${options.lazyLoad ? 'lazy' : 'eager'}">\n`;
    } else if (item.type === 'video') {
      html += `  <video controls ${options.lazyLoad ? 'preload="none"' : ''}>\n`;
      html += `    <source src="${item.url}" type="video/mp4">\n`;
      html += `    Your browser does not support the video tag.\n`;
      html += `  </video>\n`;
    } else if (item.type === 'audio') {
      html += `  <audio controls ${options.lazyLoad ? 'preload="none"' : ''}>\n`;
      html += `    <source src="${item.url}" type="audio/mpeg">\n`;
      html += `    Your browser does not support the audio tag.\n`;
      html += `  </audio>\n`;
    } else {
      // Document type
      html += `  <div class="document-preview">\n`;
      html += `    <div class="document-icon">📄</div>\n`;
      html += `    <div class="document-info">\n`;
      html += `      <div class="document-name">${item.filename}</div>\n`;
      html += `      <div class="document-size">${this.formatFileSize(item.fileSize)}</div>\n`;
      html += `    </div>\n`;
      html += `  </div>\n`;
    }
    
    // Content section
    html += `  <div class="gallery-item-content">\n`;
    
    if (settings.showTitles && item.metadata.title) {
      html += `    <div class="gallery-item-title">${item.metadata.title}</div>\n`;
    }
    
    if (settings.showDescriptions && item.metadata.description) {
      html += `    <div class="gallery-item-description">${item.metadata.description}</div>\n`;
    }
    
    if (settings.showMetadata) {
      html += `    <div class="gallery-item-meta">\n`;
      html += `      <span class="gallery-item-type">${item.type}</span>\n`;
      html += `      <span class="gallery-item-date">${this.formatDate(item.metadata.uploadedAt)}</span>\n`;
      html += `    </div>\n`;
    }
    
    html += `  </div>\n`;
    html += `</div>\n`;
    
    return html;
  }

  /**
   * Format file size
   */
  private formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Format date
   */
  private formatDate(date: Date): string {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  /**
   * Render slideshow gallery
   */
  private renderSlideshowGallery(gallery: Gallery, options: GalleryRenderOptions): {
    html: string;
    css: string;
    javascript: string;
  } {
    const settings = gallery.settings;
    
    // Generate HTML
    let html = `
<div class="gallery-slideshow" id="${options.containerId || 'gallery'}">
  <div class="slideshow-container">\n`;
    
    for (const item of gallery.mediaItems.slice(0, settings.maxItems)) {
      html += `<div class="slideshow-slide">${this.renderMediaItem(item, settings, options)}</div>\n`;
    }
    
    html += `</div>`;
    
    if (options.showControls) {
      html += `
  <button class="slideshow-prev" aria-label="Previous">‹</button>
  <button class="slideshow-next" aria-label="Next">›</button>`;
    }
    
    if (options.showPagination) {
      html += `
  <div class="slideshow-pagination"></div>`;
    }
    
    if (options.showThumbnails) {
      html += `
  <div class="slideshow-thumbnails"></div>`;
    }
    
    html += `</div>`;

    // Generate CSS
    const css = `
.gallery-slideshow {
  position: relative;
  max-width: 100%;
  margin: 0 auto;
}

.slideshow-container {
  position: relative;
  overflow: hidden;
}

.slideshow-slide {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  opacity: 0;
  transition: opacity ${settings.transitionSpeed}ms ease;
}

.slideshow-slide.active {
  position: relative;
  opacity: 1;
}

.gallery-item {
  margin: 0 auto;
  max-width: 800px;
  border-radius: 8px;
  background: ${options.theme === 'dark' ? '#2d3748' : '#f7fafc'};
  overflow: hidden;
}

.gallery-item img {
  width: 100%;
  height: auto;
  display: block;
}

.gallery-item-content {
  padding: 20px;
}

.gallery-item-title {
  font-weight: 600;
  margin-bottom: 8px;
  color: ${options.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
  font-size: 1.25rem;
}

.gallery-item-description {
  font-size: 1rem;
  color: ${options.theme === 'dark' ? '#a0aec0' : '#718096'};
  margin-bottom: 12px;
}

.slideshow-prev,
.slideshow-next {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(0, 0, 0, 0.5);
  color: white;
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  font-size: 1.5rem;
  cursor: pointer;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
}

.slideshow-prev:hover,
.slideshow-next:hover {
  background: rgba(0, 0, 0, 0.8);
}

.slideshow-prev {
  left: 10px;
}

.slideshow-next {
  right: 10px;
}

.slideshow-pagination {
  display: flex;
  justify-content: center;
  margin-top: 20px;
  gap: 8px;
}

.slideshow-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: ${options.theme === 'dark' ? '#4a5568' : '#cbd5e0'};
  border: none;
  cursor: pointer;
  padding: 0;
}

.slideshow-dot.active {
  background: ${options.theme === 'dark' ? '#63b3ed' : '#3182ce'};
}

.slideshow-thumbnails {
  display: flex;
  justify-content: center;
  margin-top: 20px;
  gap: 10px;
  flex-wrap: wrap;
}

.thumbnail {
  width: 60px;
  height: 60px;
  border-radius: 4px;
  overflow: hidden;
  cursor: pointer;
  opacity: 0.6;
  transition: opacity 0.3s ease;
}

.thumbnail:hover,
.thumbnail.active {
  opacity: 1;
}

.thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

${options.customStyles || ''}
`;

    // Generate JavaScript for slideshow
    const javascript = this.generateSlideshowJavaScript(options, settings);

    return { html, css, javascript };
  }

  /**
   * Generate slideshow JavaScript
   */
  private generateSlideshowJavaScript(options: GalleryRenderOptions, settings: GallerySettings): string {
    return `
document.addEventListener('DOMContentLoaded', function() {
  const slideshow = document.getElementById('${options.containerId || 'gallery'}');
  if (!slideshow) return;
  
  const container = slideshow.querySelector('.slideshow-container');
  const slides = Array.from(slideshow.querySelectorAll('.slideshow-slide'));
  const prevButton = slideshow.querySelector('.slideshow-prev');
  const nextButton = slideshow.querySelector('.slideshow-next');
  const pagination = slideshow.querySelector('.slideshow-pagination');
  const thumbnailsContainer = slideshow.querySelector('.slideshow-thumbnails');
  
  let currentSlide = 0;
  const slideCount = slides.length;
  let autoPlayInterval;
  
  // Initialize slides
  slides.forEach((slide, index) => {
    if (index === 0) {
      slide.classList.add('active');
    }
  });
  
  // Create pagination dots
  if (pagination && ${options.showPagination}) {
    for (let i = 0; i < slideCount; i++) {
      const dot = document.createElement('button');
      dot.className = 'slideshow-dot' + (i === 0 ? ' active' : '');
      dot.setAttribute('aria-label', 'Go to slide ' + (i + 1));
      dot.addEventListener('click', () => goToSlide(i));
      pagination.appendChild(dot);
    }
  }
  
  // Create thumbnails
  if (thumbnailsContainer && ${options.showThumbnails}) {
    for (let i = 0; i < slideCount; i++) {
      const slide = slides[i];
      const img = slide.querySelector('img');
      if (img) {
        const thumbnail = document.createElement('div');
        thumbnail.className = 'thumbnail' + (i === 0 ? ' active' : '');
        thumbnail.innerHTML = '<img src="' + img.src + '" alt="Thumbnail ' + (i + 1) + '">';
        thumbnail.addEventListener('click', () => goToSlide(i));
        thumbnailsContainer.appendChild(thumbnail);
      }
    }
  }
  
  // Go to specific slide
  function goToSlide(index) {
    currentSlide = (index + slideCount) % slideCount;
    
    // Update slides
    slides.forEach((slide, i) => {
      slide.classList.toggle('active', i === currentSlide);
    });
    
    // Update pagination dots
    if (pagination) {
      const dots = pagination.querySelectorAll('.slideshow-dot');
      dots.forEach((dot, i) => {
        dot.classList.toggle('active', i === currentSlide);
      });
    }
    
    // Update thumbnails
    if (thumbnailsContainer) {
      const thumbnails = thumbnailsContainer.querySelectorAll('.thumbnail');
      thumbnails.forEach((thumbnail, i) => {
        thumbnail.classList.toggle('active', i === currentSlide);
      });
    }
    
    // Reset auto-play timer
    if (${settings.autoPlay}) {
      clearInterval(autoPlayInterval);
      startAutoPlay();
    }
  }
  
  // Next slide
  function nextSlide() {
    goToSlide(currentSlide + 1);
  }
  
  // Previous slide
  function prevSlide() {
    goToSlide(currentSlide - 1);
  }
  
  // Start auto-play
  function startAutoPlay() {
    if (${settings.autoPlay}) {
      autoPlayInterval = setInterval(nextSlide, 5000);
    }
  }
  
  // Event listeners
  if (prevButton) {
    prevButton.addEventListener('click', prevSlide);
  }
  
  if (nextButton) {
    nextButton.addEventListener('click', nextSlide);
  }
  
  // Keyboard navigation
  document.addEventListener('keydown', function(e) {
    if (e.key === 'ArrowLeft') prevSlide();
    if (e.key === 'ArrowRight') nextSlide();
  });
  
  // Start auto-play if enabled
  if (${settings.autoPlay}) {
    startAutoPlay();
    
    // Pause on hover
    if (container) {
      container.addEventListener('mouseenter', () => clearInterval(autoPlayInterval));
      container.addEventListener('mouseleave', startAutoPlay);
    }
  }
  
  // Initialize
  goToSlide(0);
});
`;
  }
}
