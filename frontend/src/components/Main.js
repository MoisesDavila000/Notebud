import React, { Fragment, useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Cookies from "universal-cookie";
import "./Styles.css";
import icon from "../img/icon.png"
import moment from 'moment'
import es from "date-fns/locale/es"

import format from "date-fns/format";
import getDay from "date-fns/getDay";
import parse from "date-fns/parse";
import startOfWeek from "date-fns/startOfWeek";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "./Calendar.css";

const API = process.env.REACT_APP_API;

const locales = {
  es: es,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales
});

const formatDate = (date_finish) => {
  return new Date(date_finish).toLocaleDateString("es-MX");
}

export const Main = () => {
  const cookie = new Cookies();
  const navigate = useNavigate();
  const [tareas, setTareas] = useState([]);
  const [alarmas, setAlarmas] = useState([]);
  const [tDates, setTDates] = useState([]);
  const [tCal, setTCal] = useState([]);

  const handleLogOut = async () => {
    const res = await fetch(`${API}/logout`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${cookie.get("accessToken")}`
      },
    });

    const data = await res.json();
    if(data){
      cookie.remove("accessToken");
      cookie.remove("userName");
      navigate("/login", { replace: true });
    }
  };

  const getTareas = async () => {
    const res = await fetch(`${API}/tareas`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${cookie.get("accessToken")}`
      },
    });

    const data = await res.json();

    console.log(data)

    var alarma = [];
    var tarea = [];
    var calendario = [];
    for (var i = 0; i < data.length; i++) {
      var start = data[i].date_start;
      var end = data[i].date_finish;
      calendario.push({title: data[i].name, start: moment(start).toDate(), end: moment(end).toDate(), allDay:false});
      if (data[i].recordatorio === "True") {
        alarma.push(data[i]);
        alarma[alarma.length-1].date_finish = formatDate(alarma[alarma.length-1].date_finish)
      } else {
        tarea.push(data[i]);
        tarea[tarea.length-1].date_finish = formatDate(tarea[tarea.length-1].date_finish)
        
      }
    }
    setAlarmas(alarma);
    setTareas(tarea);
    setTCal(calendario);
  };

  const getTareasDate = async () => {
    const res = await fetch(`${API}/fechatarea`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${cookie.get("accessToken")}`
      },
    })

    const data = await res.json();

    for(var i = 0; i < data.length; i++){
      data[i].date_finish = formatDate(data[i].date_finish);
    }
    setTDates(data);
  };

  const editTarea = (id) => {
    const pet = "PUT"
    navigate("/tarea", {state:{id: id, pet: pet}});
  };

  const deleteTarea = async (id) => {
    const userResponse = window.confirm(
      "¿Estas seguro que quieres eliminar esta tarea?"
    );
    if (userResponse) {
      const res = await fetch(`${API}/delete_tarea/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${cookie.get("accessToken")}`
        }
      });
      const data = await res.json();
      await getTareas();
      await getTareasDate();
    }
  };

  useEffect(() => {
    getTareas();
    getTareasDate();
  }, []);

  return (
    <Fragment>
      <nav className="navbar justify-content-between"
      style={{backgroundColor:"#8294C4"}}>
        <Link className="navbar-brand ms-4 d-flex" to="/">
          <img className="" src={icon} alt="Icono"/>
          <h2 className="m-0 text-light align-self-center">Notebud</h2>
        </Link>
        <div className="d-flex align-items-center">
          <h4 className="align-self-center m-0 text-light">Hola, {cookie.get("userName")} |</h4>
          <button
            className="btn me-4 ps-1"
            onClick={handleLogOut}
          >
            <h4 className="m-0 text-dark"
            >Cerrar Sesión</h4>
          </button>
        </div>
      </nav>
      <div>
        <div className=" mt-3 mx-3">
          {/* Calendario */}
          <div className="d-flex">
            <div className="w-50 m-2">
              <Calendar localizer={localizer} startAccessor="start" endAccessor="end" style={{height:"36rem", padding:"0.5rem", backgroundColor: "rgba(255,255,255,0.9)", color:"#343A40", border:"1px solid rgba(0,0,0,0.25)"}}
              events={tCal}
              toolbar={true}  
              culture="es"
              messages={{
                next:"Sig",
                previous: "Ant",
                today: "Hoy",
                month:"Mes",
                week:"Semana",
                day:"Día",
                agenda:"Agenda",
                date: "Fecha",
                time: "Hora",
                event: "Tarea",
                showMore: (total) => `+${total} más`,

              }}
              />
            </div>
            
            <div className="w-50">
              {/* Alerta de 3 dias */}
              <div>
                <div className="d-flex h-25">
                  <div
                    className="card text-dark m-2 w-100"
                    style={{ maxHeight: "10rem", backgroundColor: "#FFEAD2"}}
                  >
                    <div className="card-header">
                      <h2 className="m-0">Faltan 3 días o menos...</h2>
                    </div>
                    <div style={{ overflowY: "scroll" }}>
                      {tDates.length === 0
                      ? <div>
                      <div
                      className="card-body d-flex align-items-center"
                      >
                      <h3 className="card-title w-50">No tareas por vencer...</h3>
                      <p>
                        
                        <br />
                        
                      </p>
                    </div>
                    <hr className="my-0 mx-2" />
                    </div>
                    : tDates.map((tDates) => (
                      <div key={tDates._id}>
                        <div
                        className="card-body d-flex align-items-center"
                      >
                        <h3 className="card-title w-50">{tDates.name}</h3>
                        <p>
                          {tDates.description}
                          <br />
                          {tDates.date_finish}
                        </p>
                      </div>
                      <hr className="my-0 mx-2" />
                      </div>
                    )) }
                    </div>
                  </div>
                </div>
                {/* Listas */}
                <div className="d-flex mt-1">
                  <div
                    className="card text-dark m-2 w-50"
                    style={{ maxHeight: "25rem", backgroundColor: "#DBDFEA"}}
                  >
                    <div className="card-header d-flex">
                      <h3 className="m-0">Tareas</h3>
                      <Link
                        className="btn btn-sm ms-auto text-dark py-0"
                        to={"/tarea"}
                      >
                        <h4 className="m-0">+</h4>
                      </Link>
                    </div>
                    <div style={{ overflowY: "scroll" }}>
                    {tareas.length === 0
                      ? <div>
                      <div
                      className="card-body d-flex align-items-center"
                      >
                      <h3 className="card-title w-50">No hay tareas...</h3>
                      <p>
                        
                        <br />
                        
                      </p>
                    </div>
                    <hr className="my-0 mx-2" />
                    </div>
                    : tareas.map((tareas) => (
                      <div key={tareas._id}>
                        <div className="d-flex">
                          <div className="card-body w-75">
                            <h5 className="card-title">{tareas.name}</h5>
                            <p className="card-text">
                              {tareas.description} <br />
                              {tareas.date_finish}
                            </p>
                          </div>
                          <div className="w-50 m-auto">
                            <button
                              className="btn btn-light btn-sm btn-block mb-3 w-75 text-black"
                              onClick={(e) => editTarea(tareas._id)}
                              style={{fontWeight:"500"}}
                            >
                              Editar
                            </button>
                            <button
                              className="btn btn-dark btn-sm btn-block w-75"
                              onClick={(e) => deleteTarea(tareas._id)}
                              style={{fontWeight:"500"}}
                            >
                              Eliminar
                            </button>
                          </div>
                        </div>
                        <hr className="my-0 mx-2" />
                      </div>
                    ))}
                    </div>
                  </div>
                  <div
                    className="card m-2 mb-0 w-50 text-dark"
                    style={{ maxHeight: "25rem", maxWidth: "22 rem", backgroundColor:"#DBDFEA" }}
                  >
                    <div className="card-header d-flex">
                      <h3 className="m-0">Alarmas</h3>
                      <Link
                        className="btn btn-sm ms-auto text-dark py-0"
                        to={"/tarea"}
                      >
                        <h4 className="m-0">+</h4>
                      </Link>
                    </div>
                    <div style={{ overflowY: "scroll" }}>
                    {alarmas.length === 0
                      ? <div>
                      <div
                      className="card-body d-flex align-items-center"
                      >
                      <h3 className="card-title w-50">No hay alarmas...</h3>
                      <p>
                        
                        <br />
                        
                      </p>
                    </div>
                    <hr className="my-0 mx-2" />
                    </div>
                    : alarmas.map((alarmas) => (
                      <div key={alarmas._id}>
                        <div className="d-flex">
                          <div className="card-body w-75">
                            <h5 className="card-title">{alarmas.name}</h5>
                            <p className="card-text">
                              {alarmas.description} <br />
                              {alarmas.date_finish}
                            </p>
                          </div>
                          <div className="w-50 m-auto">
                            <button
                              className="btn btn-light btn-sm btn-block mb-3 w-75 text-black"
                              onClick={(e) => editTarea(alarmas._id)}
                              style={{fontWeight:"500"}}
                            >
                              Editar
                            </button>
                            <button
                              className="btn btn-dark btn-sm btn-block w-75"
                              onClick={(e) => deleteTarea(alarmas._id)}
                              style={{fontWeight:"500"}}

                            >
                              Eliminar
                            </button>
                          </div>
                        </div>
                        <hr className="my-0 mx-2" />
                      </div>
                    ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <svg xmlns="http://www.w3.org/2000/svg" className="position-absolute w-100 h-100" style={{top: "0", zIndex:"-1", backgroundSize:"cover"}}>
          <defs>
            <linearGradient
              id="a"
              gradientUnits="userSpaceOnUse"
              x1="0"
              x2="0"
              y1="0"
              y2="100%"
              gradientTransform="rotate(240)"
            >
              <stop offset="0" stopColor="#ffffff" />
              <stop offset="1" stopColor="#ACB1D6" />
            </linearGradient>
            <pattern
              patternUnits="userSpaceOnUse"
              id="b"
              width="540"
              height="450"
              x="0"
              y="0"
              viewBox="0 0 1080 900"
            >
              <g fillOpacity="0.1">
                <polygon fill="#444" points="90 150 0 300 180 300" />
                <polygon points="90 150 180 0 0 0" />
                <polygon fill="#AAA" points="270 150 360 0 180 0" />
                <polygon fill="#DDD" points="450 150 360 300 540 300" />
                <polygon fill="#999" points="450 150 540 0 360 0" />
                <polygon points="630 150 540 300 720 300" />
                <polygon fill="#DDD" points="630 150 720 0 540 0" />
                <polygon fill="#444" points="810 150 720 300 900 300" />
                <polygon fill="#FFF" points="810 150 900 0 720 0" />
                <polygon fill="#DDD" points="990 150 900 300 1080 300" />
                <polygon fill="#444" points="990 150 1080 0 900 0" />
                <polygon fill="#DDD" points="90 450 0 600 180 600" />
                <polygon points="90 450 180 300 0 300" />
                <polygon fill="#666" points="270 450 180 600 360 600" />
                <polygon fill="#AAA" points="270 450 360 300 180 300" />
                <polygon fill="#DDD" points="450 450 360 600 540 600" />
                <polygon fill="#999" points="450 450 540 300 360 300" />
                <polygon fill="#999" points="630 450 540 600 720 600" />
                <polygon fill="#FFF" points="630 450 720 300 540 300" />
                <polygon points="810 450 720 600 900 600" />
                <polygon fill="#DDD" points="810 450 900 300 720 300" />
                <polygon fill="#AAA" points="990 450 900 600 1080 600" />
                <polygon fill="#444" points="990 450 1080 300 900 300" />
                <polygon fill="#222" points="90 750 0 900 180 900" />
                <polygon points="270 750 180 900 360 900" />
                <polygon fill="#DDD" points="270 750 360 600 180 600" />
                <polygon points="450 750 540 600 360 600" />
                <polygon points="630 750 540 900 720 900" />
                <polygon fill="#444" points="630 750 720 600 540 600" />
                <polygon fill="#AAA" points="810 750 720 900 900 900" />
                <polygon fill="#666" points="810 750 900 600 720 600" />
                <polygon fill="#999" points="990 750 900 900 1080 900" />
                <polygon fill="#999" points="180 0 90 150 270 150" />
                <polygon fill="#444" points="360 0 270 150 450 150" />
                <polygon fill="#FFF" points="540 0 450 150 630 150" />
                <polygon points="900 0 810 150 990 150" />
                <polygon fill="#222" points="0 300 -90 450 90 450" />
                <polygon fill="#FFF" points="0 300 90 150 -90 150" />
                <polygon fill="#FFF" points="180 300 90 450 270 450" />
                <polygon fill="#666" points="180 300 270 150 90 150" />
                <polygon fill="#222" points="360 300 270 450 450 450" />
                <polygon fill="#FFF" points="360 300 450 150 270 150" />
                <polygon fill="#444" points="540 300 450 450 630 450" />
                <polygon fill="#222" points="540 300 630 150 450 150" />
                <polygon fill="#AAA" points="720 300 630 450 810 450" />
                <polygon fill="#666" points="720 300 810 150 630 150" />
                <polygon fill="#FFF" points="900 300 810 450 990 450" />
                <polygon fill="#999" points="900 300 990 150 810 150" />
                <polygon points="0 600 -90 750 90 750" />
                <polygon fill="#666" points="0 600 90 450 -90 450" />
                <polygon fill="#AAA" points="180 600 90 750 270 750" />
                <polygon fill="#444" points="180 600 270 450 90 450" />
                <polygon fill="#444" points="360 600 270 750 450 750" />
                <polygon fill="#999" points="360 600 450 450 270 450" />
                <polygon fill="#666" points="540 600 630 450 450 450" />
                <polygon fill="#222" points="720 600 630 750 810 750" />
                <polygon fill="#FFF" points="900 600 810 750 990 750" />
                <polygon fill="#222" points="900 600 990 450 810 450" />
                <polygon fill="#DDD" points="0 900 90 750 -90 750" />
                <polygon fill="#444" points="180 900 270 750 90 750" />
                <polygon fill="#FFF" points="360 900 450 750 270 750" />
                <polygon fill="#AAA" points="540 900 630 750 450 750" />
                <polygon fill="#FFF" points="720 900 810 750 630 750" />
                <polygon fill="#222" points="900 900 990 750 810 750" />
                <polygon fill="#222" points="1080 300 990 450 1170 450" />
                <polygon fill="#FFF" points="1080 300 1170 150 990 150" />
                <polygon points="1080 600 990 750 1170 750" />
                <polygon fill="#666" points="1080 600 1170 450 990 450" />
                <polygon fill="#DDD" points="1080 900 1170 750 990 750" />
              </g>
            </pattern>
          </defs>
          <rect x="0" y="0" fill="url(#a)" width="100%" height="100%" />
          <rect x="0" y="0" fill="url(#b)" width="100%" height="100%" />
        </svg>
      </div>
    </Fragment>
  );
};