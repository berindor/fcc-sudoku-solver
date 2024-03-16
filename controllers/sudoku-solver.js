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
      output.error = 'invalid coordinate';
    }
    if (!/^[1-9]$/.test(value.toString())) {
      output.error = 'invalid value';
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
    if (!puzzleString.includes('.')) return puzzleString;

    console.log('puzzleString: ', puzzleString);
    //create solveData array
    let solveData = [];
    for (let index = 0; index < 81; index++) {
      solveData.push({
        solved: puzzleString[index] === '.' ? false : true,
        value: puzzleString[index],
        possibleValues: [],
        rowLetter: String.fromCharCode('A'.charCodeAt(0) + Math.floor(index / 9)),
        column: (index % 9) + 1
      });
    }

    const reduceCases = data => {
      let solveData = data;
      for (let index = 0; index < 81; index++) {
        let possibleValues = [];
        let { rowLetter, column } = solveData[index];
        for (let value = 1; value < 10; value++) {
          if (
            this.checkRowPlacement(puzzleString, rowLetter, column, value) === true &&
            this.checkColPlacement(puzzleString, rowLetter, column, value) === true &&
            this.checkRegionPlacement(puzzleString, rowLetter, column, value) === true
          ) {
            possibleValues.push(value);
          }
        }
        solveData[index].possibleValues = possibleValues;
        if (possibleValues === []) return 'unsolvable';
        if (possibleValues.length === 1) {
          solveData[index].value = possibleValues[0];
          solveData[index].solved = true;
        }
      }
      return solveData;
    };

    let previousPuzzleString = puzzleString;
    solveData = reduceCases(solveData);
    if (solveData === 'unsolvable') return 'unsolvable';
    let newPuzzleString = solveData.map(data => data.value).join('');
    console.log('newPuzzleString: ', newPuzzleString);

    while (solveData !== 'unsolvable' && previousPuzzleString !== newPuzzleString) {
      previousPuzzleString = newPuzzleString;
      solveData = reduceCases(solveData);
      newPuzzleString = solveData.map(data => data.value).join('');
      console.log('newPuzzleString: ', newPuzzleString);
    }

    if (solveData === 'unsolvable') return 'unsolvable';
    return newPuzzleString;

    //TODO: when previousPuzzleString === newPuzzleString

    /*
    const firstPeriodIndex = puzzleString.search('.');
    const rowLetter = String.fromCharCode('A'.charCodeAt(0) + Math.floor(firstPeriodIndex / 9));
    const column = (firstPeriodIndex % 9) + 1;
    let newPuzzleString;
    for (let value = 0; value < 10; value++) {
      if (
        this.checkRowPlacement(puzzleString, rowLetter, column, value) === true &&
        this.checkColPlacement(puzzleString, rowLetter, column, value) === true &&
        this.checkRegionPlacement(puzzleString, rowLetter, column, value) === true
      ) {
        newPuzzleString = puzzleString.slice(0, firstPeriodIndex) + value + puzzleString.slice(firstPeriodIndex + 1);
        if (this.solve(newPuzzleString) !== 'unsolvable') return this.solve(newPuzzleString);
      }
    }
    if (value === 10) return 'unsolvable';
    */
  }
}

module.exports = SudokuSolver;
