(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) {
    module.exports = api;
  } else {
    root.MontyHall = api;
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  const DOORS = Object.freeze([0, 1, 2]);

  const randomIndex = (length, rng) => Math.floor(rng() * length);

  function pickRandomDoor(rng = Math.random) {
    return DOORS[randomIndex(DOORS.length, rng)];
  }

  function pickHostDoor(prize, choice, rng = Math.random) {
    const candidates = DOORS.filter((door) => door !== choice && door !== prize);
    return candidates[randomIndex(candidates.length, rng)];
  }

  function pickSwitchDoor(choice, opened) {
    return DOORS.find((door) => door !== choice && door !== opened);
  }

  function playRound(strategy, rng = Math.random) {
    const prize = pickRandomDoor(rng);
    const choice = pickRandomDoor(rng);
    const opened = pickHostDoor(prize, choice, rng);
    const finalChoice = strategy === 'switch' ? pickSwitchDoor(choice, opened) : choice;

    return { prize, choice, opened, finalChoice, won: finalChoice === prize };
  }

  return { DOORS, pickRandomDoor, pickHostDoor, pickSwitchDoor, playRound };
});
