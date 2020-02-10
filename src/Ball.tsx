import React from 'react';

import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles({
  ball: {
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 1000,
    borderRadius: '50%',
  },
});

const Ball = (props: {
  x: number;
  y: number;
  radius: number;
  color: string;
}) => {
  const classes = useStyles();
  const { x, y, radius, color } = props;
  return (
    <div
      className={classes.ball}
      style={{
        top: y,
        left: x,
        width: radius,
        height: radius,
        backgroundColor: color,
      }}></div>
  );
};

export default Ball;
