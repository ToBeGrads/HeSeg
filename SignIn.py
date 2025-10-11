from flask import Flask, request, jsonify
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from flask_cors import CORS

app = Flask(__name__)
app.config['JWT_SECRET_KEY'] = 'super-secret'
jwt = JWTManager(app)
CORS(app)

USERS = {'user': 'pass'}

@app.route('/login', methods=['POST'])
def login():
    data = request.json
    if USERS.get(data['username']) == data['password']:
        token = create_access_token(identity=data['username'])
        return jsonify(access_token=token)
    return jsonify(msg='Bad credentials'), 401

if __name__ == '__main__':
    app.run(debug=True, port=5001)