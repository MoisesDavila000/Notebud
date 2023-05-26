import { Link } from "react-router-dom"

const Missing = () => {
    return (
        <article style={{ padding: "100px" }}>
            <h1>Oops!</h1>
            <p>Esta pagina no existe</p>
            <div className="flexGrow">
                <Link style={{color:"#8294C4"}}to="/">Regresa a nuestra pagina principal</Link>
            </div>
        </article>
    )
}

export default Missing