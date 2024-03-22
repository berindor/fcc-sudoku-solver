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

    //check if puzzlestring has no incompatibilities with itself
    for (let index = 0; index < 81; index++) {
      let rowLetter = String.fromCharCode('A'.charCodeAt(0) + Math.floor(index / 9));
      let column = (index % 9) + 1;
      let value = puzzleString[index];
      if (
        this.checkRowPlacement(puzzleString, rowLetter, column, value) === false ||
        this.checkColPlacement(puzzleString, rowLetter, column, value) === false ||
        this.checkRegionPlacement(puzzleString, rowLetter, column, value) === false
      ) {
        return 'unsolvable';
      }
    }

    if (!puzzleString.includes('.')) return puzzleString;

    console.log('puzzleString: ', puzzleString);
    //create solveData array
    let solveData = [];
    for (let index = 0; index < 81; index++) {
      solveData.push({
        value: puzzleString[index],
        possibleValues: puzzleString[index] === '.' ? [1, 2, 3, 4, 5, 6, 7, 8, 9] : [puzzleString[index]]
      });
    }

    const reduceCases = dataToReduce => {
      let dataArr = dataToReduce;
      let puzzleStringOfData = dataToReduce.map(cellData => cellData.value).join('');
      for (let index = 0; index < 81; index++) {
        if (dataToReduce[index].value === '.') {
          let rowLetter = String.fromCharCode('A'.charCodeAt(0) + Math.floor(index / 9));
          let column = (index % 9) + 1;
          let possibleValues = [];
          for (let value = 1; value < 10; value++) {
            if (
              this.checkRowPlacement(puzzleStringOfData, rowLetter, column, value) === true &&
              this.checkColPlacement(puzzleStringOfData, rowLetter, column, value) === true &&
              this.checkRegionPlacement(puzzleStringOfData, rowLetter, column, value) === true
            ) {
              possibleValues.push(value);
            }
          }
          dataArr[index].possibleValues = possibleValues;
          if (possibleValues === []) return 'unsolvable';
          if (possibleValues.length === 1) dataArr[index].value = possibleValues[0];
        }
      }
      return dataArr;
    };

    let previousData;
    let previousPuzzleString;
    let newPuzzleString;
    let count = 0;

    do {
      previousData = solveData;
      previousPuzzleString = previousData.map(data => data.value).join('');
      solveData = reduceCases(previousData);
      if (solveData === 'unsolvable') return 'unsolvable';
      newPuzzleString = solveData.map(data => data.value).join('');
      count++;
      console.log(`newPuzzleString${count}: `, newPuzzleString);
    } while (solveData !== 'unsolvable' && newPuzzleString !== previousPuzzleString && count < 81);

    if (!newPuzzleString.includes('.')) return solveData.map(data => data.value).join('');

    return 'not easily solvable';
    //TODO: when previousPuzzleString === newPuzzleString
  }
}

module.exports = SudokuSolver;
