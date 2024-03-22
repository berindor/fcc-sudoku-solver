'use strict';

const SudokuSolver = require('../controllers/sudoku-solver.js');

module.exports = function (app) {
  let solver = new SudokuSolver();

  app.route('/api/check').post((req, res) => {});

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
