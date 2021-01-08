import React, { useState, useEffect } from 'react';
import moment from "moment";
import "./style.css";
import { logout, useInput, getCookie } from "../../sharedFunctions/sharedFunctions";
import BarLoader from "react-spinners/BarLoader";
import NavbarLoggedOut from "../../components/Navbar/Navbar";
import API from "../../utils/API";

const override = "display: block; margin: 0 auto; border-color: #2F4F4F;";

const Home = () => {

    var [currentMoment, setCurrentMoment] = useState(new Date());
    var [loading, setLoading] = useState(false);

    let startClock = () => {
        setInterval(clock, 1000);
    }

    const clock = () => {
        let currentMomentVar = moment();
        console.log(currentMoment);
        setCurrentMoment(currentMoment => currentMomentVar);
    }

    const scrapeAdvancedStats = () => {
        console.log("Called scrapeAdvancedStats...");
        API.scrapeAdvancedStats().then(res => {
            console.log(res);
        });
    }

    useEffect(() => {
        console.log("useEffect Called...");
        startClock();
    }, []) //<-- Empty array makes useEffect run only once...

    return (
        <div>
            <NavbarLoggedOut />
            <div className="container">
                <div className="row">
                    <div className="col-md-12 text-center">
                        <h2>{moment(currentMoment).format("dddd, D MMMM YYYY")}</h2>
                    </div>
                    <div className="col-md-12 text-center">
                        <h2>{moment(currentMoment).format("hh:mm A")}</h2>
                    </div>
                </div>
                <div className="row">

                </div>
                <div className="col-md-12 d-flex justify-content-center text-center mt-2">
                    <BarLoader
                        css={override}
                        height={10}
                        color={"#D4AF37"}
                        loading={loading}
                    />
                    <div className="row">
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
        </div>
    )
}

export default Home;