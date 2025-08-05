document.addEventListener('DOMContentLoaded', () => {
    const root = document.getElementById('root');
    const heroSection = document.querySelector('.hero-section');
    const howItWorksSection = document.getElementById('how-it-works');
    const formSection = document.getElementById('formSection');
    const getStartedBtn = document.querySelector('.get-started-btn');
    const homeBtn = document.getElementById('homeBtn');
    const themeToggleBtn = document.getElementById('themeToggleBtn');
    const themeIcon = themeToggleBtn.querySelector('i');

    root.innerHTML = `
        <div class="container">
            <h1>Personalized Learning Path Recommender</h1>
            <form id="recommendationForm">
                <!-- Step 1: Student Background -->
                <div class="form-step" id="step1">
                    <div class="form-group">
                        <label for="background">Student Background:</label>
                        <textarea id="background" placeholder="e.g., 'High school graduate with strong math skills, limited programming experience.'" required></textarea>
                    </div>
                    <div class="button-group">
                        <button type="button" class="next-btn">Next</button>
                    </div>
                </div>

                <!-- Step 2: Current Skills -->
                <div class="form-step" id="step2" style="display:none;">
                    <div class="form-group">
                        <label for="skills">Current Skills:</label>
                        <textarea id="skills" placeholder="e.g., 'Algebra, basic Python syntax, data entry.'" required></textarea>
                    </div>
                    <div class="button-group">
                        <button type="button" class="prev-btn">Previous</button>
                        <button type="button" class="next-btn">Next</button>
                    </div>
                </div>

                <!-- Step 3: Career Aspirations -->
                <div class="form-step" id="step3" style="display:none;">
                    <div class="form-group">
                        <label for="career_aspirations">Career Aspirations:</label>
                        <textarea id="career_aspirations" placeholder="e.g., 'Aspiring Data Scientist, interested in machine learning and AI.'" required></textarea>
                    </div>
                    <div class="button-group">
                        <button type="button" class="prev-btn">Previous</button>
                        <button type="submit">Get Recommendation</button>
                    </div>
                </div>
            </form>
            <div id="recommendationResult" class="result-box">
                <h2>Your Personalized Learning Path:</h2>
                <pre id="resultContent"></pre>
                <div class="button-group">
                    <button type="button" id="backBtn" class="back-btn"><i class="fas fa-arrow-left"></i> Back</button>
                    <button type="button" id="startOverBtn" class="start-over-btn">Start Over</button>
                </div>
            </div>
            <div id="loading" class="loading-spinner" style="display:none;"></div>
        </div>
    `;

    const form = document.getElementById('recommendationForm');
    const recommendationResult = document.getElementById('recommendationResult');
    const resultContent = document.getElementById('resultContent');
    const loadingSpinner = document.getElementById('loading');
    const formSteps = document.querySelectorAll('.form-step');
    const nextButtons = document.querySelectorAll('.next-btn');
    const prevButtons = document.querySelectorAll('.prev-btn');
    const startOverBtn = document.getElementById('startOverBtn');
    const backBtn = document.getElementById('backBtn');

    let currentStep = 0;

    function showStep(stepIndex) {
        formSteps.forEach((step, index) => {
            step.style.display = index === stepIndex ? 'block' : 'none';
        });
    }

    function resetForm() {
        form.reset();
        form.style.display = 'block';
        currentStep = 0;
        showStep(currentStep);
        recommendationResult.style.display = 'none';
        heroSection.style.display = 'block';
        howItWorksSection.style.display = 'block';
        formSection.style.display = 'none';
    }
    
    function goBack() {
        recommendationResult.style.display = 'none';
        form.style.display = 'block';
        showStep(formSteps.length - 1);
    }

    nextButtons.forEach(button => {
        button.addEventListener('click', () => {
            if (currentStep < formSteps.length - 1) {
                currentStep++;
                showStep(currentStep);
            }
        });
    });

    prevButtons.forEach(button => {
        button.addEventListener('click', () => {
            if (currentStep > 0) {
                currentStep--;
                showStep(currentStep);
            }
        });
    });

    startOverBtn.addEventListener('click', resetForm);
    backBtn.addEventListener('click', goBack);
    
    // Handle 'Home' button click
    homeBtn.addEventListener('click', (e) => {
        e.preventDefault();
        resetForm();
    });
    
    // Handle theme toggle
    themeToggleBtn.addEventListener('click', (e) => {
        e.preventDefault();
        document.body.classList.toggle('dark-theme');
        
        // Update icon
        if (document.body.classList.contains('dark-theme')) {
            themeIcon.classList.remove('fa-moon');
            themeIcon.classList.add('fa-sun');
        } else {
            themeIcon.classList.remove('fa-sun');
            themeIcon.classList.add('fa-moon');
        }
        
        // Save preference to localStorage
        const isDarkTheme = document.body.classList.contains('dark-theme');
        localStorage.setItem('darkTheme', isDarkTheme);
    });

    // Handle 'Get Started' button click
    getStartedBtn.addEventListener('click', () => {
        heroSection.style.display = 'none';
        howItWorksSection.style.display = 'none';
        formSection.style.display = 'block';
        form.style.display = 'block';
        showStep(0); // Show the first step of the form
    });

    // Load saved theme preference
    const savedTheme = localStorage.getItem('darkTheme');
    if (savedTheme === 'true') {
        document.body.classList.add('dark-theme');
        themeIcon.classList.remove('fa-moon');
        themeIcon.classList.add('fa-sun');
    }
    
    // Initial display
    showStep(currentStep);

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Only submit if on the last step
        if (currentStep !== formSteps.length - 1) {
            return; // Prevent submission if not on the last step
        }

        loadingSpinner.style.display = 'block';
        recommendationResult.style.display = 'none';
        form.style.display = 'none';
        resultContent.textContent = '';

        const background = document.getElementById('background').value;
        const skills = document.getElementById('skills').value;
        const career_aspirations = document.getElementById('career_aspirations').value;

        try {
            const response = await fetch('http://localhost:5000/recommend', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ background, skills, career_aspirations }),
            });

            const data = await response.json();

            if (response.ok) {
                resultContent.textContent = data.recommendation;
                recommendationResult.style.display = 'block';
            } else {
                resultContent.textContent = `Error: ${data.error || 'Something went wrong.'}`;
                recommendationResult.style.display = 'block';
            }
        } catch (error) {
            resultContent.textContent = `Network Error: ${error.message}`;
            recommendationResult.style.display = 'block';
        } finally {
            loadingSpinner.style.display = 'none';
        }
    });
});