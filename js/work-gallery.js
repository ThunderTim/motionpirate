document.addEventListener('DOMContentLoaded', function() {
    const workGrid = document.querySelector('.work-grid');
    
    // Function to load all projects
    async function loadProjects() {
        try {
            // Fetch the list of project files (you might need a server-side solution for this)
            // For now, we'll use a direct fetch to the projects directory and handle any errors
            const response = await fetch('./data/json-index/project-index.json');
            const projectsIndex = await response.json();
            
            // Array to store all project promises
            const projectPromises = projectsIndex.projects.map(projectInfo => {
                return fetch(projectInfo.path)
                    .then(response => response.json())
                    .then(projectData => {
                        return { ...projectData, path: projectInfo.path };
                    });
            });
            
            // Wait for all projects to load
            const projects = await Promise.all(projectPromises);
            
            // Clear any existing content
            workGrid.innerHTML = '';
            
            // Create a tile for each project
            projects.forEach(project => {
                // Find the hero image for the tile
                const heroImage = project.images.find(img => img.type === 'hero') || project.images[0];
                
                // Create tile element
                const tile = document.createElement('article');
                tile.className = 'gallery-tile';
                
                // Create image container
                const imageContainer = document.createElement('div');
                imageContainer.className = 'gallery-image';
                
                // Create image
                const img = document.createElement('img');
                img.src = heroImage.url;
                img.alt = project.title;
                
                // Create overlay with project title
                const overlay = document.createElement('div');
                overlay.className = 'gallery-overlay';
                
                const title = document.createElement('span');
                title.textContent = project.title;
                overlay.appendChild(title);
                
                // Assemble the tile
                imageContainer.appendChild(img);
                imageContainer.appendChild(overlay);
                tile.appendChild(imageContainer);
                
                // Add click handler to navigate to project page
                tile.addEventListener('click', function() {
                    // Store the project ID in localStorage for the project page to use
                    localStorage.setItem('selectedProjectId', project.id);
                    // Navigate to the project detail page
                    window.location.href = 'project-page-template.html';
                });
                
                // Add the tile to the grid
                workGrid.appendChild(tile);
            });
            
        } catch (error) {
            console.error('Error loading projects:', error);
            workGrid.innerHTML = '<p class="error-message">Error loading projects. Please try again later.</p>';
        }
    }
    
    // Load all projects
    loadProjects();
});