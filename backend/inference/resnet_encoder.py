import onnxruntime as ort
import numpy as np
import os
import requests

# Lazy loading to keep memory usage low until the first request
_session = None
MODEL_PATH = "backend/inference/resnet50.onnx"

def get_session():
    global _session
    if _session is None:
        # Download the official ResNet50 ONNX model if not present (~95MB)
        if not os.path.exists(MODEL_PATH):
            os.makedirs(os.path.dirname(MODEL_PATH), exist_ok=True)
            url = "https://github.com/onnx/models/raw/main/validated/vision/classification/resnet/model/resnet50-v1-7.onnx"
            response = requests.get(url)
            with open(MODEL_PATH, "wb") as f:
                f.write(response.content)
        
        # Initialize ONNX Runtime with CPU provider
        _session = ort.InferenceSession(MODEL_PATH, providers=['CPUExecutionProvider'])
    return _session

def encode_image(img: np.ndarray):
    """
    Input: img as np.ndarray (224, 224, 3) with values 0.0 to 1.0
    Output: 2048-dim embedding vector
    """
    session = get_session()
    
    # 1. Scale to 0-255 (Matches your img * 255.0)
    img = img.astype(np.float32) * 255.0
    
    # 2. Manual 'preprocess_input' (ResNet50 uses 'caffe' mode: BGR + Mean Subtraction)
    # Convert RGB to BGR
    img = img[:, :, ::-1]
    # Subtract Mean (ImageNet constants)
    img[:, :, 0] -= 103.939 # Blue
    img[:, :, 1] -= 116.779 # Green
    img[:, :, 2] -= 123.68  # Red
    
    # 3. Transpose to NCHW format (1, 3, 224, 224) required by ONNX ResNet
    img = np.transpose(img, (2, 0, 1))
    img = np.expand_dims(img, axis=0)
    
    # 4. Run Inference
    input_name = session.get_inputs()[0].name
    # outputs[0] is the (1, 1000) classification or (1, 2048) pooling layer
    # Note: official ONNX models often include the Top Layer. 
    # If the vector size is 1000, we use the layer before it.
    outputs = session.run(None, {input_name: img})
    
    return outputs[0].flatten()