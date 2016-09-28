warplog
==================

Applies mutations to state; keeps previous states around.

You pass it states and mutation objects: objects with names, a `canMutateState` function, and `mutate` function. It uses `canMutateState` to decide if it can be used on the state, then passes the state to the `mutate` function. Then, it logs a copy of the state after that and passes back that new state. Everything is async.

Installation
------------

    npm install warplog

Usage
-----

    var Warplog = require('warplog');
    var warplog = Warplog();

    var initialState = {
      colors: [
        'FF0000',
        '00FF00',
        '0000FF'
      ],
      widths: [
        100,
        120,
        70
      ]
    };

    var darken = {
      name: 'darken',
      canMutateState: function canMutateState(state, done) {
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
        callNextTick(done, null, state.widths && state.widths.length > 0);
      },
      mutate: function thinState(state, done) {
        state.thin = state.widths.map((width) => width > 20 ? width - 20 : 0);
        callNextTick(done, null, state);
      }
    };

    warplog.mutate(initialState, darken, applyThin);

    function applyThin(error, state) {
      if (error) {
        console.error(error);
      }
      else {
        console.log(state);
        // Output:
        // {
        //   colors: [
        //     { b: 0, g: 0, opacity: 1, r: 178.5 },
        //     { b: 0, g: 178.5, opacity: 1, r: 0 },
        //     { b: 178.5, g: 0, opacity: 1, r: 0 }
        //   ],
        //   widths: [
        //     100,
        //     120,
        //     70
        //   ]
        // }
        warplog.mutate(state, thin, logStates);
      }
    }

    function logStates(error, state) {
      if (error) {
        console.error(error);
      }
      else {
        console.log(warplog.getLog());
        // Output:
        // [
        //   {
        //     mutation: undefined,
        //     state: {
        //       colors: [
        //         '#FF0000',
        //         '#00FF00',
        //         '#0000FF'
        //       ],
        //       widths: [
        //         100,
        //         120,
        //         70
        //       ]
        //     }
        //   },
        //   {
        //     mutation: 'darken',
        //     state: {
        //       colors: [
        //         { b: 0, g: 0, opacity: 1, r: 178.5 },
        //         { b: 0, g: 178.5, opacity: 1, r: 0 },
        //         { b: 178.5, g: 0, opacity: 1, r: 0 }
        //       ],
        //       widths: [
        //         100,
        //         120,
        //         70
        //       ]          
        //     }
        //   },
        //   {
        //     mutation: 'thin',
        //     state: {
        //       colors: [
        //         { b: 0, g: 0, opacity: 1, r: 178.5 },
        //         { b: 0, g: 178.5, opacity: 1, r: 0 },
        //         { b: 178.5, g: 0, opacity: 1, r: 0 }
        //       ],
        //       widths: [
        //         80,
        //         100,
        //         50
        //       ]
        //     }
        //   }
        // ]
      }
    }

Tests
-----

Run tests with `make test`.

License
-------

The MIT License (MIT)

Copyright (c) 2016 Jim Kang

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
