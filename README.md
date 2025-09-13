# Celebrity Image Classification

A Flask API and web frontend for classifying images of sports celebrities using a machine learning model.

## Features

- Classify images of selected celebrities like Lionel Messi, Virat Kohli, and others.
- Uses OpenCV and wavelet transforms for image preprocessing.
- Flask backend exposing REST API for classification.
- Frontend with image upload, preview, and probability display.

## Installation

1. Clone the repository:
[git clone https://github.com/<your-username>/<repo-name>.git
cd <repo-name>](https://github.com/Unique1606/Person-classification-using-ML.git)

text

2. Create and activate virtual environment (optional but recommended):
python -m venv venv
source venv/bin/activate # macOS/Linux
venv\Scripts\activate.bat # Windows

text

3. Install dependencies:
pip install -r requirements.txt

text

4. Download or prepare your ML model and artifacts inside the `artifacts` folder.

## Usage

1. Run the Flask server:
python server.py

text

2. Open your frontend HTML in a browser (or run with a static server).

3. Upload an image and see celebrity classification results.

## Project Structure

- `server.py` - Flask backend server
- `util.py` - Utility functions for classification and preprocessing
- `artifacts/` - Saved model and class dictionary JSON
- `frontend/` - HTML, CSS, JS files for UI
- `opencv/` - Cascade files for face/eye detection
- `requirements.txt` - Project dependencies

## Contributing

PRs and issues are welcome! Please ensure consistent code style and test new features.

## License

MIT License.

---

(Adjust placeholders like <your-username> and <repo-name> as needed.)
