from application import app
from flask import request, redirect, jsonify
from datetime import datetime, date
from application import db
from bson import ObjectId
from flask_bcrypt import Bcrypt
        
# Inicializar Bcrypt
bcrypt = Bcrypt(app)

@app.route("/tareas/<user_id>", methods=["GET"])
def get_tareas(user_id):
    tareas = []
    for tarea in db.tarea_flask.find({"user_id": ObjectId(str(user_id))}).sort("date_finish", -1):
        tarea["_id"] = str(tarea["_id"])
        tarea["user_id"] = str(tarea["user_id"])
        tareas.append(tarea)
    return jsonify(tareas)

@app.route("/tareafecha/<user_id>", methods=["GET"])
def get_fechas(user_id):
    tareas = []
    for tarea in db.tarea_flask.find({"user_id": ObjectId(str(user_id))}).sort("date_finish", -1):
        fechaT = datetime.strptime(tarea["date_finish"], "%Y-%m-%dT%H:%M").date()
        hoy = date.today()
        delta = fechaT - hoy
        if(delta.days <=3 and delta.days >= 0):
            tarea["_id"] = str(tarea["_id"])
            tarea["user_id"] = str(tarea["user_id"])
            tareas.append(tarea)
    return jsonify(tareas)

@app.route("/tarea/<id>", methods=["GET"])
def get_tarea(id):
    tarea = db.tarea_flask.find_one({"_id": ObjectId(str(id))})
    return jsonify({
        "name": tarea["name"],
        "description": tarea["description"],
        "recordatorio": tarea["recordatorio"],
        "date_start": tarea["date_start"],
        "date_finish": tarea["date_finish"],
    })

@app.route("/tarea/<user_id>", methods=["POST"])
def add_tarea(user_id):
    db.tarea_flask.insert_one({
        "name": request.json['name'],
        "description": request.json['description'],
        "recordatorio": request.json['recordatorio'],
        "date_start": request.json['date_start'],
        "date_finish": request.json['date_finish'],
        "user_id": ObjectId(str(user_id))
    })
    
    return jsonify({"msg": "Tarea creada."})

@app.route("/tarea/<user_id>/<id>", methods = ["PUT"])
def update_tarea(user_id, id):
    db.tarea_flask.find_one_and_update({"_id": ObjectId(id)}, {"$set":{
        "name": request.json['name'],
        "description": request.json['description'],
        "recordatorio": request.json['recordatorio'],
        "date_start": request.json['date_start'],
        "date_finish": request.json['date_finish'],
        "user_id": ObjectId(str(user_id))

    }})
    return jsonify({"msg": "Tarea Actualizada"})

@app.route("/delete_tarea/<id>", methods = ["DELETE"])
def delete_tarea(id):
    db.tarea_flask.find_one_and_delete({"_id": ObjectId(id)})
    return redirect({"msg" :"Se elimino la tarea"})


############## LOG IN / REGISTER 

# Log In
@app.route("/login", methods=["POST"])
def login():
    users = db.users_data
    #Se busca en la BD si existe un usuario con el email ingresado
    loginuser_json = users.find_one({"email": request.json["email"]})
    if loginuser_json:
            #Si existe el email despues se compara la contraseña con la almacenada en la base de datos
        if bcrypt.check_password_hash(loginuser_json["password"], request.json["password"]):
                #Si las contraseñas son iguales se almacena el usuario para que este loggeado
            return jsonify({"accessToken": str(loginuser_json["_id"]), "userName": loginuser_json["name"]})
        
    return jsonify({"msg": "No existe dicha cuenta."})

# Register
@app.route("/register", methods=["POST"])
def register():
    #Se checa si existe el correo en la base de datoss
    if(db.users_data.find_one({"email": request.json["email"]})):
            #Si exite, se manda un error y se hace reload a la pagina
        return jsonify({"msg": "Este correo ya existe"})
        #Si no existe, se hace hash a la contraseña
    hashed_password = bcrypt.generate_password_hash(request.json["password"])
        #Se almacena los datos del nuevo usuario en la base de datos
    registeruser_json = db.users_data.insert_one({
        "name": request.json["name"],
        "email": request.json["email"],
        "password": hashed_password
    })
        #Se muestra un flash de success y se redirige a login
    return jsonify({"accessToken": str(registeruser_json["_id"]), "userName": registeruser_json["name"]})

#Log out, hace uso de flask_login y ejecuta logout_user()
@app.route("/logout", methods=["GET"])
def logout():
    return jsonify({"msg": "Out"})