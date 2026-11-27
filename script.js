'use strict';

(() => {
  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => [...root.querySelectorAll(s)];
  const C = { green: '#ededee', blue: '#b9c5d4', amber: '#cbbca7', coral: '#c7b0ab', muted: '#a5a5aa', line: '#3e3e3e', bg: '#0c0c0d' };
  const durations = [2, 10, 30, 120, 600];
  const timing = ['00:00 - 00:50', '00:50 - 01:40', '01:40 - 02:30', '02:30 - 03:25', '03:25 - 04:20', '04:20 - 05:30', '05:30 - 06:25', '06:25 - 07:15', '07:15 - 08:00'];
  const slideEls = $$('.slide');
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const state = { slide: 0, room: 'occupied', filter: 'coordinated', activity: 'empty', history: 2, comparison: 2, paused: reduceMotion.matches, time: 0, nextSceneAt: Infinity, activityStartedAt: 0 };
  const svg = (content, viewBox = '0 0 1000 340') => `<svg viewBox="${viewBox}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${content}</svg>`;
  const text = (x, y, str, cls = '', anchor = 'start') => `<text x="${x}" y="${y}" class="${cls}" text-anchor="${anchor}">${str}</text>`;
  const person = (x, y, scale = 1, seated = false, extra = '') => `<g class="person ${extra}" transform="translate(${x} ${y}) scale(${scale})"><circle class="head" cy="-30" r="8"/><path class="body" d="${seated ? 'M0 -15V7H20V30M0 7H-15V28M-2 -8L17 0' : 'M0 -15V12M0 12L-14 36M0 12L14 36M0 -8L-16 7M0 -8L16 7'}"/>${seated ? '<path d="M-14 -6V19H15M-14 19V35" stroke="#7f7f7f" stroke-width="2" fill="none"/>' : ''}</g>`;
  const router = (x, y, scale = 1) => `<g transform="translate(${x} ${y}) scale(${scale})"><rect x="-24" y="-9" width="48" height="21" rx="5" fill="#333333" stroke="#9e9e9e"/><path d="M-15 -9V-27M15 -9V-27" stroke="#ededee" stroke-width="2.5" stroke-linecap="round"/><circle cx="-12" cy="2" r="2" fill="#ededee"/><circle cx="-3" cy="2" r="2" fill="#ededee"/><path d="M-10 -37Q0 -44 10 -37M-17 -46Q0 -58 17 -46" fill="none" stroke="#ededee" stroke-width="1.4" opacity=".65"/></g>`;
  const receiver = (x, y, color = C.blue, scale = 1) => `<g transform="translate(${x} ${y}) scale(${scale})"><rect x="-19" y="-25" width="38" height="47" rx="7" fill="#262626" stroke="${color}" stroke-width="1.5"/><path d="M-12 12H12M-8 -11Q0 -18 8 -11M-4 -5Q0 -8 4 -5" stroke="${color}" fill="none" stroke-width="1.5"/><circle cy="1" r="1.8" fill="${color}"/></g>`;
  const eye = (x, y, color = C.amber, scale = 1) => `<g transform="translate(${x} ${y}) scale(${scale})"><path d="M-26 0Q0 -29 26 0Q0 29 -26 0Z" fill="#222222" stroke="${color}" stroke-width="1.5"/><circle r="8" fill="none" stroke="${color}" stroke-width="1.5"/><circle r="2" fill="${color}"/></g>`;
  const key = (x, y, scale = 1, color = C.green) => `<g transform="translate(${x} ${y}) scale(${scale})"><circle cx="-8" r="8" stroke="${color}" stroke-width="2" fill="none"/><path d="M0 0H23M16 0V7M22 0V5" stroke="${color}" stroke-width="2" fill="none"/></g>`;
  const shield = (x, y, scale = 1) => `<g transform="translate(${x} ${y}) scale(${scale})"><path d="M0 -26L22 -17V1Q22 18 0 30Q-22 18 -22 1V-17Z" fill="none" stroke="${C.green}" stroke-width="1.5"/><path d="M-9 0L-2 7L11 -8" fill="none" stroke="${C.green}" stroke-width="2"/></g>`;
  const trace = (id, x, y, width, height, kind = 'physical', cls = '') => `<path id="${id}" data-trace="${kind}" data-x="${x}" data-y="${y}" data-w="${width}" data-h="${height}" class="trace ${cls}"/>`;
  const dot = (cx, cy, r = 3, cls = 'particle') => `<circle cx="${cx}" cy="${cy}" r="${r}" class="${cls}"/>`;

  const scenes = {
    hook: () => svg(`
      <circle cx="230" cy="214" r="185" class="soft-ring"/><circle cx="230" cy="214" r="158" class="soft-ring second"/>
      <path d="M74 290V118L228 42L366 118V290" fill="#262626" stroke="#717171" stroke-width="1.6"/>
      <path d="M74 290H366" fill="none" stroke="#717171" stroke-width="1.6"/>
      <g id="hook-door">
        <rect x="191" y="214" width="69" height="76" rx="1" fill="#303030" stroke="#b6b6b6" stroke-width="1.5"/>
        <rect x="200" y="223" width="51" height="57" rx="1" fill="none" stroke="#555555" stroke-width=".8"/>
        <path d="M188 229H194M188 274H194" stroke="#b6b6b6" stroke-width="2"/>
        <circle cx="247" cy="252" r="2.4" fill="${C.green}"/>
        <path d="M247 260v4" stroke="${C.green}" stroke-width="1.2" stroke-linecap="round"/>
      </g>
      ${person(281, 205, .8)}${router(134, 192, .8)}
      <path class="signal-path" d="M153 182L226 93L344 164L416 232"/>
      <path class="signal-path faint" d="M153 192L286 210L416 232"/>
      ${eye(417, 232, C.amber, .8)}
      ${text(416, 274, 'PRESENCE?', 's-label', 'middle')}
      <g id="data-lock-badge" transform="translate(160 318)"><rect class="badge-outline" x="-80" y="-17" width="160" height="34" rx="17" fill="#303030" stroke="#676767"/><rect x="-61" y="-4" width="13" height="12" rx="2" fill="none" stroke="${C.green}"/><path d="M-58 -4V-8A4 4 0 0 1 -50 -8V-4" stroke="${C.green}" fill="none"/>${text(-35, 4, 'DATA LOCKED', 's-label s-accent')}</g>
      ${text(230, 382, 'WHAT PROTECTS THE ROOM?', 's-label', 'middle')}
    `, '0 0 480 430'),

    propagation: () => svg(`
      <rect x="225" y="36" width="540" height="225" rx="10" class="room-outline"/>
      <path d="M240 246H750M240 53H750" class="ghost-line"/>
      <rect x="578" y="174" width="112" height="60" rx="5" fill="#333333" stroke="#5c5c5c"/><path d="M594 234V246M672 234V246" stroke="#5c5c5c"/>
      <path class="signal-path faint" d="M145 158L490 52L850 158"/>
      <path class="signal-path" d="M145 158L480 238L850 158"/>
      <path class="signal-path blue" d="M145 158L503 146L850 158"/>
      <path class="signal-path faint" d="M145 158L705 55L850 158"/>
      ${router(120, 160, 1.2)}${receiver(880, 158, C.blue, 1.15)}
      <g id="propagation-person">${person(490, 153, 1.05)}</g>
      ${text(120, 221, 'TRANSMITTER', 's-label', 'middle')}${text(880, 221, 'RECEIVER', 's-label', 'middle')}
      <rect x="355" y="278" width="290" height="51" rx="7" fill="#1d1d1d" stroke="#454545"/>
      ${trace('room-trace', 370, 303, 260, 17, 'physical')}
      ${text(338, 307, 'CSI', 's-label', 'end')}
    `),

    history: () => svg(`
      <rect x="30" y="45" width="282" height="224" rx="10" fill="#1f1f1f" stroke="#484848"/>
      ${text(52, 76, 'A BRIEF LOOK', 's-label')}${text(52, 111, 'A few fragments.', 's-title')}
      ${Array.from({ length: 5 }, (_, i) => `<path d="M${65 + i * 43} 186l8 ${i % 2 ? '-15' : '17'}l9 -8l8 12" fill="none" stroke="${C.green}" stroke-width="2" opacity="${.3 + i * .1}"/>`).join('')}
      ${text(52, 242, '2 seconds', 's-small')}
      <path d="M328 151H365" stroke="#8b8b8b" stroke-width="1.5" stroke-dasharray="3 5"/>
      <rect x="384" y="45" width="586" height="224" rx="10" fill="#1f1f1f" stroke="#646464"/>
      ${text(407, 76, 'A LONGER HISTORY', 's-label')}${text(407, 111, 'More observations. A clearer answer?', 's-title')}
      <path d="M418 220H941" class="ghost-line"/>
      ${Array.from({ length: 26 }, (_, i) => `<g class="history-fragment" data-fragment="${i}">${dot(423 + i * 20, 180 + Math.sin(i * 1.2) * 18, 3)}<path d="M${423 + i * 20} 220V${183 + Math.sin(i * 1.2) * 18}" stroke="#686868" opacity=".45"/></g>`).join('')}
      ${text(407, 249, '2 seconds', 's-small')}<text id="history-duration" x="944" y="249" text-anchor="end" class="s-small s-accent">2 seconds</text>
      ${text(500, 314, 'OCCUPANCY LEAKAGE IS A QUESTION, NOT AN ASSUMED RESULT.', 's-label', 'middle')}
    `),

    filter: () => svg(`
      <path d="M123 151H215M315 151H411M585 151H652V76H811M652 151V247H811" class="signal-path"/>
      ${router(96, 152, 1.1)}${text(96, 211, 'TRANSMITTER', 's-label', 'middle')}
      <rect x="218" y="102" width="93" height="98" rx="12" fill="#353535" stroke="#aaaaaa"/>
      ${Array.from({ length: 4 }, (_, i) => `<rect class="filter-chip" x="${235 + i * 15}" y="${122 + i % 2 * 9}" width="7" height="${47 - i % 2 * 18}" rx="3" fill="${C.green}"/>`).join('')}
      ${text(265, 226, 'KEYED FILTER', 's-label s-accent', 'middle')}
      <rect x="414" y="47" width="171" height="209" rx="8" class="room-outline"/>
      ${person(500, 149, .9)}${text(500, 279, 'PHYSICAL ROOM', 's-label', 'middle')}
      ${receiver(852, 75, C.blue, 1)}${key(907, 46, .65, C.blue)}
      ${text(852, 122, 'AUTHORIZED', 's-label s-blue', 'middle')}${text(852, 143, 'Compensate with the key', 's-small', 'middle')}
      ${eye(852, 246, C.amber)}${text(852, 288, 'OBSERVER', 's-label s-amber', 'middle')}${text(852, 309, 'Sees the mixture', 's-small', 'middle')}
      ${trace('filter-schedule', 185, 296, 154, 15, 'schedule')}${text(265, 326, 'FILTER SCHEDULE', 's-label', 'middle')}
    `),

    experiment: () => svg(`
      <path class="signal-path faint" d="M131 148L454 46L864 87"/><path class="signal-path" d="M131 148L470 158L864 87"/><path class="signal-path faint" d="M131 148L630 239L864 237"/>
      <path d="M263 106V43H733V262H263V190" class="room-outline"/>
      <path d="M263 106L223 130V189L263 190" stroke="#909090" fill="#2d2d2d"/>
      <path d="M283 244H714" class="ghost-line"/>
      <rect x="603" y="177" width="76" height="54" rx="5" fill="#323232" stroke="#606060"/>
      ${router(103, 148, 1.1)}${text(103, 205, 'TRANSMITTER', 's-label', 'middle')}
      ${receiver(897, 86, C.blue)}${text(897, 134, 'AUTHORIZED', 's-label s-blue', 'middle')}
      ${eye(897, 236, C.amber)}${text(897, 278, 'OBSERVER', 's-label s-amber', 'middle')}
      <g class="activity-person" id="standing-person">${person(483, 151, 1.1)}</g>
      <g class="activity-person" id="seated-person">${person(483, 160, 1.1, true)}</g>
      <g id="experiment-fan" transform="translate(650 123)"><circle r="28" fill="#1d1d1d" stroke="#767676"/><g class="rotor"><path d="M0 0C-12 -26 11 -30 12 -13C13 -2 0 0 0 0M0 0C28 2 20 23 6 17C-4 12 0 0 0 0M0 0C-15 22 -30 5 -15 -3C-5 -9 0 0 0 0" fill="#9b9b9b"/></g><path d="M0 28V47M-17 48H17" stroke="#767676" stroke-width="2"/></g>
      <rect x="329" y="282" width="340" height="40" rx="6" fill="#282828" stroke="#626262"/>
      ${text(348, 307, 'INDEPENDENT LABEL', 's-label')}<text id="occupancy-label" x="650" y="307" text-anchor="end" class="s-accent" style="font-size:14px">EMPTY</text>
    `),

    comparison: () => svg(`
      <defs><clipPath id="comparison-window"><rect class="history-window" id="comparison-clip" x="790" y="30" width="80" height="255"/></clipPath></defs>
      ${[70, 150, 230].map((y, i) => `
        ${text(20, y + 5, ['Unprotected', 'Independent filters', 'Coordinated filters'][i], '')}
        ${i === 2 ? text(20, y + 27, 'PROPOSED', 's-label s-accent') : ''}
        <rect x="239" y="${y - 30}" width="631" height="60" rx="5" fill="#202020"/>
        ${trace(`comparison-faint-${i}`, 247, y, 615, 19, ['physical', 'independent', 'coordinated'][i], i === 1 ? 'amber' : i === 2 ? 'blue' : '')}
        <g clip-path="url(#comparison-window)">${trace(`comparison-bright-${i}`, 247, y, 615, 19, ['physical', 'independent', 'coordinated'][i], i === 1 ? 'amber' : i === 2 ? 'blue' : '')}</g>
        <path d="M881 ${y}H920" stroke="#848484" stroke-width="1"/>
        <circle cx="944" cy="${y}" r="20" fill="#282828" stroke="#8f8f8f"/>
        ${text(944, y + 6, '?', 's-accent', 'middle')}
      `).join('')}
      <path d="M875 25V280" stroke="${C.green}" stroke-width="1.6"/>
      ${text(875, 310, 'SAME DECISION TIME', 's-label s-accent', 'middle')}
      ${text(250, 310, 'PAST', 's-label')}<text id="comparison-duration" x="585" y="310" class="s-label s-accent" text-anchor="middle">2 SECONDS OF HISTORY</text>
    `),

    balance: () => svg(`
      <path d="M299 142H411M589 142H701" class="signal-path faint"/>
      ${[220, 500, 780].map((x, i) => `<circle cx="${x}" cy="141" r="78" fill="#252525" stroke="${[C.green, C.blue, C.amber][i]}" stroke-width="1"/><circle cx="${x}" cy="141" r="91" class="soft-ring" style="stroke:${[C.green, C.blue, C.amber][i]};animation-delay:-${i}s"/>`).join('')}
      ${shield(220, 138, 1.2)}${key(500, 142, 1.5, C.blue)}
      <g transform="translate(780 143)">${Array.from({ length: 4 }, (_, i) => `<rect class="packet" x="${-30 + i * 18}" y="${15 - i * 11}" width="10" height="${12 + i * 11}" rx="2" style="fill:${C.amber}"/>`).join('')}</g>
      ${text(220, 262, 'Less unauthorized inference', '', 'middle')}${text(500, 262, 'Useful authorized sensing', '', 'middle')}${text(780, 262, 'Reliable communication', '', 'middle')}
      ${text(220, 288, 'PRIVACY', 's-label s-accent', 'middle')}${text(500, 288, 'RECOVERY', 's-label s-blue', 'middle')}${text(780, 288, 'LINK QUALITY', 's-label s-amber', 'middle')}
    `),

    limits: () => svg(`
      <path d="M500 35V294" stroke="#454545"/>
      ${text(235, 55, 'Weak response. Stronger noise.', 's-title', 'middle')}
      <path d="M72 193H398" class="ghost-line"/>
      ${trace('noise-small', 80, 147, 115, 7, 'noise')}
      ${text(232, 153, '÷ small G', 's-small', 'middle')}
      ${trace('noise-large', 282, 147, 115, 37, 'noise', 'amber')}
      ${text(238, 241, 'RECOVERY CAN AMPLIFY NOISE', 's-label s-amber', 'middle')}
      ${text(757, 55, 'A shared filter can cancel.', 's-title', 'middle')}
      ${receiver(585, 129, C.blue, .7)}${receiver(585, 192, C.blue, .7)}
      ${[[135, 'H₁ ×'], [198, 'H₂ ×']].map(([y, term]) => `
        ${text(642, y, term, 's-blue')}
        <g class="cancelled-factor" transform="translate(690 ${y})">
          ${text(0, 0, 'G', 's-blue', 'middle')}
          <path d="M-8 -14L8 3" fill="none" stroke="${C.coral}" stroke-width="1.6" stroke-linecap="round"/>
        </g>
      `).join('')}
      <path d="M634 157H712" stroke="#838383"/>
      ${text(751, 169, '=', 's-title', 'middle')}${text(830, 146, 'H₁', 's-title', 'middle')}${text(830, 198, 'H₂', 's-title', 'middle')}<path d="M810 159H852" stroke="${C.green}"/>
      ${text(755, 241, 'MULTIPLE-ANTENNA BOUNDARY', 's-label s-amber', 'middle')}
      ${text(500, 308, 'A PROPOSED METHOD, NOT YET A VALIDATED DEFENSE.', 's-label', 'middle')}
    `),

    closing: () => svg(`
      ${[130, 205, 280, 355, 430, 505].map((r, i) => `<circle cx="600" cy="250" r="${r}" class="closing-ring" style="animation-delay:-${i * 1.3}s"/>`).join('')}
      ${Array.from({ length: 18 }, (_, i) => dot(600 + Math.cos(i * 2.4) * (140 + i * 19), 250 + Math.sin(i * 2.4) * (90 + i * 15), 1.6, 'latency-dot')).join('')}
    `, '0 0 1200 500')
  };

  $$('[data-visual]').forEach(el => { el.innerHTML = scenes[el.dataset.visual](); });
  $$('[id^="comparison-faint"]').forEach(el => { el.style.opacity = '.15'; });

  const notes = [
    [`A locked door protects your room. A password protects your network. But what protects the fact that you are home?`, `Wi-Fi signals are travelling around us. They bounce off walls, furniture, and us. With suitable equipment and analysis, changes in those signals may reveal whether someone is inside a room, without reading a single message.`, `Researchers are developing ways to hide those clues. But my research asks: if we hide a moment of movement, have we also hidden someone’s presence? My name is Fathima Zahra Sanuj Abdulla, and I am investigating whether Wi-Fi privacy protection can hold up over time.`],
    [`Imagine speaking inside an empty room. Your voice echoes. Now fill that room with furniture and people. The echo changes because the paths taken by the sound have changed.`, `Wi-Fi signals also travel along different paths before reaching a receiver. The receiver measures their combined effect using channel state information, or CSI. Simply put, CSI describes what happened to the signal as it travelled through the room.`, `It is not a photograph of a person. But it can contain clues about their presence. Encryption protects the data being transmitted. It does not automatically remove these physical clues. The message can be protected while the room still leaves traces.`],
    [`Existing defenses can distort those measurements to make unauthorized sensing harder. This is called obfuscation. My project builds on that approach, with one concern: an observer may be willing to wait.`, `One quiet sound behind a door might tell you little. Several sounds over time could tell a clearer story. Protected wireless measurements might behave similarly.`, `An observer could combine weak clues, or remember evidence that someone entered earlier, even after that person stops moving. This is a possibility to test, not a result I am assuming. My research question is: does occupancy protection weaken when an observer receives a longer history?`],
    [`The proposed solution applies short filters to the signal before transmission. These filters introduce an artificial effect that becomes mixed with the physical effect of the room. An unauthorized receiver sees that mixture.`, `An authorized receiver shares a secret key that allows it to reconstruct the filter sequence and attempt to compensate for the artificial effect. This general filtering approach already exists.`, `The part I am investigating is how the filters change over time. One comparison method chooses filters independently. My proposed method coordinates their changes across several time scales. The aim is to make clues harder to combine over longer observations, while keeping communication and authorized sensing useful.`],
    [`Before testing a new defense, I need to establish that the observer can detect occupancy without protection. Otherwise, poor observer performance would tell us very little.`, `The first experiment uses a controlled room with a transmitter, an authorized receiver, and an observer receiver. Recordings will include an empty room, someone sitting still, someone walking, and entry and exit events. An empty room with a moving fan will help check whether environmental movement is mistaken for a person.`, `Occupancy will be recorded separately using synchronized annotations. The observer will be trained on some complete recording sessions and tested on different sessions. The first question is whether it can detect presence reliably, not simply recognize a recording.`],
    [`The main experiment compares three conditions: no protection, independently changing filters, and my proposed temporally coordinated filters. The observers will be trained on protected recordings too, so they have a fair opportunity to learn the disturbance.`, `Each observer then receives different amounts of history: two seconds, ten seconds, thirty seconds, two minutes, and ten minutes. Every prediction answers the same question at the same moment: is the room occupied now? One observer might receive only the last two seconds. Another receives the preceding ten minutes. That isolates the value of waiting.`, `The physical experiment requires a programmable transmitter and receivers that expose suitable channel measurements. Software simulations can help develop the method first. But transmitted tests are needed to establish that it works on real signals.`],
    [`There are two questions the results must answer. First: does longer observation help an unauthorized receiver infer occupancy despite protection? Second: does my proposed timing reduce that inference compared with independent filtering?`, `The main result would show observer performance against observation duration, with a separate curve for each defense. Those curves must come from experiments; none are presented here.`, `I will also measure entry and exit detection, authorized sensing, throughput, and packet loss. The comparison must be made at a similar communication cost. A defense that hides occupancy by making the network unusable would not meet the objective. Success means a measurable privacy improvement, useful authorized sensing, and an acceptable cost to communication.`],
    [`A credible defense must explain its limits. The mathematical analysis identifies two. If a filter response becomes too weak, compensating for it can amplify noise and damage authorized recovery.`, `Also, an observer with multiple receive antennas may cancel a disturbance shared between its measurements. Changing that disturbance’s timing does not remove this mathematical weakness. The method also protects only transmissions under its control. Other radio sources may still reveal information.`, `At present, this work includes a proposed method, mathematical analysis, and an experimental protocol. Hardware validation remains to be completed. These limits define what I can test and what I can honestly claim.`],
    [`Someone does not need to recognize every movement to learn something private. Knowing whether a room is occupied can itself matter.`, `This project examines whether protection that appears effective over a brief recording remains effective when an observer waits longer. If longer histories expose occupancy, we need to understand why. If coordinating filters reduces that leakage at a comparable communication cost, that could support a better defense.`, `I began by asking: what protects the fact that you are home? My research takes one step toward answering that question: can we hide someone’s presence for longer than a moment? Thank you.`]
  ];

  function updateNotes() {
    $('#notes-timing').textContent = `${String(state.slide + 1).padStart(2, '0')} / 09 · ${timing[state.slide]}`;
    $('#notes-content').replaceChildren(...notes[state.slide].map(str => { const p = document.createElement('p'); p.textContent = str; return p; }));
  }
  function goTo(index, updateHash = true) {
    index = Math.max(0, Math.min(8, index));
    state.slide = index;
    slideEls.forEach((el, i) => { el.hidden = i !== index; el.inert = i !== index; el.classList.toggle('active', i === index); });
    $('#back').disabled = index === 0;
    $('#next').disabled = index === 8;
    $('#current-slide').textContent = String(index + 1).padStart(2, '0');
    $$('.progress-step').forEach((el, i) => { el.classList.toggle('past', i < index); el.classList.toggle('current', i === index); if (i === index) el.setAttribute('aria-current', 'step'); else el.removeAttribute('aria-current'); });
    $$('.jump-link').forEach((el, i) => el.classList.toggle('current', i === index));
    if (updateHash) history.replaceState(null, '', `#${index + 1}`);
    $('#announcement').textContent = `Slide ${index + 1} of 9. ${slideEls[index].dataset.name}.`;
    updateNotes();
    updateScenes();
    state.activityStartedAt = state.time;
    scheduleSceneLoop();
    drawTraces(state.time);
  }
  slideEls.forEach((el, i) => {
    const step = document.createElement('button'); step.className = 'progress-step'; step.setAttribute('aria-label', `Slide ${i + 1}: ${el.dataset.name}`); step.addEventListener('click', () => goTo(i)); $('#deck-progress').append(step);
    const jump = document.createElement('button'); jump.className = 'jump-link'; jump.innerHTML = `<span>${String(i + 1).padStart(2, '0')}</span><span>${el.dataset.name}</span><small>${timing[i]}</small>`; jump.addEventListener('click', () => { $('#jump-dialog').close(); goTo(i); }); $('#slide-list').append(jump);
  });

  $('#back').addEventListener('click', () => goTo(state.slide - 1));
  $('#next').addEventListener('click', () => goTo(state.slide + 1));
  $('#slide-counter').addEventListener('click', () => $('#jump-dialog').showModal());
  $$('[data-close]').forEach(el => el.addEventListener('click', () => document.getElementById(el.dataset.close).close()));
  $$('dialog').forEach(dialog => dialog.addEventListener('click', e => { if (e.target === dialog) { const r = dialog.getBoundingClientRect(); if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) dialog.close(); } }));

  function toggleNotes(force) {
    const show = typeof force === 'boolean' ? force : $('#notes-panel').hidden;
    $('#notes-panel').hidden = !show;
    if (show) { updateNotes(); $('#close-notes').focus(); } else $('#slide-counter').focus();
  }
  $('#close-notes').addEventListener('click', () => toggleNotes(false));

  function setMotion(paused) {
    state.paused = paused;
    document.body.classList.toggle('motion-paused', paused);
  }
  reduceMotion.addEventListener('change', e => { setMotion(e.matches); drawTraces(state.time); });

  async function toggleFullscreen() {
    try { if (document.fullscreenElement) await document.exitFullscreen(); else await document.documentElement.requestFullscreen(); }
    catch { $('#announcement').textContent = 'Fullscreen is not available in this browser. You can use your browser’s fullscreen command.'; }
  }

  // Slide changes stay manual. Only the illustrative states cycle automatically.
  const sceneLoops = {
    1: { key: 'room', attribute: 'room', selector: '[data-room]', values: ['occupied', 'empty'], hold: 5 },
    2: { key: 'history', attribute: 'duration', selector: '[data-group="history"] [data-duration]', values: durations, hold: 3 },
    3: { key: 'filter', attribute: 'filter', selector: '[data-filter]', values: ['coordinated', 'independent'], hold: 6 },
    4: { key: 'activity', attribute: 'activity', selector: '[data-activity]', values: ['empty', 'seated', 'walking', 'entry', 'fan'], hold: 6, holds: { empty: 4, seated: 6, walking: 6, entry: 8, fan: 5 } },
    5: { key: 'comparison', attribute: 'duration', selector: '[data-group="comparison"] [data-duration]', values: durations, hold: 3 }
  };
  function scheduleSceneLoop(manual = false) {
    const loop = sceneLoops[state.slide];
    const hold = loop ? (loop.holds?.[state[loop.key]] ?? loop.hold) : Infinity;
    // A click gets an eight-second hold, then the automatic demonstration resumes.
    state.nextSceneAt = state.time + (manual ? Math.max(hold, 8) : hold);
  }
  function advanceSceneLoop() {
    const loop = sceneLoops[state.slide];
    if (!loop || state.time < state.nextSceneAt) return;
    const next = loop.values[(loop.values.indexOf(state[loop.key]) + 1) % loop.values.length];
    const button = $$(loop.selector).find(el => String(el.dataset[loop.attribute]) === String(next));
    if (button) selectInGroup(button, loop.attribute, true);
  }
  function selectInGroup(button, attribute, automatic = false) {
    const group = button.closest('.segmented, .duration-picker, .activity-picker');
    $$('button', group).forEach(el => { const selected = el === button; el.classList.toggle('selected', selected); el.setAttribute('aria-pressed', String(selected)); });
    if (attribute === 'duration') state[group.dataset.group] = Number(button.dataset.duration);
    else state[attribute] = button.dataset[attribute];
    if (attribute === 'activity') state.activityStartedAt = state.time;
    scheduleSceneLoop(!automatic);
    updateScenes(); drawTraces(state.time);
    if (state.slide === 4) drawActivity(state.time);
  }
  $$('[data-room]').forEach(b => b.addEventListener('click', () => selectInGroup(b, 'room')));
  $$('[data-filter]').forEach(b => b.addEventListener('click', () => selectInGroup(b, 'filter')));
  $$('[data-duration]').forEach(b => b.addEventListener('click', () => selectInGroup(b, 'duration')));
  $$('[data-activity]').forEach(b => b.addEventListener('click', () => selectInGroup(b, 'activity')));

  function updateScenes() {
    $('#propagation-person').style.opacity = state.room === 'occupied' ? '1' : '0';
    const histIndex = durations.indexOf(state.history);
    $$('.history-fragment').forEach((el, i) => { el.style.opacity = i < [2, 6, 11, 19, 26][histIndex] ? '1' : '.08'; });
    $('#history-duration').textContent = state.history < 60 ? `${state.history} seconds` : `${state.history / 60} minutes`;
    const width = [80, 190, 320, 475, 630][durations.indexOf(state.comparison)];
    $('#comparison-clip').setAttribute('x', 870 - width); $('#comparison-clip').setAttribute('width', width);
    $('#comparison-duration').textContent = `${state.comparison < 60 ? state.comparison + ' SECONDS' : state.comparison / 60 + ' MINUTES'} OF HISTORY`;
    $('#seated-person').style.opacity = state.activity === 'seated' ? '1' : '0';
    $('#standing-person').style.opacity = ['walking', 'entry'].includes(state.activity) ? '1' : '0';
    $('#experiment-fan').style.opacity = state.activity === 'fan' ? '1' : '.16';
    if (state.activity !== 'entry') $('#occupancy-label').textContent = ['seated', 'walking'].includes(state.activity) ? 'OCCUPIED' : 'EMPTY';
  }

  function sample(kind, u, t) {
    if (kind === 'noise') return Math.sin(u * 41 + t * 3) * .43 + Math.sin(u * 93 - t * 2) * .25;
    if (kind === 'schedule') kind = state.filter;
    if (kind === 'independent') { const bucket = Math.floor(u * 32 - t * .7); return Math.sin(bucket * 127.1 + 8) * .7; }
    if (kind === 'coordinated') return .35 * Math.sin(u * 13 - t * .8) + .25 * Math.sin(u * 36 - t * 1.6) + .15 * Math.sin(u * 6 + t * .25);
    if (state.slide === 1 && state.room === 'empty') return Math.sin(u * 22 + t * .9) * .1 + Math.sin(u * 70 + t) * .045;
    return .38 * Math.sin(u * 24 - t * 1.7) + .2 * Math.sin(u * 57 + t * .8) + .12 * Math.cos(u * 10 - t * .45);
  }
  function drawTraces(t) {
    $$('[data-trace]', slideEls[state.slide]).forEach(el => {
      const x = Number(el.dataset.x), y = Number(el.dataset.y), w = Number(el.dataset.w), h = Number(el.dataset.h);
      let d = '';
      for (let i = 0; i <= 130; i++) { const u = i / 130; d += `${i ? 'L' : 'M'}${(x + u * w).toFixed(1)} ${(y + sample(el.dataset.trace, u, t) * h).toFixed(1)} `; }
      el.setAttribute('d', d);
    });
  }
  function drawActivity(t) {
    t -= state.activityStartedAt;
    if (state.activity === 'walking') $('#standing-person').setAttribute('transform', `translate(${Math.sin(t * .65) * 130} 0)`);
    else if (state.activity === 'entry') {
      const offset = -150 - Math.cos(t * .8) * 150;
      $('#standing-person').setAttribute('transform', `translate(${offset} 0)`);
      $('#occupancy-label').textContent = 483 + offset > 263 ? 'OCCUPIED' : 'EMPTY';
    } else $('#standing-person').setAttribute('transform', 'translate(0 0)');
  }
  let lastFrame = performance.now(), lastDraw = 0;
  function animate(now) {
    const delta = Math.min((now - lastFrame) / 1000, .1); lastFrame = now;
    const canAnimate = !state.paused && !document.hidden && !$('dialog[open]');
    if (canAnimate) { state.time += delta; advanceSceneLoop(); }
    if (now - lastDraw > 40) {
      if (canAnimate) { drawTraces(state.time); if (state.slide === 4) drawActivity(state.time); }
      if (state.slide === 3 && canAnimate) $$('.filter-chip').forEach((el, i) => { el.style.opacity = String(.4 + .6 * (sample(state.filter, i / 4, state.time) + 1) / 2); });
      lastDraw = now;
    }
    requestAnimationFrame(animate);
  }

  document.addEventListener('keydown', e => {
    if (e.altKey || e.ctrlKey || e.metaKey || /INPUT|TEXTAREA|SELECT/.test(e.target.tagName)) return;
    if ($('dialog[open]')) return;
    if (e.key === 'Escape' && !$('#notes-panel').hidden) { toggleNotes(false); return; }
    if (!$('#notes-panel').hidden && e.key.toLowerCase() !== 'n') return;
    if (e.key === 'ArrowRight' || e.key === 'PageDown' || (e.key === ' ' && e.target === document.body)) { e.preventDefault(); goTo(state.slide + 1); }
    else if (e.key === 'ArrowLeft' || e.key === 'PageUp') { e.preventDefault(); goTo(state.slide - 1); }
    else if (e.key === 'Home') { e.preventDefault(); goTo(0); }
    else if (e.key === 'End') { e.preventDefault(); goTo(8); }
    else if (/^[1-9]$/.test(e.key)) goTo(Number(e.key) - 1);
    else if (e.key.toLowerCase() === 'n') toggleNotes();
    else if (e.key.toLowerCase() === 'h' || e.key === '?') $('#help-dialog').showModal();
    else if (e.key.toLowerCase() === 'p') setMotion(!state.paused);
    else if (e.key.toLowerCase() === 'f') toggleFullscreen();
  });
  let touchStart = null;
  $('#slides').addEventListener('pointerdown', e => { if (e.pointerType === 'touch' && !e.target.closest('button')) touchStart = { x: e.clientX, y: e.clientY }; });
  $('#slides').addEventListener('pointerup', e => { if (!touchStart) return; const dx = e.clientX - touchStart.x, dy = e.clientY - touchStart.y; if (Math.abs(dx) > 75 && Math.abs(dy) < 55) goTo(state.slide + (dx < 0 ? 1 : -1)); touchStart = null; });
  window.addEventListener('hashchange', () => { const n = Number(location.hash.slice(1)); if (Number.isInteger(n) && n >= 1 && n <= 9) goTo(n - 1, false); });
  const initial = Number(location.hash.slice(1));
  setMotion(state.paused);
  goTo(Number.isInteger(initial) && initial >= 1 && initial <= 9 ? initial - 1 : 0);
  requestAnimationFrame(animate);
})();
