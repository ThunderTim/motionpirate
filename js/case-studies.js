/**
 * Function to load case studies
 * Creates case study elements with the following ID structure:
 * - case-study-{id} - The main article element
 * - case-study-image-{id} - The image container div
 * - case-study-img-{id} - The actual image element
 * - case-study-overlay-{id} - The overlay div
 * - case-study-title-{id} - The title span element
 * 
 * This allows for targeted CSS and JS manipulation of each element
 */
async function loadCaseStudies() {
    try {
      // Fetch the case study index
      const indexResponse = await fetch('./data/json-index/case-study-index.json');
      if (!indexResponse.ok) {
        throw new Error('Failed to load case study index');
      }
      
      const indexData = await indexResponse.json();
      const caseStudies = indexData.caseStudies || [];
      
      // Sort case studies by order if available
      caseStudies.sort((a, b) => (a.order || 999) - (b.order || 999));
      
      const caseStudyGrid = document.querySelector('.case-studies-grid');
      if (!caseStudyGrid) {
        console.error('Case study grid not found in the DOM');
        return;
      }
      
      // Clear existing case studies (if any)
      caseStudyGrid.innerHTML = '';
      
      // Load each case study
      for (const study of caseStudies) {
        try {
          // Fetch the detailed project data
          const projectResponse = await fetch(study.path);
          if (!projectResponse.ok) {
            throw new Error(`Failed to load project data for ${study.id}`);
          }
          
          const projectData = await projectResponse.json();
          
          // Find a suitable image for the thumbnail
          let thumbnailImage = './images/placeholder.jpg'; // Default placeholder
          let thumbnailAlt = projectData.title || study.id || 'Case Study';
          
          // Try to find a hero image first, then fall back to any available image
          if (projectData.images && projectData.images.length > 0) {
            const heroImage = projectData.images.find(img => img.type === 'hero');
            if (heroImage) {
              thumbnailImage = heroImage.url;
              thumbnailAlt = heroImage.alt || thumbnailAlt;
            } else {
              // Use the first available image
              thumbnailImage = projectData.images[0].url;
              thumbnailAlt = projectData.images[0].alt || thumbnailAlt;
            }
          }
          
          // Create the case study article
          const article = document.createElement('article');
          article.className = 'case-study';
          article.id = `case-study-${study.id}`;
          
          // Create the case study content
          article.innerHTML = `
            <div class="case-study-image" id="case-study-image-${study.id}">
              <img src="${thumbnailImage}" alt="${thumbnailAlt}" id="case-study-img-${study.id}">
              <div class="case-study-overlay" id="case-study-overlay-${study.id}">
                <span class="title" id="case-study-title-${study.id}">${projectData.title || study.id || 'Untitled Case Study'}</span>
              </div>
            </div>
          `;
          
          // Add click event to navigate to case study page
          article.addEventListener('click', () => {
            window.location.href = `case-study.html?id=${study.id}`;
          });
          
          // Add the article to the grid
          caseStudyGrid.appendChild(article);
        } catch (projectError) {
          console.error(`Error loading case study ${study.id}:`, projectError);
          
          // Create a fallback case study with available data
          const article = document.createElement('article');
          article.className = 'case-study';
          article.id = `case-study-${study.id}`;
          
          article.innerHTML = `
            <div class="case-study-image" id="case-study-image-${study.id}">
              <img src="./images/placeholder.jpg" alt="${study.id || 'Case Study'}" id="case-study-img-${study.id}">
              <div class="case-study-overlay" id="case-study-overlay-${study.id}">
                <span class="title" id="case-study-title-${study.id}">${study.id || 'Untitled Case Study'}</span>
              </div>
            </div>
          `;
          
          article.addEventListener('click', () => {
            window.location.href = `case-study.html?id=${study.id}`;
          });
          
          caseStudyGrid.appendChild(article);
        }
      }
    } catch (indexError) {
      console.error('Error loading case studies index:', indexError);
      
      // Display error message or fallback content
      const caseStudyGrid = document.querySelector('.case-studies-grid');
      if (caseStudyGrid) {
        caseStudyGrid.innerHTML = `
          <div class="error-message">
            <p>Unable to load case studies. Please try again later.</p>
          </div>
        `;
      }
    }
  }
  
  // Execute when the DOM is fully loaded
  document.addEventListener('DOMContentLoaded', loadCaseStudies);