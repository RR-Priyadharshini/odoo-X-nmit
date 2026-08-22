from flask import jsonify

def register_error_handlers(app):
    @app.errorhandler(400)
    def bad_request(e):
        return jsonify({'error': str(e.description if hasattr(e, 'description') else 'Bad request')}), 400

    @app.errorhandler(401)
    def unauthorized(e):
        return jsonify({'error': 'Unauthorized: Access token missing or invalid'}), 401

    @app.errorhandler(403)
    def forbidden(e):
        return jsonify({'error': 'Forbidden: You do not have permission for this resource'}), 403

    @app.errorhandler(404)
    def not_found(e):
        return jsonify({'error': 'Resource not found'}), 404

    @app.errorhandler(409)
    def conflict(e):
        return jsonify({'error': str(e.description if hasattr(e, 'description') else 'Conflict')}), 409

    @app.errorhandler(500)
    def internal_server_error(e):
        return jsonify({'error': 'Internal server error occurred'}), 500
