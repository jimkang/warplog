var cloneDeep = require('lodash.clonedeep');

function Warplog() {
  var log = [];

  return {
    mutate: mutate,
    getLog: getLog
  };

  function mutate(state, mutation, done) {
    if (log.length === 0) {
      log.push({
        mutation: undefined,
        state: cloneDeep(state)
      });
    }

    mutation.canMutateState(state, decide);

    function decide(error, canMutate) {
      if (error) {
        done(error);
      }
      else if (!canMutate) {
        // Do nothing.
        done(null, state);
      }
      else {
        mutation.mutate(state, logMutation);
      }
    }

    function logMutation(error, newState) {
      if (error) {
        done(error);
      }
      else {
        log.push({
          mutation: mutation.name,
          state: cloneDeep(newState)
        });
        done(null, newState);
      }
    }
  }

  function getLog() {
    return log;
  }
}

module.exports = Warplog;
