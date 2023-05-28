import React, { Fragment, useState} from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Cookies from "universal-cookie";
import login_photo from '../img/login.jpg';
import register_photo from '../img/register.jpg';
import icon from '../img/icon.png';

const API = process.env.REACT_APP_API;

export const LogIn = () => {
  const cookie = new Cookies();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";

  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogIn = async (e) => {
    e.preventDefault();
    const res = await fetch(`${API}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
      }),
    });

    const data = await res.json();
    var count = Object.keys(data).length;
    if (count === 2) {
      const accessToken = data.accessToken;
      const userName = data.userName;
      cookie.set("accessToken", accessToken, { path: "/" });
      cookie.set("userName", userName, { path: "/" });
      setEmail("");
      setPassword("");
      navigate(from, { replace: true });
    }
    else{
      alert(data.msg);
    }

  };

  return (
    <Fragment>
      <div className="d-flex">
      <div className="container min-vh-100 d-flex align-items-center flex-column w-50">
        <div className="d-flex">
        <img className="mt-5 mb-5 pt-5 pb-4" src={icon} alt="Icono"/>
        <h1 className="mt-5 mb-5 pt-5 pb-4 font-weight-bold align-self-center">Notebud</h1>
        </div>
        <form
          className="rounded w-75"
          style={{border:"1px solid #8294C4", color:"#8294C4", fontWeight:"500"}}
          onSubmit={handleLogIn}
        >
          <div className="form-group m-4">
            <div className="mb-3">
              <label htmlFor="emailLog" className="form-label">
                Correo
              </label>
              <input
                type="email"
                className="form-control"
                id="emailLog"
                aria-describedby="emailHelp"
                placeholder="ejemplo@correo.com"
                required
                onChange={(e) => setEmail(e.target.value)}
                value={email}
              />
            </div>
            <div className="form-group mb-4">
              <label htmlFor="passLog" className="form-label">
                Contraseña
              </label>
              <input
                type="password"
                className="form-control"
                id="passLog"
                required
                maxLength="20"
                onChange={(e) => setPassword(e.target.value)}
                value={password}
              />
            </div>
            <div className="d-flex justify-content-center">
              <button type="submit" className="btn w-50 text-light" style={{backgroundColor:"#8294C4", fontWeight:"500"}}>
                Iniciar Sesion
              </button>
            </div>
          </div>
        </form>
        <div>
          <div className="container-fluid mt-3 d-flex justify-content-center">
            <Link className="navbar-brand" to="/register">
              ¿No tienes una cuenta? Crea una.
            </Link>
          </div>
        </div>
      </div>
      <div className="w-50">
        <img src={login_photo} alt="LogIn" className="img-fluid h-100 position-fixed"/>
      </div>
      </div>
    </Fragment>
  );
};

export const Register = () => {
  const cookie = new Cookies();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";

  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();
    const res = await fetch(`${API}/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        "name": name,
        "email": email,
        "password": password,
      }),
    });

    const data = await res.json();
    var count = Object.keys(data).length;
    console.log(count);
    if (count === 2) {
      const accessToken = data.accessToken;
      const userName = data.userName;
      cookie.set("accessToken", accessToken, { path: "/" });
      cookie.set("userName", userName, { path: "/" });
      setEmail("");
      setPassword("");
      navigate(from, { replace: true });
    }
    else{
      alert(data.msg);
    }
  };

  return (
    <Fragment>
      <div className="d-flex">
      <div className="container min-vh-100 d-flex align-items-center flex-column w-50">
      <div className="d-flex">
        <img className="mt-5 mb-5 pt-5 pb-4" src={icon} alt="Icono"/>
        <h1 className="mt-5 mb-5 pt-5 pb-4 align-self-center">Notebud</h1>
      </div>
        <form
          className="rounded w-75"
          style={{border:"1px solid #8294C4", color:"#8294C4", fontWeight:"500"}}
          onSubmit={handleRegister}
        >
          <div className="form-group m-4">
            <div className="mb-3">
              <label htmlFor="nameReg" className="form-label">
                Nombre
              </label>
              <input
                type="text"
                className="form-control"
                id="nameReg"
                aria-describedby="emailHelp"
                placeholder="Usuario"
                required
                onChange={(e) => setName(e.target.value)}
                value={name}
              />
            </div>
            <div className="mb-3">
              <label htmlFor="emailReg" className="form-label">
                Correo
              </label>
              <input
                type="email"
                className="form-control"
                id="emailReg"
                aria-describedby="emailHelp"
                placeholder="ejemplo@correo.com"
                required
                onChange={(e) => setEmail(e.target.value)}
                value={email}
              />
            </div>
            <div className="mb-3">
              <label htmlFor="passReg" className="form-label">
                Contraseña
              </label>
              <input
                type="password"
                className="form-control"
                id="passReg"
                required
                maxLength="20"
                onChange={(e) => setPassword(e.target.value)}
                value={password}
              />
            </div>
            <div className="d-flex justify-content-center">
              <button type="submit" className="btn w-50" style={{backgroundColor:"#8294C4", fontWeight:"500"}}>
                Crear Cuenta
              </button>
            </div>
          </div>
        </form>
        <div className="container-fluid mt-3 d-flex justify-content-center">
          <Link className="navbar-brand" to="/login">
            ¿Ya tienes una cuenta? Inicia Sesion.
          </Link>
        </div>
      </div>
      <div className="w-50">
        <img src={register_photo} alt="Register" className="img-fluid h-100 position-fixed"/>
      </div>
      </div>
    </Fragment>
  );
};
