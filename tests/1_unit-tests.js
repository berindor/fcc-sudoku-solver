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
  suite('Puzzle solver', () => {
    test('invalid puzzle string => false', () => {
      assert.equal(solver.solve('...2345'), false);
      //add more cases? e.g. unsolvable puzzles?
    });
    test("valid puzzle with few .'s => solution", () => {
      const easyPuzzle = '...........' + puzzleStrings[0][1].slice(11);
      assert.equal(solver.solve(easyPuzzle), puzzleStrings[0][1], 'puzzle 0 solved');
    });
    test('valid puzzle => solution', () => {
      assert.equal(solver.solve(puzzleStrings[0][0]), puzzleStrings[0][1], 'puzzle 0 solved');
      assert.equal(solver.solve(puzzleStrings[1][0]), puzzleStrings[1][1], 'puzzle 1 solved');
      assert.equal(solver.solve(puzzleStrings[2][0]), puzzleStrings[2][1], 'puzzle 2 solved');
      assert.equal(solver.solve(puzzleStrings[3][0]), puzzleStrings[3][1], 'puzzle 3 solved');
      assert.equal(solver.solve(puzzleStrings[4][0]), puzzleStrings[4][1], 'puzzle 4 solved');
      //add more cases? puzzles where separate cases needed to be checked
      //no example provided for this :(
    });
  });
});
