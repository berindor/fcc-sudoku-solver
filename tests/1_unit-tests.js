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
    test('invalid coordinate => "Invalid coordinate"', () => {
      assert.deepInclude(solver.validateInput('K', 2, 3), { error: 'Invalid coordinate' });
      assert.deepInclude(solver.validateInput('A', 10, 3), { error: 'Invalid coordinate' });
    });
    test('invalid value => "Invalid value"', () => {
      assert.deepInclude(solver.validateInput('A', 2, 'b'), { error: 'Invalid value' });
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
      assert.equal(solver.checkColPlacement(validPuzzle, 'G', 5, 3), false), 'value 3 in G5';
      assert.equal(solver.checkColPlacement(validPuzzle, 'D', 4, 6), false, 'value 6 in D4');
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
      assert.equal(solver.solve(easyPuzzle), puzzleStrings[0][1], 'easy puzzle');
    });
    test('valid puzzle => solution', () => {
      assert.equal(solver.solve(puzzleStrings[0][0]), puzzleStrings[0][1], 'puzzle 0');
      assert.equal(solver.solve(puzzleStrings[1][0]), puzzleStrings[1][1], 'puzzle 1');
      assert.equal(solver.solve(puzzleStrings[2][0]), puzzleStrings[2][1], 'puzzle 2');
      assert.equal(solver.solve(puzzleStrings[3][0]), puzzleStrings[3][1], 'puzzle 3');
      assert.equal(solver.solve(puzzleStrings[4][0]), puzzleStrings[4][1], 'puzzle 4');
      //puzzle with solution foundable in many steps:
      const notEasyPuzzle = '123456789........................................................................';
      assert.equal(
        solver.solve(notEasyPuzzle),
        '123456789456789123789123456214365897365897214897214365531642978642978531978531642',
        'not easy puzzle'
      );
      //underdefined puzzle
      const underdefPuzzle = '9................................................................................';
      assert.equal(
        solver.solve(underdefPuzzle),
        '912345678345678129678129345123456897456897213789213456237561984561984732894732561',
        'underdefined puzzle'
      );
    });
    test('unsolvable puzzle => unsolvable', () => {
      //conflict with itself:
      const unsolvablePuzzle1 = '6.9..5.1.85.4....2432......1...69.83.9.....6.62.71...9......1945....4.37.4.3..6..';
      assert.equal(solver.solve(unsolvablePuzzle1), 'unsolvable', 'unsolvable puzzle 1');
      //not easily solvable, but in fact unsolvable
      const unsolvablePuzzle2 = '..9..5.1.85.4.1..2432......1...69.83.9.....6.62.71...9......1945....4.37.4.3..6..';
      assert.equal(solver.solve(unsolvablePuzzle2), 'unsolvable', 'unsolvable puzzle 1');
    });
  });
});
