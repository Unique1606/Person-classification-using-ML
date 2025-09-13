"""import numpy as np
import pywt
import cv2

def w2d(img, mode='haar', level=1):
    # Convert to grayscale
    imArray = cv2.cvtColor(img, cv2.COLOR_RGB2GRAY)

    # Convert to float and normalize
    imArray = np.float32(imArray) / 255.0

    # Compute wavelet coefficients
    coeffs = pywt.wavedec2(imArray, mode, level=level)

    # Zero out approximation coefficients
    coeffs_H = list(coeffs)
    coeffs_H[0] *= 0

    # Reconstruct image from modified coefficients
    imArray_H = pywt.waverec2(coeffs_H, mode)

    # Convert back to 0-255
    imArray_H *= 255
    imArray_H = np.uint8(imArray_H)

    return imArray_H"""
    
import numpy as np
import pywt
import cv2

def w2d(img, mode='haar', level=1):
    imArray = cv2.cvtColor(img, cv2.COLOR_RGB2GRAY)
    imArray = np.float32(imArray) / 255.0

    coeffs = pywt.wavedec2(imArray, mode, level=level)
    coeffs_H = list(coeffs)
    coeffs_H[0] *= 0

    imArray_H = pywt.waverec2(coeffs_H, mode)
    imArray_H *= 255
    imArray_H = np.uint8(imArray_H)

    return imArray_H
