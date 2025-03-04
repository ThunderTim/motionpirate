document.addEventListener('DOMContentLoaded', function() {
    const projectContainer = document.getElementById('projectContainer');
    
    // Get the project ID from URL parameter instead of localStorage
    const urlParams = new URLSearchParams(window.location.search);
    const projectId = urlParams.get('id');
    
    if (!projectId) {
        projectContainer.innerHTML = '<p class="error-message">No project selected. <a href="work.html">Return to gallery</a></p>';
        return;
    }
    
    // Function to load the project data
    async function loadProjectDetails() {
        try {
            console.log('Attempting to load project:', projectId);
            
            // First, find the project file path from the index
            console.log('Fetching project index...');
            const indexResponse = await fetch('./data/json-index/project-index.json');
            if (!indexResponse.ok) {
                throw new Error(`Failed to fetch index: ${indexResponse.status} ${indexResponse.statusText}`);
            }
            
            const indexData = await indexResponse.json();
            console.log('Project index loaded:', indexData);
            
            // Find the project in the index
            const projectInfo = indexData.projects.find(p => p.id === projectId);
            console.log('Project info found:', projectInfo);
            
            if (!projectInfo) {
                throw new Error('Project not found in index');
            }
            
            // Now fetch the actual project data
            console.log('Fetching project data from:', projectInfo.path);
            const projectResponse = await fetch(projectInfo.path);
            if (!projectResponse.ok) {
                throw new Error(`Failed to fetch project: ${projectResponse.status} ${projectResponse.statusText}`);
            }
            
            const projectData = await projectResponse.json();
            console.log('Project data loaded:', projectData);
            
            // Update page title
            document.title = `Motion Pirate - ${projectData.title}`;
            
            // Create the project content
            console.log('Creating project content...');
            createProjectContent(projectData);
            console.log('Project content created successfully');
            
        } catch (error) {
            console.error('Error loading project:', error);
            projectContainer.innerHTML = `<p class="error-message">Error loading project details: ${error.message} <br><a href="work.html">Return to gallery</a></p>`;
        }
    }

    // Function to create the project content
    function createProjectContent(project) {

        console.log("Creating project content for:", project.title);
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
            
            // Process each video...
            // Process each video
        project.videos.forEach((video, index) => {
            if (video.platform === 'vimeo' && video.id) {
                // Create options string for Vimeo
                const optionsStr = video.options
                    ? Object.entries(video.options)
                        .map(([key, value]) => `${key}=${value}`)
                        .join('&')
                    : '';
                
                // Create a container for this individual video and its description
                const videoItemContainer = document.createElement('div');
                videoItemContainer.className = 'video-item-container';
                
                // Set aspect ratio based on JSON data, defaulting to 16:9
                let paddingBottom = '56.25%'; // Default 16:9 aspect ratio
                
                // Only override the default if aspectRatio exists and is valid
                if (video.hasOwnProperty('aspectRatio') && video.aspectRatio) {
                    try {
                        const [width, height] = video.aspectRatio.split(':').map(Number);
                        if (width && height) {
                            paddingBottom = (height / width * 100) + '%';
                            console.log("Calculated padding for", video.id, ":", paddingBottom);
                        }
                    } catch (e) {
                        console.error("Error parsing aspect ratio for video", video.id, e);
                    }
                }
                
                // Create video wrapper with appropriate aspect ratio
                const videoWrapper = document.createElement('div');
                videoWrapper.className = `video-wrapper ${video.type || ''}`;
                videoWrapper.style.paddingBottom = paddingBottom;
                videoWrapper.style.zIndex = 10 - index; 
                
                // Create iframe
                const iframe = document.createElement('iframe');
                iframe.src = `https://player.vimeo.com/video/${video.id}?${optionsStr}`;
                iframe.width = '100%';
                iframe.height = '100%';
                iframe.frameBorder = '0';
                iframe.allow = 'autoplay; fullscreen; picture-in-picture';
                iframe.allowFullscreen = true;
                
                videoWrapper.appendChild(iframe);
                
                // Add overlay for consistent border radius appearance
                const overlay = document.createElement('div');
                overlay.className = 'video-overlay';
                overlay.style.position = 'absolute';
                overlay.style.top = '0';
                overlay.style.left = '0';
                overlay.style.width = '100%';
                overlay.style.height = '100%';
                overlay.style.pointerEvents = 'none';
                overlay.style.zIndex = '1';
                videoWrapper.appendChild(overlay);
                
                // Add the video wrapper to the item container
                videoItemContainer.appendChild(videoWrapper);
                
                // Check if this video has a description and add it
                if (video.description && video.description.trim()) {
                    const videoDesc = document.createElement('p');
                    videoDesc.className = 'individual-video-description';
                    videoDesc.textContent = video.description;
                    videoItemContainer.appendChild(videoDesc);
                }
                
                // Add the complete item (video + its description) to the container
                videoContainer.appendChild(videoItemContainer);
                console.log("Added video to container:", video.id);
            } else {
                console.warn("Skipping video due to missing platform or ID:", video);
            }
             });

                // Add this line - it was missing
            videoSection.appendChild(videoContainer);
            
            // And this line to add the video section to your main section
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
       // Add case study details if available and not empty
if (project.casestudy) {
    // Check if at least one field has content
    const hasContent = Object.values(project.casestudy).some(value => value && value.trim() !== '');
    
    if (hasContent) {
        const caseStudySection = document.createElement('div');
        caseStudySection.className = 'project-case-study';
        
        const caseStudyTitle = document.createElement('h3');
        caseStudyTitle.textContent = 'Case Study';
        caseStudySection.appendChild(caseStudyTitle);
        
        // Challenge
        if (project.casestudy.challenge && project.casestudy.challenge.trim() !== '') {
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
        if (project.casestudy.approach && project.casestudy.approach.trim() !== '') {
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
        if (project.casestudy.results && project.casestudy.results.trim() !== '') {
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
        
        // Add credits if available and not empty
if (project.credits && Object.keys(project.credits).length > 0) {
    // Check if at least one credit has content
    const hasContent = Object.values(project.credits).some(value => value && value.trim() !== '');
    
    if (hasContent) {
        const creditsSection = document.createElement('div');
        creditsSection.className = 'project-credits';
        
        const creditsTitle = document.createElement('h3');
        creditsTitle.textContent = 'Credits';
        creditsSection.appendChild(creditsTitle);
        
        const creditsList = document.createElement('ul');
        creditsList.className = 'credits-list';
        
        for (const [key, value] of Object.entries(project.credits)) {
            // Only add credits with actual content
            if (value && value.trim() !== '') {
                const creditItem = document.createElement('li');
                creditItem.textContent = value;
                creditsList.appendChild(creditItem);
            }
        }
        
        creditsSection.appendChild(creditsList);
        section.appendChild(creditsSection);
    }
}

        // Add share button
const shareButtonContainer = document.createElement('div');
shareButtonContainer.className = 'share-button-container';

const shareButton = document.createElement('button');
shareButton.className = 'share-button';
shareButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path><polyline points="16 6 12 2 8 6"></polyline><line x1="12" y1="2" x2="12" y2="15"></line></svg> Share';
shareButton.addEventListener('click', function() {
    // Create the shareable link
    const projectUrl = window.location.origin + window.location.pathname + '?id=' + project.id;
    
    // Check if the Web Share API is available
    if (navigator.share) {
        navigator.share({
            title: project.title,
            text: project.subtitle || 'Check out this project',
            url: projectUrl
        })
        .catch(error => {
            console.error('Error sharing:', error);
            fallbackCopyToClipboard(projectUrl);
        });
    } else {
        // Fallback for browsers that don't support Web Share API
        fallbackCopyToClipboard(projectUrl);
    }
});

        // Function to copy URL to clipboard as fallback
        function fallbackCopyToClipboard(text) {
            // Create temporary input element
            const input = document.createElement('input');
            input.style.position = 'fixed';
            input.style.opacity = 0;
            input.value = text;
            document.body.appendChild(input);
            
            // Select and copy the text
            input.select();
            document.execCommand('copy');
            
            // Remove the temporary element
            document.body.removeChild(input);
            
            // Show feedback
            const message = document.createElement('div');
            message.className = 'copy-feedback';
            message.textContent = 'Link copied to clipboard!';
            document.body.appendChild(message);
            
            // Remove feedback after delay
            setTimeout(() => {
                document.body.removeChild(message);
            }, 2000);
        }

        shareButtonContainer.appendChild(shareButton);
        section.appendChild(shareButtonContainer);

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

     // Threshold start and end points
     const startThreshold = 40;
     const endThreshold = 120;

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
        if (scrollPos <= startThreshold) 
        {
            // Fully expanded
            projectHeader.classList.remove('shrink');
            projectTitle.classList.remove('shrink');
            projectClient.classList.remove('shrink');
            projectSubtitle.classList.remove('shrink');
        } 

        else if (scrollPos >= endThreshold) {
            // Fully shrunk
            projectHeader.classList.add('shrink');
            projectTitle.classList.add('shrink');
            projectClient.classList.add('shrink');
            projectSubtitle.classList.add('shrink');
        }
        else {
            // In between - calculate the transition progress
            const progress = (scrollPos - startThreshold) / (endThreshold - startThreshold);
            
            // Apply intermediate styles
            applyIntermediateStyles(projectHeader, progress);
            applyIntermediateStyles(projectTitle, progress);
            applyIntermediateStyles(projectClient, progress);
            applyIntermediateStyles(projectSubtitle, progress);
        }

    }
    
     // Function to apply intermediate styles during the transition
function applyIntermediateStyles(element, progress) {
    if (element === projectHeader) {
        // Adjust padding proportionally
        const paddingValue = 15 - (progress * 7); // 15px to 8px
        element.style.padding = `${paddingValue}px 0`;
        
        // Keep background transparent
        element.style.backgroundColor = 'rgba(0, 0, 0, 0)';
        
        // Adjust backdrop blur (optional)
        const blurValue = 8; // Constant blur value
        element.style.backdropFilter = `blur(${blurValue}px)`;
        element.style.webkitBackdropFilter = `blur(${blurValue}px)`;
        
        // Adjust border opacity (very subtle)
        const borderOpacity = progress * 0.05; // 0 to 0.05
        element.style.borderBottomColor = `rgba(255, 255, 255, ${borderOpacity})`;
        
        // Maintain vertical stack and left alignment
        element.style.flexDirection = 'column';
        element.style.alignItems = 'flex-start';
    }
    // Rest of the function remains the same...
    else if (element === projectTitle) {
        // Interpolate font size from 1.7rem to 1rem
        const fontSize = 1.7 - (progress * 0.7);
        element.style.fontSize = `${fontSize}rem`;
        
        // Interpolate margin from 10px to 5px
        const margin = 10 - (progress * 5);
        element.style.marginBottom = `${margin}px`;
        
        // Maintain left alignment
        element.style.textAlign = 'left';
    }
    else if (element === projectClient) {
        // Interpolate font size from 1.7rem to 1rem
        const fontSize = 1.7 - (progress * 0.7);
        element.style.fontSize = `${fontSize}rem`;
        
        // Interpolate margin from 10px to 5px
        const margin = 10 - (progress * 5);
        element.style.marginBottom = `${margin}px`;
        
        // Maintain left alignment
        element.style.textAlign = 'left';
    }
    else if (element === projectSubtitle) {
        // Interpolate font size from 1rem to 0.8rem
        const fontSize = 1 - (progress * 0.2);
        element.style.fontSize = `${fontSize}rem`;
        
        // Maintain left alignment
        element.style.textAlign = 'left';
    }
}

    // Add optimized scroll listener
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // Initialize state
    updateHeaderState(window.scrollY);
}, 200); // Short timeout to ensure DOM is ready



    projectContainer.appendChild(section);
    console.log("Project content added to DOM");

    }
    
    // Load the project details
    
    loadProjectDetails();
});