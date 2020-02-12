import React from 'react';

import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles({
  arrow: {
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 1000,

    '& :hover': {
      width: 10,
    },
  },
});

const Arrow = (props: {
  x: number;
  y: number;
  height: number;
  width: number;
  color: string;
}) => {
  const classes = useStyles();
  const { x, y, height, color, width } = props;
  return (
    <div
      className={classes.arrow}
      style={{
        top: y,
        left: x,
        height: height,
        width,
        backgroundColor: color,
      }}></div>
  );
};

export default Arrow;
