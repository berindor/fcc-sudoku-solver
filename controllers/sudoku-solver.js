class SudokuSolver {
  validate(puzzleString) {
    if (puzzleString.length !== 81) return 'Expected puzzle to be 81 characters long';
    if (!/^[1-9\.]{81}$/.test(puzzleString)) return 'Invalid characters in puzzle';
    return true;
  }

  letterOfIndex(index) {
    if (index < 0 || index > 80) return null;
    const rowLetter = String.fromCharCode('A'.charCodeAt(0) + Math.floor(index / 9));
    return rowLetter;
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

  solve(puzzleString) {}
}

module.exports = SudokuSolver;
