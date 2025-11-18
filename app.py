from flask import Flask, render_template, request, jsonify
import os
from werkzeug.utils import secure_filename
from model import get_model_prediction, get_text_response, get_disease_comment

app = Flask(__name__)

UPLOAD_FOLDER = 'static/uploads'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/chatbot')
def chatbot_page():
    return render_template('chatbot.html')

@app.route('/ilmu_mata')
def ilmu_mata_page():
    return render_template('ilmu_mata.html')

@app.route('/kanker')
def kanker_page():
    return render_template('kanker.html')

@app.route('/our-team')
def our_team_page():
    selected_team = request.args.get('team', 'ai')
    return render_template('our_team.html', selected_team=selected_team)

@app.route('/predict', methods=['POST'])
def predict():
    if 'file' not in request.files:
        return jsonify({'error': 'Tidak ada file terkirim'}), 400
    
    file = request.files['file']
    
    if file.filename == '':
        return jsonify({'error': 'Tidak ada file yang dipilih'}), 400

    if file:
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        
        try:
            prediction_text, advice_text = get_model_prediction(filepath)
            try:
                predicted_disease = prediction_text.split('**')[1]
            except IndexError:
                predicted_disease = "tidak diketahui" 
            comment_text = get_disease_comment(predicted_disease)
            return jsonify({
                'prediction': prediction_text,
                'advice': advice_text,
                'comment': comment_text
            })
        except Exception as e:
            return jsonify({'error': f'Gagal memproses model: {str(e)}'}), 500

@app.route('/chat', methods=['POST'])
def handle_chat():
    data = request.json
    user_message = data.get('message')
    
    if not user_message:
        return jsonify({'error': 'Tidak ada pesan terkirim'}), 400

    try:
        bot_response_text = get_text_response(user_message)
        return jsonify({'response': bot_response_text})
    except Exception as e:
        return jsonify({'error': f'Gagal memproses chat: {str(e)}'}), 500

if __name__ == '__main__':
    app.run(debug=True, host='127.0.0.1', port=5000)