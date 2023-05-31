from email.message import EmailMessage
import os
import ssl 
import smtplib
from datetime import datetime, date, timezone
from pytz import timezone

# Funcion para enviar correos 
def _emailSender(db):
    # Obtener correo y contraseña del .env 
    email_sender = os.getenv('EMAIL_SENDER')
    email_pass = os.getenv('EMAIL_PASS')
    # For para obtener las tareas que tengan la caracteristica de recordatorio
    for tarea in db.tarea_flask.find({"recordatorio": "True"}):
        # Obtener el usuario a partir del user_id de la tarea 
        user = db.users_data.find_one({"_id": tarea["user_id"]})
        fechaT = datetime.strptime(tarea["date_finish"], "%Y-%m-%dT%H:%M").date()
        hoy = datetime.now(timezone('America/Monterrey')).date()
        if(fechaT == hoy):
            # Almacenar correo del usuario
            email_reciever = user["email"]
            # Llenado del correo
            subject = "Notebud - Alarma: " + tarea["name"] + ""
            body = """
                <html>
                <head></head>
                <body>
                <h1>Notebud</h1>
                <h3>Recordatorio sobre """ + tarea["name"] + """.</h3>
                <h2>Hola """ + user["name"] + """.</h2>
                <h2>Tu tarea vence hoy, no olvides acabarla.</h2>
                <p> """ + tarea["description"] + """ </p>
                <a href="https://notebud.azurewebsites.net">Ver mis tareas </a> 
                </body>
                </html>
                """
            # Creacion del objeto EmailMessage
            em = EmailMessage()
            em['From'] = email_sender
            em['To'] = email_reciever
            em['Subject'] = subject
            em.set_content(body, subtype="html")
            
            context = ssl.create_default_context()
            # Proceso de inicio de sesion y envio del correo
            with smtplib.SMTP_SSL('smtp.gmail.com', 465, context=context) as smtp:
                smtp.login(email_sender, email_pass)
                smtp.sendmail(email_sender, email_reciever, em.as_string())
    