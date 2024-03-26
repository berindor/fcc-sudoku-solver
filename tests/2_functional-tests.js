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
    test('missing puzzle string => {error: Required field missing}', function (done) {
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
    test('puzzle string with invalid characters => {error: Invalid characters in puzzle}', function (done) {
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
    test('puzzle string with invalid length => {error: Expected puzzle to be 81 characters long}', function (done) {
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
    test('puzzle that cannot be solved => {error: Puzzle cannot be solved}', function (done) {
      //conflict with itself:
      const unsolvablePuzzle1 = '6.9..5.1.85.4....2432......1...69.83.9.....6.62.71...9......1945....4.37.4.3..6..';
      chai
        .request(server)
        .post('/api/solve')
        .send({ puzzle: unsolvablePuzzle1 })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.deepEqual(res.body, { error: 'Puzzle cannot be solved' }, 'puzzle has conflict with itself');
        });
      //not easily solvable, but in fact unsolvable
      const unsolvablePuzzle2 = '..9..5.1.85.4.1..2432......1...69.83.9.....6.62.71...9......1945....4.37.4.3..6..';
      chai
        .request(server)
        .post('/api/solve')
        .send({ puzzle: unsolvablePuzzle2 })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.deepEqual(res.body, { error: 'Puzzle cannot be solved' }, 'unsolvable puzzle');
          done();
        });
    });
  });

  suite('POST to /api/check', function () {
    const validPuzzle = puzzleStrings[0][0];
    test('all input valid, no conflict => {valid: true}', function (done) {
      chai
        .request(server)
        .post('/api/check')
        .send({ puzzle: validPuzzle, coordinate: 'D4', value: '4' })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.deepEqual(res.body, { valid: true });
          done();
        });
    });
    test('conflict with region => {valid: false, conflict: [region]}', function (done) {
      chai
        .request(server)
        .post('/api/check')
        .send({ puzzle: validPuzzle, coordinate: 'D4', value: '2' })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.deepEqual(res.body, { valid: false, conflict: ['region'] });
          done();
        });
    });
    test('conflict with region and column => {valid: false, conflict: [column, region]}', function (done) {
      chai
        .request(server)
        .post('/api/check')
        .send({ puzzle: validPuzzle, coordinate: 'D4', value: '6' })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.deepEqual(res.body, { valid: false, conflict: ['column', 'region'] });
          done();
        });
    });
    test('conflict with all placement => {valid: false, conflict: [row, column, region]}', function (done) {
      chai
        .request(server)
        .post('/api/check')
        .send({ puzzle: validPuzzle, coordinate: 'D4', value: '1' })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.deepEqual(res.body, { valid: false, conflict: ['row', 'column', 'region'] });
          done();
        });
    });
    test('missing required fields => {error: Required field(s) missing}', function (done) {
      chai
        .request(server)
        .post('/api/check')
        .send({ coordinate: 'D4', value: '4' })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.deepEqual(res.body, { error: 'Required field(s) missing' }, 'missing puzzle');
        });
      chai
        .request(server)
        .post('/api/check')
        .send({ puzzle: validPuzzle, value: '4' })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.deepEqual(res.body, { error: 'Required field(s) missing' }, 'missing coordinate');
        });
      chai
        .request(server)
        .post('/api/check')
        .send({ puzzle: validPuzzle, coordinate: 'D4' })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.deepEqual(res.body, { error: 'Required field(s) missing' }, 'missing value');
          done();
        });
    });
    test('invalid characters in puzzle => {error: Invalid characters in puzzle}', function (done) {
      const invalidPuzzle = puzzleStrings[0][0].slice(5) + 'ab/..';
      chai
        .request(server)
        .post('/api/check')
        .send({ puzzle: invalidPuzzle, coordinate: 'D4', value: '4' })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.deepEqual(res.body, { error: 'Invalid characters in puzzle' });
          done();
        });
    });
    test('incorrect length of puzzle => {error: Expected puzzle to be 81 characters long}', function (done) {
      const shortPuzzle = puzzleStrings[0][0].slice(5);
      const longPuzzle = puzzleStrings[0][0] + '56..';
      chai
        .request(server)
        .post('/api/check')
        .send({ puzzle: shortPuzzle, coordinate: 'D4', value: '4' })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.deepEqual(res.body, { error: 'Expected puzzle to be 81 characters long' }, 'error when puzzle is short');
        });
      chai
        .request(server)
        .post('/api/check')
        .send({ puzzle: longPuzzle, coordinate: 'D4', value: '4' })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.deepEqual(res.body, { error: 'Expected puzzle to be 81 characters long' }, 'error when puzzle is long');
          done();
        });
    });
    test('invalid placement coordinate => {error: Invalid coordinate}', function (done) {
      chai
        .request(server)
        .post('/api/check')
        .send({ puzzle: validPuzzle, coordinate: 'K4', value: '4' })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.deepEqual(res.body, { error: 'Invalid coordinate' }, 'invalid row coordinate');
        });
      chai
        .request(server)
        .post('/api/check')
        .send({ puzzle: validPuzzle, coordinate: 'D10', value: '4' })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.deepEqual(res.body, { error: 'Invalid coordinate' }, 'invalid column coordinate');
          done();
        });
    });
    test('invalid placement value => {error: Invalid value}', function (done) {
      chai
        .request(server)
        .post('/api/check')
        .send({ puzzle: validPuzzle, coordinate: 'D4', value: '10' })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.deepEqual(res.body, { error: 'Invalid value' }, 'invalid value 10');
        });
      chai
        .request(server)
        .post('/api/check')
        .send({ puzzle: validPuzzle, coordinate: 'D4', value: 'a' })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.deepEqual(res.body, { error: 'Invalid value' }, 'invalid value "a"');
          done();
        });
    });
  });
});
