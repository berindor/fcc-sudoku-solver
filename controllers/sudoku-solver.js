class SudokuSolver {
  validate(puzzleString) {
    if (puzzleString.length !== 81) return 'Expected puzzle to be 81 characters long';
    if (!/^[1-9\.]{81}$/.test(puzzleString)) return 'Invalid characters in puzzle';
    return true;
  }

  //row: A-I, column: 1-9
  validateInput(row, column, value) {
    let output = { error: undefined, rowIndex: undefined };
    if (!/^[A-I]$/.test(row) || !/^[1-9]$/.test(column)) {
      output.error = 'Invalid coordinate';
    }
    if (!/^[1-9]$/.test(value.toString())) {
      output.error = 'Invalid value';
    }
    output.rowIndex = row.charCodeAt(0) - 'A'.charCodeAt(0);
    return output;
  }

  checkRowPlacement(puzzleString, row, column, value) {
    const { error, rowIndex } = this.validateInput(row, column, value);
    if (error) return error;
    const rowString = puzzleString.slice(9 * rowIndex, 9 * (rowIndex + 1));
    const stringToSearch = rowString.slice(0, column - 1) + rowString.slice(column);
    return !stringToSearch.includes(value.toString());
  }

  checkColPlacement(puzzleString, row, column, value) {
    const { error, rowIndex } = this.validateInput(row, column, value);
    if (error) return error;
    let columnArr = [];
    for (let i = 0; i < 9; i++) {
      columnArr.push(puzzleString[9 * i + column - 1]);
    }
    columnArr[rowIndex] = '.';
    return !columnArr.includes(value.toString());
  }

  checkRegionPlacement(puzzleString, row, column, value) {
    const { error, rowIndex } = this.validateInput(row, column, value);
    if (error) return error;
    let regionArr = [];
    const regionStartRow = rowIndex - (rowIndex % 3);
    const regionStartCol = column - 1 - ((column - 1) % 3);
    for (let r = regionStartRow; r < regionStartRow + 3; r++) {
      for (let index = 9 * r + regionStartCol; index < 9 * r + regionStartCol + 3; index++) {
        regionArr.push(puzzleString[index]);
      }
    }
    regionArr[3 * (rowIndex % 3) + ((column - 1) % 3)] = '.';
    return !regionArr.includes(value.toString());
  }

  solve(puzzleString) {
    if (this.validate(puzzleString) !== true) return false;

    //check if puzzlestring has no incompatibilities with itself
    const checkCompatibility = inputPuzzleString => {
      for (let index = 0; index < 81; index++) {
        let rowLetter = String.fromCharCode('A'.charCodeAt(0) + Math.floor(index / 9));
        let column = (index % 9) + 1;
        let value = inputPuzzleString[index];
        if (
          this.checkRowPlacement(inputPuzzleString, rowLetter, column, value) === false ||
          this.checkColPlacement(inputPuzzleString, rowLetter, column, value) === false ||
          this.checkRegionPlacement(inputPuzzleString, rowLetter, column, value) === false
        ) {
          return false;
        }
      }
      return true;
    };

    //inputPuzzleString => array of {value, possibleValues array} or 'unsolvable'
    const reduceCases = inputPuzzleString => {
      let dataArr = inputPuzzleString.split('').map(input => {
        return { value: input, possibleValues: [input] };
      });
      for (let index = 0; index < 81; index++) {
        if (inputPuzzleString[index] === '.') {
          let rowLetter = String.fromCharCode('A'.charCodeAt(0) + Math.floor(index / 9));
          let column = (index % 9) + 1;
          let possibleValues = [];
          for (let value = 1; value < 10; value++) {
            if (
              this.checkRowPlacement(inputPuzzleString, rowLetter, column, value) === true &&
              this.checkColPlacement(inputPuzzleString, rowLetter, column, value) === true &&
              this.checkRegionPlacement(inputPuzzleString, rowLetter, column, value) === true
            ) {
              possibleValues.push(value);
            }
          }
          dataArr[index].possibleValues = possibleValues;
          if (possibleValues.length === 0) return 'unsolvable';
          if (possibleValues.length === 1) dataArr[index].value = possibleValues[0];
        }
      }
      if (checkCompatibility(dataArr.map(data => data.value).join('')) === false) return 'unsolvable';
      return dataArr;
    };

    //fill the unambiguous cells repeatedly until there are no more
    //inputPuzzleString => outputPuzzleString or unsolvable
    const unambFill = inputPuzzleString => {
      let previousPuzzleString;
      let solveData;
      let newPuzzleString = inputPuzzleString;

      do {
        previousPuzzleString = newPuzzleString;
        solveData = reduceCases(previousPuzzleString);
        if (solveData === 'unsolvable') return 'unsolvable';
        newPuzzleString = solveData.map(data => data.value).join('');
      } while (solveData !== 'unsolvable' && newPuzzleString !== previousPuzzleString);

      return newPuzzleString;
    };

    //unreducable string => 'unsolvable' or solution or iterate
    let stepCount = 0;
    let iterationCount = 0;
    const reduceUncertain = inputPuzzleString => {
      //console.log(`inputPuzzleString${stepCount}: ${inputPuzzleString}`);
      let newPuzzleString = unambFill(inputPuzzleString);
      if (newPuzzleString === 'unsolvable') return 'unsolvable';
      if (!newPuzzleString.includes('.')) return newPuzzleString;

      const indexOfFirstUncertain = newPuzzleString.search(/\./);
      let solveData = reduceCases(newPuzzleString);
      const listOfPossibleValues = solveData[indexOfFirstUncertain].possibleValues;
      iterationCount++;
      //console.log(`iteration #${iterationCount} needed, list of possible values on place ${indexOfFirstUncertain}: [${listOfPossibleValues}]`);

      while (stepCount < 300) {
        let unsolvableCases = 0;
        for (let value of listOfPossibleValues) {
          let insertValueInPuzzle = inputPuzzleString.slice(0, indexOfFirstUncertain) + value + inputPuzzleString.slice(indexOfFirstUncertain + 1);
          stepCount++;
          //console.log(`step ${stepCount}: insert value ${value} in place ${indexOfFirstUncertain}`);

          newPuzzleString = unambFill(insertValueInPuzzle);

          if (newPuzzleString === 'unsolvable') {
            unsolvableCases++;
            /*
            console.log(
              `newPuzzleString${stepCount}: unsolvable => first ${unsolvableCases} cases of [${listOfPossibleValues}] unsolvable on place ${indexOfFirstUncertain}`
            );
            */
          } else if (!newPuzzleString.includes('.')) {
            //console.log(`newPuzzleString${stepCount}: solved: ${newPuzzleString}`);
            return newPuzzleString;
          } else {
            //console.log(`newPuzzleString${stepCount}: iteration needed`);
            let iteration = reduceUncertain(newPuzzleString);
            if (iteration === 'unsolvable') {
              unsolvableCases++;
              /*
              console.log(
                `newPuzzleString${stepCount} with first ${unsolvableCases} iterations in [${listOfPossibleValues}] on place ${indexOfFirstUncertain} is unsolvable`
              );
              */
            } else {
              stepCount++;
              //console.log(`newPuzzleString${stepCount}: iteration solved: ${iteration}`);
              return iteration;
            }
          }
        }
        if (unsolvableCases === listOfPossibleValues.length) {
          return 'unsolvable';
        }
      }
    };

    let unambFilledString = unambFill(puzzleString);
    if (unambFilledString === 'unsolvable') return 'unsolvable';
    if (!unambFilledString.includes('.')) return unambFilledString;
    return reduceUncertain(unambFilledString);
  }
}

module.exports = SudokuSolver;
