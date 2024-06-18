document.addEventListener('DOMContentLoaded', () => {
    let currentPage = 1;
    const perPage = 9;

    const fetchData = (page = 1) => {
        fetch(`/get_verbs?page=${page}&per_page=${perPage}`)
            .then(response => response.json())
            .then(data => {
                displayCards(data.verbs);
                updatePaginationControls(data.total_pages, data.current_page);
            })
            .catch(error => console.error('Error fetching verbs:', error));
    };

    fetchData(currentPage);

    document.getElementById('stats-button').addEventListener('click', showStats);
    document.getElementById('show-all-button').addEventListener('click', () => loadVerbs('Sheet1', currentPage));
    document.getElementById('previous-failed-button').addEventListener('click', () => loadVerbs('Failure', currentPage));
    document.getElementById('previous-flipped-button').addEventListener('click', () => loadVerbs('JustFlipped', currentPage));

    document.getElementById('prev-page').addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            fetchData(currentPage);
        }
    });

    document.getElementById('next-page').addEventListener('click', () => {
        currentPage++;
        fetchData(currentPage);
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            closeStats();
        }
    });

    window.addEventListener('beforeunload', sendStatsToServer);

    function loadVerbs(sheetName, page = 1) {
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
    }

    function displayCards(data) {
        const container = document.getElementById('cards-container');
        container.innerHTML = '';  // Clear previous cards
        stats = {
            success: 0,
            failure: 0,
            justFlipped: 0,
            justFlippedCards: [],
            failureCards: []
        };
        cardStates = [];
        data.forEach((verb, index) => {
            const card = document.createElement('div');
            card.className = 'flip-card';
            card.innerHTML = `
                <div class="flip-card-inner" id="card-inner-${index}">
                    <div class="flip-card-front">
                        <h2>${verb['Italian']}</h2>
                        <input type="text"  autoComplete="off" placeholder="enter here" id="inputValue-${index}" onkeydown="checkEnter(event, ${index})" onclick="event.stopPropagation()" />
                    </div>
                    <div class="flip-card-back" id="flip-card-back-${index}">
                        <h2>${verb['English']}</h2>
                        <p id="outputMessage-${index}"></p>
                    </div>
                </div>
            `;
            card.addEventListener('click', (event) => {
                flipCard(card, index);
            });
            container.appendChild(card);
        });
    }

    function updatePaginationControls(totalPages, currentPage) {
        const pageInfo = document.getElementById('page-info');
        pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
        
        const prevButton = document.getElementById('prev-page');
        const nextButton = document.getElementById('next-page');

        if (currentPage === 1) {
            prevButton.disabled = true;
        } else {
            prevButton.disabled = false;
        }

        if (currentPage === totalPages) {
            nextButton.disabled = true;
        } else {
            nextButton.disabled = false;
        }
    }
    document.getElementById('stats-button').addEventListener('click', showStats);
    document.getElementById('show-all-button').addEventListener('click', () => loadVerbs('Sheet1'));
    document.getElementById('previous-failed-button').addEventListener('click', () => loadVerbs('Failure'));
    document.getElementById('previous-flipped-button').addEventListener('click', () => loadVerbs('JustFlipped'));

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            closeStats();
        }
    });

    window.addEventListener('beforeunload', sendStatsToServer);
});

let stats = {
    success: 0,
    failure: 0,
    justFlipped: 0,
    justFlippedCards: [],
    failureCards: []
};
let cardStates = [];

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
                    <input type="text" placeholder="enter here" id="inputValue-${index}" onkeydown="checkEnter(event, ${index})" onclick="event.stopPropagation()" />
                </div>
                <div class="flip-card-back" id="flip-card-back-${index}">
                    <h2>${verb['English']}</h2>
                    <p id="outputMessage-${index}"></p>
                </div>
            </div>
        `;
        card.addEventListener('click', (event) => {
            flipCard(card, index);
        });
        container.appendChild(card);
    });
}

function loadVerbs(sheetName) {
    fetch(`/get_verbs/${sheetName}`)
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                console.error(data.error);
            } else {
                displayCards(data);
            }
        })
        .catch(error => console.error('Error loading verbs:', error));
}

function checkEnter(event, index) {
    if (event.key === 'Enter') {
        const card = event.target.closest('.flip-card');
        flipCard(card, index);
    }
}

function flipCard(card, index) {
    const innerCard = document.getElementById(`card-inner-${index}`);
    const inputValue = document.getElementById(`inputValue-${index}`).value.toLowerCase();
    const backTitle = document.querySelector(`#card-inner-${index} .flip-card-back h2`).textContent.toLowerCase();
    const outputMessage = document.getElementById(`outputMessage-${index}`);
    const flipCardBack = document.getElementById(`flip-card-back-${index}`);

    if (!innerCard.classList.contains('flipped') && !cardStates[index]) {
        document.getElementById(`inputValue-${index}`).disabled = true;
        cardStates[index] = true;
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
}

function sendStatsToServer() {
    const statsData = {
        justFlipped: stats.justFlippedCards,
        failure: stats.failureCards
    };

    fetch('/save_stats', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(statsData)
    })
    .then(response => response.json())
    .then(data => {
        console.log('Statistics saved:', data);
        
    })
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
}

function closeStats() {
    document.getElementById('stats-output').style.display = 'none';
    document.querySelector('.cards-container').classList.remove('blur');
    sendStatsToServer();
}
