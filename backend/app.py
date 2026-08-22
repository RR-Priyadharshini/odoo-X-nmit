import os
from flask import Flask, jsonify
from flask_cors import CORS
from backend.database import db
from backend.utils.errors import register_error_handlers

def create_app(test_config=None):
    app = Flask(__name__)
    CORS(app)

    db_path = os.path.join(os.path.abspath(os.path.dirname(__file__)), 'dayflow.db')
    app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL', f'sqlite:///{db_path}')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY', 'dayflow-secret-key-2025')

    if test_config:
        app.config.update(test_config)

    db.init_app(app)
    register_error_handlers(app)

    with app.app_context():
        db.create_all()

    @app.route('/api/health', methods=['GET'])
    def health():
        return jsonify({'status': 'ok', 'app': 'Dayflow HRMS Backend'})

    return app

if __name__ == '__main__':
    app = create_app()
    app.run(host='0.0.0.0', port=5000, debug=True)
