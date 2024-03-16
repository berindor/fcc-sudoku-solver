const chai = require('chai');
const assert = chai.assert;

const Solver = require('../controllers/sudoku-solver.js');
let solver = new Solver();

const { puzzlesAndSolutions: puzzleStrings } = require('../controllers/puzzle-strings');

suite('Unit Tests', () => {
  const validPuzzle = puzzleStrings[0][0];
  suite('Validate input', () => {
    test('input puzzle is 81 characters long with valid characters => true', () => {
      assert.isOk(solver.validate(validPuzzle));
    });
    test('input puzzle consists only valid characters 1-9 and . => "Invalid characters in puzzle"', () => {
      const invalidPuzzle = puzzleStrings[0][0].slice(5) + 'ab/..';
      assert.equal(solver.validate(invalidPuzzle), 'Invalid characters in puzzle');
    });
    test('input puzzle is not 81 characters long => "Expected puzzle to be 81 characters long"', () => {
      const shortPuzzle = puzzleStrings[0][0].slice(5);
      assert.equal(solver.validate(shortPuzzle), 'Expected puzzle to be 81 characters long');
    });
    test('invalid coordinate => "invalid coordinate"', () => {
      assert.deepInclude(solver.validateInput('K', 2, 3), { error: 'invalid coordinate' });
      assert.deepInclude(solver.validateInput('A', 10, 3), { error: 'invalid coordinate' });
    });
    test('invalid value => "invalid value"', () => {
      assert.deepInclude(solver.validateInput('A', 2, 'b'), { error: 'invalid value' });
    });
  });
  suite('Check row', () => {
    test('no conflict in row => true', () => {
      assert.equal(solver.checkRowPlacement(validPuzzle, 'G', 5, 6), true);
    });
    test('conflict in row => false', () => {
      assert.equal(solver.checkRowPlacement(validPuzzle, 'G', 5, 1), false);
    });
  });
  suite('Check column', () => {
    test('no conflict in column => true', () => {
      assert.equal(solver.checkColPlacement(validPuzzle, 'G', 5, 8), true);
    });
    test('conflict in column => false', () => {
      assert.equal(solver.checkColPlacement(validPuzzle, 'G', 5, 3), false);
    });
  });
  suite('Check region', () => {
    test('no conflict in region => true', () => {
      assert.equal(solver.checkRegionPlacement(validPuzzle, 'G', 5, 3), true);
    });
    test('conflict in region => false', () => {
      assert.equal(solver.checkRegionPlacement(validPuzzle, 'G', 5, 6), false);
    });
    test('no conflict in region on a place where not . stands => true', () => {
      assert.equal(solver.checkRegionPlacement(validPuzzle, 'G', 6, 3), true);
    });
  });
});
