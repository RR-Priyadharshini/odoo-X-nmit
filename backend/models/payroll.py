from datetime import datetime
from backend.database import db

class Payroll(db.Model):
    __tablename__ = 'payroll'

    id = db.Column(db.Integer, primary_key=True)
    employee_id = db.Column(db.Integer, db.ForeignKey('employees.id'), unique=True, nullable=False)
    basic_salary = db.Column(db.Float, nullable=False)
    allowances = db.Column(db.Float, default=0.0)
    deductions = db.Column(db.Float, default=0.0)
    net_salary = db.Column(db.Float, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def recompute_net(self):
        self.net_salary = (self.basic_salary or 0) + (self.allowances or 0) - (self.deductions or 0)

    def to_dict(self):
        return {
            'id': self.id,
            'employee_id': self.employee_id,
            'basic_salary': self.basic_salary,
            'allowances': self.allowances,
            'deductions': self.deductions,
            'net_salary': self.net_salary,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
