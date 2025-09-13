"""from flask import Flask, request, jsonify
import util

app = Flask(__name__)

@app.route("/", methods=["GET"])
def home():
    return "✅ Sports Celebrity Image Classification API is running!"

@app.route("/classify_image", methods=["POST"])
def classify_image():
    image_data = request.json['image_base64']
    response = jsonify(util.classify_image(image_data))
    response.headers.add('Access-Control-Allow-Origin', '*')
    return response

# Extra route just for quick testing with saved base64 image
@app.route("/classify_image/test", methods=["GET"])
def classify_test_image():
    test_img = util.get_b64_test_image_for_pawankalyan()
    response = jsonify(util.classify_image(test_img))
    response.headers.add('Access-Control-Allow-Origin', '*')
    return response

if __name__ == "__main__":
    print("Starting Python Flask Server For Sports Celebrity Image Classification")
    util.load_saved_artifacts()
    app.run(debug=True)"""
#####################################################################################################################
"""THE BELOW CODE IS TO TESTING PURPOSE IN VS CODE TERMINAL AND ITS PREDICTING CORRECTLY LIKE THIS 
D:\ML\ML Project 2(Classification)\Server>python server.py
Starting server and testing with Pawan Kalyan base64...
loading saved artifacts...start
loading saved artifacts...done
Classification Result: [{'class': 'Pawan Kalyan', 'class_probability': [0.18, 0.14, 0.33, 99.01, 0.28, 0.06], 'class_dictionary': {'cropped': 0, 'lionel messi': 1, 'michael jackson': 2, 'Narendra Modi': 3, 'Pawan Kalyan': 4, 'Ratan Tata': 5, 'Virat Kohli': 6}}]

D:\ML\ML Project 2(Classification)\Server>, NOW WE NEED TO THIS PREDICTION IN FRONTEND USING HTML , THE CODE WILL BE ABOVE """
########################################################################################################################
"""from flask import Flask
import util

app = Flask(__name__)

if __name__ == "__main__":
    print("Starting server and testing with Pawan Kalyan base64...")
    util.load_saved_artifacts()

    # Get the base64 test image (Pawan Kalyan)
    b64 = util.get_b64_test_image_for_pawankalyan()

    # Run classification directly
    result = util.classify_image(b64, None)
    print("Classification Result:", result)"""
# this is for testing the code in local 
"""from flask import Flask
import util

app = Flask(__name__)

if __name__ == "__main__":
    print("Starting server and testing with images...")
    util.load_saved_artifacts()

    # 🔹 Test with Pawan Kalyan (Base64)
    print("\nTesting with Pawan Kalyan (Base64)...")
    b64 = util.get_b64_test_image_for_pawankalyan()
    result = util.classify_image(b64, None)
    print("Classification Result:", result)

    # 🔹 Test with Michael Jackson (File Path)
    print("\nTesting with Michael Jackson (File Path)...")
    mj_path = r"D:\ML\ML Project 2(Classification)\Server\dataset\michael jackson\Image_15.jpg"
    mj_result = util.classify_image(None, file_path=mj_path)
    print("Classification Result:", mj_result)

    # 🔹 Test with Virat Kohli (File Path)
    print("\nTesting with Virat Kohli (File Path)...")
    vk_path = r"D:\ML\ML Project 2(Classification)\Server\dataset\Virat Kohli\Image_29.jpg"
    vk_result = util.classify_image(None, file_path=vk_path)
    print("Classification Result:", vk_result)
# this is using the file path given no base64 encoded string """


# code for run from web
# server.py
from flask import Flask, request, jsonify
from flask_cors import CORS
import util

app = Flask(__name__)
CORS(app)  # Allow cross-origin requests


@app.route('/classify_image', methods=['POST'])
def classify_image():
    data = request.get_json()
    # Accept either 'image_data' or 'image_base64' keys for compatibility
    image_data = data.get('image_data') or data.get('image_base64')
    if not image_data:
        return jsonify({"error": "No image data provided"}), 400

    result = util.classify_image(image_data)
    return jsonify(result)  # Return JSON response


if __name__ == "__main__":
    print("Starting python flask server for person/image classifier")
    util.load_saved_artifacts()
    app.run(port=5000)
