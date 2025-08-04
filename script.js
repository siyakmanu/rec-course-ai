document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const userForm = document.getElementById('user-form');
    const formSection = document.getElementById('form-section');
    const loadingSection = document.getElementById('loading');
    const recommendationsSection = document.getElementById('recommendations');
    const startOverButton = document.getElementById('start-over');
    const getStartedBtn = document.getElementById('get-started-btn');
    
    // Configuration
    const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
        ? `http://${window.location.hostname}:3000` 
        : '';
    
    // Event Listeners
    userForm.addEventListener('submit', handleFormSubmit);
    startOverButton.addEventListener('click', resetForm);
    getStartedBtn.addEventListener('click', showForm);
    
    // Setup multi-step form navigation
    const nextButtons = document.querySelectorAll('.next-step');
    const prevButtons = document.querySelectorAll('.prev-step');
    
    nextButtons.forEach(button => {
        button.addEventListener('click', () => {
            const currentStep = button.closest('.form-step');
            const nextStep = currentStep.nextElementSibling;
            
            // Move to the next step
            currentStep.classList.remove('active');
            nextStep.classList.add('active');
            
            // Update progress bar
            const stepNumber = parseInt(nextStep.dataset.step);
            const progress = (stepNumber - 1) / (document.querySelectorAll('.form-step').length - 1) * 100;
            document.querySelector('.progress').style.width = `${progress}%`;
        });
    });
    
    prevButtons.forEach(button => {
        button.addEventListener('click', () => {
            const currentStep = button.closest('.form-step');
            const prevStep = currentStep.previousElementSibling;
            
            // Move to the previous step
            currentStep.classList.remove('active');
            prevStep.classList.add('active');
            
            // Update progress bar
            const stepNumber = parseInt(prevStep.dataset.step);
            const progress = (stepNumber - 1) / (document.querySelectorAll('.form-step').length - 1) * 100;
            document.querySelector('.progress').style.width = `${progress}%`;
        });
    });
    
    // Show the form when Get Started is clicked
    function showForm() {
        formSection.classList.remove('hidden');
        document.querySelector('.hero-section').style.paddingBottom = '40px';
        window.scrollTo({ top: formSection.offsetTop - 50, behavior: 'smooth' });
    }
    
    // Handle form submission
    async function handleFormSubmit(e) {
        e.preventDefault();
        
        // Get form data
        const userData = {
            name: document.getElementById('name').value,
            currentSkills: document.getElementById('current-skills').value,
            education: document.getElementById('education').value,
            careerGoal: document.getElementById('career-goal').value,
            timeCommitment: document.getElementById('time-commitment').value,
            learningStyle: document.getElementById('learning-style').value
        };
        
        // Show loading screen
        formSection.classList.add('hidden');
        loadingSection.classList.remove('hidden');
        
        try {
            // Get recommendations from Groq API
            const recommendations = await getRecommendations(userData);
            
            // Display recommendations
            displayRecommendations(userData, recommendations);
            
            // Hide loading, show recommendations
            loadingSection.classList.add('hidden');
            recommendationsSection.classList.remove('hidden');
        } catch (error) {
            console.error('Error getting recommendations:', error);
            alert('Sorry, there was an error generating your recommendations. Please try again.');
            resetForm();
        }
    }
    
    // Reset the form and go back to the input screen
    function resetForm() {
        userForm.reset();
        recommendationsSection.classList.add('hidden');
        formSection.classList.remove('hidden');
        
        // Reset form to first step
        const formSteps = document.querySelectorAll('.form-step');
        formSteps.forEach(step => step.classList.remove('active'));
        formSteps[0].classList.add('active');
        
        // Reset progress bar
        document.querySelector('.progress').style.width = '0%';
        
        // Scroll to form
        window.scrollTo({ top: formSection.offsetTop - 50, behavior: 'smooth' });
    }
    

    
    // Get recommendations (mock data since backend might not be running)
    async function getRecommendations(userData) {
        try {
            // First try to use the backend API if it's running
            try {
                // Create an AbortController with timeout
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 2000);
                
                const response = await fetch(`${API_BASE_URL}/api/recommendations`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(userData),
                    signal: controller.signal
                });
                
                // Clear the timeout
                clearTimeout(timeoutId);
                
                if (response.ok) {
                    return await response.json();
                }
            } catch (apiError) {
                console.log('Backend API not available, using mock data instead');
                // Continue to mock data if API fails
            }
            
            // Generate mock recommendations based on user data
            console.log('Generating mock recommendations for:', userData);
            return generateMockRecommendations(userData);
        } catch (error) {
            console.error('Error getting recommendations:', error);
            throw error;
        }
    }
    
    // Generate mock recommendations based on user input
    function generateMockRecommendations(userData) {
        const careerGoal = userData.careerGoal.toLowerCase();
        const skills = userData.currentSkills.toLowerCase();
        
        // Default recommendations
        let courses = [
            {
                title: "Foundations of Programming",
                provider: "Coursera",
                level: "Beginner",
                duration: "8 weeks",
                description: "Learn the basics of programming logic and structure.",
                url: "#",
                tags: ["Programming", "Fundamentals"]
            },
            {
                title: "Data Structures and Algorithms",
                provider: "edX",
                level: "Intermediate",
                duration: "10 weeks",
                description: "Master essential computer science concepts.",
                url: "#",
                tags: ["Algorithms", "Computer Science"]
            },
            {
                title: "Project Management Fundamentals",
                provider: "Udemy",
                level: "Beginner",
                duration: "6 weeks",
                description: "Learn to manage technical projects effectively.",
                url: "#",
                tags: ["Management", "Soft Skills"]
            }
        ];
        
        // Customize based on career goal
        if (careerGoal.includes('data sci') || careerGoal.includes('machine learning')) {
            courses = [
                {
                    title: "Python for Data Science",
                    provider: "DataCamp",
                    level: "Beginner",
                    duration: "6 weeks",
                    description: "Learn Python specifically for data analysis and visualization.",
                    url: "#",
                    tags: ["Python", "Data Science"]
                },
                {
                    title: "Machine Learning Fundamentals",
                    provider: "Coursera",
                    level: "Intermediate",
                    duration: "8 weeks",
                    description: "Understand core ML algorithms and when to apply them.",
                    url: "#",
                    tags: ["Machine Learning", "AI"]
                },
                {
                    title: "Statistics for Data Science",
                    provider: "edX",
                    level: "Intermediate",
                    duration: "7 weeks",
                    description: "Master statistical concepts essential for data analysis.",
                    url: "#",
                    tags: ["Statistics", "Mathematics"]
                }
            ];
        } else if (careerGoal.includes('web dev') || careerGoal.includes('frontend') || careerGoal.includes('front end')) {
            courses = [
                {
                    title: "Modern JavaScript",
                    provider: "Udemy",
                    level: "Beginner",
                    duration: "8 weeks",
                    description: "Master JavaScript fundamentals and modern ES6+ features.",
                    url: "#",
                    tags: ["JavaScript", "Web Development"]
                },
                {
                    title: "React - The Complete Guide",
                    provider: "Udemy",
                    level: "Intermediate",
                    duration: "10 weeks",
                    description: "Build powerful, fast, user-friendly and reactive web apps.",
                    url: "#",
                    tags: ["React", "Frontend"]
                },
                {
                    title: "CSS Mastery",
                    provider: "Frontend Masters",
                    level: "Intermediate",
                    duration: "6 weeks",
                    description: "Advanced styling techniques for modern web applications.",
                    url: "#",
                    tags: ["CSS", "Design"]
                }
            ];
        }
        
        // Generate materials based on courses
        const materials = [
            {
                title: courses[0].title + " Handbook",
                type: "Book",
                author: "Various Authors",
                description: "Comprehensive reference guide for " + courses[0].title,
                url: "#"
            },
            {
                title: "Essential Tools for " + userData.careerGoal,
                type: "Article",
                author: "Industry Experts",
                description: "Overview of must-have tools and resources for your career path.",
                url: "#"
            },
            {
                title: "Getting Started with " + courses[1].tags[0],
                type: "Video Series",
                author: "Online Academy",
                description: "Step-by-step video tutorials for beginners.",
                url: "#"
            }
        ];
        
        // Generate skill priorities
        const skillPriorities = [
            {
                skill: courses[0].tags[0],
                importance: "High",
                reason: "Fundamental skill required for " + userData.careerGoal
            },
            {
                skill: courses[1].tags[0],
                importance: "Medium",
                reason: "Important for advancing in your chosen field."
            },
            {
                skill: "Communication",
                importance: "High",
                reason: "Essential soft skill for any professional role."
            }
        ];
        
        // Generate learning path
        const learningPath = [
            {
                phase: "Phase 1: Foundation",
                duration: "2 months",
                focus: "Building core skills in " + courses[0].tags.join(" and "),
                milestones: ["Complete " + courses[0].title, "Build a small project", "Join a community"]
            },
            {
                phase: "Phase 2: Specialization",
                duration: "3 months",
                focus: "Deepening knowledge in " + courses[1].tags.join(" and "),
                milestones: ["Complete " + courses[1].title, "Contribute to open source", "Build a portfolio project"]
            },
            {
                phase: "Phase 3: Professional Development",
                duration: "Ongoing",
                focus: "Refining skills and preparing for job market",
                milestones: ["Complete advanced projects", "Network with professionals", "Prepare for interviews"]
            }
        ];
        
        return {
            courses,
            materials,
            skillPriorities,
            learningPath
        };
    }
    
    // No longer need the generatePrompt function as it's handled by the backend
    
    // Parse the recommendations from the API response
    function parseRecommendations(responseText) {
        try {
            // Extract JSON from the response text
            const jsonMatch = responseText.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }
            
            // If no JSON found, try to parse the entire response
            return JSON.parse(responseText);
        } catch (error) {
            console.error('Error parsing recommendations:', error);
            console.log('Response text:', responseText);
            
            // If parsing fails, return a structured error message
            return {
                error: true,
                message: 'Could not parse recommendations. Please try again.'
            };
        }
    }
    
    // Display recommendations on the page
    function displayRecommendations(userData, recommendations) {
        // Display user profile summary
        const profileSummary = document.getElementById('profile-summary');
        profileSummary.innerHTML = `
            <p><strong>Name:</strong> ${userData.name}</p>
            <p><strong>Current Skills:</strong> ${userData.currentSkills}</p>
            <p><strong>Education:</strong> ${userData.education}</p>
            <p><strong>Target Career:</strong> ${userData.careerGoal}</p>
            <p><strong>Time Commitment:</strong> ${userData.timeCommitment} hours/week</p>
            <p><strong>Learning Style:</strong> ${userData.learningStyle}</p>
        `;
        
        // Check if there was an error parsing the recommendations
        if (recommendations.error) {
            document.getElementById('courses-list').innerHTML = `<p class="error">${recommendations.message}</p>`;
            return;
        }
        
        // Display courses
        const coursesList = document.getElementById('courses-list');
        coursesList.innerHTML = '';
        
        if (recommendations.courses && recommendations.courses.length > 0) {
            recommendations.courses.forEach(course => {
                const courseElement = document.createElement('div');
                courseElement.className = 'recommendation-item';
                courseElement.innerHTML = `
                    <h4>${course.title}</h4>
                    <p><strong>Provider:</strong> ${course.provider}</p>
                    <p><strong>Level:</strong> ${course.level}</p>
                    <p><strong>Duration:</strong> ${course.duration}</p>
                    <p>${course.description}</p>
                    <div class="tags">
                        ${course.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                    </div>
                `;
                coursesList.appendChild(courseElement);
            });
        } else {
            coursesList.innerHTML = '<p>No course recommendations available.</p>';
        }
        
        // Display materials
        const materialsList = document.getElementById('materials-list');
        materialsList.innerHTML = '';
        
        if (recommendations.materials && recommendations.materials.length > 0) {
            recommendations.materials.forEach(material => {
                const materialElement = document.createElement('div');
                materialElement.className = 'recommendation-item';
                materialElement.innerHTML = `
                    <h4>${material.title}</h4>
                    <p><strong>Type:</strong> ${material.type}</p>
                    <p><strong>Author:</strong> ${material.author}</p>
                    <p>${material.description}</p>
                `;
                materialsList.appendChild(materialElement);
            });
        } else {
            materialsList.innerHTML = '<p>No material recommendations available.</p>';
        }
        
        // Display skill priorities
        const skillsList = document.getElementById('skills-list');
        skillsList.innerHTML = '';
        
        if (recommendations.skillPriorities && recommendations.skillPriorities.length > 0) {
            recommendations.skillPriorities.forEach(skill => {
                const skillElement = document.createElement('div');
                skillElement.className = 'recommendation-item';
                
                // Add color based on importance
                if (skill.importance.toLowerCase() === 'high') {
                    skillElement.style.borderLeft = '4px solid var(--danger-color)';
                } else if (skill.importance.toLowerCase() === 'medium') {
                    skillElement.style.borderLeft = '4px solid var(--warning-color)';
                } else {
                    skillElement.style.borderLeft = '4px solid var(--success-color)';
                }
                
                skillElement.innerHTML = `
                    <h4>${skill.skill}</h4>
                    <p><strong>Importance:</strong> ${skill.importance}</p>
                    <p>${skill.reason}</p>
                `;
                skillsList.appendChild(skillElement);
            });
        } else {
            skillsList.innerHTML = '<p>No skill priority recommendations available.</p>';
        }
        
        // Display learning path
        const learningPathTimeline = document.getElementById('learning-path-timeline');
        learningPathTimeline.innerHTML = '';
        
        if (recommendations.learningPath && recommendations.learningPath.length > 0) {
            recommendations.learningPath.forEach(phase => {
                const phaseElement = document.createElement('div');
                phaseElement.className = 'phase';
                phaseElement.innerHTML = `
                    <h4>${phase.phase}</h4>
                    <p><strong>Duration:</strong> ${phase.duration}</p>
                    <p><strong>Focus:</strong> ${phase.focus}</p>
                    <p><strong>Milestones:</strong></p>
                    <ul>
                        ${phase.milestones.map(milestone => `<li><i class="fas fa-check-circle"></i>${milestone}</li>`).join('')}
                    </ul>
                `;
                learningPathTimeline.appendChild(phaseElement);
            });
        } else {
            learningPathTimeline.innerHTML = '<p>No learning path available.</p>';
        }
    }
});