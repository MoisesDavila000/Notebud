from flask import Flask 
from flask_pymongo import PyMongo
from flask_cors import CORS
from dotenv import load_dotenv
from email.message import EmailMessage
import os
import time 
import threading
import schedule
import ssl 
import smtplib
import datetime

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

# Funcion para enviar correos 
def _emailSender():
    # Obtener correo y contraseña del .env 
    email_sender = os.getenv('EMAIL_SENDER')
    email_pass = os.getenv('EMAIL_PASS')
    # For para obtener las tareas que tengan la caracteristica de recordatorio
    for tarea in db.tarea_flask.find({"recordatorio": "True", "date_finish": datetime.date.today().strftime("%Y-%m-%d")}):
        # Obtener el usuario a partir del user_id de la tarea 
        user = db.users_data.find_one({"_id": tarea["user_id"]})

        # Almacenar correo del usuario
        email_reciever = user["email"]
        # Llenado del correo
        subject = "Recordatorio sobre " + tarea["name"] + ""
        body = """
            Se le notifica que la tarea """ + tarea["name"] + """
            se vence hoy.
            """
        # Creacion del objeto EmailMessage
        em = EmailMessage()
        em['From'] = email_sender
        em['To'] = email_reciever
        em['Subject'] = subject
        em.set_content(body)
        
        context = ssl.create_default_context()
        # Proceso de inicio de sesion y envio del correo
        with smtplib.SMTP_SSL('smtp.gmail.com', 465, context=context) as smtp:
            smtp.login(email_sender, email_pass)
            smtp.sendmail(email_sender, email_reciever, em.as_string())
    
# Funcion background
def bgfunc():
    # Ejecutar el trabajo _emailSender todos los dias a cierta hora 
    # Nota: Tener Debug=True en run.py hara que este se ejecute 2 veces
    schedule.every().day.at("00:00:00").do(_emailSender)
    schedule.every().day.at("20:00:00").do(_emailSender)

    while 1:
        schedule.run_pending() 
        time.sleep(1) 

# Crear Proceso1 e iniciarlo, se ejecutara en otro hilo y realizara la funcion background
p1 = threading.Thread(target=bgfunc, daemon=True)
p1.start()

from application import routes

