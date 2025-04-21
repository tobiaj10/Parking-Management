from flask import Flask, jsonify, request
from flask_cors import CORS
import os
from dotenv import load_dotenv
from datetime import datetime
import math
from database import init_db, db_session
from models import Ticket, GarageSetting
from sqlalchemy import func, desc
import random

# Load environment variables
load_dotenv()

app = Flask(__name__, static_folder='../client/dist', static_url_path='/')
CORS(app)

# Initialize database
init_db()

# Create default garage settings if none exist
def initialize_garage_settings():
    settings = GarageSetting.query.first()
    if not settings:
        new_settings = GarageSetting(
            total_spaces=140,
            hourly_rate=1000  # $10.00 in cents
        )
        db_session.add(new_settings)
        db_session.commit()

# Run initialization
initialize_garage_settings()

# Serve frontend static assets
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    if path and os.path.exists(os.path.join(app.static_folder, path)):
        return app.send_static_file(path)
    return app.send_static_file('index.html')

# API status endpoint
@app.route('/api/status', methods=['GET'])
def status():
    return jsonify({'status': 'ok'})

# Get garage stats
@app.route('/api/garage/stats', methods=['GET'])
def get_garage_stats():
    try:
        # Get garage settings
        settings = GarageSetting.query.first()
        if not settings:
            return jsonify({'message': 'Garage settings not found'}), 404
        
        # Count active tickets for occupied spaces
        occupied_spaces = Ticket.query.filter_by(status='active').count()
        available_spaces = settings.total_spaces - occupied_spaces
        
        # Calculate occupancy percentages
        occupied_percentage = math.floor((occupied_spaces / settings.total_spaces) * 100)
        available_percentage = 100 - occupied_percentage
        
        # Calculate today's revenue
        today = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
        today_revenue = db_session.query(func.sum(Ticket.amount_paid)).filter(
            Ticket.status == 'completed',
            Ticket.exit_time >= today
        ).scalar() or 0
        
        # Count vehicles processed today
        vehicles_processed = Ticket.query.filter(
            Ticket.status == 'completed',
            Ticket.exit_time >= today
        ).count()
        
        # Calculate average stay time
        avg_stay = db_session.query(func.avg(Ticket.duration_minutes)).filter(
            Ticket.status == 'completed'
        ).scalar() or 0
        
        return jsonify({
            'totalSpaces': settings.total_spaces,
            'occupiedSpaces': occupied_spaces,
            'availableSpaces': available_spaces,
            'occupiedSpacesPercentage': occupied_percentage,
            'availableSpacesPercentage': available_percentage,
            'hourlyRate': settings.hourly_rate / 100,  # Convert to dollars
            'todaysRevenue': today_revenue / 100,  # Convert to dollars
            'vehiclesProcessedToday': vehicles_processed,
            'averageStayTime': round(avg_stay / 60, 1) if avg_stay else 0  # Convert to hours and round to 1 decimal place
        })
    except Exception as e:
        print(f"Error getting garage stats: {e}")
        return jsonify({'message': 'Error retrieving garage statistics'}), 500

# Create a new ticket
@app.route('/api/tickets', methods=['POST'])
def create_ticket():
    try:
        data = request.json
        
        # Validate required fields
        if not data.get('licensePlate') or not data.get('vehicleType'):
            return jsonify({'message': 'License plate and vehicle type are required'}), 400
        
        # Generate ticket number
        ticket_number = f"PS-{1000 + random.randint(0, 8999)}"
        
        # Create new ticket
        new_ticket = Ticket(
            ticket_number=ticket_number,
            license_plate=data['licensePlate'],
            vehicle_type=data['vehicleType'],
            entry_time=datetime.now(),
            status='active'
        )
        
        db_session.add(new_ticket)
        db_session.commit()
        
        return jsonify(new_ticket.to_dict()), 201
    except Exception as e:
        print(f"Error creating ticket: {e}")
        return jsonify({'message': 'Error creating parking ticket'}), 500

# Get a ticket by number
@app.route('/api/tickets/<ticket_number>', methods=['GET'])
def get_ticket(ticket_number):
    try:
        ticket = Ticket.query.filter_by(ticket_number=ticket_number).first()
        
        if not ticket:
            return jsonify({'message': 'Ticket not found'}), 404
        
        return jsonify(ticket.to_dict())
    except Exception as e:
        print(f"Error retrieving ticket: {e}")
        return jsonify({'message': 'Error retrieving ticket information'}), 500

# Process payment and exit
@app.route('/api/tickets/<ticket_number>/exit', methods=['PUT'])
def process_exit(ticket_number):
    try:
        ticket = Ticket.query.filter_by(ticket_number=ticket_number).first()
        
        if not ticket:
            return jsonify({'message': 'Ticket not found'}), 404
        
        if ticket.status != 'active':
            return jsonify({'message': 'Ticket has already been processed'}), 400
        
        # Get payment method from request
        data = request.json
        payment_method = data.get('paymentMethod')
        
        if not payment_method:
            return jsonify({'message': 'Payment method is required'}), 400
        
        # Calculate duration and amount
        exit_time = datetime.now()
        entry_time = ticket.entry_time
        
        # Calculate duration in minutes
        duration_minutes = math.ceil((exit_time - entry_time).total_seconds() / 60)
        
        # Get hourly rate from settings
        settings = GarageSetting.query.first()
        if not settings:
            return jsonify({'message': 'Garage settings not found'}), 500
        
        # Calculate payment amount (rounded up to the next hour)
        hours = math.ceil(duration_minutes / 60)
        amount_paid = hours * settings.hourly_rate
        
        # Update ticket
        ticket.exit_time = exit_time
        ticket.duration_minutes = duration_minutes
        ticket.amount_paid = amount_paid
        ticket.payment_method = payment_method
        ticket.status = 'completed'
        
        db_session.commit()
        
        return jsonify(ticket.to_dict())
    except Exception as e:
        print(f"Error processing exit: {e}")
        return jsonify({'message': 'Error processing exit'}), 500

# Get recent activities/tickets
@app.route('/api/activities', methods=['GET'])
def get_activities():
    try:
        limit = request.args.get('limit', default=10, type=int)
        tickets = Ticket.query.order_by(desc(Ticket.entry_time)).limit(limit).all()
        
        # Format activities for the response
        activities = [
            {
                'id': ticket.id,
                'ticketNumber': ticket.ticket_number,
                'licensePlate': ticket.license_plate,
                'entryTime': ticket.entry_time.isoformat() if ticket.entry_time else None,
                'exitTime': ticket.exit_time.isoformat() if ticket.exit_time else None,
                'durationMinutes': ticket.duration_minutes,
                'amount': ticket.amount_paid / 100 if ticket.amount_paid else None,  # Convert to dollars
                'status': ticket.status
            }
            for ticket in tickets
        ]
        
        return jsonify(activities)
    except Exception as e:
        print(f"Error retrieving activities: {e}")
        return jsonify({'message': 'Error retrieving recent activities'}), 500

if __name__ == '__main__':
    host = os.getenv('HOST', '0.0.0.0')
    port = int(os.getenv('PORT', 5000))
    app.run(host=host, port=port, debug=True)