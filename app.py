from flask import Flask, render_template, request, jsonify, redirect
import json
import os

app = Flask(__name__)

DATA_FILE = "data/data.json"

# 初期化
if not os.path.exists(DATA_FILE):
    with open(DATA_FILE, "w") as f:
        json.dump({
            "programs": [],
            "goals": {"target_tes": 0, "target_pcs": 0, "pcs_factor": 1.2}
        }, f)

def load_data():
    with open(DATA_FILE) as f:
        return json.load(f)

def save_data(data):
    with open(DATA_FILE, "w") as f:
        json.dump(data, f, indent=2)

@app.route("/")
def index():
    return redirect("/program")

@app.route("/program")
def program():
    return render_template("program.html")

@app.route("/data")
def get_data():
    return jsonify(load_data())

@app.route("/program", methods=["POST"])
def save_program():
    data = load_data()
    data["programs"].append(request.json)
    save_data(data)
    return {"status": "ok"}

@app.route("/goal", methods=["POST"])
def save_goal():
    data = load_data()
    data["goals"] = request.json
    save_data(data)
    return {"status": "ok"}

if __name__ == "__main__":
    app.run(debug=True)