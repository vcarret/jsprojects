from PIL import ImageTk, Image, ImageGrab
import pytesseract
import cv2
from pdf2image import convert_from_path
import os


ROOT = "/home/carter/Desktop/Cours/Thèse/Programming_economics/jsprojects/research/mankiw-et-al_1992/"

def parse_img(image_path,lang,desalt=False):
    image = cv2.imread(image_path)
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    if desalt: # Useful for salt-and-pepper background.
        gray = cv2.medianBlur(gray, 5)
    filename = ROOT + "{}.png".format(os.getpid())
    cv2.imwrite(filename, gray) #Create a temp file
    text = pytesseract.image_to_string(Image.open(filename),lang=langconfig='-c preserve_interword_spaces=1x1 --psm 1 --oem 3')
    os.remove(filename) #Remove the temp file

    return text

out = "orig_images"
if not os.path.exists(ROOT + out):
	os.mkdir(ROOT + out)

file = ROOT + "tables.pdf"

pages = convert_from_path(file, dpi=300,output_file="",output_folder=out,first_page=1,fmt='jpeg',paths_only=True)

for img in pages:
	text = parse_img(img,"en")

