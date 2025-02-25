document.addEventListener('DOMContentLoaded', function() {
    const projectContainer = document.getElementById('projectContainer');
    
    

    // Get the selected project ID from localStorage
    const projectId = localStorage.getItem('selectedProjectId');
    
    if (!projectId) {
        projectContainer.innerHTML = '<p class="error-message">No project selected. <a href="work.html">Return to gallery</a></p>';
        return;
    }
    
    // Function to load the project data
    async function loadProjectDetails() {
        try {
            // First, find the project file path from the index
            const indexResponse = await fetch('./data/json-index/project-index.json');
            const indexData = await indexResponse.json();
            
            // Find the project in the index
            const projectInfo = indexData.projects.find(p => p.id === projectId);
            
            if (!projectInfo) {
                throw new Error('Project not found in index');
            }
            
            // Now fetch the actual project data
            const projectResponse = await fetch(projectInfo.path);
            const projectData = await projectResponse.json();
            
            // Update page title
            document.title = `Motion Pirate - ${projectData.title}`;
            
            // Create the project content
            createProjectContent(projectData);
            
        } catch (error) {
            console.error('Error loading project:', error);
            projectContainer.innerHTML = '<p class="error-message">Error loading project details. <a href="work.html">Return to gallery</a></p>';
        }
    }
    
    // Function to create the project content
    function createProjectContent(project) {
        // First, clear the loading message
        projectContainer.innerHTML = '';

        // Create main project section
        const section = document.createElement('section');
        section.className = 'project-section';
        
        // Create header with title, client, and subtitle
        const header = document.createElement('header');
        header.className = 'project-header';
        
        const title = document.createElement('h1');
        title.className = 'project-title';
        title.textContent = project.title;
        header.appendChild(title);
        
        if (project.client) {
            const client = document.createElement('h2');
            client.className = 'project-client';
            client.textContent = `Client: ${project.client}`;
            header.appendChild(client);
        }
        
        if (project.subtitle) {
            const subtitle = document.createElement('p');
            subtitle.className = 'project-subtitle';
            subtitle.textContent = project.subtitle;
            header.appendChild(subtitle);
        }
        
        section.appendChild(header);
        
        // Add project types if available
        if (project.projectType && project.projectType.length) {
            const typeContainer = document.createElement('div');
            typeContainer.className = 'project-type-container';
            
            const typeList = document.createElement('ul');
            typeList.className = 'project-type-list';
            
            project.projectType.forEach(type => {
                const typeItem = document.createElement('li');
                typeItem.textContent = type;
                typeList.appendChild(typeItem);
            });
            
            typeContainer.appendChild(typeList);
            section.appendChild(typeContainer);
        }
        
        // Add description
        if (project.description) {
            const descContainer = document.createElement('div');
            descContainer.className = 'project-description';
            
            const desc = document.createElement('p');
            desc.textContent = project.description;
            descContainer.appendChild(desc);
            
            section.appendChild(descContainer);
        }
        
        // Add extended description if available
        if (project.extendedsDescription) {
            const extendedDesc = document.createElement('div');
            extendedDesc.className = 'project-extended-description';
            
            const extendedText = document.createElement('p');
            extendedText.textContent = project.extendedsDescription;
            extendedDesc.appendChild(extendedText);
            
            section.appendChild(extendedDesc);
        }
        
        // Add videos if available
        if (project.videos && project.videos.length) {
            const videoSection = document.createElement('div');
            videoSection.className = 'project-video-section';
            
            // Add video description if available
            if (project.videosDescription) {
                const videoDesc = document.createElement('p');
                videoDesc.className = 'video-description';
                videoDesc.textContent = project.videosDescription;
                videoSection.appendChild(videoDesc);
            }
            
            const videoContainer = document.createElement('div');
            videoContainer.className = 'video-container';
            
            // Process each video
            project.videos.forEach(video => {
                if (video.platform === 'vimeo' && video.id) {
                    // Create options string for Vimeo
                    const optionsStr = video.options 
                        ? Object.entries(video.options)
                            .map(([key, value]) => `${key}=${value}`)
                            .join('&')
                        : '';
                    
                    // Create iframe
                    const iframe = document.createElement('iframe');
                    iframe.src = `https://player.vimeo.com/video/${video.id}?${optionsStr}`;
                    iframe.width = '100%';
                    iframe.height = '480';
                    iframe.frameBorder = '0';
                    iframe.allow = 'autoplay; fullscreen; picture-in-picture';
                    iframe.allowFullscreen = true;
                    
                    const videoWrapper = document.createElement('div');
                    videoWrapper.className = `video-wrapper ${video.type || ''}`;
                    videoWrapper.appendChild(iframe);
                    
                    videoContainer.appendChild(videoWrapper);
                }
            });
            
            videoSection.appendChild(videoContainer);
            section.appendChild(videoSection);
        }
        
        // Add images if available
        if (project.images && project.images.length) {
            const imageSection = document.createElement('div');
            imageSection.className = 'project-image-section';
            
            // Add image description if available
            if (project.imagesDescription) {
                const imageDesc = document.createElement('p');
                imageDesc.className = 'images-description';
                imageDesc.textContent = project.imagesDescription;
                imageSection.appendChild(imageDesc);
            }
            
            const imageGallery = document.createElement('div');
            imageGallery.className = 'image-gallery';
            
            // Process each image
            const filteredImages = project.images.filter(image => image.type !== "thumbnail");
            filteredImages.forEach(image => {
                const figure = document.createElement('figure');
                figure.className = `image-figure ${image.type || ''}`;
                
                const img = document.createElement('img');
                img.src = image.url;
                img.alt = image.alt || '';
                figure.appendChild(img);

                
                if (image.caption) {
                    const caption = document.createElement('figcaption');
                    caption.textContent = image.caption;
                    figure.appendChild(caption);
                }
                
                imageGallery.appendChild(figure);
            });
            
            imageSection.appendChild(imageGallery);
            section.appendChild(imageSection);
        }
        
        // Add case study details if available
        if (project.casestudy) {
            const caseStudySection = document.createElement('div');
            caseStudySection.className = 'project-case-study';
            
            const caseStudyTitle = document.createElement('h3');
            caseStudyTitle.textContent = 'Case Study';
            caseStudySection.appendChild(caseStudyTitle);
            
            // Challenge
            if (project.casestudy.challenge) {
                const challengeDiv = document.createElement('div');
                challengeDiv.className = 'case-study-challenge';
                
                const challengeTitle = document.createElement('h4');
                challengeTitle.textContent = 'Challenge';
                challengeDiv.appendChild(challengeTitle);
                
                const challengeText = document.createElement('p');
                challengeText.textContent = project.casestudy.challenge;
                challengeDiv.appendChild(challengeText);
                
                caseStudySection.appendChild(challengeDiv);
            }
            
            // Approach
            if (project.casestudy.approach) {
                const approachDiv = document.createElement('div');
                approachDiv.className = 'case-study-approach';
                
                const approachTitle = document.createElement('h4');
                approachTitle.textContent = 'Approach';
                approachDiv.appendChild(approachTitle);
                
                const approachText = document.createElement('p');
                approachText.textContent = project.casestudy.approach;
                approachDiv.appendChild(approachText);
                
                caseStudySection.appendChild(approachDiv);
            }
            
            // Results
            if (project.casestudy.results) {
                const resultsDiv = document.createElement('div');
                resultsDiv.className = 'case-study-results';
                
                const resultsTitle = document.createElement('h4');
                resultsTitle.textContent = 'Results';
                resultsDiv.appendChild(resultsTitle);
                
                const resultsText = document.createElement('p');
                resultsText.textContent = project.casestudy.results;
                resultsDiv.appendChild(resultsText);
                
                caseStudySection.appendChild(resultsDiv);
            }
            
            section.appendChild(caseStudySection);
        }
        
        // Add skills and software labels
        const labelsSection = document.createElement('div');
        labelsSection.className = 'project-labels-section';
        
        // Skills
        if (project.skillLabels && project.skillLabels.length) {
            const skillsDiv = document.createElement('div');
            skillsDiv.className = 'skills-container';
            
            const skillsTitle = document.createElement('h3');
            skillsTitle.textContent = 'Skills';
            skillsDiv.appendChild(skillsTitle);
            
            const skillsList = document.createElement('ul');
            skillsList.className = 'skills-list';
            
            project.skillLabels.forEach(skill => {
                const skillItem = document.createElement('li');
                skillItem.textContent = skill;
                skillsList.appendChild(skillItem);
            });
            
            skillsDiv.appendChild(skillsList);
            labelsSection.appendChild(skillsDiv);
        }
        
        // Software
        if (project.softwareLabels && project.softwareLabels.length) {
            const softwareDiv = document.createElement('div');
            softwareDiv.className = 'software-container';
            
            const softwareTitle = document.createElement('h3');
            softwareTitle.textContent = 'Software';
            softwareDiv.appendChild(softwareTitle);
            
            const softwareList = document.createElement('ul');
            softwareList.className = 'software-list';
            
            project.softwareLabels.forEach(software => {
                const softwareItem = document.createElement('li');
                softwareItem.textContent = software;
                softwareList.appendChild(softwareItem);
            });
            
            softwareDiv.appendChild(softwareList);
            labelsSection.appendChild(softwareDiv);
        }
        
        section.appendChild(labelsSection);
        
        // Add credits if available
        if (project.credits && Object.keys(project.credits).length > 0) {
            const creditsSection = document.createElement('div');
            creditsSection.className = 'project-credits';
            
            const creditsTitle = document.createElement('h3');
            creditsTitle.textContent = 'Credits';
            creditsSection.appendChild(creditsTitle);
            
            const creditsList = document.createElement('ul');
            creditsList.className = 'credits-list';
            
            for (const [key, value] of Object.entries(project.credits)) {
                const creditItem = document.createElement('li');
                creditItem.textContent = value;
                creditsList.appendChild(creditItem);
            }
            
            creditsSection.appendChild(creditsList);
            section.appendChild(creditsSection);
        }
        
        // Add back button
        const backButton = document.createElement('a');
        backButton.href = 'work.html';
        backButton.className = 'back-button';
        backButton.textContent = '< Back to Gallery';
        section.appendChild(backButton);
        

        // Set up scroll effects after content is created
setTimeout(function() {
    // Get elements
    const projectHeader = document.querySelector('.project-header');
    const projectTitle = document.querySelector('.project-title');
    const projectClient = document.querySelector('.project-client');
    const projectSubtitle = document.querySelector('.project-subtitle');
    
    if (!projectHeader) {
        console.warn('Project header not found');
        return;
    }

    // Create a throttled scroll handler to improve performance
    let lastScrollPosition = 0;
    let ticking = false;

    // Function to handle scroll events
    function handleScroll() {
        lastScrollPosition = window.scrollY;
        
        if (!ticking) {
            window.requestAnimationFrame(() => {
                updateHeaderState(lastScrollPosition);
                ticking = false;
            });
            
            ticking = true;
        }
    }

    function updateHeaderState(scrollPos) {
        // Get a value between 0 and 1 based on scroll position
        // Threshold start and end points
        const startThreshold = 40;
        const endThreshold = 120;
        
        if (scrollPos <= startThreshold) {
            // Fully expanded
            if (projectHeader.classList.contains('shrink')) {
                projectHeader.classList.remove('shrink');
                projectTitle.classList.remove('shrink');
                projectClient.classList.remove('shrink');
                projectSubtitle.classList.remove('shrink');
            }
        } 
        else if (scrollPos >= endThreshold) {
            // Fully shrunk
            if (!projectHeader.classList.contains('shrink')) {
                projectHeader.classList.add('shrink');
                projectTitle.classList.add('shrink');
                projectClient.classList.add('shrink');
                projectSubtitle.classList.add('shrink');
            }
        }
        // No else clause - this creates a "dead zone" where state doesn't toggle back and forth
    }

    // Add optimized scroll listener
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // Initialize state
    updateHeaderState(window.scrollY);
}, 100); // Short timeout to ensure DOM is ready



        // Add the project to the container
        projectContainer.appendChild(section);
    }
    
    // Load the project details
    loadProjectDetails();
});