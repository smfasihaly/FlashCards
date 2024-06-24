# FlashCards Learning App

This is a web-based flashcard application for learning Italian verbs. It includes user authentication, dynamic card fetching, and statistics tracking. The app is built using Flask for the backend and vanilla JavaScript, HTML, and CSS for the frontend.

## Features

- User authentication (signup, login, logout)
- Dynamic verb fetching and pagination
- Flip card functionality to test knowledge
- Statistics tracking and saving
- Modal-based login/signup forms
- Responsive design

## Installation

### Prerequisites

- Python 3.x
- Flask
- pandas
- openpyxl
- Werkzeug

### Steps

1. **Clone the repository:**

    ```sh
    git clone https://github.com/smfasihaly/FlashCards.git
    cd FlashCards
    ```

2. **Create a virtual environment:**

    ```sh
    python -m venv venv
    ```

3. **Activate the virtual environment:**

    - On Windows:

        ```sh
        venv\Scripts\activate
        ```

    - On macOS/Linux:

        ```sh
        source venv/bin/activate
        ```

4. **Install the dependencies:**

    ```sh
    pip install -r requirements.txt
    ```

5. **Run the application:**

    ```sh
    python app.py
    ```

6. **Access the application:**

    Open a web browser and go to `http://127.0.0.1:5000`.





## Usage

### User Authentication

- **Signup:** Click the "Login/Signup" button and fill out the signup form. After successful signup, you can log in.
- **Login:** Click the "Login/Signup" button and fill out the login form. On successful login, the page will refresh, and you will see additional options.
- **Logout:** Click the "Logout" button to log out. The page will refresh after successful logout.

### Flip Cards

- The main interface shows a set of cards with Italian verbs on the front.
- Click on a card or press Enter after typing in the input box to flip it and see the English translation.
- Your statistics (success, failure, just flipped) are tracked as you interact with the cards.

### Pagination

- Use the "Previous" and "Next" buttons at the bottom to navigate through different pages of verbs.

### Statistics

- Click the "Save Stats" button to save your current statistics.
- Click the "Show All" button to view all verbs.
- Click the "Previous Failed" button to view verbs you previously failed.
- Click the "Previous Just Flipped" button to view verbs you just flipped.

## Code Explanation

### Backend (Flask)

- **app.py:** The main backend script. It handles routing, user authentication, and interaction with the Excel file containing the verbs data.
- **learnITalian/Data/words.xlsx:** The Excel file containing the Italian verbs and their English translations.

### Frontend

- **index.html:** The main HTML template rendered by Flask.
- **styles.css:** The stylesheet containing styles for the UI components.
- **script.js:** The JavaScript file handling the frontend logic, including fetching data, user interactions, and page updates.

### JavaScript (script.js)

- Handles login and logout interactions, including refreshing the page after successful login/logout.
- Manages fetching and displaying verbs dynamically.
- Implements card flipping functionality and statistics tracking.

## License

This project is licensed under the MIT License.

## Acknowledgements

- [Font Awesome](https://fontawesome.com/) for the user icon
- [Flask](https://flask.palletsprojects.com/) for the web framework
- [pandas](https://pandas.pydata.org/) for data manipulation
- [openpyxl](https://openpyxl.readthedocs.io/en/stable/) for handling Excel files
