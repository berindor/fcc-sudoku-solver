class SudokuSolver {
  validate(puzzleString) {
    if (puzzleString.length !== 81) return 'Expected puzzle to be 81 characters long';
    if (!/^[1-9\.]{81}$/.test(puzzleString)) return 'Invalid characters in puzzle';
    return true;
  }

  checkRowPlacement(puzzleString, row, column, value) {}

  checkColPlacement(puzzleString, row, column, value) {}

  checkRegionPlacement(puzzleString, row, column, value) {}

  solve(puzzleString) {}
}

module.exports = SudokuSolver;
