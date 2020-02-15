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

export type BallType = {
  x: number;
  y: number;
  radius: number;
  color: string;
  direction: number[];
};

export type MinMaxType = {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
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
    display: 'flex',
    margin: 'auto',
    flexDirection: 'column',
    background: 'linear-gradient(to bottom right,#39CCCC, #3FDBFF)',
    outline: 'none',
    position: 'relative',
  },
  fieldRow: {
    display: 'flex',
  },
  slot: {
    height: 24,
    width: 24,
    padding: 4,
    boxSizing: 'border-box',
    border: '0.05px solid #eee',
  },

  playerSlot: {
    backgroundColor: 'green',
  },
  activeSlot: {
    backgroundColor: 'blue',
  },
  dimoSlot: {
    backgroundColor: '#99f',
  },
  filledSlot: {
    backgroundColor: '#29f',
  },
  btn: {
    padding: 0,
    height: 40,
  },

  status: {
    fontStyle: 'bold',
  },
});

function Dimo() {
  const classes = useStyles();
  const min = 16,
    max = 32;

  const [value, setValue] = useState((min + max) / 2);
  const [balls, setBalls] = useState<BallType[]>([]);
  const [fieldSlots, setFieldSlots] = useState<string[][]>([]);
  const [dimoSlots, setDimoSlots] = useState(0);
  const [status, setStatus] = useState('init');
  const minMaxInit = {
    minX: 0,
    minY: 0,
    maxX: 0,
    maxY: 0,
  };
  const [minMax, setMinMax] = useState<MinMaxType>(minMaxInit);
  const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);
  const [difficulty, setDifficulty] = useState(1);
  const [activePlayer, setActivePlayer] = useState<{ i: number; j: number }>({
    i: 0,
    j: 0,
  });
  const ballsRef = useRef<BallType[]>();
  ballsRef.current = balls;
  const minMaxRef = useRef<MinMaxType>(minMaxInit);
  minMaxRef.current = minMax;
  const activePlayerRef = useRef<{ i: number; j: number }>({ i: 0, j: 0 });
  const ref = useRef<HTMLDivElement | null>(null);
  activePlayerRef.current = activePlayer;
  const [players, setPlayers] = useState<{
    active: number;
    failed: number;
    succeeded: number;
    total: number;
  }>({ active: 0, failed: 0, succeeded: 0, total: 0 });
  const playersRef = useRef({ active: 0, failed: 0, succeeded: 0, total: 0 });
  playersRef.current = players;
  const fieldSlotsRef = useRef<string[][]>([]);
  fieldSlotsRef.current = fieldSlots;
  const dimoSlotsRef = useRef<number>(0);
  dimoSlotsRef.current = dimoSlots;
  const statusRef = useRef<string>('init');
  statusRef.current = status;
  const difficultyLevels = ['Easy', 'Medium', 'Advanced'];

  function getNewCoord(c: number, min: number, max: number, direction: number) {
    let newC = c + direction;
    const newDirectionC = newC < min || newC > max ? -direction : direction;

    newC = newC < min ? min : newC > max ? max : newC;

    return { newC, newDirectionC };
  }

  function playerOnPath(
    x: number,
    y: number,
    radius: number,
    px: number,
    py: number,
    height: number,
    width: number,
  ) {
    return !(
      x + 2 * radius <= px ||
      px + width <= x ||
      y + 2 * radius <= py ||
      py + height <= y
    );
  }

  const takeOutActivePlayer = () => {
    const players = playersRef.current;
    const fieldSlots = fieldSlotsRef.current;
    const failed = players.failed + 1;

    setPlayers({ ...players, failed });
    const curPlayers = players.total - failed - players.succeeded;
    console.log(players, curPlayers);
    if (curPlayers < dimoSlotsRef.current - players.succeeded) {
      setStatus('lost');
    } else if (curPlayers > 0) {
      setActivePlayer({ i: 0, j: curPlayers - 1 });
      fieldSlots[0][curPlayers - 1] = '';

      onChange(fieldSlots);
    }
  };

  const animateBalls = useCallback(
    (
      balls: BallType[] | null,
      timeout: number,
      minMax: MinMaxType,
      activePlayer: { i: number; j: number },
      start?: boolean,
    ) => {
      // change each balls position
      if (!balls) {
        return;
      }
      const status = statusRef.current;
      console.log('animate balls');
      if (status === 'won') {
        if (start === undefined) {
          start = true;
        }
        start = animateWinning(start);
      } else if (status === 'lost') {
        if (start === undefined) {
          start = true;
        }
        start = animateLosing(start);
      } else {
        const newBalls = balls.map(ball => {
          const { newC: newX, newDirectionC: newDirectionX } = getNewCoord(
            ball.x,
            minMax.minX,
            minMax.maxX,
            ball.direction[0],
          );
          const { newC: newY, newDirectionC: newDirectionY } = getNewCoord(
            ball.y,
            minMax.minY,
            minMax.maxY,
            ball.direction[1],
          );

          if (
            playerOnPath(
              newX,
              newY,
              ball.radius,
              activePlayer.j * 24,
              activePlayer.i * 24,
              24,
              24,
            )
          ) {
            takeOutActivePlayer();
          }

          return {
            ...ball,
            x: newX,
            y: newY,
            direction: [newDirectionX, newDirectionY],
          };
        });
        //update balls

        setBalls([...newBalls]);
        // ballsRef.current = newBalls;
        //call same function with time out
      }
      const timer = setTimeout(
        () =>
          animateBalls(
            ballsRef.current ?? null,
            timeout,
            minMaxRef.current,
            activePlayerRef.current,
            start,
          ),
        timeout,
      );
      setTimer(timer);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [balls],
  );

  const animateWinning = (start: boolean) => {
    let balls = ballsRef.current;
    if (!balls || !balls.length) {
      return;
    }
    const count = balls.length;
    let minMax = minMaxRef.current;
    let outOfbox = false;
    const newBalls = balls.map((ball, index) => {
      if (start) {
        return {
          ...ball,
          x: minMax.maxX / 2,
          y: minMax.maxY / 2,
          direction: [
            5 * Math.cos((2 * Math.PI * index) / count),
            5 * Math.sin((2 * Math.PI * index) / count),
          ],
        };
      } else {
        const { newC: newX, newDirectionC: newDirectionX } = getNewCoord(
          ball.x,
          minMax.minX,
          minMax.maxX,
          ball.direction[0],
        );
        const { newC: newY, newDirectionC: newDirectionY } = getNewCoord(
          ball.y,
          minMax.minY,
          minMax.maxY,
          ball.direction[1],
        );

        outOfbox =
          outOfbox ||
          newDirectionX !== ball.direction[0] ||
          newDirectionY !== ball.direction[1];
        //console.log(ball.direction, newDirectionX, newDirectionY, start);
        return {
          ...ball,
          x: newX,
          y: newY,
          direction: [newDirectionX, newDirectionY],
        };
      }
    });
    //update balls
    start = start ? false : outOfbox;
    setBalls([...newBalls]);
    return start;
  };

  const animateLosing = (start: boolean) => {
    let balls = ballsRef.current;
    if (!balls) {
      return;
    }
    let minMax = minMaxRef.current;
    let outOfbox = false;
    const newBalls = balls.map((ball, index) => {
      if (start) {
        return {
          ...ball,
          x: minMax.minX + 40 * index,
          y: minMax.minY,
          direction: [5, 5],
        };
      } else {
        const { newC: newX, newDirectionC: newDirectionX } = getNewCoord(
          ball.x,
          minMax.minX,
          minMax.maxX,
          ball.direction[0],
        );
        const { newC: newY, newDirectionC: newDirectionY } = getNewCoord(
          ball.y,
          minMax.minY,
          minMax.maxY,
          ball.direction[1],
        );

        outOfbox =
          outOfbox ||
          newDirectionX !== ball.direction[0] ||
          newDirectionY !== ball.direction[1];
        //console.log(ball.direction, newDirectionX, newDirectionY, start);
        return {
          ...ball,
          x: newX,
          y: newY,
          direction: [newDirectionX, newDirectionY],
        };
      }
    });
    //update balls
    start = start ? false : outOfbox;
    setBalls([...newBalls]);
    return start;
  };

  useEffect(() => {
    if (fieldSlots.length === 0) {
      return;
    }
    //get bounding rect and set min and max coordinates
    if (ref && ref.current) {
      const width = ref.current.offsetWidth;
      const height = ref.current.offsetHeight;
      console.log(width, height);
      setMinMax({
        minX: 0,
        maxX: width - 20,
        minY: 24,
        maxY: height - 64,
      });
    }
  }, [fieldSlots.length]);

  useEffect(() => {
    if (fieldSlots.length > 0 && minMax.maxX > 0 && status === 'new') {
      animateBalls(balls, 20, minMax, activePlayer);
    }
    return () => {
      if (timer != null) clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fieldSlots.length, minMax.maxX, status]);

  useEffect(() => {
    if (status === 'won') {
      const newBalls = balls.map((ball, index) => {
        return {
          ...ball,
          x: minMax.maxX / 2,
          y: minMax.maxY / 2,
          direction: [
            5 * Math.cos((2 * Math.PI * index) / balls.length),
            5 * Math.sin((2 * Math.PI * index) / balls.length),
          ],
        };
      });
      setBalls(newBalls);
    } else if (status === 'lost') {
      const newBalls = balls.map((ball, index) => {
        return {
          ...ball,
          x: index * 40 + minMax.minX,
          y: minMax.minY,
          direction: [5, 5],
        };
      });
      setBalls(newBalls);
    }
    return () => {
      if (timer != null) clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

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
    setStatus('init');
    setFieldSlots([]);
    setBalls([]);
    setMinMax({ minX: 0, minY: 0, maxX: 0, maxY: 0 });
    setPlayers({ active: 0, failed: 0, succeeded: 0, total: 0 });
  };
  const generateField = () => {
    const dimoSlotsCount = Math.floor((difficulty * value) / 6);
    const playersCount = Math.min(value, 2 * dimoSlotsCount);
    const ballsCount = Math.floor((2 * dimoSlotsCount) / difficulty);
    const slots: string[][] = [];
    for (let i = 0; i < value; i++) {
      slots.push([]);
      for (let j = 0; j < value; j++) {
        const char =
          i === 0 && j < playersCount - 1
            ? 'P'
            : i === value - 1 && j >= value - dimoSlotsCount
            ? 'D'
            : '';
        slots[i].push(char);
      }
    }
    const balls = [];
    const baseSpeed = 10;
    const speed = (difficulty * baseSpeed) / 3;
    for (let b = 0; b < ballsCount; b++) {
      balls.push({
        x: 0,
        y: b * 40 + 40,
        radius: 20,
        color: getRandomColor(),
        direction: [getRandomInt(speed) + 3, getRandomInt(speed) + 3],
      });
    }
    setFieldSlots(slots);
    setStatus('new');
    setBalls(balls);
    setActivePlayer({ i: 0, j: playersCount - 1 });
    setPlayers({ active: 1, failed: 0, succeeded: 0, total: playersCount });
    setDimoSlots(dimoSlotsCount);
  };

  const getSlotClass = (i: number, j: number) => {
    if (activePlayer && activePlayer.i === i && activePlayer.j === j) {
      return classes.activeSlot;
    }
    if (fieldSlots[i][j] === 'P') {
      return classes.playerSlot;
    }
    if (fieldSlots[i][j] === 'D') {
      return classes.dimoSlot;
    }
    if (fieldSlots[i][j] === 'F') {
      return classes.filledSlot;
    }
    return '';
  };

  const getCurrentStatus = () => {
    switch (status) {
      case 'init':
        return 'Welcome to the game !!';
      case 'new':
        return 'Good luck !!';
      case 'lost':
        return 'Oh no, You lost !!!';

      case 'won':
        return 'Congratulations !!! You won !!!';
      default:
        return `Keep going !!  ( Filled:${
          players.succeeded
        },ToFill:${dimoSlots - players.succeeded})`;
    }
  };

  const onChange = (fieldSlots: string[][]) => {
    setFieldSlots([...fieldSlots]);
  };
  const handleMove = (direction: number[]) => {
    if (status === 'lost' || status === 'won') {
      return;
    }
    if (status === 'new') {
      setStatus('started');
    }
    const i = activePlayer.i;
    const j = activePlayer.j;
    let nextI = i + direction[0];
    nextI = nextI < 0 ? 0 : nextI >= fieldSlots.length ? i : nextI;
    let nextJ = j + direction[1];
    nextJ = nextJ < 0 ? 0 : nextJ >= fieldSlots[0].length ? j : nextJ;
    if (['F', 'P'].includes(fieldSlots[nextI][nextJ])) {
      nextI = i;
      nextJ = j;
    }

    if (fieldSlots[nextI][nextJ] === 'D') {
      fieldSlots[nextI][nextJ] = 'F';
      const succeeded = players.succeeded + 1;

      setPlayers({ ...players, succeeded });
      if (succeeded === dimoSlots) {
        setStatus('won');
      }
      const curPlayers = players.total - players.failed - succeeded;
      if (curPlayers > 0) {
        nextI = 0;
        nextJ = curPlayers - 1;
        const fieldSlots = fieldSlotsRef.current;
        fieldSlots[0][curPlayers - 1] = '';
      }
      onChange(fieldSlots);
    }

    setActivePlayer({ i: nextI, j: nextJ });
  };

  const handleKeyDown = (e: any) => {
    console.log(e.key);
    let cancelEvent = true;
    switch (e.key) {
      case 'ArrowLeft':
        handleMove([0, -1]);
        break;
      case 'ArrowRight':
        handleMove([0, 1]);
        console.log('moving right');
        break;
      case 'ArrowDown':
        handleMove([1, 0]);
        console.log('moving down');
        break;
      case 'ArrowUp':
        handleMove([-1, 0]);
        console.log('movign up');
        break;
      default:
        cancelEvent = false;
        break;
    }
    if (cancelEvent) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  return (
    <>
      <div className={classes.fieldContainer}>
        <header className={classes.header}>Dimo Game</header>
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
            value={value}
            onChange={(newVal: number) => setValue(newVal)}
            disabled={status !== 'init'}
          />
          <div className={classes.sliderval}>
            {value} * {value}{' '}
          </div>
          <FormGroup row>
            {difficultyLevels.map((d, index) => (
              <FormControlLabel
                control={
                  <Checkbox
                    checked={difficulty === index + 1}
                    onChange={() => setDifficulty(index + 1)}
                    value={d}
                    inputProps={{ 'aria-label': 'primary checkbox' }}
                  />
                }
                label={d}
                disabled={status !== 'init'}
              />
            ))}
          </FormGroup>

          <Button
            color='primary'
            className={classes.btn}
            size='small'
            onClick={generateField}
            disabled={status !== 'init'}>
            <PlayCircleFilledIcon data-tip='Prepare the field' />
          </Button>
        </div>
        <div className={classes.status}>{getCurrentStatus()}</div>

        <div
          className={classes.field}
          ref={ref}
          tabIndex={0}
          onKeyDown={handleKeyDown}>
          {fieldSlots.map((fieldRow, i) => (
            <div className={classes.fieldRow}>
              {fieldRow.map((fieldSlot, j) => (
                <div className={`${classes.slot} ${getSlotClass(i, j)} `}></div>
              ))}
            </div>
          ))}
          {balls.map(ball => (
            <Ball
              x={ball.x}
              y={ball.y}
              radius={ball.radius}
              color={ball.color}
            />
          ))}
        </div>
      </div>
    </>
  );
}

export default Dimo;
