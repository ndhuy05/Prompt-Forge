const Prompt = require('../models/promptModel');
const { spawn } = require('child_process');
const path = require('path');

class SimilarityService {
    constructor() {
        this.pipeline = null;
        this.promptEmbeddings = new Map();
        this.promptIds = [];
        this.isInitialized = false;
        this.pythonServicePath = path.join(__dirname, '../../python/similarity_service.py');
        this.usePythonService = true; // Flag to use Python service
    }

    async initialize() {
        try {
            console.log('Initializing Similarity Service...');
            
            const isProduction = process.env.NODE_ENV === 'production';
            
            if (isProduction) {
                // PRODUCTION: Skip Python FAISS, use JavaScript or text-based similarity
                console.log('🚀 Production mode: Using lightweight similarity methods...');
                this.usePythonService = false;
                
                try {
                    // Try JavaScript transformers (lighter than Python FAISS)
                    const { pipeline } = await import('@xenova/transformers');
                    this.pipeline = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
                    console.log('✅ JavaScript Similarity Service initialized for production');
                } catch (jsError) {
                    console.log('⚠️ JavaScript transformers failed, will use text-based similarity');
                    // Text-based similarity will be used as fallback
                }
                
                this.isInitialized = true;
                
            } else {
                // DEVELOPMENT: Prioritize Python FAISS (vector database)
                console.log('🛠️ Development mode: Trying Python FAISS service first...');
                
                if (this.usePythonService) {
                    console.log('Attempting to use Python FAISS service...');
                    const success = await this.initializePythonService();
                    if (success) {
                        console.log('✅ Python FAISS service initialized successfully');
                        this.isInitialized = true;
                        return;
                    }
                    console.log('⚠️ Python service failed, falling back to JavaScript...');
                    this.usePythonService = false;
                }
                
                // Fallback to JavaScript implementation for development
                try {
                    const { pipeline } = await import('@xenova/transformers');
                    this.pipeline = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
                    console.log('✅ JavaScript Similarity Service initialized successfully');
                } catch (jsError) {
                    console.log('⚠️ JavaScript transformers failed, will use text-based similarity');
                }
                
                this.isInitialized = true;
            }
            
        } catch (error) {
            console.error('❌ Error initializing Similarity Service:', error);
            this.isInitialized = false;
        }
    }

    async initializePythonService() {
        return new Promise((resolve) => {
            try {
                const pythonProcess = spawn('python', [this.pythonServicePath, 'build_index']);
                
                let output = '';
                pythonProcess.stdout.on('data', (data) => {
                    output += data.toString();
                });

                pythonProcess.on('close', (code) => {
                    if (code === 0) {
                        try {
                            const result = JSON.parse(output.trim());
                            resolve(result.success);
                        } catch (e) {
                            console.log('Python service output:', output);
                            resolve(true); // Assume success if we get output
                        }
                    } else {
                        console.error('Python service failed with code:', code);
                        resolve(false);
                    }
                });

                pythonProcess.on('error', (error) => {
                    console.error('Failed to start Python service:', error);
                    resolve(false);
                });
            } catch (error) {
                console.error('Error initializing Python service:', error);
                resolve(false);
            }
        });
    }

    async buildIndex() {
        try {
            if (!this.isInitialized) {
                await this.initialize();
            }

            if (this.usePythonService) {
                console.log('Building FAISS index using Python service...');
                return await this.buildIndexPython();
            } else {
                console.log('Building index using JavaScript...');
                return await this.buildIndexJS();
            }
        } catch (error) {
            console.error('Error building similarity index:', error);
        }
    }

    async buildIndexPython() {
        return new Promise((resolve) => {
            const pythonProcess = spawn('python', [this.pythonServicePath, 'build_index']);
            
            let output = '';
            pythonProcess.stdout.on('data', (data) => {
                console.log(data.toString());
                output += data.toString();
            });

            pythonProcess.on('close', (code) => {
                if (code === 0) {
                    console.log('Python FAISS index built successfully');
                    resolve(true);
                } else {
                    console.error('Python index build failed with code:', code);
                    resolve(false);
                }
            });

            pythonProcess.on('error', (error) => {
                console.error('Python process error:', error);
                resolve(false);
            });
        });
    }

    async buildIndexJS() {
        // Existing JavaScript implementation
        if (!this.pipeline) {
            console.log('Pipeline not available, skipping index build');
            return;
        }

        console.log('Building similarity index...');
        
        // Get prompts that are public or undefined (treat undefined as public)
        const prompts = await Prompt.find({
            $or: [
                { isPublic: true },
                { isPublic: { $exists: false } },
                { isPublic: { $ne: false } }
            ]
        })
            .select('_id content')
            .lean();

        if (prompts.length === 0) {
            console.log('No prompts found for indexing');
            return;
        }

        console.log(`Processing ${prompts.length} prompts for similarity index...`);
        
        this.promptEmbeddings.clear();
        this.promptIds = [];

        const batchSize = 10;
        for (let i = 0; i < prompts.length; i += batchSize) {
            const batch = prompts.slice(i, i + batchSize);
            
            for (const prompt of batch) {
                try {
                    // Only use content for embedding
                    const text = (prompt.content || '').trim();
                    
                    // Skip prompts without content
                    if (!text) {
                        console.log(`Skipping prompt ${prompt._id} - no content`);
                        continue;
                    }
                    const embedding = await this.pipeline(text, { 
                        pooling: 'mean', 
                        normalize: true 
                    });
                    
                    this.promptEmbeddings.set(prompt._id.toString(), Array.from(embedding.data));
                    this.promptIds.push(prompt._id.toString());
                    
                } catch (err) {
                    console.error(`Error processing prompt ${prompt._id}:`, err);
                }
            }
            
            console.log(`Processed ${Math.min(i + batchSize, prompts.length)}/${prompts.length} prompts`);
        }

        console.log(`Similarity index built with ${this.promptIds.length} prompts`);
    }

    // Calculate cosine similarity between two vectors
    cosineSimilarity(vecA, vecB) {
        if (vecA.length !== vecB.length) {
            throw new Error('Vectors must have the same length');
        }

        let dotProduct = 0;
        let normA = 0;
        let normB = 0;

        for (let i = 0; i < vecA.length; i++) {
            dotProduct += vecA[i] * vecB[i];
            normA += vecA[i] * vecA[i];
            normB += vecB[i] * vecB[i];
        }

        normA = Math.sqrt(normA);
        normB = Math.sqrt(normB);

        if (normA === 0 || normB === 0) {
            return 0;
        }

        return dotProduct / (normA * normB);
    }

    async findSimilarPrompts(targetPrompt, limit = 5) {
        try {
            if (!this.isInitialized) {
                console.log('Service not ready, initializing...');
                await this.initialize();
            }

            const isProduction = process.env.NODE_ENV === 'production';

            if (isProduction) {
                // PRODUCTION: Use lightweight methods (no Python FAISS)
                console.log('🚀 Production mode: Using lightweight similarity search...');
                
                if (this.pipeline) {
                    console.log('Using JavaScript transformers for similarity search...');
                    return await this.findSimilarPromptsJS(targetPrompt, limit);
                } else {
                    console.log('Using text-based similarity search...');
                    return await this.findSimilarPromptsTextBased(targetPrompt, limit);
                }
                
            } else {
                // DEVELOPMENT: Prioritize Python FAISS (vector database)
                console.log('🛠️ Development mode: Trying vector database first...');
                
                if (this.usePythonService) {
                    console.log('Using Python FAISS service for similarity search...');
                    return await this.findSimilarPromptsPython(targetPrompt, limit);
                } else if (this.pipeline) {
                    console.log('Using JavaScript transformers for similarity search...');
                    return await this.findSimilarPromptsJS(targetPrompt, limit);
                } else {
                    console.log('Falling back to text-based similarity search...');
                    return await this.findSimilarPromptsTextBased(targetPrompt, limit);
                }
            }
            
        } catch (error) {
            console.error('❌ Error finding similar prompts:', error);
            // Final fallback to text-based similarity
            console.log('Using final fallback: text-based similarity...');
            return await this.findSimilarPromptsTextBased(targetPrompt, limit);
        }
    }

    async findSimilarPromptsPython(targetPrompt, limit = 5) {
        return new Promise((resolve) => {
            // Only use content for similarity search
            const queryText = targetPrompt.content || '';
            
            if (!queryText.trim()) {
                console.log('No content available for similarity search');
                resolve([]);
                return;
            }
            
            const pythonProcess = spawn('python', [
                this.pythonServicePath, 
                'find_by_text', 
                queryText, 
                limit.toString()
            ]);
            
            let output = '';
            let errorOutput = '';

            pythonProcess.stdout.on('data', (data) => {
                output += data.toString();
            });

            pythonProcess.stderr.on('data', (data) => {
                errorOutput += data.toString();
            });

            pythonProcess.on('close', async (code) => {
                if (code === 0) {
                    try {
                        // Clean output - remove warning messages and keep only JSON
                        const lines = output.trim().split('\n');
                        let jsonOutput = '';
                        
                        // Find the last line that looks like JSON (starts with [ or {)
                        for (let i = lines.length - 1; i >= 0; i--) {
                            const line = lines[i].trim();
                            if (line.startsWith('[') || line.startsWith('{')) {
                                jsonOutput = line;
                                break;
                            }
                        }
                        
                        if (!jsonOutput) {
                            console.log('No JSON output found from Python service');
                            resolve([]);
                            return;
                        }
                        
                        const similarPrompts = JSON.parse(jsonOutput);
                        
                        if (!Array.isArray(similarPrompts)) {
                            console.log('Python service returned non-array result');
                            resolve([]);
                            return;
                        }
                        
                        // Add comments count for each prompt
                        const Comment = require('../models/commentModel');
                        const promptsWithStats = await Promise.all(
                            similarPrompts.map(async (prompt) => {
                                const commentsCount = await Comment.countDocuments({ prompt: prompt._id });
                                
                                return {
                                    ...prompt,
                                    commentsCount,
                                    likesCount: prompt.likes ? prompt.likes.length : 0
                                };
                            })
                        );

                        console.log(`Python service found ${promptsWithStats.length} similar prompts`);
                        resolve(promptsWithStats);
                    } catch (e) {
                        console.error('Error parsing Python output:', e);
                        console.error('Python output:', output);
                        console.error('Python error:', errorOutput);
                        resolve([]);
                    }
                } else {
                    console.error('Python similarity search failed with code:', code);
                    console.error('Error output:', errorOutput);
                    resolve([]);
                }
            });

            pythonProcess.on('error', (error) => {
                console.error('Python process error:', error);
                resolve([]);
            });
        });
    }

    async findSimilarPromptsJS(targetPrompt, limit = 5) {
        // If AI similarity is not available, use text-based similarity
        if (!this.pipeline || !this.isInitialized || this.promptIds.length === 0) {
            console.log('AI similarity not available, using text-based similarity');
            return await this.findSimilarPromptsTextBased(targetPrompt, limit);
        }

        // Only use content for similarity search
        const queryText = targetPrompt.content || '';
        
        if (!queryText.trim()) {
            console.log('No content available for similarity search');
            return await this.findSimilarPromptsTextBased(targetPrompt, limit);
        }
        
        // Generate embedding for query
        const queryEmbedding = await this.pipeline(queryText, { 
            pooling: 'mean', 
            normalize: true 
        });
        
        const queryVector = Array.from(queryEmbedding.data);

        // Calculate similarities with all prompts
        const similarities = [];
        
        for (const promptId of this.promptIds) {
            // Skip the target prompt itself
            if (promptId === targetPrompt._id.toString()) {
                continue;
            }

            const promptEmbedding = this.promptEmbeddings.get(promptId);
            if (promptEmbedding) {
                const similarity = this.cosineSimilarity(queryVector, promptEmbedding);
                similarities.push({
                    promptId,
                    similarity
                });
            }
        }

        // Sort by similarity (highest first) and take top results
        similarities.sort((a, b) => b.similarity - a.similarity);
        const topSimilarIds = similarities.slice(0, limit).map(item => item.promptId);

        if (topSimilarIds.length === 0) {
            return await this.findSimilarPromptsTextBased(targetPrompt, limit);
        }

        // Get full prompt details
        const similarPrompts = await Prompt.find({
            _id: { $in: topSimilarIds }
        })
        .populate('author', 'username avatar')
        .populate('tags', 'name')
        .lean();

        // Add similarity scores and sort
        const promptsWithSimilarity = similarPrompts.map(prompt => {
            const similarityData = similarities.find(s => s.promptId === prompt._id.toString());
            return {
                ...prompt,
                similarity: similarityData ? similarityData.similarity : 0
            };
        });

        // Sort by similarity score
        promptsWithSimilarity.sort((a, b) => b.similarity - a.similarity);

        // Add comments count for each prompt
        const Comment = require('../models/commentModel');
        const promptsWithStats = await Promise.all(
            promptsWithSimilarity.map(async (prompt) => {
                const commentsCount = await Comment.countDocuments({ prompt: prompt._id });
                
                return {
                    ...prompt,
                    commentsCount,
                    likesCount: prompt.likes ? prompt.likes.length : 0
                };
            })
        );

        return promptsWithStats;
    }

    // Fallback text-based similarity using keyword matching
    async findSimilarPromptsTextBased(targetPrompt, limit = 5) {
        try {
            console.log('Using text-based similarity search');
            
            // Extract keywords from target prompt content only
            const targetText = (targetPrompt.content || '').toLowerCase();
            const targetWords = targetText.split(/\s+/).filter(word => word.length > 3);
            
            if (targetWords.length === 0) {
                console.log('No meaningful content words found for similarity search');
                return [];
            }
            
            // Find prompts with similar content keywords only
            const similarPrompts = await Prompt.find({
                _id: { $ne: targetPrompt._id },
                $or: [
                    { isPublic: true },
                    { isPublic: { $exists: false } },
                    { isPublic: { $ne: false } }
                ],
                $and: [
                    {
                        $or: [
                            { content: { $regex: targetWords.join('|'), $options: 'i' } },
                            { category: targetPrompt.category }
                        ]
                    }
                ]
            })
            .populate('author', 'username avatar')
            .populate('tags', 'name')
            .limit(limit * 2) // Get more to filter better matches
            .lean();

            // Add comments count and likes count
            const Comment = require('../models/commentModel');
            const promptsWithStats = await Promise.all(
                similarPrompts.map(async (prompt) => {
                    const commentsCount = await Comment.countDocuments({ prompt: prompt._id });
                    
                    return {
                        ...prompt,
                        commentsCount,
                        likesCount: prompt.likes ? prompt.likes.length : 0,
                        similarity: Math.random() * 0.5 + 0.3 // Fake similarity score for consistency
                    };
                })
            );

            // Sort by category match first, then by likes
            promptsWithStats.sort((a, b) => {
                if (a.category === targetPrompt.category && b.category !== targetPrompt.category) return -1;
                if (b.category === targetPrompt.category && a.category !== targetPrompt.category) return 1;
                return b.likesCount - a.likesCount;
            });

            return promptsWithStats.slice(0, limit);

        } catch (error) {
            console.error('Error in text-based similarity search:', error);
            return [];
        }
    }

    async rebuildIndex() {
        console.log('Rebuilding similarity index...');
        await this.buildIndex();
    }
}

// Create singleton instance
const similarityService = new SimilarityService();

module.exports = similarityService;
