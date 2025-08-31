// backend/server.js

const express = require('express');
const cors = require('cors');
const { Sequelize, DataTypes, Op } = require('sequelize');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const app = express();

// Middleware for CORS and JSON body parsing
app.use(cors());
app.use(express.json());

// Set up the database connection using Sequelize
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: 'mysql',
    logging: false, // Set to true for debugging SQL queries
  }
);

// Define Sequelize models that mirror the SQL schema
const VehicleType = sequelize.define('VehicleType', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  wheels: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
}, {
  tableName: 'vehicle_types',
  timestamps: false,
});

const Vehicle = sequelize.define('Vehicle', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  type_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  price_per_day: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  is_available: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
}, {
  tableName: 'vehicles',
  timestamps: false,
});

const Booking = sequelize.define('Booking', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  first_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  last_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  vehicle_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  start_date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  end_date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
}, {
  tableName: 'bookings',
  timestamps: false,
});

// Define model associations
VehicleType.hasMany(Vehicle, { foreignKey: 'type_id' });
Vehicle.belongsTo(VehicleType, { foreignKey: 'type_id' });
Vehicle.hasMany(Booking, { foreignKey: 'vehicle_id' });
Booking.belongsTo(Vehicle, { foreignKey: 'vehicle_id' });

// API Route to get all vehicle types (2-wheelers and 4-wheelers)
app.get('/api/vehicle-types', async (req, res) => {
  try {
    const types = await VehicleType.findAll();
    res.json(types);
  } catch (error) {
    console.error('Error fetching vehicle types:', error);
    res.status(500).json({ message: 'Error fetching vehicle types' });
  }
});

// API Route to get vehicles by type ID
app.get('/api/vehicles/:typeId', async (req, res) => {
  try {
    const { typeId } = req.params;
    const vehicles = await Vehicle.findAll({
      where: { type_id: typeId, is_available: true },
    });
    res.json(vehicles);
  } catch (error) {
    console.error('Error fetching vehicles:', error);
    res.status(500).json({ message: 'Error fetching vehicles' });
  }
});

// API Route to submit a new booking
app.post('/api/bookings', async (req, res) => {
  try {
    const { firstName, lastName, vehicleId, startDate, endDate } = req.body;

    // Backend validation for required fields
    if (!firstName || !lastName || !vehicleId || !startDate || !endDate) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    // Check for booking overlap for the selected vehicle
    const existingBookings = await Booking.findAll({
      where: {
        vehicle_id: vehicleId,
        [Op.or]: [
          // Case 1: Existing booking starts within the new booking's date range
          { start_date: { [Op.between]: [startDate, endDate] } },
          // Case 2: Existing booking ends within the new booking's date range
          { end_date: { [Op.between]: [startDate, endDate] } },
          // Case 3: New booking is fully contained within an existing booking
          { start_date: { [Op.lte]: startDate }, end_date: { [Op.gte]: endDate } },
          // Case 4: Existing booking is fully contained within the new booking
          { start_date: { [Op.gte]: startDate }, end_date: { [Op.lte]: endDate } },
        ],
      },
    });

    if (existingBookings.length > 0) {
      return res.status(409).json({ message: 'This vehicle is already booked for the selected dates. Please choose a different date range or vehicle.' });
    }

    // Create the new booking
    const newBooking = await Booking.create({
      first_name: firstName,
      last_name: lastName,
      vehicle_id: vehicleId,
      start_date: startDate,
      end_date: endDate,
    });

    res.status(201).json({ message: 'Booking created successfully!', booking: newBooking });
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({ message: 'An internal server error occurred.' });
  }
});

// Sync database models and start the server
async function startServer() {
  try {
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
}

startServer();