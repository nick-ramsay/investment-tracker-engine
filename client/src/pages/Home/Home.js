import React, { useState, useEffect } from 'react';
import moment from "moment";
import "./style.css";
import { logout, useInput, getCookie } from "../../sharedFunctions/sharedFunctions";
import BarLoader from "react-spinners/BarLoader";
import NavbarLoggedOut from "../../components/Navbar/Navbar";
import API from "../../utils/API";

const override = "display: block; margin: 0 auto; border-color: #2F4F4F;";

const Home = () => {


    var [loading, setLoading] = useState(false);

    useEffect(() => {
        console.log("useEffect Called...")
    }, []) //<-- Empty array makes useEffect run only once...

    return (
        <div>
            <NavbarLoggedOut />
            <div className="container">
                <div className="col-md-12 mt-2">
                    <BarLoader
                        css={override}
                        height={10}
                        color={"#D4AF37"}
                        loading={loading}
                    />

                </div>
            </div>
        </div>
    )
}

export default Home;