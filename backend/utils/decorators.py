from functools import wraps
from flask import request, jsonify, g, current_app
import jwt
from backend.models.user import User

def authenticate_jwt(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'error': 'Authentication required. No token provided.'}), 401
        
        token = auth_header.split(' ')[1]
        secret = current_app.config.get('JWT_SECRET_KEY', 'dayflow-secret-key')
        
        try:
            payload = jwt.decode(token, secret, algorithms=['HS256'])
            user = User.query.get(payload['id'])
            if not user:
                return jsonify({'error': 'User associated with token no longer exists.'}), 401
            g.current_user = user
        except jwt.ExpiredSignatureError:
            return jsonify({'error': 'Token has expired.'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'error': 'Invalid authentication token.'}), 401
            
        return f(*args, **kwargs)
    return decorated

def require_role(allowed_role):
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            if not hasattr(g, 'current_user') or not g.current_user:
                return jsonify({'error': 'Authentication required.'}), 401
            if g.current_user.role != allowed_role:
                return jsonify({'error': f'Forbidden: Access restricted to {allowed_role} role.'}), 403
            return f(*args, **kwargs)
        return decorated_function
    return decorator
