from flask import Flask, request, jsonify
import google.generativeai as genai
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Replace with your actual Gemini API key
GOOGLE_API_KEY = 'AIzaSyDGn6vr_hc_dPxSdGR73WlMAb5mA-oGp28'
genai.configure(api_key=GOOGLE_API_KEY)
model = genai.GenerativeModel('gemini-1.5-flash')

@app.route('/generate-text', methods=['POST'])
def generate_text():
    prompt = request.json.get('prompt')

    if not prompt:
        return jsonify({'error': 'Prompt is required'}), 400

    try:
        # Generate content using the Google API
        response = model.generate_content(prompt)
        print(response.text)
        # Extract the generated text from the response object
        if hasattr(response, 'text'):  # If the response has a 'text' attribute
            generated_text = response.text
        elif 'text' in response:  # If response is a dict with a 'text' key
            generated_text = response['text']
        else:
            generated_text = "No text generated" 
        return jsonify({'text': generated_text})

    except Exception as e:
        print(f"Error generating text: {e}")
        return jsonify({'error': 'Error generating text'}), 500

if __name__ == '__main__':
    app.run(debug=True)

