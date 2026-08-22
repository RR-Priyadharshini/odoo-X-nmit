from backend.database import db

class Employee(db.Model):
    __tablename__ = 'employees'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), unique=True, nullable=False)
    phone = db.Column(db.String(30), nullable=True)
    address = db.Column(db.Text, nullable=True)
    designation = db.Column(db.String(100), nullable=False)
    department = db.Column(db.String(100), nullable=False)
    joining_date = db.Column(db.Date, nullable=False)
    profile_picture = db.Column(db.Text, nullable=True)

    attendance = db.relationship('Attendance', backref='employee', lazy='dynamic', cascade='all, delete-orphan')
    leaves = db.relationship('Leave', backref='employee', lazy='dynamic', cascade='all, delete-orphan')
    payroll = db.relationship('Payroll', backref='employee', uselist=False, cascade='all, delete-orphan')

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'phone': self.phone,
            'address': self.address,
            'designation': self.designation,
            'department': self.department,
            'joining_date': self.joining_date.isoformat() if self.joining_date else None,
            'profile_picture': self.profile_picture
        }
