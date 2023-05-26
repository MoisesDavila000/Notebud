import React from "react";
import { Routes, Route } from "react-router-dom";

import {Main} from './components/Main';
import {Form} from './components/Form';
import { LogIn, Register } from "./components/LogIn";
import Layout from "./components/Layout";
import {RequireAuth, Logged} from "./components/RequireAuth";
import Missing from "./components/Missing";


function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout/>}>
        {/* Public Routes */}
          <Route element={<Logged/>}>
            <Route path="login" element={<LogIn/>}/>
            <Route path="register" element={<Register/>}/>
          </Route>
        {/* Protected Routes */}
        <Route element={<RequireAuth/>}>
          <Route path="/" element={<Main/>}/>
          <Route path="/tarea" element={<Form/>}/>
        </Route>
        {/* Catch all */}
          <Route path="*" element={<Missing/>}/>
      </Route>
    </Routes>
  );
}

export default App;
