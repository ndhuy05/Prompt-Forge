import faiss
import numpy as np
from sentence_transformers import SentenceTransformer
import json
import sys
import os
from pymongo import MongoClient
from bson import ObjectId
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class PromptSimilarityService:
    def __init__(self):
        self.model = SentenceTransformer('all-MiniLM-L6-v2')
        self.index = None
        self.prompt_ids = []
        self.embeddings = None
        
        # MongoDB connection
        mongodb_uri = os.getenv('MONGODB_URI', 'mongodb://localhost:27017/promptforce')
        self.client = MongoClient(mongodb_uri)
        
        # Extract database name from URI or use default
        if 'promptforce' in mongodb_uri:
            db_name = 'promptforce'
        else:
            db_name = os.getenv('DB_NAME', 'promptforce')
        
        self.db = self.client[db_name]
        self.prompts_collection = self.db['prompts']

    def build_index(self, quiet=False):
        try:
            if not quiet:
                print("Building FAISS index...")
            
            # Test MongoDB connection
            try:
                # Ping the database to test connection
                self.client.admin.command('ping')
                if not quiet:
                    print("MongoDB connection successful")
                
                # Check database and collection
                db_names = self.client.list_database_names()
                if not quiet:
                    print(f"Available databases: {db_names}")
                
                if 'promptforce' in db_names:
                    collections = self.db.list_collection_names()
                    if not quiet:
                        print(f"Collections in promptforce: {collections}")
                else:
                    if not quiet:
                        print("Database 'promptforce' not found!")
                    return False
                    
            except Exception as conn_error:
                if not quiet:
                    print(f"MongoDB connection error: {conn_error}")
                return False
            
            # Get all prompts from MongoDB (not just public ones for now)
            prompts = list(self.prompts_collection.find(
                {}, 
                {"_id": 1, "title": 1, "description": 1, "content": 1, "isPublic": 1}
            ))
            
            if not quiet:
                print(f"Found {len(prompts)} total prompts")
            
            # Check isPublic status (treat undefined as public for now)
            public_prompts = [p for p in prompts if p.get('isPublic') != False]
            if not quiet:
                print(f"Public/undefined prompts: {len(public_prompts)}")
            
            # Use public prompts or all prompts if none are explicitly public
            if len(public_prompts) > 0:
                working_prompts = public_prompts
            else:
                if not quiet:
                    print("No public prompts found, using all prompts for similarity index")
                working_prompts = prompts
            
            if not working_prompts:
                if not quiet:
                    print("No prompts found for indexing")
                return False
            
            # Prepare texts for embedding - only use prompt content
            texts = []
            self.prompt_ids = []
            
            for prompt in working_prompts:
                # Only use content for similarity matching
                content = prompt.get('content', '').strip()
                if content:  # Only include prompts with content
                    texts.append(content)
                    self.prompt_ids.append(str(prompt['_id']))
            
            if not quiet:
                print(f"Prompts with content: {len(texts)}")
            
            if not texts:
                if not quiet:
                    print("No prompts with content found for indexing")
                return False
            
            if not quiet:
                print(f"Encoding {len(texts)} prompts...")
            
            # Generate embeddings
            self.embeddings = self.model.encode(texts)
            
            if not quiet:
                print(f"Shape of embeddings: {self.embeddings.shape}")
            
            # Create FAISS index
            dimension = len(self.embeddings[0])
            self.index = faiss.IndexFlatL2(dimension)
            
            # Add embeddings to index
            self.index.add(np.array(self.embeddings).astype('float32'))
            
            if not quiet:
                print(f"FAISS index built with {len(self.prompt_ids)} prompts")
            return True
            
        except Exception as e:
            if not quiet:
                print(f"Error building index: {e}")
            return False

    def find_similar_prompts(self, target_prompt_id, limit=5):
        try:
            if self.index is None:
                print("Index not built, building now...")
                if not self.build_index():
                    return []
            
            # Find target prompt in our index
            if target_prompt_id not in self.prompt_ids:
                print(f"Target prompt {target_prompt_id} not found in index")
                return []
            
            target_index = self.prompt_ids.index(target_prompt_id)
            query_vector = self.embeddings[target_index:target_index+1]
            
            # Search for similar prompts
            k = min(limit + 1, len(self.prompt_ids))  # +1 to exclude self
            distances, indices = self.index.search(query_vector.astype('float32'), k)
            
            similar_prompts = []
            for i, (distance, idx) in enumerate(zip(distances[0], indices[0])):
                prompt_id = self.prompt_ids[idx]
                
                # Skip the target prompt itself
                if prompt_id == target_prompt_id:
                    continue
                
                # Get prompt details from MongoDB
                prompt_data = self.prompts_collection.find_one(
                    {"_id": prompt_id},
                    {"title": 1, "description": 1, "category": 1, "author": 1, "likes": 1, "createdAt": 1}
                )
                
                if prompt_data:
                    similarity_score = 1.0 / (1.0 + distance)  # Convert distance to similarity
                    similar_prompts.append({
                        "_id": prompt_id,
                        "title": prompt_data.get("title", ""),
                        "description": prompt_data.get("description", ""),
                        "category": prompt_data.get("category", ""),
                        "author": prompt_data.get("author", ""),
                        "likes": prompt_data.get("likes", []),
                        "createdAt": prompt_data.get("createdAt", ""),
                        "similarity": float(similarity_score),
                        "distance": float(distance)
                    })
                
                if len(similar_prompts) >= limit:
                    break
            
            return similar_prompts
            
        except Exception as e:
            print(f"Error finding similar prompts: {e}")
            return []

    def find_similar_by_text(self, query_text, limit=5):
        try:
            if self.index is None:
                if not self.build_index(quiet=True):
                    return []
            
            # Generate embedding for query text
            query_vector = self.model.encode([query_text])
            
            # Search for similar prompts
            k = min(limit, len(self.prompt_ids))
            distances, indices = self.index.search(query_vector.astype('float32'), k)
            
            similar_prompts = []
            for i, (distance, idx) in enumerate(zip(distances[0], indices[0])):
                prompt_id = self.prompt_ids[idx]
                
                # Get prompt details from MongoDB using ObjectId
                try:
                    prompt_data = self.prompts_collection.find_one({"_id": ObjectId(prompt_id)})
                except:
                    # Try as string if ObjectId fails
                    prompt_data = self.prompts_collection.find_one({"_id": prompt_id})
                
                if prompt_data:
                    similarity_score = 1.0 / (1.0 + distance)
                    similar_prompts.append({
                        "_id": str(prompt_data["_id"]),
                        "title": prompt_data.get("title", ""),
                        "description": prompt_data.get("description", ""),
                        "category": prompt_data.get("category", ""),
                        "author": prompt_data.get("author", ""),
                        "likes": prompt_data.get("likes", []),
                        "createdAt": prompt_data.get("createdAt", ""),
                        "similarity": float(similarity_score),
                        "distance": float(distance)
                    })
            
            return similar_prompts
            
        except Exception as e:
            return []

def main():
    if len(sys.argv) < 2:
        print("Usage: python similarity_service.py <command> [args]")
        sys.exit(1)
    
    service = PromptSimilarityService()
    command = sys.argv[1]
    
    if command == "build_index":
        success = service.build_index()
        print(json.dumps({"success": success}))
    
    elif command == "find_similar":
        if len(sys.argv) < 3:
            print("Usage: python similarity_service.py find_similar <prompt_id> [limit]")
            sys.exit(1)
        
        prompt_id = sys.argv[2]
        limit = int(sys.argv[3]) if len(sys.argv) > 3 else 5
        
        similar_prompts = service.find_similar_prompts(prompt_id, limit)
        print(json.dumps(similar_prompts, default=str))
    
    elif command == "find_by_text":
        if len(sys.argv) < 3:
            print("Usage: python similarity_service.py find_by_text <query_text> [limit]")
            sys.exit(1)
        
        query_text = sys.argv[2]
        limit = int(sys.argv[3]) if len(sys.argv) > 3 else 5
        
        similar_prompts = service.find_similar_by_text(query_text, limit)
        print(json.dumps(similar_prompts, default=str))
    
    else:
        print(f"Unknown command: {command}")
        sys.exit(1)

if __name__ == "__main__":
    main()
