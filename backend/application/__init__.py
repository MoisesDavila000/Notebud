from flask import Flask 
from flask_pymongo import PyMongo
from flask_cors import CORS
from dotenv import load_dotenv
import os
import time 
import threading
import schedule
from application.emailSender import _emailSender

# Cargar .env
load_dotenv()

# Inicializar aplicacion y obtener SECRET_KEY para los formularios y MONGO_URI para la base de datos
app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv('SECRET_KEY')
app.config["MONGO_URI"] = os.getenv('URI')

#setup mongodb
mongodb_client = PyMongo(app)
db = mongodb_client.db

CORS(app)

# Funcion background
def bgfunc():
    # Ejecutar el trabajo _emailSender todos los dias a cierta hora 
    # Nota: Tener Debug=True en run.py hara que este se ejecute 2 veces
    schedule.every().day.at("19:09:00").do(_emailSender, db)
    schedule.every().day.at("20:00:00").do(_emailSender, db)

    while 1:
        schedule.run_pending() 
        time.sleep(1) 

# Crear Proceso1 e iniciarlo, se ejecutara en otro hilo y realizara la funcion background
p1 = threading.Thread(target=bgfunc, daemon=True)
p1.start()

from application import routes

