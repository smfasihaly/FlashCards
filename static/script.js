let stats = resetStatsAndCardStates();
let cardStates = [];
let isFlippedLanguage = localStorage.getItem('isFlippedLanguage') === 'true';
let currentView = localStorage.getItem('currentView') || 'All';

function resetStatsAndCardStates() {
    return {
        success: 0,
        failure: 0,
        justFlipped: 0,
        justFlippedCards: [],
        failureCards: []
    };
}

document.addEventListener('DOMContentLoaded', () => {
    let currentPage = 1;
    const perPage = 9;
    const logoutButton = document.getElementById('logout-button');
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    const showSignupFormLink = document.getElementById('show-signup-form');
    const showLoginFormLink = document.getElementById('show-login-form');
    const modalTitle = document.getElementById('modal-title');
    const loginModal = document.getElementById('login-modal');
    const saveStatsButton = document.getElementById('stats-button');
    const statsPanel = document.getElementById('stats-panel');
    const infoButton = document.getElementById('info-button');
    const howToPlayModal = document.getElementById('how-to-play-modal');
    const closeHowToPlay = document.getElementById('close-how-to-play');
    const flipLanguageButton = document.getElementById('flip-language-button');
    const languageDirectionText = document.getElementById('language-direction-text');
    const headerButtons = document.querySelector('.header-center');

    headerButtons.addEventListener('click', (event) => {
        if (event.target.tagName === 'A') {
            const links = headerButtons.querySelectorAll('a');
            links.forEach(link => link.classList.remove('active'));
        }
        setActive();
    });

    // Refactored: Abstracted the logic to find and add 'active' class to a link
    function addActiveClass(linkId) {
        const link = document.getElementById(linkId);
        if (link) {
            link.classList.add('active');
        }
    }

    // Set the initial active link based on currentView
    function setActive() {
        if (currentView === 'All') {
            addActiveClass('show-all-button'); // This is refactored code
        } else if (currentView === 'Failure') {
            addActiveClass('previous-failed-button'); // This is refactored code
        } else if (currentView === 'JustFlipped') {
            addActiveClass('previous-flipped-button'); // This is refactored code
        }
    }
    setActive();

    languageDirectionText.textContent = isFlippedLanguage ? 'English to Italian' : 'Italian to English';


    infoButton.addEventListener('click', () => {
        howToPlayModal.style.display = 'block';
        document.querySelector('.cards-container').classList.add('blur');
    });

    closeHowToPlay.addEventListener('click', () => {
        howToPlayModal.style.display = 'none';
        document.querySelector('.cards-container').classList.remove('blur');
    });

    window.addEventListener('click', (event) => {
        if (event.target === howToPlayModal) {
            howToPlayModal.style.display = 'none';
            document.querySelector('.cards-container').classList.remove('blur');

        }
    });


    flipLanguageButton.addEventListener('click', () => {
        stats = resetStatsAndCardStates();
        cardStates = [];
        isFlippedLanguage = !isFlippedLanguage;
        localStorage.setItem('isFlippedLanguage', isFlippedLanguage);
        languageDirectionText.textContent = isFlippedLanguage ? 'English to Italian' : 'Italian to English';
        loadDataAccordingToViewType();
    });

    loginModal.style.display = userLoggedIn ? 'none' : 'block';
    logoutButton.style.display = userLoggedIn ? 'block' : 'none';
    statsPanel.style.display = userLoggedIn ? 'block' : 'none';

    if (userLoggedIn) loadDataAccordingToViewType();

    // Fetch data function
    function fetchData(page) {
        fetch(`/get_verbs?page=${page}&per_page=${perPage}`)
            .then(response => {
                if (!response.ok) throw new Error('Not authorized');
                return response.json();
            })
            .then(data => {
                if (data.verbs) {
                    displayCards(data.verbs);
                    updatePaginationControls(data.total_pages, data.current_page);
                    restoreCardStates(page);
                }
            })
            .catch(error => {
                console.error('Error fetching verbs:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Please log in to view data.',
                    showConfirmButton: false,
                    timer: 1500
                });

            });
    }

    sessionStorage.clear();


    logoutButton.addEventListener('click', () => {
        fetch('/logout', { method: 'POST' })
            .then(response => response.json())
            .then(data => {
                if (data.status === 'success') {
                    logoutButton.style.display = 'none';
                    loginModal.style.display = 'block';

                    Swal.fire({
                        icon: 'success',
                        title: 'Logged out successfully!.',
                        showConfirmButton: false,
                        timer: 1500
                    }).then(() => {
                        window.location.reload();
                    });
                }
            })
            .catch(error => console.error('Error during logout:', error));
    });

    showSignupFormLink.addEventListener('click', (event) => {
        event.preventDefault();
        loginForm.style.display = 'none';
        signupForm.style.display = 'block';
        modalTitle.textContent = 'Sign Up';
    });

    showLoginFormLink.addEventListener('click', (event) => {
        event.preventDefault();
        signupForm.style.display = 'none';
        loginForm.style.display = 'block';
        modalTitle.textContent = 'Login';
    });

    loginForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const username = document.getElementById('login-username').value;
        const password = document.getElementById('login-password').value;

        fetch('/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        })
            .then(response => response.json())
            .then(data => {
                if (data.status === 'success') {
                    Swal.fire({
                        icon: 'success',
                        title: 'Login successful!',
                        showConfirmButton: false,
                        timer: 1500
                    }).then(() => {
                        window.location.reload();
                    });
                    loginModal.style.display = 'none';
                    logoutButton.style.display = 'block';
                    
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: data.error
                    });

                }
            })
            .catch(error => console.error('Error during login:', error));
    });

    signupForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const username = document.getElementById('signup-username').value;
        const password = document.getElementById('signup-password').value;

        fetch('/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        })
            .then(response => response.json())
            .then(data => {
                if (data.status === 'success') {
                    Swal.fire({
                        icon: 'success',
                        title: 'Signup successful! Please log in.',
                        showConfirmButton: false,
                        timer: 1500
                    });
                    signupForm.style.display = 'none';
                    loginForm.style.display = 'block';
                    modalTitle.textContent = 'Login';
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: data.error
                    });
                }
            })
            .catch(error => console.error('Error during signup:', error));
    });

    document.getElementById('stats-button').addEventListener('click', () => {
        sendStatsToServer()
            .then(() => {
                Swal.fire({
                    icon: 'success',
                    title: 'Record saved successfully!',
                    showConfirmButton: false,
                    timer: 1500
                });
            })
            .catch(error => {
                console.error('Error saving statistics:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Failed to save record.',
                    text: error
                });
            });
    });


    document.getElementById('show-all-button').addEventListener('click', () => {
        currentView = 'All';
        localStorage.setItem('currentView', currentView);
        fetchData(currentPage);
        showSaveStatsButton();  // Show the Save Stats button when showing all data
    });

    document.getElementById('previous-failed-button').addEventListener('click', () => {
        currentView = 'Failure';
        localStorage.setItem('currentView', currentView);
        loadVerbs('Failure', 1, isFlippedLanguage ? 'English to Italian' : 'Italian to English');
        hideSaveStatsButton();  // Hide the Save Stats button when showing previously failed data
    });

    document.getElementById('previous-flipped-button').addEventListener('click', () => {
        currentView = 'JustFlipped';
        localStorage.setItem('currentView', currentView);
        loadVerbs('JustFlipped', 1, isFlippedLanguage ? 'English to Italian' : 'Italian to English');
        hideSaveStatsButton();  // Hide the Save Stats button when showing previous flipped data
    });

    function hideSaveStatsButton() {
        saveStatsButton.style.display = 'none';
        statsPanel.style.display = 'none';

    }

    function showSaveStatsButton() {
        saveStatsButton.style.display = 'block';
        statsPanel.style.display = 'block';
    }


    document.getElementById('prev-page').addEventListener('click', () => {
        if (currentPage > 1) {
            saveCardStates(currentPage);
            currentPage--;
            loadDataAccordingToViewType()
        }
    });

    document.getElementById('next-page').addEventListener('click', () => {
        saveCardStates(currentPage);
        currentPage++;
        loadDataAccordingToViewType()
    });

    function saveCardStates(page) {
        const cardStates = [];
        document.querySelectorAll('.flip-card-inner').forEach((card, index) => {
            const isFlipped = card.classList.contains('flipped');
            const cardColor = document.getElementById(`flip-card-back-${index}`).style.backgroundColor;
            cardStates[index] = { isFlipped, cardColor };
        });
        sessionStorage.setItem(`cardStates-${page}`, JSON.stringify(cardStates));
    }

    function restoreCardStates(page) {
        const savedStates = JSON.parse(sessionStorage.getItem(`cardStates-${page}`));
        if (savedStates) {
            document.querySelectorAll('.flip-card-inner').forEach((card, index) => {
                if (savedStates[index].isFlipped) {
                    card.classList.add('flipped');
                    document.getElementById(`flip-card-back-${index}`).style.backgroundColor = savedStates[index].cardColor;
                }
            });
        }
    }



    window.addEventListener('beforeunload', sendStatsToServer);

    function loadVerbs(sheetName, page = 1) {
        languageDirection = isFlippedLanguage ? 'English to Italian' : 'Italian to English'

        sessionStorage.clear();
        fetch(`/get_verbs/${sheetName}?page=${page}&per_page=${perPage}&language_direction=${languageDirection}`)
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    console.error(data.error);
                } else {
                    updatePaginationControls(data.total_pages, data.current_page);
                    displayCards(data.verbs);
                }
            })
            .catch(error => console.error('Error loading verbs:', error));
        stats = resetStatsAndCardStates(); // This is refactored code
        cardStates = [];
    }



    function displayCards(data) {
        const container = document.getElementById('cards-container');
        container.innerHTML = '';  // Clear previous cards

        data.forEach((verb, index) => {
            const card = document.createElement('div');
            card.className = 'flip-card';
            card.innerHTML = `
                <div class="flip-card-inner" id="card-inner-${index}">
                    <div class="flip-card-front">
                        <h2>${isFlippedLanguage ? verb['English'] : verb['Italian']}</h2>
                        <input type="text" autocomplete="off" placeholder="enter here" id="inputValue-${index}" onkeydown="checkEnter(event, ${index}, ${currentPage})" onclick="event.stopPropagation()" />
                    </div>
                    <div class="flip-card-back" id="flip-card-back-${index}">
                        <h2>${isFlippedLanguage ? verb['Italian'] : verb['English']}</h2>
                        <p id="outputMessage-${index}"></p>
                    </div>
                </div>
            `;
            card.addEventListener('click', (event) => {
                flipCard(card, index, currentPage);
            });
            container.appendChild(card);
        });
    }

    function updatePaginationControls(totalPages, currentPage) {
        const pageInfo = document.getElementById('page-info');
        pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;

        const prevButton = document.getElementById('prev-page');
        const nextButton = document.getElementById('next-page');

        prevButton.disabled = currentPage === 1;
        nextButton.disabled = currentPage === totalPages;
    }




    function sendStatsToServer() {
        const statsData = {
            justFlipped: stats.justFlippedCards,
            failure: stats.failureCards,
            languageDirection: isFlippedLanguage ? 'English to Italian' : 'Italian to English'
        };

        return fetch('/save_stats', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(statsData)
        })
            .then(response => response.json())
            .then(data => {
                if (data.status !== 'success') {
                    throw new Error('Failed to save statistics');
                }
                console.log('Statistics saved:', data);
            });
    }



    function loadDataAccordingToViewType() {
        if (currentView === 'All') {
            fetchData(currentPage);
        } else if (currentView === 'Failure') {
            loadVerbs('Failure', currentPage);
        } else if (currentView === 'JustFlipped') {
            loadVerbs('JustFlipped', currentPage);
        }
    }

});



function checkEnter(event, index, currentPage) {
    if (event.key === 'Enter') {
        const card = event.target.closest('.flip-card');
        flipCard(card, index, currentPage);
    }
}

function flipCard(card, index, page) {
    const innerCard = document.getElementById(`card-inner-${index}`);
    const inputValue = document.getElementById(`inputValue-${index}`).value.toLowerCase();
    const frontTitle = document.querySelector(`#card-inner-${index} .flip-card-front h2`).textContent.toLowerCase();
    const backTitle = document.querySelector(`#card-inner-${index} .flip-card-back h2`).textContent.toLowerCase();
    const outputMessage = document.getElementById(`outputMessage-${index}`);
    const flipCardBack = document.getElementById(`flip-card-back-${index}`);
    const flipped = innerCard.classList.contains('flipped');

    const cardStateKey = `cardState-${page}-${index}`;

    if (!innerCard.classList.contains('flipped') && !cardStates[cardStateKey]) {
        document.getElementById(`inputValue-${index}`).disabled = true;
        cardStates[cardStateKey] = true;
        const inputValues = inputValue.split(',').map(value => value.trim().replace(/to /g, ''));
        const significantTitles = backTitle.split(',').map(title => title.trim().replace(/to /g, ''));

        const allMatch = inputValues.every(value => significantTitles.includes(value));

        if (inputValue === "") {
            flipCardBack.style.backgroundColor = "#007bff"; // Blue
            outputMessage.textContent = "";
            stats.justFlipped++;
            stats.justFlippedCards.push({
                Italian: isFlippedLanguage ? backTitle : frontTitle,
                English: isFlippedLanguage ? frontTitle : backTitle,

            });
        } else if (allMatch) {
            flipCardBack.style.backgroundColor = "#28a745"; // Green
            outputMessage.textContent = "Success! The values match.";
            stats.success++;

            // Remove from previous failed or flipped data if correct
            const verb = {
                Italian: isFlippedLanguage ? backTitle : frontTitle,
                English: isFlippedLanguage ? frontTitle : backTitle,

            };
            if (currentView === 'Failure') {
                // Delete verb from Failure sheet
                removeVerbFromSheet(verb, 'Failure');
            } else if (currentView === 'JustFlipped') {
                // Delete verb from JustFlipped sheet
                removeVerbFromSheet(verb, 'JustFlipped');
            }
        } else {
            flipCardBack.style.backgroundColor = "#dc3545"; // Red
            outputMessage.textContent = "Failure. The values do not match.";
            stats.failure++;
            stats.failureCards.push({
                Italian: isFlippedLanguage ? backTitle : frontTitle,
                English: isFlippedLanguage ? frontTitle : backTitle,

            });
        }
        updateStatsPanel();
    }

    innerCard.classList.toggle('flipped');
    sessionStorage.setItem(cardStateKey, JSON.stringify({ flipped: !flipped }));
}


function removeVerbFromSheet(verb, sheetName) {
    fetch('/remove_verb', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ verb, sheetName })
    })
        .then(response => response.json())
        .then(data => console.log(`Verb removed from ${sheetName} sheet:`, data))
        .catch(error => console.error(`Error removing verb from ${sheetName} sheet:`, error));
}
function updateStatsPanel() {
    document.getElementById('stats-success').textContent = stats.success;
    document.getElementById('stats-failure').textContent = stats.failure;
    document.getElementById('stats-just-flipped').textContent = stats.justFlipped;
}

