import axios from "axios";

const apiURL = process.env.NODE_ENV === 'production' ? '' : '//localhost:3001'

export default {
    //START: Account APIs...
    sendEmail: function (messageInfo) {
        return axios({ method: "post", url: apiURL + "/api/investment-tracker/send-email", data: [messageInfo] });
    },
    //END: Account APIs...
    //START: Value Search APIs...
    fetchAllIexCloudSymbols: function () {
        return axios({ method: "post", url: apiURL + "/api/investment-tracker/fetch-all-iex-cloud-symbols", data: {} });
    },
    fetchAllQuotes: function () {
        return axios({ method: "post", url: apiURL + "/api/investment-tracker/fetch-all-quotes", data: {} });
    },
    fetchAllPriceTargets: function () {
        return axios({ method: "post", url: apiURL + "/api/investment-tracker/fetch-all-price-targets", data: {} });
    },
    compileValueSearchData: function () {
        return axios({ method: "post", url: apiURL + "/api/investment-tracker/compile-value-search-data", data: {} });
    },
    fetchValueSearchData: function () {
        return axios({ method: "post", url: apiURL + "/api/investment-tracker/fetch-value-search-data", data: {} });
    },
    scrapeAdvancedStats: function () {
        return axios({ method: "post", url: apiURL + "/api/investment-tracker/scrape-advanced-stats", data: {} });
    },
    runAllJobs: function () {
        return axios({ method: "post", url: apiURL + "/api/investment-tracker/run-all-jobs", data: {} });
    }
};