import React, { useState, useEffect, useRef, useCallback } from 'react';

import { Slider } from '@reach/slider';
import '@reach/slider/styles.css';
import PlayCircleFilledIcon from '@material-ui/icons/PlayCircleFilled';

import {
  makeStyles,
  Button,
  Checkbox,
  FormGroup,
  FormControlLabel,
} from '@material-ui/core';
import Ball from './Ball';
import Arrow from './Arrow';

export type BallType = {
  x: number;
  y: number;
  radius: number;
  color: string;
  direction: number[];
  status?: string;
};

export type ArrowType = {
  x: number;
  y: number;
  height: number;
  width: number;
  color: string;
  direction: number[];
};

export type MinMaxType = {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
};

const minMaxInit = {
  minX: 0,
  minY: 0,
  maxX: 800,
  maxY: 200,
};

export type State = {
  balls: BallType[];
  arrows: ArrowType[];
  totalBalls: number;
  totalArrows: number;
  status: string;
  difficulty: number;
  minMax: MinMaxType;
  currentArrow: number;
  baseBallSpeed: number;
  baseArrowSpeed: number;
};

const initState: State = {
  balls: [],
  arrows: [],
  totalBalls: 16,
  totalArrows: 48,
  status: 'init',
  difficulty: 1,
  minMax: minMaxInit,
  currentArrow: 0,
  baseBallSpeed: 5,
  baseArrowSpeed: 10,
};

const useStyles = makeStyles({
  main: {
    margin: 'auto',
    padding: 16,
  },
  header: {
    textAlign: 'center',
    fontSize: '2rem',
    padding: 8,
  },
  slider: {
    display: 'flex',
    verticalAlign: 'center',
    height: 32,
    margin: '16px 0',

    padding: '12px 0px',
  },
  sliderval: {
    padding: '8px 16px',
  },
  fieldContainer: {
    display: 'flex',
    width: 800,
    minHeight: 800,
    paddingBottom: 32,
    margin: 'auto',
    flexDirection: 'column',
    background: 'linear-gradient(to bottom right,#39CCCC, #01FF70)',
  },
  field: {
    width: 800,
    height: 800,
    display: 'block',
    margin: 'auto',
    background: 'linear-gradient(to bottom right,#39CCCC, #3FDBFF)',
    outline: 'none',
    position: 'relative',
  },

  btn: {
    padding: 0,
    height: 40,
  },

  status: {
    fontStyle: 'bold',
  },
});

function ArrowGame() {
  const classes = useStyles();
  const min = 16,
    max = 32;

  const [state, setState] = useState<State>(initState);
  const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);
  const difficultyLevels = ['Easy', 'Medium', 'Advanced'];
  const stateRef = useRef<State>(initState);
  stateRef.current = state;

  function getNewX(c: number, min: number, max: number, direction: number) {
    let newC = c + direction;
    newC = newC > max ? -max : newC;

    return { newC, direction };
  }

  function getNewY(c: number, min: number, max: number, direction: number) {
    let newC = c + direction;
    if (newC > max || newC < min) {
      direction = -direction;
      newC = newC > max ? max : min;
    }
    return { newC, direction };
  }

  function onPath(
    x: number,
    y: number,
    radius: number,
    px: number,
    py: number,
    height: number,
    width: number,
  ) {
    return !(
      x + radius <= px ||
      px + width <= x ||
      y + radius <= py ||
      py + height <= y
    );
  }
  function arrowOnPath(
    newX: number,
    newY: number,
    radius: number,
    activeArrows: ArrowType[],
  ) {
    for (let arrow of activeArrows) {
      if (
        onPath(
          newX,
          newY,
          radius,
          arrow.x,
          arrow.y,
          0.1 * arrow.height,
          arrow.width,
        )
      ) {
        return true;
      }
    }
    return false;
  }

  const animate = useCallback(
    (timeout: number, start?: boolean) => {
      // change each balls position
      const state = stateRef.current;
      if (!state || !state.balls || !state.status || !state.minMax) {
        return;
      }
      // if (state.status === 'won') {
      //   if (start === undefined) {
      //     start = true;
      //   }
      //   start = animateWinning(start);
      // } else if (state.status === 'lost') {
      //   if (start === undefined) {
      //     start = true;
      //   }
      //   start = animateLosing(start);
      // } else {
      const activeArrows = state.arrows.filter(
        arrow => arrow.y > 0 && arrow.y < 700,
      );

      const newArrows = state.arrows.map(arrow => {
        return {
          ...arrow,
          y: arrow.y + arrow.direction[1],
        };
      });

      const newBalls = state.balls.map(ball => {
        if (ball.status === 'hit') {
          return {
            ...ball,
            y: ball.y + ball.direction[1],
          };
        }
        if (arrowOnPath(ball.x, ball.y, ball.radius, activeArrows)) {
          return {
            ...ball,
            direction: [0, 10],
            status: 'hit',
            color: 'red',
          };
        }
        const { newC: newX, direction: newDirectionX } = getNewX(
          ball.x,
          state.minMax.minX,
          state.minMax.maxX,
          ball.direction[0],
        );
        const { newC: newY, direction: newDirectionY } = getNewY(
          ball.y,
          state.minMax.minY,
          state.minMax.maxY,
          ball.direction[1],
        );

        return {
          ...ball,
          x: newX,
          y: newY,
          direction: [newDirectionX, newDirectionY],
        };
      });
      //update balls

      setState({ ...state, balls: newBalls, arrows: newArrows });
      // ballsRef.current = newBalls;
      //call same function with time out
      // }
      const timer = setTimeout(() => animate(timeout, start), timeout);
      setTimer(timer);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [stateRef.current],
  );

  useEffect(() => {
    if (state && state.status === 'new') {
      animate(20);
    }
    return () => {
      if (timer != null) clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.status]);

  useEffect(() => {
    if (!state.balls.length) {
      return;
    }
    if (state.status !== 'started') {
      return;
    }
    const ballsHit = state.balls.filter(ball => ball.status === 'hit').length;
    const remainingBalls = state.balls.length - ballsHit;
    const remainingArrows = state.arrows.filter(
      arrow => arrow.y > 0 && arrow.y < 800,
    ).length;
    if (remainingArrows < remainingBalls) {
      setState({ ...state, status: 'lost' });
    }
    if (remainingBalls === 0) {
      setState({ ...state, status: 'won' });
    }
  }, [state, state.arrows, state.balls, state.status]);

  // useEffect(() => {
  //   if (status === 'won') {
  //     const newBalls = balls.map((ball, index) => {
  //       return {
  //         ...ball,
  //         x: minMax.maxX / 2,
  //         y: minMax.maxY / 2,
  //         direction: [
  //           5 * Math.cos((2 * Math.PI * index) / balls.length),
  //           5 * Math.sin((2 * Math.PI * index) / balls.length),
  //         ],
  //       };
  //     });
  //     setBalls(newBalls);
  //   } else if (status === 'lost') {
  //     const newBalls = balls.map((ball, index) => {
  //       return {
  //         ...ball,
  //         x: index * 40 + minMax.minX,
  //         y: minMax.minY,
  //         direction: [5, 5],
  //       };
  //     });
  //     setBalls(newBalls);
  //   }
  //   return () => {
  //     if (timer != null) clearTimeout(timer);
  //   };
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [status]);

  function getRandomInt(max: number) {
    return Math.floor(Math.random() * Math.floor(max));
  }

  function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }

  const onNewGame = () => {
    setState(initState);
  };
  const generateField = () => {
    if (!state) {
      return;
    }
    const { totalBalls, difficulty, baseBallSpeed } = state;
    if (!totalBalls || totalBalls === 0 || !difficulty || !baseBallSpeed) {
      return;
    }
    const balls = [];

    const speed = baseBallSpeed + (baseBallSpeed * difficulty) / 10;
    for (let b = 0; b < totalBalls; b++) {
      balls.push({
        x: -40 * b,
        y: 0,
        radius: 30,
        color: getRandomColor(),
        direction: [getRandomInt(speed) + 3, getRandomInt(speed) + 3],
      });
    }

    const totalArrows = (6 * totalBalls) / difficulty;
    const arrows = [];
    for (let a = 0; a < totalArrows; a++) {
      arrows.push({
        x: a * 10 + 200,
        y: 720,
        height: 80,
        width: 1,
        color: getRandomColor(),
        direction: [0, 0],
      });
    }

    setState({
      ...state,
      balls,
      arrows,
      totalArrows,
      status: 'new',
    });
  };

  const getCurrentStatus = () => {
    if (!state) {
      return;
    }
    switch (state.status) {
      case 'init':
        return 'Welcome to the game !!';
      case 'new':
        return 'Good luck !!';
      case 'lost':
        return 'Oh no, You lost !!!';

      case 'won':
        return 'Congratulations !!! You won !!!';
      default:
        return `Keep going !!  Balls Hit: ${ballsHit}, Remaining Balls: ${remainingBalls}, Remaining
        Arrows: ${remainingArrows} `;
    }
  };

  const fireCurrentArrow = () => {
    if (!stateRef || !stateRef.current) {
      return;
    }

    const { currentArrow, arrows, baseArrowSpeed, status } = stateRef.current;

    const newArrows = arrows.map((arrow, index) => {
      if (index === currentArrow) {
        return {
          ...arrow,
          direction: [0, -baseArrowSpeed],
        };
      } else if (index > currentArrow) {
        return {
          ...arrow,
          x: arrow.x - 10,
        };
      } else {
        return arrow;
      }
    });

    setState({
      ...state,
      arrows: newArrows,
      currentArrow: currentArrow + 1,
      status: status === 'new' ? 'started' : status,
    });
  };

  const handleKeyDown = (e: any) => {
    console.log(e.key);
    fireCurrentArrow();
    e.preventDefault();
    e.stopPropagation();
  };

  const ballsHit = state.balls.filter(ball => ball.status === 'hit').length;
  const remainingBalls = state.balls.length - ballsHit;
  const remainingArrows = state.arrows.filter(
    arrow => arrow.y > 0 && arrow.y < 800,
  ).length;

  return (
    <>
      <div className={classes.fieldContainer}>
        <header className={classes.header}>Arrow Game</header>
        <Button
          color='primary'
          className={classes.btn}
          size='small'
          onClick={onNewGame}>
          New Game
        </Button>
        <div className={classes.slider}>
          <Slider
            min={min}
            max={max}
            step={1}
            value={state.totalBalls}
            onChange={(newVal: number) =>
              setState({ ...state, totalBalls: newVal })
            }
            disabled={state.status !== 'init'}
          />
          <div className={classes.sliderval}>{state.totalBalls}</div>
          <FormGroup row>
            {difficultyLevels.map((d, index) => (
              <FormControlLabel
                control={
                  <Checkbox
                    checked={state.difficulty === index + 1}
                    onChange={() =>
                      setState({ ...state, difficulty: index + 1 })
                    }
                    value={d}
                    inputProps={{ 'aria-label': 'primary checkbox' }}
                  />
                }
                label={d}
                disabled={state.status !== 'init'}
              />
            ))}
          </FormGroup>

          <Button
            color='primary'
            className={classes.btn}
            size='small'
            onClick={generateField}
            disabled={state.status !== 'init'}>
            <PlayCircleFilledIcon data-tip='Prepare the field' />
          </Button>
        </div>
        <div className={classes.status}>{getCurrentStatus()}</div>

        <div className={classes.field} tabIndex={0} onKeyDown={handleKeyDown}>
          {state.balls
            .filter(ball => ball.x > 0 && ball.x < 760 && ball.y < 760)
            .map(ball => (
              <Ball
                x={ball.x}
                y={ball.y}
                radius={ball.radius}
                color={ball.color}
              />
            ))}
          {state.arrows
            .filter(arrow => arrow.y > 0 && arrow.x < 760)
            .map(arrow => (
              <Arrow
                x={arrow.x}
                y={arrow.y}
                height={arrow.height}
                width={arrow.width}
                color={arrow.color}
              />
            ))}
        </div>
      </div>
    </>
  );
}

export default ArrowGame;
