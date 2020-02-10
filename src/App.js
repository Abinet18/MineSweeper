import React from 'react';

import './App.css';
import MineSweeper from './MineSweeper';
import Dimo from './Dimo';

import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles({
  main: {
    margin: 'auto',
    padding: 16,
    background: '#eee',
  },
  header: {
    margin: 'auto',
    background: '#fee',
  },
});

function App() {
  const classes = useStyles();
  return (
    <div className='App'>
      <section className={classes.main}>
        <MineSweeper />
        <Dimo />
      </section>
    </div>
  );
}

export default App;
