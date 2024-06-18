from flask import Flask, render_template, jsonify, request
import pandas as pd
import random

app = Flask(__name__)

# Read the Excel file
excel_file_path = 'Data/words.xlsx'
data = pd.read_excel(excel_file_path)

# Convert the data to a list of dictionaries
verbs_data = data.to_dict(orient='records')

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/get_verbs')
def get_verbs():
    random.shuffle(verbs_data)
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
    try:
        data = pd.read_excel(excel_file_path, sheet_name=sheet_name)
        sheet_data = data.to_dict(orient='records')
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
    
    with pd.ExcelWriter(excel_file_path, mode='a', if_sheet_exists='replace') as writer:
        if just_flipped:
            pd.DataFrame(just_flipped, columns=['Italian', 'English']).to_excel(writer, sheet_name='JustFlipped', index=False)
        if failure:
            pd.DataFrame(failure, columns=['Italian', 'English']).to_excel(writer, sheet_name='Failure', index=False)
    
    return jsonify({"status": "success"})

# if __name__ == "__main__":
#     app.run(debug=True)
