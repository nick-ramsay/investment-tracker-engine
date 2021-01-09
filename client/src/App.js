import React, { } from 'react';
import { } from "./sharedFunctions/sharedFunctions";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import './App.css';

import Home from './pages/Home/Home';
import Error from './pages/Error/Error';

function App() {

    return (
      <Router>
        <div>
          <Switch>
            <Route exact path="/" component={Home} />
            <Route component={Error} />
          </Switch>
        </div>
      </Router>
    );
}

export default App;
