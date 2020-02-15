import React from 'react';

import './App.css';

import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom';
import MineSweeper from './MineSweeper';
import Dimo from './Dimo';
import ArrowGame from './ArrowGame';

import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles({
  app: {
    background: '#eee',
  },
  main: {
    margin: 'auto',
    padding: 16,
    background: '#eee',
  },
  header: {
    margin: 'auto',
    background: '#fee',
  },
  links: {
    margin: '8px auto',
    textAlign: 'center',
    background: '#555',
    position: 'sticky',
    top: 0,
    zIndex: 100,
  },
  link: {
    textDecoration: 'none',
    color: '#441',
    margin: '8px',
    background: 'linear-gradient(to bottom right,#39CCCC, #3FDBFF)',
    padding: '8px 16px',
  },
});

function App() {
  const classes = useStyles();
  return (
    <div className={classes.app}>
      <Router>
        <div className={classes.links}>
          <Link to='/' className={classes.link}>
            MineSweeper
          </Link>

          <Link to='/dimo' className={classes.link}>
            Dimo
          </Link>

          <Link to='/arrow' className={classes.link}>
            Arrow
          </Link>
        </div>

        {/* A <Switch> looks through its children <Route>s and
            renders the first one that matches the current URL. */}
        <section className={classes.main}>
          <Switch>
            <Route path='/dimo'>
              <Dimo />
            </Route>
            <Route path='/arrow'>
              <ArrowGame />
            </Route>
            <Route path='/'>
              <MineSweeper />
            </Route>
          </Switch>
        </section>
      </Router>
    </div>
  );
}

export default App;
