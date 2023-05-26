import { useLocation, Navigate, Outlet } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import Cookies from "universal-cookie";

export const RequireAuth = () => {
    let {auth} = useAuth();
    const location = useLocation();
    //Usar cookie para ver si hay tocken, si lo hay se guarda
    const cookies = new Cookies();
    if(cookies.get("accessToken")){
        auth = {accessToken: cookies.get("accessToken")}
    }
    
    return (
        auth?.accessToken
            ? <Outlet />
            : <Navigate to="/login" state={{ from: location }} replace />
    )
}

export const Logged = () => {
    let {auth} = useAuth();
    const location = useLocation();
    //Usar cookie para ver si hay tocken, si lo hay se guarda
    const cookies = new Cookies();
    if(cookies.get("accessToken")){
        auth = {accessToken: cookies.get("accessToken")}
    }

    return (
        auth?.accessToken
            ? <Navigate to="/" state={{ from: location }} replace />
            : <Outlet/>
    )
}
