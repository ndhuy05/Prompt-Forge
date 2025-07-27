const { spawn } = require('child_process');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');

class SummaryService {
    constructor() {
        this.pythonServicePath = path.join(__dirname, '../../python/summarize_service.py');
        this.isInitialized = false;
        this.geminiInitialized = false;
        this.genAI = null;
        this.model = null;
        
        // Initialize Gemini AI
        this.initializeGemini();
    }

    async initializeGemini() {
        try {
            const apiKey = process.env.GEMINI_API_KEY || 'AIzaSyCbCVIwSZQaa5jMeFNL0wkepxkDR_o6AtE';
            if (apiKey) {
                this.genAI = new GoogleGenerativeAI(apiKey);
                this.model = this.genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
                this.geminiInitialized = true;
                console.log('✅ Gemini AI initialized successfully');
            } else {
                console.log('⚠️ No Gemini API key found, will use fallback methods');
            }
        } catch (error) {
            console.error('❌ Error initializing Gemini AI:', error);
            this.geminiInitialized = false;
        }
    }

    async initialize() {
        try {
            console.log('Initializing Summary Service...');
            
            // Check Gemini first (prioritized for deployment)
            if (this.geminiInitialized) {
                console.log('✅ Gemini AI service ready');
                return;
            }
            
            // Fallback to Python service if Gemini not available
            const testResult = await this.testPythonService();
            if (testResult) {
                console.log('Python Summary service initialized successfully');
                this.isInitialized = true;
            } else {
                console.log('Python Summary service initialization failed');
                this.isInitialized = false;
            }
        } catch (error) {
            console.error('Error initializing Summary Service:', error);
            this.isInitialized = false;
        }
    }

    async testPythonService() {
        return new Promise((resolve) => {
            try {
                const pythonProcess = spawn('python', [this.pythonServicePath, 'test']);
                
                let output = '';
                let errorOutput = '';

                pythonProcess.stdout.on('data', (data) => {
                    output += data.toString();
                });

                pythonProcess.stderr.on('data', (data) => {
                    errorOutput += data.toString();
                });

                pythonProcess.on('close', (code) => {
                    if (code === 0) {
                        try {
                            const result = JSON.parse(output.trim());
                            resolve(result.success);
                        } catch (e) {
                            console.log('Python service test output:', output);
                            resolve(false);
                        }
                    } else {
                        console.error('Python service test failed with code:', code);
                        console.error('Error output:', errorOutput);
                        resolve(false);
                    }
                });

                pythonProcess.on('error', (error) => {
                    console.error('Failed to start Python service:', error);
                    resolve(false);
                });
            } catch (error) {
                console.error('Error testing Python service:', error);
                resolve(false);
            }
        });
    }

    async generateDescription(promptContent) {
        try {
            if (!promptContent || !promptContent.trim()) {
                return {
                    success: false,
                    error: 'Prompt content is required'
                };
            }

            const isProduction = process.env.NODE_ENV === 'production';

            if (isProduction) {
                // PRODUCTION: Prioritize Gemini API for Render deployment
                console.log('🚀 Production mode: Trying Gemini API first...');
                
                if (this.geminiInitialized) {
                    console.log('Using Gemini AI for description generation...');
                    return await this.generateDescriptionGemini(promptContent);
                }
                
                // Fallback to Python if Gemini fails
                if (this.isInitialized) {
                    console.log('Gemini failed, falling back to Python service...');
                    return await this.generateDescriptionPython(promptContent);
                }
                
            } else {
                // DEVELOPMENT: Prioritize Python/Qwen for local development
                console.log('🛠️  Development mode: Trying Python/Qwen service first...');
                
                if (this.isInitialized) {
                    console.log('Using Python/Qwen service for description generation...');
                    return await this.generateDescriptionPython(promptContent);
                }
                
                // Fallback to Gemini if Python not available
                if (this.geminiInitialized) {
                    console.log('Python service not available, using Gemini AI...');
                    return await this.generateDescriptionGemini(promptContent);
                }
            }
            
            // Final fallback for both environments
            console.log('Using simple fallback method for description generation...');
            return this.generateDescriptionFallback(promptContent);
            
        } catch (error) {
            console.error('Error generating description:', error);
            return this.generateDescriptionFallback(promptContent);
        }
    }

    async generateDescriptionGemini(promptContent) {
        try {
            const prompt = `Create a concise, professional description (50-150 characters) for this AI prompt. Focus on what it does and how it helps users:

"${promptContent}"

Requirements:
- Keep it under 150 characters
- Be clear and professional
- Highlight the main purpose
- Avoid technical jargon

Response format: Just return the description text only, no additional formatting.`;

            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            let description = response.text().trim();
            
            // Clean up the response
            description = description.replace(/"/g, '');
            description = description.replace(/^\w+:\s*/, ''); // Remove "Description:" prefix if present
            
            // Ensure length constraint
            if (description.length > 150) {
                description = description.substring(0, 147) + "...";
            }
            
            if (description.length < 10) {
                throw new Error('Generated description too short');
            }
            
            console.log('✅ Gemini AI generated description successfully');
            return {
                success: true,
                description: description,
                source: 'gemini'
            };
            
        } catch (error) {
            console.error('❌ Gemini AI description generation failed:', error);
            
            // Fallback to Python service if available
            if (this.isInitialized) {
                console.log('Falling back to Python service...');
                return await this.generateDescriptionPython(promptContent);
            }
            
            // Final fallback
            return this.generateDescriptionFallback(promptContent);
        }
    }

    async generateDescriptionPython(promptContent) {
        return new Promise((resolve) => {
            const pythonProcess = spawn('python', [
                this.pythonServicePath, 
                'generate_description', 
                promptContent
            ]);
            
            let output = '';
            let errorOutput = '';

            pythonProcess.stdout.on('data', (data) => {
                output += data.toString();
            });

            pythonProcess.stderr.on('data', (data) => {
                errorOutput += data.toString();
            });

            pythonProcess.on('close', (code) => {
                if (code === 0) {
                    try {
                        // Clean output - remove warning messages and keep only JSON
                        const lines = output.trim().split('\n');
                        let jsonOutput = '';
                        
                        // Find the last line that looks like JSON (starts with {)
                        for (let i = lines.length - 1; i >= 0; i--) {
                            const line = lines[i].trim();
                            if (line.startsWith('{')) {
                                jsonOutput = line;
                                break;
                            }
                        }
                        
                        if (!jsonOutput) {
                            console.log('No JSON output found from Python service');
                            resolve(this.generateDescriptionFallback(promptContent));
                            return;
                        }
                        
                        const result = JSON.parse(jsonOutput);
                        
                        if (result.success && result.description) {
                            console.log('Python service generated description successfully');
                            resolve({
                                success: true,
                                description: result.description,
                                source: 'python'
                            });
                        } else {
                            console.log('Python service returned unsuccessful result');
                            resolve(this.generateDescriptionFallback(promptContent));
                        }
                    } catch (e) {
                        console.error('Error parsing Python output:', e);
                        console.error('Python output:', output);
                        console.error('Python error:', errorOutput);
                        resolve(this.generateDescriptionFallback(promptContent));
                    }
                } else {
                    console.error('Python description generation failed with code:', code);
                    console.error('Error output:', errorOutput);
                    resolve(this.generateDescriptionFallback(promptContent));
                }
            });

            pythonProcess.on('error', (error) => {
                console.error('Python process error:', error);
                resolve(this.generateDescriptionFallback(promptContent));
            });
        });
    }

    generateDescriptionFallback(promptContent) {
        try {
            // Simple fallback: generate description based on keywords and length
            const content = promptContent.trim();
            
            // Extract key action words
            const actionWords = ['write', 'create', 'generate', 'analyze', 'explain', 'help', 'assist', 'code', 'debug', 'review'];
            const foundActions = actionWords.filter(word => 
                content.toLowerCase().includes(word)
            );
            
            // Extract programming languages or technologies
            const techKeywords = ['javascript', 'python', 'react', 'vue', 'html', 'css', 'sql', 'api', 'function', 'component'];
            const foundTech = techKeywords.filter(tech => 
                content.toLowerCase().includes(tech)
            );
            
            let description = '';
            
            if (foundActions.length > 0) {
                const action = foundActions[0];
                if (foundTech.length > 0) {
                    description = `A prompt to ${action} ${foundTech[0]} code and solutions`;
                } else {
                    description = `A helpful prompt to ${action} content and provide assistance`;
                }
            } else if (foundTech.length > 0) {
                description = `A ${foundTech[0]} focused prompt for development tasks`;
            } else if (content.length < 50) {
                description = "A concise AI prompt for quick tasks and queries";
            } else if (content.length > 200) {
                description = "A comprehensive AI prompt with detailed instructions";
            } else {
                description = "A useful AI prompt for various tasks and assistance";
            }
            
            // Ensure description is not too long
            if (description.length > 150) {
                description = description.substring(0, 147) + "...";
            }
            
            return {
                success: true,
                description: description,
                source: 'fallback'
            };
        } catch (error) {
            console.error('Error in fallback description generation:', error);
            return {
                success: true,
                description: "A helpful AI prompt for various tasks",
                source: 'fallback'
            };
        }
    }
}

// Create singleton instance
const summaryService = new SummaryService();

module.exports = summaryService; 