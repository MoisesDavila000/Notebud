import React, { Fragment, useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Cookies from "universal-cookie";
import './Styles.css'

const API = process.env.REACT_APP_API;

export const Form = () => {

  const cookie = new Cookies();
  const navigate = useNavigate();
  const location = useLocation();

  const [name, setName] = useState("");
  const [description, setDesc] = useState("");
  const [start, setStart] = useState("");
  const [finish, setFinish] = useState("");
  const [check, setCheck] = useState(false);

  const [update_id, setID] = useState("");
  const [pet, setPet] = useState("POST")


  const updateForm = async () =>{
    //Peticion para llenar formulario con datos del objeto a modificar
    const res = await fetch(`${API}/tarea/${update_id}`);
    const data = await res.json();
    
    if(data){
      setName(data.name);
      setDesc(data.description);
      setFinish(data.date_finish);
      setStart(data.date_start)
      if(data.recordatorio === "True"){
        setCheck(true);
      }
    }
  }

  useEffect( () =>{
    if(location.state != null){
      setID(location.state.id);
      setPet(location.state.pet);
      if(pet === "PUT"){
        updateForm();
      }
    }
  },[location, pet, update_id]);

  const handleSubmit = async (e) =>{
    e.preventDefault();
    var recordatorio = check.toString();
    recordatorio = recordatorio.charAt(0).toUpperCase() + recordatorio.slice(1);
    if(pet === "POST"){
    //POST
    const res = await fetch(`${API}/tarea/${cookie.get("accessToken")}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        "name": name,
        "description":description,
        "date_finish":finish,
        "date_start":start,
        "recordatorio":recordatorio
      }),
    });
    const data = await res.json();
    if(data){
      navigate("/", { replace: true })
    }
    }
    else if (pet === "PUT"){
      //PUT
      const res = await fetch(`${API}/tarea/${cookie.get("accessToken")}/${update_id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          "name": name,
          "description":description,
          "date_finish":finish,
          "date_start":start,
          "recordatorio":recordatorio
        }),
      });
      const data = await res.json();
      if(data){
        navigate("/", { replace: true })
      }    
    }
  }

  return (
    <Fragment>
      <div className="d-flex">
      <div className="container min-vh-100 d-flex align-items-center flex-column w-50">
        {pet === "POST" 
        ? <h1 className="m-4 pt-4 pb-4 font-weight-bold">Nueva Tarea</h1>
        : <h1 className="m-4 pt-4 pb-4 font-weight-bold">Actualizar Tarea</h1>
        }
        <form
          className="rounded w-75 bg-white"
          style={{border:"1px solid #8294C4", color:"#8294C4", fontWeight:"500"}}
          onSubmit={handleSubmit}
        >
          <div className="form-group m-4">
            <div className="mb-3">
              <label htmlFor="nameTarea" className="form-label">
                Nombre
              </label>
              <input
                type="text"
                className="form-control"
                id="nameTarea"
                aria-describedby="textHelp"
                placeholder="Tarea #N"
                required
                onChange={(e) => setName(e.target.value)}
                value={name}
              />
            </div>
            <div className="form-group mb-3">
              <label htmlFor="descTarea" className="form-label">
                Descripcion
              </label>
              <input
                type="text"
                className="form-control"
                id="descTarea"
                required
                maxLength="100"
                onChange={(e) => setDesc(e.target.value)}
                value={description}
              />
            </div>
            <div className="d-flex">
            <div className="form-group mb-3 d-flex w-100">
              <label htmlFor="fechaTarea" className="form-label my-auto me-3" style={{width:"30px"}}>
                Inicio
              </label>
              <input
                type="datetime-local"
                className="form-control w-100"
                id="fechaTarea"
                required
                onChange={(e) => setStart(e.target.value)}
                value={start}
              />
            </div>
            <div className="form-group ms-3 mb-3 d-flex w-50">
              <label htmlFor="recTarea" className="form-label me-2 my-auto">
                Alarma
              </label>
              <input
                type="checkbox"
                className="check my-auto"
                id="recTarea"
                value={check}
                checked={check}
                onChange={(e) => setCheck(!check)}
              />
            </div>
            </div>
            <div className="form-group mb-4 d-flex w-100">
              <label htmlFor="fechaTarea" className="form-label my-auto me-3" style={{width:"30px"}}>
                Final
              </label>
              <input
                type="datetime-local"
                className="form-control w-100"
                id="fechaTarea"
                required
                onChange={(e) => setFinish(e.target.value)}
                value={finish}
              />
            </div>
            <div className="d-flex justify-content-center">
              <button type="submit" className="btn w-25 me-5" style={{backgroundColor:"#8294C4", fontWeight:"500"}}>
                Submit
              </button>
              <Link type="submit" className="btn w-25 text-dark" style={{backgroundColor:"#FFEAD2", fontWeight:"500"}} to={"/"}>
                Cancelar
              </Link>
            </div>
          </div>
        </form>
      </div>
      <svg className="position-absolute" style={{bottom: "0", zIndex:"-1"}} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320"><path fill="#8294C4" fillOpacity="1" d="M0,192L40,165.3C80,139,160,85,240,90.7C320,96,400,160,480,192C560,224,640,224,720,213.3C800,203,880,181,960,176C1040,171,1120,181,1200,170.7C1280,160,1360,128,1400,112L1440,96L1440,320L1400,320C1360,320,1280,320,1200,320C1120,320,1040,320,960,320C880,320,800,320,720,320C640,320,560,320,480,320C400,320,320,320,240,320C160,320,80,320,40,320L0,320Z"></path></svg>
      {/* <svg className="position-absolute" style={{bottom: "0", zIndex:"-1"}} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320"><path fill="#78C2AD" fillOpacity={1} d="M0,256L48,245.3C96,235,192,213,288,181.3C384,149,480,107,576,96C672,85,768,107,864,112C960,117,1056,107,1152,112C1248,117,1344,139,1392,149.3L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z" /></svg> */}
      </div>
    </Fragment>
  );
};

//export default Form
