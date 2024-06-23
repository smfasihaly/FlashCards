document.addEventListener('DOMContentLoaded', () => {
    let currentPage = 1;
    const perPage = 9;
    const loginButton = document.getElementById('login-button');
    const logoutButton = document.getElementById('logout-button');
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    const showSignupFormLink = document.getElementById('show-signup-form');
    const showLoginFormLink = document.getElementById('show-login-form');
    const modalTitle = document.getElementById('modal-title');
    const loginModal = document.getElementById('login-modal');

    loginModal.style.display = userLoggedIn ? 'none' : 'block';
    loginButton.style.display = userLoggedIn ? 'none' : 'block';
    logoutButton.style.display = userLoggedIn ? 'block' : 'none';
    if (userLoggedIn) fetchData(1);

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
                alert('Please log in to view data.');
            });
    }

    sessionStorage.clear();

    loginButton.addEventListener('click', () => loginModal.style.display = 'block');

    logoutButton.addEventListener('click', () => {
        fetch('/logout', { method: 'POST' })
            .then(response => response.json())
            .then(data => {
                if (data.status === 'success') {
                    logoutButton.style.display = 'none';
                    loginButton.style.display = 'block';
                    loginModal.style.display = 'block';
                    alert('Logged out successfully!');
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
                    alert('Login successful!');
                    loginModal.style.display = 'none';
                    loginButton.style.display = 'none';
                    logoutButton.style.display = 'block';
                    fetchData(1);
                } else {
                    alert('Error: ' + data.error);
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
                    alert('Signup successful! Please log in.');
                    signupForm.style.display = 'none';
                    loginForm.style.display = 'block';
                    modalTitle.textContent = 'Login';
                } else {
                    alert('Error: ' + data.error);
                }
            })
            .catch(error => console.error('Error during signup:', error));
    });

    document.getElementById('stats-button').addEventListener('click', showStats);
    document.getElementById('show-all-button').addEventListener('click', () => fetchData(currentPage));
    document.getElementById('previous-failed-button').addEventListener('click', () => loadVerbs('Failure', currentPage));
    document.getElementById('previous-flipped-button').addEventListener('click', () => loadVerbs('JustFlipped', currentPage));

    document.getElementById('prev-page').addEventListener('click', () => {
        if (currentPage > 1) {
            saveCardStates(currentPage);
            currentPage--;
            fetchData(currentPage);
        }
    });

    document.getElementById('next-page').addEventListener('click', () => {
        saveCardStates(currentPage);
        currentPage++;
        fetchData(currentPage);
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

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') closeStats();
    });

    window.addEventListener('beforeunload', sendStatsToServer);

    function loadVerbs(sheetName, page = 1) {
        sessionStorage.clear();
        fetch(`/get_verbs/${sheetName}?page=${page}&per_page=${perPage}`)
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    console.error(data.error);
                } else {
                    displayCards(data.verbs);
                    updatePaginationControls(data.total_pages, data.current_page);
                }
            })
            .catch(error => console.error('Error loading verbs:', error));

        stats = { success: 0, failure: 0, justFlipped: 0, justFlippedCards: [], failureCards: [] };
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
                        <h2>${verb['Italian']}</h2>
                        <input type="text" autocomplete="off" placeholder="enter here" id="inputValue-${index}" onkeydown="checkEnter(event, ${index}, ${currentPage})" onclick="event.stopPropagation()" />
                    </div>
                    <div class="flip-card-back" id="flip-card-back-${index}">
                        <h2>${verb['English']}</h2>
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
           
        };
    
        fetch('/save_stats', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(statsData)
        })
            .then(response => response.json())
            .then(data => console.log('Statistics saved:', data))
            .catch(error => console.error('Error saving statistics:', error));
    }
    

    function showStats() {
        const statsOutput = document.getElementById('stats-output');
        statsOutput.innerHTML = `
            <button id="close-stats">&times;</button>
            <p>Success: ${stats.success}</p>
            <p>Failure: ${stats.failure}</p>
            <p>Just Flipped: ${stats.justFlipped}</p>
        `;
        statsOutput.style.display = 'block';
        document.querySelector('.cards-container').classList.add('blur');
        document.getElementById('close-stats').addEventListener('click', closeStats);
        sendStatsToServer();
    }

    function closeStats() {
        document.getElementById('stats-output').style.display = 'none';
        document.querySelector('.cards-container').classList.remove('blur');
    }
});

let stats = {
    success: 0,
    failure: 0,
    justFlipped: 0,
    justFlippedCards: [],
    failureCards: []
};
let cardStates = [];
function checkEnter(event, index, currentPage) {
    if (event.key === 'Enter') {
        const card = event.target.closest('.flip-card');
        flipCard(card, index, currentPage);
    }
}
function flipCard(card, index, page) {
    const innerCard = document.getElementById(`card-inner-${index}`);
    const inputValue = document.getElementById(`inputValue-${index}`).value.toLowerCase();
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
                Italian: document.querySelector(`#card-inner-${index} .flip-card-front h2`).textContent,
                English: backTitle
            });
        } else if (allMatch) {
            flipCardBack.style.backgroundColor = "#28a745"; // Green
            outputMessage.textContent = "Success! The values match.";
            stats.success++;
        } else {
            flipCardBack.style.backgroundColor = "#dc3545"; // Red
            outputMessage.textContent = "Failure. The values do not match.";
            stats.failure++;
            stats.failureCards.push({
                Italian: document.querySelector(`#card-inner-${index} .flip-card-front h2`).textContent,
                English: backTitle
            });
        }
    }

    innerCard.classList.toggle('flipped');
    sessionStorage.setItem(cardStateKey, JSON.stringify({ flipped: !flipped }));
}