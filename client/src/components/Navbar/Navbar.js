import React from "react";
import logo from "../../images/logo512.png";
import "./style.css";


function Navbar(props) {

    return (
        <nav className="navbar navbar-expand-lg navbar-dark">
            <div className="container">
                <a className="navbar-brand" href="/"><img className="navbar-brand-img mb-2" src={logo} width="25" height="25" alt="investment_tracker_engine_icon" /><strong>  Investment Tracker Engine</strong></a>
                <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                    <span className="navbar-toggler-icon"></span>
                </button>
                <div className="collapse navbar-collapse" id="navbarNav">
                    <div className="navbar-nav ml-auto">
                    </div>
                </div>
            </div>
        </nav>

    )
}

export default Navbar;