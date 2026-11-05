(() => {
  const { pickRandomDoor, pickHostDoor, pickSwitchDoor } = MontyHall;

  const Phase = Object.freeze({ PICK: 'pick', DECIDE: 'decide', RESULT: 'result' });
  const PHASE_ORDER = [Phase.PICK, Phase.DECIDE, Phase.RESULT];

  const root = document.getElementById('gameRoot');
  const doors = [...root.querySelectorAll('.door')];
  const slotTags = [...root.querySelectorAll('.door-slot__tag')];
  const stepItems = [...root.querySelectorAll('.stepper__item')];
  const statusEl = document.getElementById('status');
  const switchBtn = document.getElementById('switch');
  const stayBtn = document.getElementById('stay');
  const nextBtn = document.getElementById('next');
  const resetBtn = document.getElementById('reset');
  const gamesEl = document.getElementById('games');
  const winsEl = document.getElementById('wins');
  const rateEl = document.getElementById('rate');
  const meters = {
    switch: { tally: document.getElementById('switchTally'), fill: document.getElementById('switchMeter') },
    stay: { tally: document.getElementById('stayTally'), fill: document.getElementById('stayMeter') },
  };

  const createTally = () => ({ switch: { games: 0, wins: 0 }, stay: { games: 0, wins: 0 } });

  const state = {
    phase: Phase.PICK,
    prize: null,
    choice: null,
    opened: null,
    finalChoice: null,
    switched: false,
    tally: createTally(),
  };

  const doorName = (index) => `дверь ${index + 1}`;
  const hasWon = () => state.finalChoice === state.prize;

  function startRound() {
    Object.assign(state, {
      phase: Phase.PICK,
      prize: pickRandomDoor(),
      choice: null,
      opened: null,
      finalChoice: null,
      switched: false,
    });
    render();
  }

  function pickDoor(index) {
    if (state.phase !== Phase.PICK) return;

    state.choice = index;
    state.opened = pickHostDoor(state.prize, state.choice);
    state.phase = Phase.DECIDE;
    render();
    switchBtn.focus();
  }

  function finishRound(shouldSwitch) {
    if (state.phase !== Phase.DECIDE) return;

    state.switched = shouldSwitch;
    state.finalChoice = shouldSwitch ? pickSwitchDoor(state.choice, state.opened) : state.choice;
    state.phase = Phase.RESULT;

    const entry = state.tally[shouldSwitch ? 'switch' : 'stay'];
    entry.games++;
    if (hasWon()) entry.wins++;

    render();
    nextBtn.focus();
  }

  function resetStats() {
    state.tally = createTally();
    startRound();
  }

  function doorTag(index) {
    if (state.phase === Phase.PICK) return '';
    if (state.phase === Phase.DECIDE) {
      if (index === state.choice) return 'Твой выбор';
      return index === state.opened ? 'Открыл ведущий' : '';
    }
    if (index === state.finalChoice) return 'Итоговый выбор';
    if (index === state.opened) return 'Открыл ведущий';
    return state.switched && index === state.choice ? 'Первый выбор' : '';
  }

  function renderDoors() {
    const isResult = state.phase === Phase.RESULT;

    doors.forEach((door, index) => {
      const isPrize = index === state.prize;
      const isOpen = isResult || index === state.opened;
      const isSelected = isResult ? index === state.finalChoice : index === state.choice;
      const content = isPrize ? 'car' : 'goat';

      door.disabled = state.phase !== Phase.PICK;
      door.classList.toggle('is-open', isOpen);
      door.classList.toggle('is-selected', isSelected);
      door.dataset.content = content;
      door.dataset.outcome = isResult && isSelected ? (hasWon() ? 'win' : 'lose') : '';

      door.querySelector('use').setAttribute('href', isPrize ? '#icon-car' : '#icon-goat');
      door.querySelector('.door__caption').textContent = isPrize ? 'Автомобиль' : 'Коза';
      door.setAttribute(
        'aria-label',
        `Дверь ${index + 1}${isOpen ? `, открыта: ${isPrize ? 'автомобиль' : 'коза'}` : ', закрыта'}`,
      );

      slotTags[index].textContent = doorTag(index);
    });
  }

  function renderStepper() {
    const current = PHASE_ORDER.indexOf(state.phase);

    stepItems.forEach((item, index) => {
      const stepState = index < current ? 'done' : index === current ? 'current' : 'todo';
      item.dataset.state = stepState;
      if (stepState === 'current') {
        item.setAttribute('aria-current', 'step');
      } else {
        item.removeAttribute('aria-current');
      }
    });
  }

  function statusMessage() {
    if (state.phase === Phase.PICK) {
      return 'Шаг 1. Выбери одну из трёх дверей.';
    }

    if (state.phase === Phase.DECIDE) {
      return `Ты выбрал ${doorName(state.choice)}. Ведущий открыл ${doorName(state.opened)}: там коза. Оставить выбор или поменять дверь?`;
    }

    const action = state.switched ? 'Ты поменял дверь' : 'Ты оставил выбор';
    const outcome = hasWon() ? ' и выиграл автомобиль!' : ', но за дверью оказалась коза.';
    return `${action}${outcome} Приз был за дверью ${state.prize + 1}.`;
  }

  function renderControls() {
    switchBtn.hidden = stayBtn.hidden = state.phase !== Phase.DECIDE;
    nextBtn.hidden = state.phase !== Phase.RESULT;
  }

  function renderStats() {
    const { switch: switching, stay } = state.tally;
    const games = switching.games + stay.games;
    const wins = switching.wins + stay.wins;

    gamesEl.textContent = Format.integer(games);
    winsEl.textContent = Format.integer(wins);
    rateEl.textContent = games ? Format.percent((wins / games) * 100) : '—';

    Object.entries({ switch: switching, stay }).forEach(([key, entry]) => {
      const rate = entry.games ? (entry.wins / entry.games) * 100 : 0;
      meters[key].tally.textContent = entry.games
        ? `${Format.percent(rate)} · ${entry.wins} из ${entry.games}`
        : '—';
      meters[key].fill.style.setProperty('--value', `${rate}%`);
    });
  }

  function render() {
    renderDoors();
    renderStepper();
    renderControls();
    renderStats();
    statusEl.textContent = statusMessage();
  }

  doors.forEach((door, index) => door.addEventListener('click', () => pickDoor(index)));
  switchBtn.addEventListener('click', () => finishRound(true));
  stayBtn.addEventListener('click', () => finishRound(false));
  nextBtn.addEventListener('click', startRound);
  resetBtn.addEventListener('click', resetStats);

  startRound();
})();
