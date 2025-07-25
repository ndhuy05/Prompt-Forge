import sys
import json
from transformers import AutoModelForCausalLM, AutoTokenizer

class PromptSummaryService:
    def __init__(self):
        try:
            model_name = "Qwen/Qwen3-0.6B"
            # load the tokenizer and the model
            self.tokenizer = AutoTokenizer.from_pretrained(model_name)
            self.model = AutoModelForCausalLM.from_pretrained(
                model_name,
                torch_dtype="auto",
                device_map="auto"
            )
            self.initialized = True
        except Exception as e:
            print(f"Error initializing model: {e}")
            self.initialized = False

    def generate_description(self, prompt_content):
        if not self.initialized:
            return "Unable to generate description - model not available"
        
        try:
            # Create a prompt to generate description
            system_prompt = """You are an AI assistant that creates concise, helpful descriptions for AI prompts. 
            Given a prompt, write a 1-2 sentence description that explains what the prompt does and how it can be used.
            Keep it clear, professional, and under 150 characters."""
            
            user_input = f"Create a description for this AI prompt:\n\n{prompt_content}"
            
            messages = [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_input}
            ]
            
            text = self.tokenizer.apply_chat_template(
                messages,
                tokenize=False,
                add_generation_prompt=True,
                enable_thinking=False  # Disable thinking mode for faster response
            )
            
            model_inputs = self.tokenizer([text], return_tensors="pt").to(self.model.device)
            
            # Generate with constraints for description
            generated_ids = self.model.generate(
                **model_inputs,
                max_new_tokens=100,  # Limit length for descriptions
                temperature=0.7,
                do_sample=True,
                pad_token_id=self.tokenizer.eos_token_id
            )
            
            output_ids = generated_ids[0][len(model_inputs.input_ids[0]):].tolist()
            description = self.tokenizer.decode(output_ids, skip_special_tokens=True).strip()
            
            # Clean up the description
            description = description.replace('\n', ' ').strip()
            if len(description) > 200:
                description = description[:200] + "..."
            
            return description
            
        except Exception as e:
            print(f"Error generating description: {e}")
            return "A helpful AI prompt for various tasks"

def main():
    if len(sys.argv) < 2:
        print(json.dumps({"error": "Usage: python summarize_service.py <command> [prompt_content]"}))
        sys.exit(1)
    
    command = sys.argv[1]
    service = PromptSummaryService()
    
    if command == "generate_description":
        if len(sys.argv) < 3:
            print(json.dumps({"error": "Prompt content required"}))
            sys.exit(1)
        
        prompt_content = sys.argv[2]
        description = service.generate_description(prompt_content)
        
        result = {
            "success": True,
            "description": description
        }
        print(json.dumps(result))
    
    elif command == "test":
        # Test with sample prompt
        test_prompt = "Write a function that calculates the factorial of a number using recursion"
        description = service.generate_description(test_prompt)
        print(json.dumps({"success": True, "description": description}))
    
    else:
        print(json.dumps({"error": f"Unknown command: {command}"}))
        sys.exit(1)

if __name__ == "__main__":
    main()
