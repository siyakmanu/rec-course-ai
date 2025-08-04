// Simple Express server to handle API requests
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Groq API Key - In a production environment, this should be stored in environment variables
const GROQ_API_KEY = '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';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..')));

// API endpoint to get recommendations
app.post('/api/recommendations', async (req, res) => {
    try {
        const userData = req.body;
        
        // Generate prompt for Groq API
        const prompt = `
        I need a personalized learning path recommendation based on the following profile:
        
        Name: ${userData.name}
        Current Skills: ${userData.currentSkills}
        Education Level: ${userData.education}
        Target Career/Role: ${userData.careerGoal}
        Weekly Time Commitment: ${userData.timeCommitment} hours
        Preferred Learning Style: ${userData.learningStyle}
        
        Please provide recommendations in the following JSON format:
        
        {
            "courses": [
                {
                    "title": "Course Title",
                    "provider": "Provider Name",
                    "level": "Beginner/Intermediate/Advanced",
                    "duration": "Estimated duration",
                    "description": "Brief description",
                    "url": "Course URL or placeholder",
                    "tags": ["tag1", "tag2"]
                }
            ],
            "materials": [
                {
                    "title": "Material Title",
                    "type": "Book/Article/Video/Tool",
                    "author": "Author or Creator",
                    "description": "Brief description",
                    "url": "URL or placeholder"
                }
            ],
            "skillPriorities": [
                {
                    "skill": "Skill Name",
                    "importance": "High/Medium/Low",
                    "reason": "Why this skill is important"
                }
            ],
            "learningPath": [
                {
                    "phase": "Phase 1: Foundation",
                    "duration": "X weeks",
                    "focus": "What to focus on in this phase",
                    "milestones": ["milestone1", "milestone2"]
                }
            ]
        }
        
        Provide at least 3 courses, 3 materials, 3 skill priorities, and a learning path with at least 3 phases.
        Make sure all recommendations are relevant to the target career and consider the current skills and education level.
        `;
        
        // Call Groq API
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${GROQ_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'llama3-8b-8192',
                messages: [
                    {
                        role: 'system',
                        content: 'You are an educational advisor specialized in creating personalized learning paths. Provide detailed, structured recommendations based on the user\'s background, goals, and preferences.'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                temperature: 0.7,
                max_tokens: 2048
            })
        });
        
        if (!response.ok) {
            throw new Error(`API request failed with status ${response.status}`);
        }
        
        const data = await response.json();
        const content = data.choices[0].message.content;
        
        // Parse the recommendations from the API response
        let recommendations;
        try {
            // Extract JSON from the response text
            const jsonMatch = content.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                recommendations = JSON.parse(jsonMatch[0]);
            } else {
                // If no JSON found, try to parse the entire response
                recommendations = JSON.parse(content);
            }
        } catch (error) {
            console.error('Error parsing recommendations:', error);
            return res.status(500).json({
                error: true,
                message: 'Could not parse recommendations. Please try again.'
            });
        }
        
        res.json(recommendations);
    } catch (error) {
        console.error('Error getting recommendations:', error);
        res.status(500).json({
            error: true,
            message: 'Error getting recommendations. Please try again.'
        });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Open http://localhost:${PORT} in your browser`);
});