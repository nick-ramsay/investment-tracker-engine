const db = require("../models");

require('dotenv').config();

const mongoose = require('mongoose');
const pLimit = require('p-limit');
const axios = require('axios');
const moment = require('moment');
const sha256 = require('js-sha256').sha256;
const sgMail = require('@sendgrid/mail');
const nodemailer = require("nodemailer");
const { google } = require("googleapis");
const OAuth2 = google.auth.OAuth2;

const cheerio = require("cheerio");
const request = require("request-promise");

const fs = require('fs');

const keys = require("../keys");

const limit = pLimit(9);

const gmailClientId = keys.gmail_credentials.gmailClientId;
const gmailClientSecret = keys.gmail_credentials.gmailClientSecret;
const gmailRefreshToken = keys.gmail_credentials.gmailRefreshToken;
const sendGridAPIKey = keys.gmail_credentials.sendGridAPIKey;

sgMail.setApiKey(sendGridAPIKey);

const oauth2Client = new OAuth2(
    gmailClientId, // ClientID
    gmailClientSecret, // Client Secret
    "https://developers.google.com/oauthplayground" // Redirect URL
);

oauth2Client.setCredentials({
    refresh_token: gmailRefreshToken
});

const accessToken = oauth2Client.getAccessToken();

const smtpTransport = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        type: "OAuth2",
        user: "applications.nickramsay@gmail.com",
        //user: gmailUserId,
        //pass: gmailPassword,
        clientId: gmailClientId,
        clientSecret: gmailClientSecret,
        refreshToken: gmailRefreshToken,
        accessToken: accessToken
    }
});

let useGmail = true;
let useSendgrid = true;

module.exports = {
    sendEmail: function (req, res) {
        console.log("Called send test e-mail controller...");
        //SENDGRID LOGIC BELOW...

        let messageParameters = req.body[0];

        let msg = {
            to: messageParameters.recipientEmail,
            from: 'applications.nickramsay@gmail.com',
            subject: '"' + messageParameters.subject + '" from ' + messageParameters.senderName + ' via SendGrid',
            text: messageParameters.message,
            html: '<strong>' + messageParameters.message + '</strong>'
        };

        if (useSendgrid) {
            sgMail.send(msg);
        }

        //GMAIL CREDENTIALS BELOW...

        let mailOptions = {
            from: 'applications.nickramsay@gmail.com',
            to: messageParameters.recipientEmail,
            subject: '"' + messageParameters.subject + '" from ' + messageParameters.senderName,
            text: messageParameters.message
        };

        if (useGmail) {
            smtpTransport.sendMail(mailOptions, (error, response) => {
                error ? console.log(error) : console.log(response);
                smtpTransport.close();
            });
        }
    },
    fetchAllIexCloudSymbols: function (req, res) {
        console.log("Called update fetchAllIexCloudSymbols controller...");

        let apiURLs = [];
        let promises = [];

        apiURLs.push("https://cloud.iexapis.com/beta/ref-data/symbols?&token=" + keys.iex_credentials.apiKey)

        apiURLs.forEach(apiURL =>
            promises.push(
                axios.get(apiURL)
            )
        )

        Promise.all(promises).then(response => {
            console.log(response[0].data);
            db.IEXCloudSymbols
                .updateMany({},
                    {
                        "symbolsLastUpdated": new Date(),
                        "symbols": response[0].data
                    }
                )
                .then(dbModel => res.json(dbModel), console.log("IEX Symbol Update Complete ✔️"))
                .catch(err => console.log(err))
        })
            .catch(err => console.log(err));
    },
    fetchAllQuotes: function (req, res) {
        console.log("Called fetchAllQuotes controller...");

        let allSymbols = [[]];
        let arrayIndex = 0;

        let apiURLs = [];
        let promises = [];
        let symbolString;

        db.IEXCloudSymbols
            .find({})
            .then(dbModel => {
                for (let i = 0; i < dbModel[0].symbols.length; i++) {
                    if (i % 90 === 0 && i !== 0) {
                        allSymbols.push([]);
                        arrayIndex += 1;
                    }
                    if (dbModel[0].symbols[i].symbol.includes("#") === false) {
                        allSymbols[arrayIndex].push(dbModel[0].symbols[i].symbol);
                    }
                }

                for (let i = 0; i < allSymbols.length; i++) {
                    symbolString = "";
                    for (let j = 0; j < allSymbols[i].length; j++) {
                        symbolString += (j !== 0 ? "," : "") + allSymbols[i][j];
                    }
                    apiURLs.push("https://cloud.iexapis.com/stable/stock/market/batch?types=quote&symbols=" + symbolString + "&token=" + keys.iex_credentials.apiKey);
                }

                apiURLs.forEach(apiURL =>
                    promises.push(
                        limit(() => axios.get(apiURL)).catch(err => console.log(err))
                    )
                )

                let allResults = [];

                (async () => {
                    const result = await Promise.all(promises);
                    for (let i = 0; i < result.length; i++) {
                        allResults.push(result[i].data);
                    }
                    db.IEXCloudSymbols
                        .updateMany({},
                            {
                                "rawQuoteDataLastUpdated": new Date(),
                                "rawQuoteData": allResults
                            }
                        )
                        .then(dbModel => res.send(dbModel), console.log("IEX Quote Update Complete ✔️"))
                        .catch(err => console.log(err))
                })()
            })
            .catch(err => res.status(422).json(err));
    },
    fetchAllPriceTargets: function (req, res) {
        console.log("Called fetchAllPriceTargets controller...");

        let allSymbols = [[]];
        let arrayIndex = 0;

        let apiURLs = [];
        let promises = [];
        let symbolString;

        db.IEXCloudSymbols
            .find({})
            .then(dbModel => {
                for (let i = 0; i < dbModel[0].symbols.length; i++) {
                    if (i % 90 === 0 && i !== 0) {
                        allSymbols.push([]);
                        arrayIndex += 1;
                    }
                    if (dbModel[0].symbols[i].symbol.includes("#") === false) {
                        allSymbols[arrayIndex].push(dbModel[0].symbols[i].symbol);
                    }
                }

                for (let i = 0; i < allSymbols.length; i++) {
                    symbolString = "";
                    for (let j = 0; j < allSymbols[i].length; j++) {
                        console.log("Preparing Price Target Request for " + allSymbols[i][j] + " (#" + j + ")");
                        symbolString += (j !== 0 ? "," : "") + allSymbols[i][j];
                    }
                    apiURLs.push("https://cloud.iexapis.com/stable/stock/market/batch?types=price-target&symbols=" + symbolString + "&token=" + keys.iex_credentials.apiKey);
                }

                apiURLs.forEach(apiURL =>
                    promises.push(
                        limit(() => axios.get(apiURL)).catch(err => console.log(err))
                    )
                )

                let bulkWriteCommands = [];

                (async () => {
                    const result = await Promise.all(promises);
                    for (let i = 0; i < result.length; i++) {
                        for (let j in result[i].data) {
                            if (result[i].data[j]["price-target"] !== null) {
                                let currentItem = {
                                    symbol: result[i].data[j]["price-target"].symbol,
                                    priceTarget: result[i].data[j]["price-target"]
                                }
                                let bulkWriteCommand = {
                                    updateOne: {
                                        "filter": { "symbol": currentItem.symbol },
                                        "update": {
                                            "symbol": currentItem.symbol,
                                            "priceTarget": currentItem.priceTarget,
                                            "priceTargetLastUpdated": new Date()
                                        },
                                        "upsert": true
                                    }
                                };
                                bulkWriteCommands.push(bulkWriteCommand);
                                console.log("Bulk Write Command Saved for " + currentItem.symbol + "...");
                            }
                        }
                    }

                    db.AllPriceTargets.bulkWrite(bulkWriteCommands)
                        .then(dbModel => res.send(dbModel), console.log("IEX Price Target Updates Complete ✔️"))
                        .catch(err => console.log(err))
                })()
            })
            .catch(err => res.status(422).json(err));
    },
    scrapeAdvancedStats: (req, res) => {
        console.log("Called scrapeAdvancedStats controller...");

        let allSymbols = [];

        db.IEXCloudSymbols
            .find({})
            .then(dbModel => {
                dbModel[0].symbols.forEach((symbol, index) => {
                    allSymbols.push(symbol.symbol);
                })

                let allStats = {};

                let currentStat = {
                    statType: "",
                    statData: []
                }

                const bulkSaveAdvancedStats = (bulkWriteCommands) => {
                    db.AdvancedStatistics.bulkWrite(bulkWriteCommands)
                        .then(dbModel => res.send(dbModel))
                        .catch(err => console.log(err))
                }

                const sleep = (milliseconds) => {
                    return new Promise(resolve => setTimeout(resolve, milliseconds))
                }

                let bulkWriteCommands = [];
                (async () => {
                    for (let p = 0; p < allSymbols.length; p++) {
                        await sleep(1000); //Slows down for loop...
                        let apiURL = "https://finance.yahoo.com/quote/" + allSymbols[p] + "/key-statistics?p=" + allSymbols[p];
                        request.get(apiURL).then(result => {
                            console.log("Called scrapeData function #" + p + " (" + allSymbols[p] + ")...");

                            allStats = {
                                symbol: allSymbols[p],
                                stats: []
                            }

                            var $ = cheerio.load(result);

                            $("tr").each((index, element) => {

                                currentStat = {
                                    statType: "",
                                    statData: []
                                }
                                for (let i = 0; i < $($(element).find("td")).length; i++) {

                                    if (i === 0) {
                                        currentStat.statType = $($(element).find("td")[i]).text();
                                    } else {
                                        currentStat.statData.push($($(element).find("td")[i]).text());
                                    }
                                }
                                allStats.stats.push(currentStat);
                            });

                            let bulkWriteCommand = {
                                updateOne: {
                                    "filter": { "symbol": allStats.symbol },
                                    "update": {
                                        "statLastUpdated": new Date(),
                                        "symbol": allStats.symbol,
                                        "stats": allStats.stats
                                    },
                                    "upsert": true
                                }
                            };
                            bulkWriteCommands.push(bulkWriteCommand);
                            if (p % 5 === 0 && p !== 0) {
                                console.log("Database save ... Iterator: " + p + "; Remainder: " + p % 5);
                                bulkSaveAdvancedStats(bulkWriteCommands);
                                bulkWriteCommands = [];
                            }
                        });
                    }
                    bulkSaveAdvancedStats(bulkWriteCommands);
                })();
            })
            .catch(err => console.log(err))
    },
    compileValueSearchData: (req, res) => {
        console.log("Called compileValueSearchData controller...");
        let allIEXData;
        let priceTargetData = [];
        let advancedStatisticsData = [];

        let bulkWriteCommands = [];

        db.AdvancedStatistics.find({})
            .then(advancedStatistics => {
                advancedStatisticsData = advancedStatistics;
                db.AllPriceTargets
                    .find({})
                    .then(priceTargetModel => {
                        priceTargetData = priceTargetModel,
                            db.IEXCloudSymbols
                                .find()
                                .then(dbModel => {
                                    allIEXData = dbModel[0];

                                    for (let i = 0; i < Object.keys(allIEXData.rawQuoteData).length; i++) {
                                        for (const [key, value] of Object.entries(allIEXData.rawQuoteData[i])) {
                                            let currentKey = `${key}`;

                                            let currentPriceTargetIndex = priceTargetData.map((pt) => {
                                                return pt.symbol;
                                            }).indexOf(currentKey);

                                            let currentAdvanceStatsIndex = advancedStatistics.map((as) => {
                                                return as.symbol;
                                            }).indexOf(currentKey);

                                            let currentDebtEquityIndex;

                                            if (currentAdvanceStatsIndex !== -1) {
                                                currentDebtEquityIndex = advancedStatisticsData[currentAdvanceStatsIndex].stats.map((de) => {
                                                    return de.statType;
                                                }).indexOf("Total Debt/Equity (mrq)")
                                            } else {
                                                currentDebtEquityIndex = -1;
                                            }

                                            let currentDebtEquityValue;

                                            if (currentDebtEquityIndex !== -1) {
                                                currentDebtEquityValue = advancedStatisticsData[currentAdvanceStatsIndex].stats[currentDebtEquityIndex].statData[0];
                                            } else {
                                                currentDebtEquityValue = null
                                            }

                                            let currentBookValuePerShareIndex;
                                            let currentBookValuePerShareValue;

                                            if (currentAdvanceStatsIndex !== -1) {
                                                currentBookValuePerShareIndex = advancedStatisticsData[currentAdvanceStatsIndex].stats.map((bvps) => {
                                                    return bvps.statType;
                                                }).indexOf("Book Value Per Share (mrq)")
                                            } else {
                                                currentBookValuePerShareIndex = -1;
                                            };

                                            if (currentBookValuePerShareIndex !== -1) {
                                                currentBookValuePerShareValue = advancedStatisticsData[currentAdvanceStatsIndex].stats[currentBookValuePerShareIndex].statData[0];
                                            } else {
                                                currentBookValuePerShareValue = null
                                            }

                                            let currentPriceTargetData;

                                            if (currentPriceTargetIndex !== -1) {
                                                currentPriceTargetData = priceTargetData[currentPriceTargetIndex]
                                            } else {
                                                currentPriceTargetData = null
                                            }

                                            let symbolsIndex = allIEXData.symbols.map((e) => {
                                                return e.symbol;
                                            }).indexOf(currentKey);

                                            let valueSearchObject = {
                                                symbol: `${key}`,
                                                quote: (allIEXData.rawQuoteData[i][currentKey].quote !== undefined ? allIEXData.rawQuoteData[i][currentKey].quote : null),
                                                price: (allIEXData.rawQuoteData[i][currentKey].quote.latestPrice !== undefined ? allIEXData.rawQuoteData[i][currentKey].quote.latestPrice : null),
                                                targetPrice: (currentPriceTargetData !== null ? currentPriceTargetData.priceTarget.priceTargetAverage : null),
                                                numberOfAnalysts: (currentPriceTargetData !== null ? currentPriceTargetData.priceTarget.numberOfAnalysts : null),
                                                targetPercentage: (currentPriceTargetData !== null ? Number(allIEXData.rawQuoteData[i][currentKey].quote.latestPrice) / Number(currentPriceTargetData.priceTarget.priceTargetAverage) : null),
                                                type: allIEXData.symbols[symbolsIndex].type,
                                                region: allIEXData.symbols[symbolsIndex].region,
                                                exchange: allIEXData.symbols[symbolsIndex].exchange,
                                                exchangeName: allIEXData.symbols[symbolsIndex].exchangeName,
                                                week52Range: ((allIEXData.rawQuoteData[i][currentKey].quote.latestPrice - allIEXData.rawQuoteData[i][currentKey].quote.week52Low) / (allIEXData.rawQuoteData[i][currentKey].quote.week52High - allIEXData.rawQuoteData[i][currentKey].quote.week52Low) * 100),
                                                debtEquity: (currentDebtEquityValue !== null && currentDebtEquityValue !== "N/A" ? Number(currentDebtEquityValue / 100) : null),
                                                priceToBook: (currentBookValuePerShareValue !== null && currentBookValuePerShareValue !== "N/A" ? Number(allIEXData.rawQuoteData[i][currentKey].quote.latestPrice / currentBookValuePerShareValue) : null)
                                            }

                                            let bulkWriteCommand = {
                                                updateOne: {
                                                    "filter": { "symbol": valueSearchObject.symbol },
                                                    "update": {
                                                        "symbol": valueSearchObject.symbol,
                                                        "quote": valueSearchObject.quote,
                                                        "price": valueSearchObject.price,
                                                        "targetPrice": valueSearchObject.targetPrice,
                                                        "numberOfAnalysts": valueSearchObject.numberOfAnalysts,
                                                        "targetPercentage": valueSearchObject.targetPercentage,
                                                        "type": valueSearchObject.type,
                                                        "region": valueSearchObject.region,
                                                        "exchange": valueSearchObject.exchange,
                                                        "exchangeName": valueSearchObject.exchangeName,
                                                        "lastUpdated": new Date()
                                                    },
                                                    "upsert": true
                                                }
                                            };

                                            valueSearchObject.week52Range !== null && isNaN(valueSearchObject.week52Range) === false ? bulkWriteCommand.updateOne.update.week52Range = valueSearchObject.week52Range : "";
                                            valueSearchObject.debtEquity !== null && isNaN(valueSearchObject.debtEquity) === false ? bulkWriteCommand.updateOne.update.debtEquity = valueSearchObject.debtEquity : "";
                                            valueSearchObject.priceToBook !== null && isNaN(valueSearchObject.priceToBook) === false ? bulkWriteCommand.updateOne.update.priceToBook = valueSearchObject.priceToBook : "";

                                            bulkWriteCommands.push(bulkWriteCommand);
                                            console.log("compileValueSearchData: Bulk Write Command Saved for " + valueSearchObject.symbol + "...");
                                        }


                                        const bulkWriteValueSearch = (commands) => {
                                            db.ValueSearches.bulkWrite(commands)
                                                .then(dbModel => res.send(dbModel))
                                                .catch(err => console.log(err))
                                        }

                                        bulkWriteValueSearch(bulkWriteCommands);
                                        bulkWriteCommands = [];

                                    };
                                    console.log("Value search compilation complete, saving to database ✔️");
                                })
                                .catch(err => res.status(422).json(err));
                    })
                    .catch(err => console.log(err))
            })
            .catch(err => res.status(422).json(err));
    },
    runAllJobs: (req,res) => {
        console.log("Called runAllJobs controller...");
    }
}