/**
 * Common function to load content items (case studies or featured projects)
 * @param {string} indexPath - Path to the JSON index file
 * @param {string} gridSelector - CSS selector for the grid container
 * @param {string} itemClass - CSS class for each item
 * @param {string} itemPrefix - ID prefix for each item (e.g., 'case-study' or 'featured-project')
 * @param {string} detailPageUrl - URL pattern for detail page (e.g., 'case-study.html' or 'project.html')
 * @param {string} loadingElementId - ID of the loading element
 */
async function loadContentItems(indexPath, gridSelector, itemClass, itemPrefix, detailPageUrl, loadingElementId) {
    try {
      // Fetch the index
      const indexResponse = await fetch(indexPath);
      if (!indexResponse.ok) {
        throw new Error(`Failed to load ${itemPrefix} index`);
      }
      
      // Get the data array from the appropriate property in the JSON
      const indexData = await indexResponse.json();
      const itemsArray = indexData[itemPrefix === 'case-study' ? 'caseStudies' : 'featuredProjects'] || [];
      
      // Sort by order if available
      itemsArray.sort((a, b) => (a.order || 999) - (b.order || 999));
      
      const gridElement = document.querySelector(gridSelector);
      if (!gridElement) {
        console.error(`${gridSelector} not found in the DOM`);
        return;
      }
      
      // Clear existing items
      gridElement.innerHTML = '';
      
      // Remove loading indicator if it exists
      const loadingElement = document.getElementById(loadingElementId);
      if (loadingElement) {
        loadingElement.remove();
      }
      
      // Load each item
      for (const item of itemsArray) {
        try {
          // Fetch the detailed item data
          const itemResponse = await fetch(item.path);
          if (!itemResponse.ok) {
            throw new Error(`Failed to load data for ${item.id}`);
          }
          
          const itemData = await itemResponse.json();
          
          // Find a suitable image for the thumbnail
          let thumbnailImage = './images/placeholder.jpg'; // Default placeholder
          let thumbnailAlt = itemData.title || item.id || `${itemPrefix.replace('-', ' ')}`;
          
          // Try to find a hero image first, then fall back to any available image
          if (itemData.images && itemData.images.length > 0) {
            const heroImage = itemData.images.find(img => img.type === 'hero');
            if (heroImage) {
              thumbnailImage = heroImage.url;
              thumbnailAlt = heroImage.alt || thumbnailAlt;
            } else {
              // Use the first available image
              thumbnailImage = itemData.images[0].url;
              thumbnailAlt = itemData.images[0].alt || thumbnailAlt;
            }
          }
          
          // Create the item article
          const article = document.createElement('article');
          article.className = itemClass;
          article.id = `${itemPrefix}-${item.id}`;
          
          // Create the item content
          article.innerHTML = `
            <div class="${itemPrefix}-image" id="${itemPrefix}-image-${item.id}">
              <img src="${thumbnailImage}" alt="${thumbnailAlt}" id="${itemPrefix}-img-${item.id}">
              <div class="${itemPrefix}-overlay" id="${itemPrefix}-overlay-${item.id}">
                <span class="title" id="${itemPrefix}-title-${item.id}">${itemData.title || item.id || 'Untitled'}</span>
              </div>
            </div>
          `;
          
          // Add click event to navigate to detail page
          article.addEventListener('click', () => {
            window.location.href = `${detailPageUrl}?id=${item.id}`;
          });
          
          // Add the article to the grid
          gridElement.appendChild(article);
        } catch (itemError) {
          console.error(`Error loading ${itemPrefix} ${item.id}:`, itemError);
          
          // Create a fallback item with available data
          const article = document.createElement('article');
          article.className = itemClass;
          article.id = `${itemPrefix}-${item.id}`;
          
          article.innerHTML = `
            <div class="${itemPrefix}-image" id="${itemPrefix}-image-${item.id}">
              <img src="./images/placeholder.jpg" alt="${item.id || itemPrefix.replace('-', ' ')}" id="${itemPrefix}-img-${item.id}">
              <div class="${itemPrefix}-overlay" id="${itemPrefix}-overlay-${item.id}">
                <span class="title" id="${itemPrefix}-title-${item.id}">${item.id || 'Untitled'}</span>
              </div>
            </div>
          `;
          
          article.addEventListener('click', () => {
            window.location.href = `${detailPageUrl}?id=${item.id}`;
          });
          
          gridElement.appendChild(article);
        }
      }
    } catch (indexError) {
      console.error(`Error loading ${itemPrefix} index:`, indexError);
      
      // Display error message or fallback content
      const gridElement = document.querySelector(gridSelector);
      if (gridElement) {
        gridElement.innerHTML = `
          <div class="error-message">
            <p>Unable to load ${itemPrefix.replace('-', ' ')}s. Please try again later.</p>
          </div>
        `;
      }
    }
  }
  
  // Function to load case studies
  function loadCaseStudies() {
    return loadContentItems(
      './data/json-index/case-study-index.json',
      '.case-studies-grid',
      'case-study',
      'case-study',
      'case-study.html',
      'case-studies-loading'
    );
  }
  
  // Function to load featured projects
  function loadFeaturedProjects() {
    return loadContentItems(
      './data/json-index/featured-project-index.json',
      '.featured-projects-grid',
      'featured-project',
      'featured-project',
      'project.html',
      'featured-projects-loading'
    );
  }
  
  // Execute when the DOM is fully loaded
  document.addEventListener('DOMContentLoaded', () => {
    // Load both case studies and featured projects
    loadCaseStudies();
    loadFeaturedProjects();
  });