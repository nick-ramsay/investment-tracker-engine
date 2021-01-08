import React, { useState, useEffect } from 'react';
import moment from "moment";
import "./style.css";
import { logout, useInput, getCookie } from "../../sharedFunctions/sharedFunctions";
import BarLoader from "react-spinners/BarLoader";
import NavbarLoggedOut from "../../components/Navbar/Navbar";
import API from "../../utils/API";

const override = "display: block; margin: 0 auto; border-color: #2F4F4F;";

const Home = () => {

    const scrapeAdvancedStats = () => {
        console.log("Called scrapeAdvancedStats...");
        API.scrapeAdvancedStats().then(res => {
            console.log(res);
        });
    }

    var [loading, setLoading] = useState(false);

    useEffect(() => {
        console.log("useEffect Called...")
    }, []) //<-- Empty array makes useEffect run only once...

    return (
        <div>
            <NavbarLoggedOut />
            <div className="container">
                <div className="col-md-12 d-flex justify-content-center text-center mt-2">
                    <BarLoader
                        css={override}
                        height={10}
                        color={"#D4AF37"}
                        loading={loading}
                    />
                    <table>
                        <tbody>
                            <tr>
                                <th>Worker</th>
                                <th></th>
                            </tr>
                            <tr>
                                <td>Scrape Yahoo! Advanced Stats</td>
                                <td><button className="btn btn-sm btn-dark" onClick={() => scrapeAdvancedStats()}>Run</button></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

export default Home;