import React, { useState, useEffect } from 'react';
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
  mineContainer: {
    display: 'flex',
    width: 800,
    minHeight: 800,
    paddingBottom: 32,
    margin: 'auto',
    flexDirection: 'column',
    background: 'linear-gradient(to bottom right,#39CCCC, #01FF70)',
  },
  minefield: {
    display: 'flex',
    margin: 'auto',
    flexDirection: 'column',
    background: 'linear-gradient(to bottom right,#39CCCC, #3FDBFF)',
  },
  mineRow: {
    display: 'flex',
  },
  slot: {
    height: 24,
    width: 24,
    padding: 4,
    boxSizing: 'border-box',
  },
  unrevealedSlot: {
    boxShadow: '1px 1px 1px 1px  #777',
    border: '0.1px solid #555',
  },
  revealedSlot: {
    border: '0.05px solid #ddd',
  },
  mineSlot: {
    backgroundColor: '#800',
  },
  btn: {
    padding: 0,
    height: 40,
  },
  blueSlot: {
    color: 'blue',
  },
  greenSlot: {
    color: 'green',
  },
  redSlot: {
    color: 'red',
  },
  status: {
    fontStyle: 'bold',
  },
});

function MineSweeper() {
  const classes = useStyles();
  const min = 16,
    max = 32;

  const [value, setValue] = useState((min + max) / 2);
  const [mine, setMine] = useState<string[][]>([]);
  const [status, setStatus] = useState('init');
  const [difficulty, setDifficulty] = useState(1);
  const [revealed, setRevealed] = useState(0);
  const [toReveal, setToReveal] = useState(0);

  const difficultyLevels = ['Easy', 'Medium', 'Advanced'];

  useEffect(() => {
    if (mine.length === 0) {
      return;
    }
    let revealed = 0,
      mineSlots = 0,
      toReveal = 0;
    mine.forEach(mineRow => {
      mineRow.forEach(mineSlot => {
        if (mineSlot === 'M') {
          mineSlots++;
        } else if (mineSlot === 'E') {
          toReveal++;
        }
      });
    });

    revealed = mine.length * mine[0].length - toReveal - mineSlots;
    setRevealed(revealed);
    setToReveal(toReveal);

    if (toReveal === 0) {
      setStatus('won');
    }
  }, [mine]);

  function getRandomInt(max: number) {
    return Math.floor(Math.random() * Math.floor(max));
  }
  const onNewGame = () => {
    setStatus('init');
    setMine([]);
  };
  const generateMineField = () => {
    const slotsCount = value * value;
    const mineSlotsCount = Math.floor((difficulty * slotsCount) / 10);
    const mineSlots: Set<number> = new Set();
    for (let i = 0; i < mineSlotsCount; i++) {
      mineSlots.add(getRandomInt(slotsCount));
    }
    const slots: string[][] = [];
    for (let i = 0; i < value; i++) {
      slots.push([]);
      for (let j = 0; j < value; j++) {
        const char = mineSlots.has(i * value + j) ? 'M' : 'E';
        slots[i].push(char);
      }
    }
    setMine(slots);
    setStatus('new');
    setRevealed(0);
    setToReveal(slotsCount - mineSlots.size);
  };

  const getSlotClass = (slotVal: string) => {
    if (slotVal === 'M' && status === 'lost') {
      return classes.mineSlot;
    }
    if (slotVal === 'E' || slotVal === 'M') {
      return classes.unrevealedSlot;
    }
    if (slotVal === 'X') {
      return classes.mineSlot;
    }
    return classes.revealedSlot;
  };

  const getSlotColorClass = (slotVal: string) => {
    const slotIntVal = parseInt(slotVal);
    if (isNaN(slotIntVal)) {
      return '';
    }
    const slotColorClass =
      slotIntVal === 1
        ? classes.blueSlot
        : slotIntVal === 2
        ? classes.greenSlot
        : classes.redSlot;

    console.log(slotColorClass);
    return slotColorClass;
  };

  const getDisplay = (slotVal: string) => {
    if (slotVal === 'M' && status === 'lost') {
      return 'X';
    }
    if (slotVal === 'E' || slotVal === 'M' || slotVal === 'B') {
      return '';
    }
    return slotVal;
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
        return `Keep going !!  ( Revealed:${revealed},ToReveal:${toReveal})`;
    }
  };

  const countAdjacentMines = (i: number, j: number) => {
    let count = 0;
    for (let k = i - 1; k <= i + 1; k++) {
      for (let l = j - 1; l <= j + 1; l++) {
        if (
          k >= 0 &&
          l >= 0 &&
          k < mine.length &&
          l < mine[0].length &&
          mine[k][l] === 'M'
        ) {
          count++;
        }
      }
    }
    return count;
  };

  const onChange = (mine: string[][]) => {
    setMine([...mine]);
  };
  const handleClick = (i: number, j: number) => {
    if (status === 'lost' || status === 'won') {
      return;
    }
    if (status === 'new') {
      setStatus('started');
    }
    if (i < 0 || j < 0 || i >= mine.length || j >= mine[0].length) {
      return;
    }
    if (mine[i][j] === 'M') {
      mine[i][j] = 'X';
      setStatus('lost');
      onChange(mine);
      return;
    }
    if (mine[i][j] === 'B') {
      return;
    }
    const count = countAdjacentMines(i, j);
    if (count > 0) {
      mine[i][j] = count.toString();
    } else {
      mine[i][j] = 'B';

      for (let k = i - 1; k <= i + 1; k++) {
        for (let l = j - 1; l <= j + 1; l++) {
          if (!(i === k && j === l)) {
            handleClick(k, l);
          }
        }
      }
    }
    console.log('mine', mine);
    onChange(mine);
  };

  return (
    <>
      <div className={classes.mineContainer}>
        <header className={classes.header}>MineSweeper Game</header>
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
            onClick={generateMineField}
            disabled={status !== 'init'}>
            <PlayCircleFilledIcon data-tip='Generate Mine Field' />
          </Button>
        </div>
        <div className={classes.status}>{getCurrentStatus()}</div>

        <div className={classes.minefield}>
          {mine.map((mineRow, i) => (
            <div className={classes.mineRow}>
              {mineRow.map((mineSlot, j) => (
                <div
                  className={`${classes.slot} ${getSlotClass(
                    mineSlot,
                  )} ${getSlotColorClass(mineSlot)}`}
                  onClick={() => handleClick(i, j)}>
                  {getDisplay(mineSlot)}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export default MineSweeper;
