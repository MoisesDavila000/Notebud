import json
from application import app, jwt
from flask import request, redirect, jsonify
from datetime import datetime, date, timedelta, timezone
from application import db
from bson import ObjectId
from flask_bcrypt import Bcrypt
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity, unset_jwt_cookies, get_jwt

# Inicializar Bcrypt
bcrypt = Bcrypt(app)


# Removed token
@jwt.revoked_token_loader
def revoked_token_callback(jwt_header, jwt_payload):
    return (
        jsonify(
        {
            "msg": "The token has been revoked.", 
            "error": "token_revoked"
        }
        ),
        401,
    )

@app.after_request
def refresh_expiring_jwts(response):
    try:
        exp_timestamp = get_jwt()["exp"]
        now = datetime.now(timezone.utc)
        target_timestamp = datetime.timestamp(now + timedelta(minutes=30))
        if target_timestamp > exp_timestamp:
            access_token = create_access_token(identity=get_jwt_identity())
            data = response.get_json()
            if type(data) is dict:
                data["access_token"] = access_token 
                response.data = json.dumps(data)
        return response
    except (RuntimeError, KeyError):
        # Case where there is not a valid JWT. Just return the original respone
        return response

@app.errorhandler(404)
def page_not_found(error):
    return jsonify({"error": "Page Not Found"}), 404

@app.route("/tareas", methods=["GET"])
@jwt_required()
def get_tareas():
    id = get_jwt_identity()
    tareas = []
    for tarea in db.tarea_flask.find({"user_id": ObjectId(str(id))}).sort("date_finish", -1):
        tarea["_id"] = str(tarea["_id"])
        tarea["user_id"] = str(tarea["user_id"])
        tareas.append(tarea)
    return jsonify(tareas) , 200


@app.route("/fechatarea", methods=["GET"])
@jwt_required()
def get_fechas():
    id = get_jwt_identity()
    tareas = []
    for tarea in db.tarea_flask.find({"user_id": ObjectId(str(id))}).sort("date_finish", -1):
        fechaT = datetime.strptime(
            tarea["date_finish"], "%Y-%m-%dT%H:%M").date()
        hoy = date.today()
        delta = fechaT - hoy
        if (delta.days <= 3 and delta.days >= 0):
            tarea["_id"] = str(tarea["_id"])
            tarea["user_id"] = str(tarea["user_id"])
            tareas.append(tarea)
    return jsonify(tareas), 200


@app.route("/tarea/<tarea_id>", methods=["GET"])
@jwt_required()
def get_tarea(tarea_id):
    user_id = get_jwt_identity()
    tarea = db.tarea_flask.find_one({"_id": ObjectId(str(tarea_id))})
    if(str(tarea["user_id"]) != user_id):
        return jsonify({"msg": "No puedes ver esta tarea"}), 401
    
    return jsonify({
        "name": tarea["name"],
        "description": tarea["description"],
        "recordatorio": tarea["recordatorio"],
        "date_start": tarea["date_start"],
        "date_finish": tarea["date_finish"],
    })


@app.route("/tarea", methods=["POST"])
@jwt_required()
def add_tarea():
    user_id = get_jwt_identity()
    print(user_id)
    db.tarea_flask.insert_one({
        "name": request.json['name'],
        "description": request.json['description'],
        "recordatorio": request.json['recordatorio'],
        "date_start": request.json['date_start'],
        "date_finish": request.json['date_finish'],
        "user_id": ObjectId(str(user_id))
    })

    return jsonify({"msg": "Tarea creada."})


@app.route("/tarea/<tarea_id>", methods=["PUT"])
@jwt_required()
def update_tarea(tarea_id):
    user_id = get_jwt_identity()
    task = db.tarea_flask.find_one({"_id": ObjectId(str(tarea_id))})
    task_id = str(task["user_id"])
    print(task_id, user_id)
    print(task_id == user_id)
    if(task_id != user_id):
        return jsonify({"msg": "No puedes modificar esta tarea"}), 401
    db.tarea_flask.find_one_and_update({"_id": ObjectId(str(tarea_id))}, {"$set": {
        "name": request.json['name'],
        "description": request.json['description'],
        "recordatorio": request.json['recordatorio'],
        "date_start": request.json['date_start'],
        "date_finish": request.json['date_finish'],
        "user_id": ObjectId(str(user_id))

    }})
    return jsonify({"msg": "Tarea Actualizada"})


@app.route("/delete_tarea/<tarea_id>", methods=["DELETE"])
@jwt_required()
def delete_tarea(tarea_id):
    id = get_jwt_identity()
    task = db.tarea_flask.find_one({"_id": ObjectId(str(tarea_id))})
    if(str(task["user_id"]) != id):
        return jsonify({"msg": "No pudes eliminar esa tarea"}), 401
    
    db.tarea_flask.find_one_and_delete({"_id": ObjectId(str(tarea_id))})

    return jsonify({"msg": "Se elimino la tarea"})


# LOG IN / REGISTER

# Log In
@app.route("/login", methods=["POST"])
def login():
    users = db.users_data
    # Se busca en la BD si existe un usuario con el email ingresado
    loginuser_json = users.find_one({"email": request.json["email"]})

    if loginuser_json:
        id = str(loginuser_json["_id"])
        # Si existe el email despues se compara la contraseña con la almacenada en la base de datos
        if bcrypt.check_password_hash(loginuser_json["password"], request.json["password"]):
            # Si las contraseñas son iguales se almacena el usuario para que este loggeado
            # return jsonify({"accessToken": str(loginuser_json["_id"]), "userName": loginuser_json["name"]})
            access_token = create_access_token(identity = id)
            response = jsonify({"userName": loginuser_json["name"], "accessToken": access_token})
            # set_access_cookies(response, access_token)
            return response, 201

    return jsonify({"msg": "No existe dicha cuenta."})

# Register


@app.route("/register", methods=["POST"])
def register():
    # Se checa si existe el correo en la base de datoss
    if (db.users_data.find_one({"email": request.json["email"]})):
        # Si exite, se manda un error y se hace reload a la pagina
        return jsonify({"msg": "Este correo ya existe"})
        # Si no existe, se hace hash a la contraseña
    hashed_password = bcrypt.generate_password_hash(request.json["password"])
    # Se almacena los datos del nuevo usuario en la base de datos
    db.users_data.insert_one({
        "name": request.json["name"],
        "email": request.json["email"],
        "password": hashed_password
    })
    registeruser_json = db.users_data.find_one(
        {"email": request.json["email"]})

    user_id = ObjectId(str(registeruser_json["_id"]))

    # Se muestra un flash de success y se redirige a login
    access_token = create_access_token(identity=user_id)
    response = jsonify({"userName": registeruser_json["name"], "accessToken": access_token})
    return response, 201

# Log out, hace uso de flask_login y ejecuta logout_user()


@app.route("/logout", methods=["GET"])
@jwt_required()
def logout():
    response = jsonify({"msg": "logout successful"})
    unset_jwt_cookies(response)
    return response, 200

@app.route("/test", methods=["GET"])
@jwt_required()
def test():
    id = ObjectId(get_jwt_identity())
    return jsonify({"msg": "loggin successful"})
