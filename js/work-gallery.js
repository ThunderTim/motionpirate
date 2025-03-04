document.addEventListener('DOMContentLoaded', function() {
    const workGrid = document.querySelector('.work-grid');
    
    // Debug information
    console.log('Work page loaded');
    
    // Function to load all projects
    async function loadProjects() {
        try {
            console.log('Attempting to load project index...');
            // Fetch the list of project files
            const response = await fetch('./data/json-index/project-index.json');
            if (!response.ok) {
                throw new Error(`Failed to fetch project index: ${response.status} ${response.statusText}`);
            }
            
            const projectsIndex = await response.json();
            console.log('Project index loaded:', projectsIndex);
            
            // Array to store all project promises
            console.log('Loading individual project data...');
            const projectPromises = projectsIndex.projects.map(projectInfo => {
                console.log('Fetching project:', projectInfo.path);
                return fetch(projectInfo.path)
                    .then(response => {
                        if (!response.ok) {
                            throw new Error(`Failed to fetch project: ${response.status} ${response.statusText}`);
                        }
                        return response.json();
                    })
                    .then(projectData => {
                        return { ...projectData, id: projectInfo.id, path: projectInfo.path };
                    });
            });
            
            // Wait for all projects to load
            const projects = await Promise.all(projectPromises);
            console.log('All projects loaded:', projects.length);
            
            // Clear any existing content
            workGrid.innerHTML = '';
            
            // Create a tile for each project
            projects.forEach(project => {
                console.log('Creating tile for project:', project.title, 'with ID:', project.id);
                
                // Find the hero image for the tile
                const thumbnailImage = project.images.find(img => img.type === 'thumbnail') || project.images[0];
                
                // Create tile element
                const tile = document.createElement('article');
                tile.className = 'gallery-tile';
                
                // Create image container
                const imageContainer = document.createElement('div');
                imageContainer.className = 'gallery-image';
                
                // Create image
                const img = document.createElement('img');
                img.src = thumbnailImage.url;
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
                    // Create URL with project ID parameter
                    window.location.href = `project-page-template.html?id=${project.id}`;
                    // Optional debugging
                    console.log('Navigating to:', `project-page-template.html?id=${project.id}`);
                });
                
                // Add the tile to the grid
                workGrid.appendChild(tile);
            });
            
        } catch (error) {
            console.error('Error loading projects:', error);
            workGrid.innerHTML = `<p class="error-message">Error loading projects: ${error.message}. Please try again later.</p>`;
        }
    }
    
    // Load all projects
    loadProjects();
});