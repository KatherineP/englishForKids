/* global document */

const burger = document.querySelector('.burger-icon');
const menu = document.querySelector('.nav');
const menuBg = document.querySelector('.menu-bg');
const specifiedElement = document.getElementById('burger-menu');
const toggleButton = document.querySelector('.toggle-button-checkbox');
const menuItem = document.querySelector('.menu-item');
const rating = document.querySelector('.rating');
const starWin = '<div class="star-success"></div>';
const starFail = '<div class="star-error"></div>';


// burger menu handling
function onClickBurgerIcon() {
  burger.classList.toggle('burger-active');
  menuBg.classList.toggle('menu-bg-active');
  menu.classList.toggle('burger-active');
}

function removeActiveStateFromBurger() {
  menuBg.classList.remove('menu-bg-active');
  burger.classList.remove('burger-active');
  menu.classList.remove('burger-active');
}

function onClickOutsideMenu(event) {
  const isClickInside = specifiedElement.contains(event.target);
  if (!isClickInside) {
    removeActiveStateFromBurger();
  }
}

function changeElementsWhenToggle(element, menuElementClass, playElementClass) {
  element.classList.add('card-cover');
  element.firstElementChild.firstElementChild.classList.add('none');
  element.children[1].firstElementChild.classList.add('none');
  element.children[2].classList.add('none');
  document.querySelector(`${menuElementClass}`).classList.add('menu-bg-new-color');
  document.querySelector(`${playElementClass}`).style.display = 'block';
}

burger.addEventListener('click', onClickBurgerIcon);

document.addEventListener('click', onClickOutsideMenu);

// START APPLICATION
function startApplication(config) {
  const el = document.querySelector('.container');
  const menuElem = document.querySelector('.nav');

  let currentSection;
  let isGameStarted = false;
  let game;
  menuItem.classList.add('active-menu-element'); // highlight first item in the menu

  function buildSectionCard({ image, words, title }) {
    const cardImage = image || words[0].image;
    return `<div class="home-page-card"><img src="${cardImage}" alt="${title}">${title}</div>`;
  }

  function buildCard({
    word, translation, image, audioSrc,
  }) {
    return `<div class="card"><div class="front" style="background-image: url(&quot;${image}&quot;);">
  <div class="card-header">${word}</div></div><div class="back" style="background-image: url(&quot;${image}&quot;);">
  <div class="card-header">${translation}</div></div><div class="rotate"></div><audio class="audio" src="${audioSrc}"></audio></div>`;
  }

  function playAudio(src) {
    // eslint-disable-next-line no-undef
    const audioElement = new Audio(`/src/assets/audio/${src}.mp3`);
    audioElement.play();
  }

  function render() {
    const playButton = ['<div class="buttons"><button class="play-button">Start game</button></div>'];
    let listHTML;
    let cards;

    if (!currentSection) {
      listHTML = config.sections.map(buildSectionCard);
    } else {
      cards = currentSection.words.map(buildCard);
      listHTML = cards.concat(playButton);
    }
    el.innerHTML = listHTML.join('');
  }

  function setCurrentSection(sectionTitle) {
    currentSection = config.sections.find(({ title }) => title === sectionTitle);
    render();
  }

  render();

  function createFinalResultString(text) {
    return `<div class="result-text">${text}</div>`;
  }

  function showResult(className, typeOfSound, resultCaption) {
    document.querySelector('.container').style.display = 'none';
    document.querySelector('.toggle-button').style.display = 'none';
    document.querySelector(`${className}`).style.display = 'flex';
    document.querySelector('.results-captions').innerHTML = resultCaption;
    document.querySelector('.result-text').style.display = 'flex';
    playAudio(typeOfSound);
    setTimeout(() => {
      document.querySelector('.container').style.display = 'flex';
      document.querySelector('.toggle-button').style.display = '';
      document.querySelector(`${className}`).style.display = 'none';
      document.querySelector('.result-text').style.display = 'none';
    }, 3000);
    setCurrentSection('main Page');
    menu.querySelectorAll('a').forEach((element) => element.classList.remove('active-menu-element'));
    menuItem.classList.add('active-menu-element');
    toggleButton.checked = true;
  }

  function onClick(event) {
    const sectionCard = event.target.closest('.home-page-card');
    const rotateIcon = event.target.closest('.rotate');
    const sectionCardAudio = event.target.closest('.front');
    const play = event.target.closest('.play-button');
    const repeat = event.target.closest('.repeat');
    let cardText;

    if (sectionCard) {
      setCurrentSection(sectionCard.firstElementChild.alt);
      if (!toggleButton.checked) {
        document.querySelectorAll('.card').forEach((element) => {
          changeElementsWhenToggle(element, '.menu-bg', '.play-button');
        });
      }
      menu.querySelectorAll('a').forEach((element) => {
        element.classList.remove('active-menu-element');
        if (element.innerText === sectionCard.firstElementChild.alt) {
          element.classList.add('active-menu-element');
        }
      });
    } else if (rotateIcon) {
      rotateIcon.parentElement.style.transform = 'rotateY(180deg)';
      rotateIcon.previousElementSibling.addEventListener('mouseout', () => {
        if (toggleButton.checked) {
          rotateIcon.parentElement.style.transform = '';
        }
      });
    } else if (sectionCardAudio) {
      if (toggleButton.checked) {
        let soundSrc = sectionCardAudio.parentElement.lastElementChild.src;
        soundSrc = soundSrc.split('/');
        soundSrc = soundSrc[soundSrc.length - 1].split('.');
        playAudio(soundSrc[0]);
      }
      // GAME LOGIC
      if (isGameStarted) {
        cardText = sectionCardAudio.firstElementChild.innerText;
        if (game.words[0].word === cardText) {
          game.answers.push(true);
          rating.innerHTML += starWin;
          game.words.shift();
          playAudio('correct1');
          setTimeout(() => playAudio(game.words[0].word), 900);
          sectionCardAudio.classList.add('inactive');
          if (game.words.length === 0) {
            if (game.answers.includes(false)) {
              let a = 0;
              game.answers.forEach((element) => {
                if (element === false) {
                  a += 1;
                }
              });
              const resultFailureMessage = createFinalResultString(`You got ${a} error(s).`);
              showResult('.failure-image', 'failure', resultFailureMessage);
              rating.innerHTML = '';
            } else {
              const resultSuccessMessage = createFinalResultString('You Win!');
              showResult('.success-image', 'success', resultSuccessMessage);
              rating.innerHTML = '';
            }
          }
        } else {
          game.answers.push(false);
          playAudio('failure1');
          rating.innerHTML += starFail;
          setTimeout(() => playAudio(game.words[0].word), 900);
        }
      }
      // CLICK ON PLAY BUTTON
    } else if (repeat && repeat.classList.contains('repeat')) {
      playAudio((game.words[0].word));
    } else if (play) {
      play.classList.add('repeat');
      isGameStarted = true;
      game = { words: [...currentSection.words].sort(() => Math.random() - 0.5), answers: [] };
      playAudio((game.words[0].word));
    } 
  }

  function onMenuItemClick(event) {
    const sectionInTheMenu = event.target.closest('.menu-item');
    if (sectionInTheMenu) {
      rating.innerHTML = '';
      menu.querySelectorAll('a').forEach((element) => element.classList.remove('active-menu-element'));
      sectionInTheMenu.classList.add('active-menu-element');
      setCurrentSection(sectionInTheMenu.innerText);
      removeActiveStateFromBurger();


      if (sectionInTheMenu.innerText === 'Main Page') {
        if (!toggleButton.checked) {
          document.querySelectorAll('.home-page-card').forEach((element) => {
            element.classList.add('new-card-color');
            menuBg.classList.add('menu-bg-new-color');
          });
        }
      } else if (!toggleButton.checked) {
        document.querySelectorAll('.card').forEach((element) => {
          changeElementsWhenToggle(element, '.menu-bg', '.play-button');
        });
      }
    }
  }

  function onClickToggleButton(event) {
    const playButton = document.querySelector('.play-button');
    const toggle = event.target.closest('.toggle-button-checkbox');
    if (toggle) {
      rating.innerHTML = '';
      if (!toggleButton.checked) {
        document.querySelectorAll('.home-page-card').forEach((element) => {
          element.classList.add('new-card-color');
          menuBg.classList.add('menu-bg-new-color');
        });
        document.querySelectorAll('.card').forEach((element) => {
          changeElementsWhenToggle(element, '.menu-bg', '.play-button');
        });
      } else {
        document.querySelectorAll('.home-page-card').forEach((element) => {
          element.classList.remove('new-card-color');
          menuBg.classList.remove('menu-bg-new-color');
        });
        document.querySelectorAll('.card').forEach((element) => {
          element.classList.remove('card-cover');
          element.firstElementChild.firstElementChild.classList.remove('none');
          element.children[1].firstElementChild.classList.remove('none');
          element.children[2].classList.remove('none');
          menuBg.classList.remove('menu-bg-new-color');
          playButton.style.display = 'none';
        });
      }
    }
  }

  el.addEventListener('click', onClick);

  menuElem.addEventListener('click', onMenuItemClick);

  toggleButton.addEventListener('click', onClickToggleButton);
}


startApplication(appConfig);
