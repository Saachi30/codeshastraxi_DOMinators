import os
import numpy as np
import cv2
import face_recognition
from flask import Flask, request, jsonify
from werkzeug.utils import secure_filename
import base64
import io
from PIL import Image

app = Flask(__name__)

# Configuration
UPLOAD_FOLDER = 'temp_uploads'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}
SIMILARITY_THRESHOLD = 0.6  # Adjust as needed for sensitivity

# Create upload folder if it doesn't exist
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Dictionary to store registered face encodings
registered_faces = {}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def get_face_encoding(image_data):
    """Extract face encoding from image data"""
    # Convert to RGB (face_recognition requires RGB)
    rgb_image = cv2.cvtColor(image_data, cv2.COLOR_BGR2RGB)
    
    # Find face locations
    face_locations = face_recognition.face_locations(rgb_image)
    
    if not face_locations:
        return None
    
    # Get face encodings (using first face found if multiple exist)
    face_encodings = face_recognition.face_encodings(rgb_image, face_locations)
    
    if face_encodings:
        return face_encodings[0]
    else:
        return None

def decode_image(base64_string):
    """Decode base64 image to numpy array"""
    # Remove header if present
    if 'base64,' in base64_string:
        base64_string = base64_string.split('base64,')[1]
    
    # Decode base64 to image
    image_data = base64.b64decode(base64_string)
    image = Image.open(io.BytesIO(image_data))
    return np.array(image)

def compare_faces(known_encoding, unknown_encoding):
    """Compare face encodings and return similarity score"""
    if known_encoding is None or unknown_encoding is None:
        return 0.0
    
    # Calculate face distance (lower means more similar)
    face_distance = face_recognition.face_distance([known_encoding], unknown_encoding)[0]
    
    # Convert to similarity score (higher means more similar)
    similarity = 1.0 - face_distance
    return similarity

@app.route('/register', methods=['POST'])
def register_face():
    """Register a face with a user ID"""
    if 'user_id' not in request.form:
        return jsonify({'error': 'Missing user_id parameter'}), 400
    
    user_id = request.form['user_id']
    
    # Check if image was sent as file or base64
    if 'image' in request.files:
        # Process uploaded file
        file = request.files['image']
        if file.filename == '':
            return jsonify({'error': 'No selected file'}), 400
        
        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            filepath = os.path.join(UPLOAD_FOLDER, filename)
            file.save(filepath)
            
            # Load and process image
            image = cv2.imread(filepath)
            face_encoding = get_face_encoding(image)
            
            # Remove temporary file
            os.remove(filepath)
    
    elif 'image_base64' in request.form:
        # Process base64 image
        try:
            image = decode_image(request.form['image_base64'])
            face_encoding = get_face_encoding(image)
        except Exception as e:
            return jsonify({'error': f'Error processing base64 image: {str(e)}'}), 400
    
    else:
        return jsonify({'error': 'No image provided'}), 400
    
    # Check if face was detected
    if face_encoding is None:
        return jsonify({'error': 'No face detected in the image'}), 400
    
    # Store face encoding
    registered_faces[user_id] = face_encoding
    
    return jsonify({
        'success': True,
        'message': f'Face registered for user {user_id}',
        'user_id': user_id
    })

@app.route('/verify', methods=['POST'])
def verify_face():
    """Verify if a face matches a registered user"""
    if 'user_id' not in request.form:
        return jsonify({'error': 'Missing user_id parameter'}), 400
    
    user_id = request.form['user_id']
    
    # Check if user is registered
    if user_id not in registered_faces:
        return jsonify({'error': 'User not registered'}), 404
    
    # Get the registered face encoding
    registered_encoding = registered_faces[user_id]
    
    # Check if image was sent as file or base64
    if 'image' in request.files:
        # Process uploaded file
        file = request.files['image']
        if file.filename == '':
            return jsonify({'error': 'No selected file'}), 400
        
        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            filepath = os.path.join(UPLOAD_FOLDER, filename)
            file.save(filepath)
            
            # Load and process image
            image = cv2.imread(filepath)
            face_encoding = get_face_encoding(image)
            
            # Remove temporary file
            os.remove(filepath)
    
    elif 'image_base64' in request.form:
        # Process base64 image
        try:
            image = decode_image(request.form['image_base64'])
            face_encoding = get_face_encoding(image)
        except Exception as e:
            return jsonify({'error': f'Error processing base64 image: {str(e)}'}), 400
    
    else:
        return jsonify({'error': 'No image provided'}), 400
    
    # Check if face was detected
    if face_encoding is None:
        return jsonify({
            'success': False,
            'message': 'No face detected in the image'
        }), 400
    
    # Compare faces
    similarity = compare_faces(registered_encoding, face_encoding)
    match = similarity >= SIMILARITY_THRESHOLD
    
    return jsonify({
        'success': True,
        'match': match,
        'user_id': user_id,
        'similarity': float(similarity),
        'threshold': SIMILARITY_THRESHOLD
    })

@app.route('/users', methods=['GET'])
def list_users():
    """List all registered users"""
    return jsonify({
        'success': True,
        'users': list(registered_faces.keys()),
        'count': len(registered_faces)
    })

@app.route('/delete_user/<user_id>', methods=['DELETE'])
def delete_user(user_id):
    """Delete a registered user"""
    if user_id in registered_faces:
        del registered_faces[user_id]
        return jsonify({
            'success': True,
            'message': f'User {user_id} deleted successfully'
        })
    else:
        return jsonify({
            'success': False,
            'message': f'User {user_id} not found'
        }), 404

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)