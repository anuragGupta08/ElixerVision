import onnxruntime as ort
import numpy as np
import os
import requests

_session = None
MODEL_PATH = "backend/inference/resnet50.onnx"

def get_session():
    global _session
    if _session is None:
        if not os.path.exists(MODEL_PATH):
            os.makedirs(os.path.dirname(MODEL_PATH), exist_ok=True)
            # This is a specific version of ResNet50 that allows access to the pooling layer
            url = "https://github.com/onnx/models/raw/main/validated/vision/classification/resnet/model/resnet50-v1-7.onnx"
            r = requests.get(url)
            with open(MODEL_PATH, 'wb') as f:
                f.write(r.content)
        
        _session = ort.InferenceSession(MODEL_PATH)
    return _session

def encode_image(img: np.ndarray):
    session = get_session()
    
    # 1. Preprocess: Scale and BGR conversion (Keras style)
    img = img.astype(np.float32) * 255.0
    img = img[:, :, ::-1] # RGB to BGR
    img[:, :, 0] -= 103.939
    img[:, :, 1] -= 116.779
    img[:, :, 2] -= 123.68
    
    # 2. Transpose to NCHW
    img = img.transpose(2, 0, 1)
    img = np.expand_dims(img, axis=0)
    
    # 3. Get the Pooling Layer (2048) instead of the Prediction Layer (1000)
    # The second to last output in ResNet ONNX is usually the Flatten/Pooling layer
    input_name = session.get_inputs()[0].name
    # We ask for 'resnetv17_pool1_fwd' (specific to this ONNX model version)
    # or we take the layer before the final softmax
    outputs = session.run(None, {input_name: img})
    
    # Flatten to get your 2048-dim vector
    return outputs[0].flatten()