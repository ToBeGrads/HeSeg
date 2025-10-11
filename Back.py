from flask import Flask, request, jsonify
from PIL import Image
import io
from io import BytesIO
import torch
import numpy as np
from transformers import SamModel, SamProcessor
from flask_cors import CORS
import base64
import traceback
from flask import Flask, request, jsonify
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from flask_cors import CORS

app = Flask(__name__)
app.config['JWT_SECRET_KEY'] = 'super-secret'
jwt = JWTManager(app)
CORS(app)
USERS = {'user': 'pass'}

# Load model once at startup
print("Loading SAM model...")
device = "cuda" if torch.cuda.is_available() else "cpu"
model = SamModel.from_pretrained("facebook/sam-vit-huge").to(device)
processor = SamProcessor.from_pretrained("facebook/sam-vit-huge")
print(f"✅ Model loaded on {device}!")

@app.route('/segment', methods=['POST', 'OPTIONS'])
def Segment():
    # Handle preflight OPTIONS request
    if request.method == 'OPTIONS':
        return '', 204
    
    try:
        print("\n" + "="*50)
        print("📥 NEW SEGMENTATION REQUEST")
        print("="*50)
        
        # Get JSON data
        data = request.get_json()
        
        if not data:
            print("❌ ERROR: No JSON data received")
            return jsonify({
                "success": False,
                "error": "No JSON data received"
            }), 400
        
        print(f"📦 Received data keys: {data.keys()}")
        
        # Extract coords and file
        coords = data.get("coords")
        file_data = data.get("file")
        
        print(f"📍 Coords type: {type(coords)}")
        print(f"📍 Coords value: {coords}")
        print(f"🖼️ File data exists: {file_data is not None}")
        print(f"🖼️ File data length: {len(file_data) if file_data else 0}")
        
        # Validate coords
        if coords is None:
            print("❌ ERROR: No coordinates provided")
            return jsonify({
                "success": False,
                "error": "No coordinates provided"
            }), 400
        
        # Handle coordinate format from frontend: {x: number, y: number, z: number}
        # NOTE: z is the slice index, we only need x and y for 2D segmentation
        if isinstance(coords, dict):
            x = coords.get('x')
            y = coords.get('y')
            z = coords.get('z')
            
            print(f"📍 Extracted from dict: x={x}, y={y}, z={z} (z is slice index, not used)")
            
            if x is None or y is None:
                error_msg = f"Invalid coordinate format. Expected dict with x, y keys. Got: {coords}"
                print(f"❌ ERROR: {error_msg}")
                return jsonify({
                    "success": False,
                    "error": error_msg
                }), 400
            
            # Convert to [[[x, y]]] format for SAM (batch_size=1, point_batch_size=1, nb_points=1, 2)
            coords = [[[int(x), int(y)]]]
            print(f"✅ Converted coords to SAM format: {coords}")
        
        # Handle list format
        elif isinstance(coords, list):
            if len(coords) == 0:
                print("❌ ERROR: Empty coordinates array")
                return jsonify({
                    "success": False,
                    "error": "Empty coordinates array"
                }), 400
            
            # If it's [x, y], wrap it properly
            if len(coords) == 2 and isinstance(coords[0], (int, float)):
                coords = [[[int(coords[0]), int(coords[1])]]]
                print(f"✅ Wrapped coords to SAM format: {coords}")
            
            # If it's [[x, y]], wrap it
            elif isinstance(coords[0], list):
                coords = [[coords[0]]]
                print(f"✅ Wrapped coords to SAM format: {coords}")
            else:
                error_msg = f"Invalid coordinate format: {coords}"
                print(f"❌ ERROR: {error_msg}")
                return jsonify({
                    "success": False,
                    "error": error_msg
                }), 400
        
        else:
            error_msg = f"Coordinates must be dict or list, got: {type(coords)}"
            print(f"❌ ERROR: {error_msg}")
            return jsonify({
                "success": False,
                "error": error_msg
            }), 400
        
        # Validate file
        if not file_data:
            print("❌ ERROR: No image file provided")
            return jsonify({
                "success": False,
                "error": "No image file provided"
            }), 400
        
        # Decode base64 image
        try:
            print("🔄 Decoding base64 image...")
            
            # Remove data:image/png;base64, prefix if present
            if file_data.startswith('data:image'):
                print("🔄 Removing base64 prefix...")
                file_data = file_data.split(',')[1]
            
            # Decode base64
            image_bytes = base64.b64decode(file_data)
            print(f"✅ Decoded {len(image_bytes)} bytes")
            
            # Open image
            image = Image.open(BytesIO(image_bytes))
            
            # Check if grayscale, convert to RGB
            if image.mode != 'RGB':
                print(f"🔄 Converting from {image.mode} to RGB...")
                image = image.convert('RGB')
            
            print(f"✅ Opened image: {image.size} {image.mode}")
            
        except Exception as e:
            error_msg = f"Failed to decode image: {str(e)}"
            print(f"❌ ERROR: {error_msg}")
            traceback.print_exc()
            return jsonify({
                "success": False,
                "error": error_msg
            }), 400
        
        # Prepare inputs for SAM
        print(f"🤖 Processing with SAM model...")
        print(f"📍 Using coordinates: {coords}")
        print(f"🖼️ Image size: {image.size}")
        
        inputs = processor(image, input_points=coords, return_tensors="pt").to(device)
        print("✅ Inputs prepared")
        
        # Generate mask
        print("🔄 Generating mask...")
        with torch.no_grad():
            outputs = model(**inputs)
        print("✅ Model inference complete")
        
        # Get the mask
        print("🔄 Post-processing masks...")
        masks = processor.image_processor.post_process_masks(
            outputs.pred_masks.cpu(),
            inputs["original_sizes"].cpu(),
            inputs["reshaped_input_sizes"].cpu()
        )
        
        # Get the first mask
        mask = masks[0][0][0].numpy()
        print(f"✅ Mask generated with shape: {mask.shape}")
        
        # Convert mask to binary (0 or 255)
        binary_mask = (mask > 0.5).astype(np.uint8) * 255
        print(f"✅ Binary mask created: {binary_mask.shape}, unique values: {np.unique(binary_mask)}")
        
        # Convert to base64 PNG
        print("🔄 Converting mask to base64...")
        mask_image = Image.fromarray(binary_mask, mode='L')
        buffered = BytesIO()
        mask_image.save(buffered, format="PNG")
        mask_base64 = base64.b64encode(buffered.getvalue()).decode('utf-8')
        print(f"✅ Base64 encoding complete (length: {len(mask_base64)})")
        
        print("="*50)
        print("✅ SEGMENTATION SUCCESSFUL!")
        print("="*50 + "\n")
        
        return jsonify({
            "success": True,
            "mask": f"data:image/png;base64,{mask_base64}",
            "mask_shape": list(mask.shape),
            "coords_used": coords
        })
        
    except Exception as e:
        print("\n" + "="*50)
        print("❌ FATAL ERROR IN /segment")
        print("="*50)
        print(f"Error type: {type(e).__name__}")
        print(f"Error message: {str(e)}")
        print("\nFull traceback:")
        traceback.print_exc()
        print("="*50 + "\n")
        
        return jsonify({
            "success": False,
            "error": str(e),
            "error_type": type(e).__name__
        }), 500

@app.route('/health', methods=['GET'])
def health():
    return jsonify({
        "status": "healthy",
        "device": device,
        "model_loaded": model is not None
    })
@app.route('/login', methods=['POST'])
def login():
    data = request.json
    if USERS.get(data['username']) == data['password']:
        token = create_access_token(identity=data['username'])
        return jsonify(access_token=token)
    return jsonify(msg='Bad credentials'), 401

if __name__ == '__main__':
    print("\n" + "="*50)
    print("🚀 STARTING FLASK SERVER")
    print("="*50)
    print(f"📍 URL: http://127.0.0.1:5000")
    print(f"🔧 Device: {device}")
    print(f"✅ CORS enabled for all origins")
    print("="*50 + "\n")
    app.run(debug=True, host='127.0.0.1', port=5000, threaded=True)