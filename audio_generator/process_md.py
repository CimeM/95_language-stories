import os
import yaml
import markdown
from piper.voice import PiperVoice

def convert_md_to_speech(md_file, output_directory):
    # Read Markdown file
    with open(md_file, 'r') as file:
        content = file.read()

    # Load YAML structure from Markdown (assuming it's embedded in the Markdown)
    yaml_content = extract_yaml(content)

    # Initialize PiperVoice with the path to the voice model
    voice_model_path = "/app/voice_models/en_US_voice.onnx"  # Adjust this path as needed
    piper = PiperVoice.load(voice_model_path)

    # Process each chapter in the YAML content
    for chapter in yaml_content.get('chapters', []):
        text = chapter['content']
        output_file = os.path.join(output_directory, f"{chapter['title']}.wav")
        
        # Generate speech from text
        audio = piper.synthesize(text)
        
        # Save the audio to a file
        audio.save(output_file)
        print(f"Saved {output_file}")

def extract_yaml(content):
    # Extract YAML content from Markdown (assuming it's formatted correctly)
    yaml_start = content.find('---')
    yaml_end = content.find('---', yaml_start + 3)
    
    if yaml_start != -1 and yaml_end != -1:
        yaml_str = content[yaml_start + 3:yaml_end].strip()
        return yaml.safe_load(yaml_str)
    
    return {}

if __name__ == "__main__":
    # Process all .md files in the mounted input directory
    input_directory = "/data/input"  # Path to input directory containing .md files
    output_directory = "/data/output"  # Path to output directory for audio files
    
    os.makedirs(output_directory, exist_ok=True)  # Ensure output directory exists
    
    for filename in os.listdir(input_directory):
        if filename.endswith(".md"):
            md_file_path = os.path.join(input_directory, filename)
            convert_md_to_speech(md_file_path, output_directory)
