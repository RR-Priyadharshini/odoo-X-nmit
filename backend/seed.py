from datetime import datetime, timedelta
from werkzeug.security import generate_password_hash
from backend.app import create_app
from backend.database import db
from backend.models import User, Employee, Attendance, Leave, Payroll

def seed():
    app = create_app()
    with app.app_context():
        db.drop_all()
        db.create_all()

        print("Seeding Dayflow demo database...")

        # 1 Admin
        admin_user = User(
            employee_code="ADM001",
            name="Aditi Rao",
            email="admin@dayflow.com",
            password_hash=generate_password_hash("Admin@123"),
            role="admin",
            created_at=datetime.utcnow() - timedelta(days=300)
        )
        db.session.add(admin_user)
        db.session.flush()

        admin_emp = Employee(
            user_id=admin_user.id,
            phone="+91 98765 43210",
            address="Indiranagar, Bengaluru",
            designation="Head of People & Operations",
            department="Human Resources",
            joining_date=datetime.utcnow().date() - timedelta(days=300),
            profile_picture="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150"
        )
        db.session.add(admin_emp)
        db.session.flush()

        db.session.add(Payroll(
            employee_id=admin_emp.id,
            basic_salary=160000,
            allowances=35000,
            deductions=18000,
            net_salary=177000
        ))

        # 4 Employees
        employees_data = [
            ("EMP101", "Aarav Sharma", "aarav@dayflow.com", "Senior Backend Engineer", "Engineering", 200, 140000, 25000, 15000),
            ("EMP102", "Priya Patel", "priya@dayflow.com", "Product Design Lead", "Design", 150, 125000, 20000, 12000),
            ("EMP103", "Rohit Verma", "rohit@dayflow.com", "Enterprise Account Executive", "Sales", 100, 110000, 30000, 14000),
            ("EMP104", "Ananya Iyer", "ananya@dayflow.com", "HR & Talent Partner", "Human Resources", 60, 85000, 15000, 9000),
        ]

        for code, name, email, desig, dept, days_ago, basic, allow, ded in employees_data:
            user = User(
                employee_code=code,
                name=name,
                email=email,
                password_hash=generate_password_hash("Employee@123"),
                role="employee",
                created_at=datetime.utcnow() - timedelta(days=days_ago)
            )
            db.session.add(user)
            db.session.flush()

            emp = Employee(
                user_id=user.id,
                phone=f"+91 98{days_ago:03d} {code[-3:]}99",
                address="Bengaluru, Karnataka",
                designation=desig,
                department=dept,
                joining_date=datetime.utcnow().date() - timedelta(days=days_ago),
                profile_picture="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"
            )
            db.session.add(emp)
            db.session.flush()

            db.session.add(Payroll(
                employee_id=emp.id,
                basic_salary=basic,
                allowances=allow,
                deductions=ded,
                net_salary=basic + allow - ded
            ))

        db.session.commit()
        print("Database seeded successfully with 1 Admin & 4 Employees!")

if __name__ == '__main__':
    seed()
