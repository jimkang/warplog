var test = require('tape');
var Warplog = require('../index');
var callNextTick = require('call-next-tick');
var assertNoError = require('assert-no-error');
var d3Color = require('d3-color').color;

test('Basic test', basicTest);

function basicTest(t) {
  var warplog = Warplog();
  var darkenCanMutateStateCalls = 0;
  var thinCanMutateStateCalls = 0;
  var limitCanMutateStateCalls = 0;

  var darken = {
    name: 'darken',
    canMutateState: function canMutateState(state, done) {
      darkenCanMutateStateCalls += 1;
      callNextTick(done, null, state.colors && state.colors.length > 0);
    },
    mutate: function darkenState(state, done) {
      state.colors = state.colors.map((clr) => d3Color(clr).darker());
      callNextTick(done, null, state);
    }
  };

  var thin = {
    name: 'thin',
    canMutateState: function canMutateState(state, done) {
      thinCanMutateStateCalls += 1;
      callNextTick(done, null, state.widths && state.widths.length > 0);
    },
    mutate: function thinState(state, done) {
      state.widths = state.widths.map((width) => width > 20 ? width - 20 : 0);
      callNextTick(done, null, state);
    }
  };

  var limitTo10 = {
    name: 'limitTo10',
    canMutateState: function canMutateState(state, done) {
      limitCanMutateStateCalls += 1;
      callNextTick(done, null, state.widths && state.widths.length > 10);
    },
    mutate: function thinState(state, done) {
      state.widths = state.widths.slice(0, 10);
      callNextTick(done, null, state);
    }
  }

  var initialState = {
    colors: [
      '#FF0000',
      '#00FF00',
      '#0000FF'
    ],
    widths: [
      100,
      120,
      70
    ]
  };

  warplog.mutate(initialState, darken, checkDarken);

  function checkDarken(error, state) {
    assertNoError(t.ok, error, 'No error when applying darken mutation.');
    t.deepEqual(
      state,
      {
        colors: [
          { b: 0, g: 0, opacity: 1, r: 178.5 },
          { b: 0, g: 178.5, opacity: 1, r: 0 },
          { b: 178.5, g: 0, opacity: 1, r: 0 }
        ],
        widths: [
          100,
          120,
          70
        ]
      },
      'State is correct after darken mutation is applied.'
    );

    warplog.mutate(state, limitTo10, checkLimitTo10);
  }


  function checkLimitTo10(error, state) {
    assertNoError(t.ok, error, 'No error when applying limitTo10 mutation.');
    t.deepEqual(
      state,
      {
        colors: [
          { b: 0, g: 0, opacity: 1, r: 178.5 },
          { b: 0, g: 178.5, opacity: 1, r: 0 },
          { b: 178.5, g: 0, opacity: 1, r: 0 }
        ],
        widths: [
          100,
          120,
          70
        ]
      },
      'State did not change after limitTo10 mutation was tried.'
    );

    warplog.mutate(state, thin, checkThin);
  }  

  function checkThin(error, state) {
    assertNoError(t.ok, error, 'No error when applying thin mutation.');
    t.deepEqual(
      state,
      {
        colors: [
          { b: 0, g: 0, opacity: 1, r: 178.5 },
          { b: 0, g: 178.5, opacity: 1, r: 0 },
          { b: 178.5, g: 0, opacity: 1, r: 0 }
        ],
        widths: [
          80,
          100,
          50
        ]
      },
      'State is correct after thin is applied.'
    );

    t.deepEqual(
      warplog.getLog(),
      [
        {
          mutation: undefined,
          state: {
            colors: [
              '#FF0000',
              '#00FF00',
              '#0000FF'
            ],
            widths: [
              100,
              120,
              70
            ]
          }
        },
        {
          mutation: 'darken',
          state: {
            colors: [
              { b: 0, g: 0, opacity: 1, r: 178.5 },
              { b: 0, g: 178.5, opacity: 1, r: 0 },
              { b: 178.5, g: 0, opacity: 1, r: 0 }
            ],
            widths: [
              100,
              120,
              70
            ]          
          }
        },
        {
          mutation: 'thin',
          state: {
            colors: [
              { b: 0, g: 0, opacity: 1, r: 178.5 },
              { b: 0, g: 178.5, opacity: 1, r: 0 },
              { b: 178.5, g: 0, opacity: 1, r: 0 }
            ],
            widths: [
              80,
              100,
              50
            ]
          }
        }
      ],
      'Warplog states are all correct.'
    );
    t.equal(darkenCanMutateStateCalls, 1, 'darken\'s canMutateState called.');
    t.equal(thinCanMutateStateCalls, 1, 'thin\'s canMutateState called.');
    t.equal(limitCanMutateStateCalls, 1, 'limitTo10\'s canMutateState called.');
    t.end();
  }
}
