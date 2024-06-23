from flask import Flask, render_template, jsonify, request, session
import pandas as pd
import random
from werkzeug.security import generate_password_hash, check_password_hash

app = Flask(__name__)
app.secret_key = 'your_secret_key'

# Read the Excel file
excel_file_path = 'learnITalian/Data/words.xlsx'
data = pd.read_excel(excel_file_path)

# Convert the data to a list of dictionaries
verbs_data = data.to_dict(orient='records')

@app.route('/')
def index():
    user_logged_in = 'user' in session
    random.shuffle(verbs_data)
    return render_template('index.html', user_logged_in=user_logged_in)

@app.route('/get_verbs')
def get_verbs():
    if 'user' not in session:
        return jsonify({"error": "User not logged in", "data": []}), 401  # 401 Unauthorized

    page = int(request.args.get('page', 1))
    per_page = int(request.args.get('per_page', 9))
    start = (page - 1) * per_page
    end = start + per_page
    total_pages = (len(verbs_data) + per_page - 1) // per_page
    response_data = {
        'verbs': verbs_data[start:end],
        'total_pages': total_pages,
        'current_page': page
    }
    return jsonify(response_data)

@app.route('/get_verbs/<sheet_name>')
def get_verbs_from_sheet(sheet_name):
    username = session.get('user')  # Assuming the username is stored in session
    if not username:
        return jsonify({"error": "User not logged in"}), 401

    try:
        data = pd.read_excel(excel_file_path, sheet_name=sheet_name)
        # Filter data by username
        filtered_data = data[data['Username'] == username]
        sheet_data = filtered_data.to_dict(orient='records')
        random.shuffle(sheet_data)
        page = int(request.args.get('page', 1))
        per_page = int(request.args.get('per_page', 10))
        start = (page - 1) * per_page
        end = start + per_page
        total_pages = (len(sheet_data) + per_page - 1) // per_page
        response_data = {
            'verbs': sheet_data[start:end],
            'total_pages': total_pages,
            'current_page': page
        }
        return jsonify(response_data)
    except Exception as e:
        return jsonify({"error": str(e)}), 400
@app.route('/save_stats', methods=['POST'])
def save_stats():
    stats_data = request.json
    just_flipped = stats_data.get('justFlipped', [])
    failure = stats_data.get('failure', [])
    username = session['user']

    with pd.ExcelWriter(excel_file_path, engine="openpyxl", mode='a', if_sheet_exists='replace') as writer:
        if just_flipped:
            just_flipped_df = pd.DataFrame(just_flipped, columns=['Italian', 'English'])
            just_flipped_df['Username'] = username  # Add the username column
            just_flipped_df.to_excel(writer, sheet_name='JustFlipped', index=False)
        if failure:
            failure_df = pd.DataFrame(failure, columns=['Italian', 'English'])
            failure_df['Username'] = username  # Add the username column
            failure_df.to_excel(writer, sheet_name='Failure', index=False)

    return jsonify({"status": "success"})

@app.route('/signup', methods=['POST'])
def signup():
    user_data = request.json
    username = user_data.get('username')
    password = user_data.get('password')

    try:
        existing_data = pd.read_excel(excel_file_path, sheet_name='Users')
        if username in existing_data['Username'].values:
            return jsonify({"error": "Username already exists"}), 400
        new_user_data = existing_data.append({'Username': username, 'Password': generate_password_hash(password)}, ignore_index=True)
    except Exception as e:
        new_user_data = pd.DataFrame([{'Username': username, 'Password': generate_password_hash(password)}])

    with pd.ExcelWriter(excel_file_path, engine="openpyxl", mode='a', if_sheet_exists='replace') as writer:
        new_user_data.to_excel(writer, sheet_name='Users', index=False)

    return jsonify({"status": "success"})

@app.route('/login', methods=['POST'])
def login():
    user_data = request.json
    username = user_data.get('username')
    password = user_data.get('password')

    try:
        existing_data = pd.read_excel(excel_file_path, sheet_name='Users')
        user_row = existing_data[existing_data['Username'] == username].iloc[0]
        if check_password_hash(user_row['Password'], password):
            session['user'] = username  # Set session for the logged-in user
            return jsonify({"status": "success"})
        else:
            return jsonify({"error": "Invalid username or password"}), 400
    except Exception as e:
        return jsonify({"error": "Invalid username or password"}), 400

@app.route('/logout', methods=['POST'])
def logout():
    session.clear()  # Clear the session
    return jsonify({"status": "success"})

if __name__ == "__main__":
    app.run(debug=True)
