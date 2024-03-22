const chai = require('chai');
const chaiHttp = require('chai-http');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

const { puzzlesAndSolutions: puzzleStrings } = require('../controllers/puzzle-strings');

suite('Functional Tests', () => {
  suite('POST to /api/solve', function () {
    test('valid puzzle string => solution', function (done) {
      const [puzzle, solution] = puzzleStrings[0];
      chai
        .request(server)
        .post('/api/solve')
        .send({ puzzle: puzzle })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.deepEqual(res.body, { solution: solution });
          done();
        });
    });
    test('missing puzzle string => error: Required field missing', function (done) {
      chai
        .request(server)
        .post('/api/solve')
        .send({})
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.deepEqual(res.body, { error: 'Required field missing' });
          done();
        });
    });
    test('puzzle string with invalid characters => error: Invalid characters in puzzle', function (done) {
      const invalidPuzzle = puzzleStrings[0][0].slice(5) + 'ab/..';
      chai
        .request(server)
        .post('/api/solve')
        .send({ puzzle: invalidPuzzle })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.deepEqual(res.body, { error: 'Invalid characters in puzzle' });
          done();
        });
    });
    test('puzzle string with invalid length => error: Expected puzzle to be 81 characters long', function (done) {
      const shortPuzzle = puzzleStrings[0][0].slice(5);
      const longPuzzle = puzzleStrings[0][0] + '56..';
      chai
        .request(server)
        .post('/api/solve')
        .send({ puzzle: shortPuzzle })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.deepEqual(res.body, { error: 'Expected puzzle to be 81 characters long' }, 'error when puzzle is short');
        });
      chai
        .request(server)
        .post('/api/solve')
        .send({ puzzle: longPuzzle })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.deepEqual(res.body, { error: 'Expected puzzle to be 81 characters long' }, 'error when puzzle is long');
          done();
        });
    });
    test('puzzle that cannot be solved => error: Puzzle cannot be solved', function (done) {
      //conflict with itself:
      const unsolvablePuzzle = '6.9..5.1.85.4....2432......1...69.83.9.....6.62.71...9......1945....4.37.4.3..6..';
      //not easily solvable, but in fact unsolvable
      //const unsolvablePuzzle = '..9..5.1.85.4.1..2432......1...69.83.9.....6.62.71...9......1945....4.37.4.3..6..';
      chai
        .request(server)
        .post('/api/solve')
        .send({ puzzle: unsolvablePuzzle })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.deepEqual(res.body, { error: 'Puzzle cannot be solved' });
          done();
        });
    });
  });
});
