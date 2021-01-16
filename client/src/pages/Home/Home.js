import React, { useState, useEffect } from 'react';
import moment from "moment";
import "./style.css";
import { useInput } from "../../sharedFunctions/sharedFunctions";
import NavbarLoggedOut from "../../components/Navbar/Navbar";
import API from "../../utils/API";

const Home = () => {

    var [currentMoment, setCurrentMoment] = useState(new Date());
    //var [loading, setLoading] = useState(false);

    let startClock = () => {
        setInterval(clock, 1000);
    }

    const clock = () => {
        let currentMomentVar = moment();
        setCurrentMoment(currentMoment => currentMomentVar);
    }

    const fetchAllIexCloudSymbols = () => {
        console.log("Called fetchAllIexCloudSymbols...");
        API.fetchAllIexCloudSymbols().then(res => {
            console.log(res);
        });
    }

    const fetchAllQuotes = () => {
        console.log("Called fetchAllQuotes...");
        API.fetchAllQuotes().then(res => {
            console.log(res);
        });
    }

    const fetchAllPriceTargets = () => {
        console.log("Called fetchAllPriceTargets...");
        API.fetchAllPriceTargets().then(res => {
            console.log(res);
        });
    }

    const scrapeAdvancedStats = () => {
        console.log("Called scrapeAdvancedStats...");
        API.scrapeAdvancedStats().then(res => {
            console.log(res);
        });
    }

    const compileValueSearchData = () => {
        console.log("Called compileValueSearchData...");
        API.compileValueSearchData().then(res => {
            console.log(res);
        });
    }

    const runAllJobs = () => {
        API.fetchAllIexCloudSymbols().then(res => {
            console.log(res);
            API.fetchAllQuotes().then(res => {
                console.log(res);
                API.scrapeAdvancedStats().then(res => {
                    console.log(res);
                    
                })
            });
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
                        <h2>{moment(currentMoment).format("h:mm A")}</h2>
                    </div>
                </div>
                <div className="row">

                </div>
                <div className="col-md-12 d-flex justify-content-center text-center mt-2">
                    <div className="row">
                        <table>
                            <tbody>
                                <tr>
                                    <th colSpan="2">Worker</th>
                                </tr>
                                <tr>
                                    <td>Refresh All Available IEX Symbols</td>
                                    <td><button className="btn btn-sm btn-dark" onClick={() => fetchAllIexCloudSymbols()}>Run</button></td>
                                </tr>
                                <tr>
                                    <td>Fetch All IEX Quotes</td>
                                    <td><button className="btn btn-sm btn-dark" onClick={() => fetchAllQuotes()}>Run</button></td>
                                </tr>
                                <tr>
                                    <td style={{ color: "white", backgroundColor: "red" }}>Fetch All Price Targets</td>
                                    <td style={{ color: "white", backgroundColor: "red" }}><button className="btn btn-sm btn-warning" onClick={() => fetchAllPriceTargets()}>Run</button></td>
                                </tr>
                                <tr>
                                    <td>Scrape Yahoo! Advanced Stats</td>
                                    <td><button className="btn btn-sm btn-dark" onClick={() => scrapeAdvancedStats()}>Run</button></td>
                                </tr>
                                <tr>
                                    <td>Compile Value Search Data</td>
                                    <td><button className="btn btn-sm btn-dark" onClick={() => compileValueSearchData()}>Run</button></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                </div>
            </div>
            <div className="row mt-2 justify-content-center">
                <button className="btn btn-sm btn-primary" onClick={() => runAllJobs()}>Run All Jobs</button>
            </div>
        </div>
    )
}

export default Home;