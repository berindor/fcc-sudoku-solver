'use strict';

const SudokuSolver = require('../controllers/sudoku-solver.js');

module.exports = function (app) {
  let solver = new SudokuSolver();

  app.route('/api/check').post((req, res) => {
    try {
      const puzzle = req.body.puzzle;
      const coordinate = req.body.coordinate;
      const value = req.body.value;
      if (puzzle === undefined || coordinate === undefined || value === undefined) {
        return res.send({ error: 'Required field(s) missing' });
      }
      if (solver.validate(puzzle) !== true) {
        return res.send({ error: solver.validate(puzzle) });
      }
      if (!/^[A-I][1-9]$/.test(coordinate)) {
        return res.send({ error: 'Invalid coordinate' });
      }
      if (!/^[1-9]$/.test(value.toString())) {
        return res.send({ error: 'Invalid value' });
      }
      const row = req.body.coordinate[0];
      const column = Number(req.body.coordinate[1]);
      let conflictList = [];
      if (!solver.checkRowPlacement(puzzle, row, column, value)) {
        conflictList.push('row');
      }
      if (!solver.checkColPlacement(puzzle, row, column, value)) {
        conflictList.push('column');
      }
      if (!solver.checkRegionPlacement(puzzle, row, column, value)) {
        conflictList.push('region');
      }
      if (conflictList.length === 0) return res.send({ valid: true });
      res.send({ valid: false, conflict: conflictList });
    } catch (err) {
      res.send(err);
    }
  });

  app.route('/api/solve').post((req, res) => {
    try {
      const puzzle = req.body.puzzle;
      if (puzzle === undefined) {
        return res.send({ error: 'Required field missing' });
      }
      if (solver.validate(puzzle) !== true) {
        return res.send({ error: solver.validate(puzzle) });
      }
      const solution = solver.solve(puzzle);
      if (solution === 'unsolvable') {
        return res.send({ error: 'Puzzle cannot be solved' });
      }
      return res.send({ solution: solution });
    } catch (err) {
      res.send(err);
    }
  });
};
