const RENDER_DELAY = 50;

const gameUpdates = [];
let gameStart = 0;
let firstServerTimestamp = 0;

function initState() {
  gameStart = 0;
  firstServerTimestamp = 0;
}

function processGameUpdate(update) {
  if (!firstServerTimestamp) {
    firstServerTimestamp = update.t;
    gameStart = Date.now();
  }
  gameUpdates.push(update);

  // Keep only one game update before the current server time
  const base = getBaseUpdate();
  if (base > 0) {
    gameUpdates.splice(0, base);
  }
}

function currentServerTime() {
  // actually Client Render Time
  return firstServerTimestamp + (Date.now() - gameStart) - RENDER_DELAY;
}

// Returns the index of the base update, the first game update before
// current server time, or -1 if N/A.
function getBaseUpdate() {
  const serverTime = currentServerTime();
  for (let i = gameUpdates.length - 1; i >= 0; i--) {
    if (gameUpdates[i].t <= serverTime) {
      return i;
    }
  }
  return -1;
}

function getCurrentState() {
  if (!firstServerTimestamp) {
      //console.log(`we haven't gotten any updates yet`);
    return {};
  }

  const base = getBaseUpdate();
  const serverTime = currentServerTime();
  //console.log(base);
  // If base is the most recent update we have, use its state.
  // Else, interpolate between its state and the state of (base + 1).
  if (base < 0) {
    return gameUpdates[gameUpdates.length - 1];
  } else if (base === gameUpdates.length - 1) {
    return gameUpdates[base];
  } else {
    //interpolate if you want. Could be useful if we display decaying cells
    // const baseUpdate = gameUpdates[base];
    // const next = gameUpdates[base + 1];
    // const r = (serverTime - baseUpdate.t) / (next.t - baseUpdate.t);
    // return {
    //   me: interpolateObject(baseUpdate.me, next.me, r),
    //   others: interpolateObjectArray(baseUpdate.others, next.others, r),
    //   bullets: interpolateObjectArray(baseUpdate.bullets, next.bullets, r),
    // };
    return gameUpdates[base];
  }
}
