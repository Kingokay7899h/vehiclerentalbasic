import React, { useState, useEffect } from 'react';
import { ChevronRight, ChevronLeft, Car, Bike, Calendar, User, Check, MapPin, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { 
  TextField, 
  Button, 
  RadioGroup, 
  FormControlLabel, 
  Radio, 
  FormControl, 
  FormLabel,
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CircularProgress
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';

// NOTE: Replace this with your actual backend URL if it's different.
const API_BASE_URL = 'http://localhost:5000/api';

const App = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    wheels: '',
    vehicleType: '',
    specificModel: '',
    startDate: '',
    endDate: '',
    startDateObj: null, // Dayjs objects for DatePicker
    endDateObj: null
  });
  const [errors, setErrors] = useState({});
  const [isAnimating, setIsAnimating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [vehicleTypes, setVehicleTypes] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [allVehicles, setAllVehicles] = useState([]);

  // Fetch all vehicle types on initial load
  useEffect(() => {
    const fetchVehicleTypes = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/vehicle-types`);
        const data = await response.json();
        setVehicleTypes(data);
      } catch (error) {
        console.error('Error fetching vehicle types:', error);
      }
    };
    fetchVehicleTypes();
  }, []);

  // Fetch vehicles based on selected type
  useEffect(() => {
    if (formData.vehicleType) {
      const fetchVehicles = async () => {
        setIsLoading(true);
        try {
          const response = await fetch(`${API_BASE_URL}/vehicles/${formData.vehicleType}`);
          const data = await response.json();
          setVehicles(data);
          // To get the vehicle name for the summary, we need all vehicles
          setAllVehicles(prev => {
            const newVehicles = [...prev];
            data.forEach(v => {
              if (!newVehicles.find(nv => nv.id === v.id)) {
                newVehicles.push(v);
              }
            });
            return newVehicles;
          });
          setIsLoading(false);
        } catch (error) {
          console.error('Error fetching vehicles:', error);
          setIsLoading(false);
        }
      };
      fetchVehicles();
    }
  }, [formData.vehicleType]);

  const validateStep = (step) => {
    const newErrors = {};
    switch(step) {
      case 0:
        if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
        if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
        break;
      case 1:
        if (!formData.wheels) newErrors.wheels = 'Please select number of wheels';
        break;
      case 2:
        if (!formData.vehicleType) newErrors.vehicleType = 'Please select vehicle type';
        break;
      case 3:
        if (!formData.specificModel) newErrors.specificModel = 'Please select a specific model';
        break;
      case 4:
        if (!formData.startDate) newErrors.startDate = 'Start date is required';
        if (!formData.endDate) newErrors.endDate = 'End date is required';
        if (formData.startDate && formData.endDate && new Date(formData.startDate) >= new Date(formData.endDate)) {
          newErrors.dateRange = 'End date must be after start date';
        }
        break;
      default:
        break;
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStep(currentStep + 1);
        setIsAnimating(false);
      }, 300);
    }
  };

  const handlePrev = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentStep(currentStep - 1);
      setIsAnimating(false);
    }, 300);
  };

  const handleSubmit = async () => {
    // Validate the final step before submitting
    if (validateStep(4)) {
      setIsLoading(true);
      try {
        const payload = {
          firstName: formData.firstName,
          lastName: formData.lastName,
          vehicleId: formData.specificModel,
          startDate: formData.startDate,
          endDate: formData.endDate
        };

        const response = await fetch(`${API_BASE_URL}/bookings`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        const result = await response.json();
        setIsLoading(false);

        if (response.ok) {
          // It's generally better to use a custom modal than window.alert
          alert('Booking submitted successfully! 🎉');
          console.log('Booking Result:', result);
          // Optionally, reset form or move to a success step
          // setCurrentStep(currentStep + 1); 
        } else {
          alert(`Booking Failed: ${result.message}`);
          console.error('Booking failed:', result.message);
        }
      } catch (error) {
        setIsLoading(false);
        alert('An error occurred during booking. Please try again.');
        console.error('Error submitting booking:', error);
      }
    }
  };

  const getVehicleName = (id) => {
    const vehicle = allVehicles.find(v => v.id === id);
    return vehicle ? vehicle.name : 'Unknown Vehicle';
  };

  const steps = [
    {
      title: "What's your name?",
      subtitle: "Let's start with the basics",
      icon: <User className="w-8 h-8" />,
      component: () => (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TextField
              label="First Name"
              variant="outlined"
              fullWidth
              value={formData.firstName}
              onChange={(e) => setFormData({...formData, firstName: e.target.value})}
              error={!!errors.firstName}
              helperText={errors.firstName}
              placeholder="Enter your first name"
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
            />
            <TextField
              label="Last Name"
              variant="outlined"
              fullWidth
              value={formData.lastName}
              onChange={(e) => setFormData({...formData, lastName: e.target.value})}
              error={!!errors.lastName}
              helperText={errors.lastName}
              placeholder="Enter your last name"
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
            />
          </div>
        </div>
      )
    },
    {
      title: "How many wheels?",
      subtitle: "Choose your ride preference",
      icon: <Car className="w-8 h-8" />,
      component: () => (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { value: '4', label: '4 Wheeler', icon: '🚗', desc: 'Cars & Vehicles' },
              { value: '2', label: '2 Wheeler', icon: '🏍️', desc: 'Bikes & Motorcycles' }
            ].map((option) => (
              <div
                key={option.value}
                onClick={() => setFormData({...formData, wheels: option.value, vehicleType: '', specificModel: ''})}
                className={`p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg ${
                  formData.wheels === option.value
                    ? 'border-blue-500 bg-blue-50 shadow-lg'
                    : 'border-gray-200 hover:border-blue-300'
                }`}
              >
                <div className="text-center space-y-3">
                  <div className="text-4xl">{option.icon}</div>
                  <h3 className="font-semibold text-lg">{option.label}</h3>
                  <p className="text-gray-600 text-sm">{option.desc}</p>
                </div>
              </div>
            ))}
          </div>
          {errors.wheels && <p className="text-red-500 text-sm flex items-center gap-1 justify-center">⚠️ {errors.wheels}</p>}
        </div>
      )
    },
    {
      title: "Type of vehicle",
      subtitle: "What style fits your journey?",
      icon: formData.wheels === '2' ? <Bike className="w-8 h-8" /> : <Car className="w-8 h-8" />,
      component: () => (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {vehicleTypes.filter(type => type.wheels == formData.wheels).map((type) => (
              <div
                key={type.id}
                onClick={() => setFormData({...formData, vehicleType: type.id, specificModel: ''})}
                className={`p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg ${
                  formData.vehicleType === type.id
                    ? 'border-blue-500 bg-blue-50 shadow-lg'
                    : 'border-gray-200 hover:border-blue-300'
                }`}
              >
                <div className="text-center space-y-3">
                  <div className="text-4xl">{type.name === 'Hatchback' ? '🚗' : type.name === 'SUV' ? '🚐' : type.name === 'Sedan' ? '🚙' : type.name === 'Cruiser' ? '🏍️' : '💎'}</div>
                  <h3 className="font-semibold text-lg">{type.name}</h3>
                </div>
              </div>
            ))}
          </div>
          {errors.vehicleType && <p className="text-red-500 text-sm flex items-center gap-1 justify-center">⚠️ {errors.vehicleType}</p>}
        </div>
      )
    },
    {
      title: "Choose your ride",
      subtitle: "Pick the perfect vehicle",
      icon: <MapPin className="w-8 h-8" />,
      component: () => (
        <div className="space-y-6">
          {isLoading ? (
            <div className="flex justify-center items-center h-48">
              <CircularProgress size={40} />
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {vehicles.map((model) => (
                <div
                  key={model.id}
                  onClick={() => setFormData({...formData, specificModel: model.id})}
                  className={`p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300 hover:scale-102 hover:shadow-lg ${
                    formData.specificModel === model.id
                      ? 'border-blue-500 bg-blue-50 shadow-lg'
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-lg">{model.name}</h3>
                      <p className="text-blue-600 font-medium">₹{model.price_per_day}/day</p>
                    </div>
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      formData.specificModel === model.id ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                    }`}>
                      {formData.specificModel === model.id && <Check className="w-4 h-4 text-white" />}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          {errors.specificModel && <p className="text-red-500 text-sm flex items-center gap-1 justify-center">⚠️ {errors.specificModel}</p>}
        </div>
      )
    },
    {
      title: "When do you need it?",
      subtitle: "Select your travel dates",
      icon: <Calendar className="w-8 h-8" />,
      component: () => (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <div className="space-y-6">
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3, alignItems: 'center', justifyContent: 'center' }}>
              <DatePicker
                label="Start Date"
                value={formData.startDateObj}
                onChange={(newValue) => {
                  setFormData({
                    ...formData, 
                    startDateObj: newValue,
                    startDate: newValue ? newValue.format('YYYY-MM-DD') : '',
                    endDateObj: (formData.endDateObj && newValue && formData.endDateObj.isBefore(newValue)) ? null : formData.endDateObj,
                    endDate: (formData.endDateObj && newValue && formData.endDateObj.isBefore(newValue)) ? '' : formData.endDate
                  });
                }}
                minDate={dayjs()}
                slotProps={{ textField: { error: !!errors.startDate, helperText: errors.startDate, fullWidth: true, sx: { '& .MuiOutlinedInput-root': { borderRadius: '12px' } } } }}
              />
              <Typography variant="body2" color="text.secondary" sx={{ mx: 1 }}> to </Typography>
              <DatePicker
                label="End Date"
                value={formData.endDateObj}
                onChange={(newValue) => {
                  setFormData({
                    ...formData, 
                    endDateObj: newValue,
                    endDate: newValue ? newValue.format('YYYY-MM-DD') : ''
                  });
                }}
                minDate={formData.startDateObj ? formData.startDateObj.add(1, 'day') : dayjs()}
                disabled={!formData.startDateObj}
                slotProps={{ textField: { error: !!errors.endDate, helperText: errors.endDate, fullWidth: true, sx: { '& .MuiOutlinedInput-root': { borderRadius: '12px' } } } }}
              />
            </Box>
            {(formData.startDateObj && formData.endDateObj && formData.endDateObj.isAfter(formData.startDateObj)) && (
              <Box sx={{ textAlign: 'center', mt: 2 }}>
                <Paper elevation={1} sx={{ p: 2, borderRadius: '12px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                  <Typography variant="body2" color="text.secondary">
                    Duration: {formData.endDateObj.diff(formData.startDateObj, 'day')} day(s)
                  </Typography>
                  <Typography variant="body2" color="primary" sx={{ mt: 0.5 }}>
                    {formData.startDateObj.format('MMM DD, YYYY')} → {formData.endDateObj.format('MMM DD, YYYY')}
                  </Typography>
                </Paper>
              </Box>
            )}
            {errors.dateRange && <p className="text-red-500 text-sm flex items-center gap-1 justify-center">⚠️ {errors.dateRange}</p>}
          </div>
        </LocalizationProvider>
      )
    }
  ];

  const CurrentStepComponent = steps[currentStep]?.component;
  const currentStepInfo = steps[currentStep];

  // A final summary/confirmation step
  const ConfirmationStep = () => (
    <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Review Your Booking</h2>
        <p className="text-gray-600 text-lg">Please confirm the details below before booking.</p>
        <Paper 
            elevation={1} 
            sx={{ 
                p: 3, 
                borderRadius: '16px', 
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                textAlign: 'left'
            }}
        >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700">
                <div className="flex flex-col"><span className="text-sm font-semibold text-gray-500">Full Name</span> {formData.firstName} {formData.lastName}</div>
                <div className="flex flex-col"><span className="text-sm font-semibold text-gray-500">Vehicle</span> {getVehicleName(formData.specificModel)}</div>
                <div className="flex flex-col"><span className="text-sm font-semibold text-gray-500">Start Date</span> {dayjs(formData.startDate).format('MMM DD, YYYY')}</div>
                <div className="flex flex-col"><span className="text-sm font-semibold text-gray-500">End Date</span> {dayjs(formData.endDate).format('MMM DD, YYYY')}</div>
                <div className="flex flex-col md:col-span-2"><span className="text-sm font-semibold text-gray-500">Total Duration</span> {dayjs(formData.endDate).diff(dayjs(formData.startDate), 'day')} days</div>
            </div>
        </Paper>
    </div>
  );
  
  const allSteps = [...steps, {
    title: "Confirm Booking",
    subtitle: "Almost there!",
    icon: <Check className="w-8 h-8" />,
    component: ConfirmationStep
  }];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8 px-4 font-sans">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Vehicle Rental Booking
          </h1>
          <p className="text-gray-600 text-lg">Find your perfect ride in just a few steps</p>
        </div>
        
        <div className="mb-8 px-4">
            <div className="flex items-center">
                {allSteps.map((step, index) => (
                    <React.Fragment key={index}>
                        <div className="flex flex-col items-center">
                            <div
                                className={`flex items-center justify-center w-12 h-12 rounded-full transition-all duration-500 z-10 ${
                                index <= currentStep ? 'bg-blue-500 text-white shadow-lg' : 'bg-gray-200 text-gray-400'
                                }`}
                            >
                                {index < currentStep ? <Check className="w-6 h-6" /> : <span className="font-semibold">{index + 1}</span>}
                            </div>
                            <p className={`mt-2 text-xs text-center ${index <= currentStep ? 'text-blue-600 font-semibold' : 'text-gray-500'}`}>{step.title}</p>
                        </div>
                        {index < allSteps.length - 1 && (
                            <div className={`flex-auto border-t-2 transition-all duration-500 ${index < currentStep ? 'border-blue-500' : 'border-gray-200'}`}></div>
                        )}
                    </React.Fragment>
                ))}
            </div>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl p-8 mb-8">
          <div className={`transition-all duration-300 ${isAnimating ? 'opacity-0 transform translate-x-4' : 'opacity-100 transform translate-x-0'}`}>
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <div className="p-4 bg-blue-100 rounded-2xl text-blue-600">
                  {allSteps[currentStep]?.icon}
                </div>
              </div>
              <h2 className="text-3xl font-bold text-gray-800 mb-2">
                {allSteps[currentStep]?.title}
              </h2>
              <p className="text-gray-600 text-lg">{allSteps[currentStep]?.subtitle}</p>
            </div>
            <div className="mb-8 min-h-[200px] flex items-center justify-center">
              {allSteps[currentStep]?.component()}
            </div>
            <div className="flex justify-between items-center mt-8">
              <Button
                onClick={handlePrev}
                disabled={currentStep === 0}
                startIcon={<ChevronLeft className="w-5 h-5" />}
                variant="text"
                sx={{ borderRadius: '12px', textTransform: 'none', fontSize: '16px', fontWeight: 600, color: currentStep === 0 ? 'gray' : '#6B7280', '&:hover': { backgroundColor: currentStep === 0 ? 'transparent' : '#EFF6FF', color: currentStep === 0 ? 'gray' : '#2563EB' } }}
              >
                Previous
              </Button>
              {currentStep < allSteps.length - 1 ? (
                <Button
                  onClick={handleNext}
                  endIcon={<ChevronRight className="w-5 h-5" />}
                  variant="contained"
                  sx={{ borderRadius: '12px', textTransform: 'none', fontSize: '16px', fontWeight: 600, background: 'linear-gradient(to right, #3B82F6, #8B5CF6)', padding: '12px 32px', '&:hover': { background: 'linear-gradient(to right, #2563EB, #7C3AED)', transform: 'scale(1.05)' } }}
                >
                  Next
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={isLoading}
                  endIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <Check className="w-5 h-5" />}
                  variant="contained"
                  sx={{ borderRadius: '12px', textTransform: 'none', fontSize: '16px', fontWeight: 600, background: 'linear-gradient(to right, #10B981, #3B82F6)', padding: '12px 32px', '&:hover': { background: 'linear-gradient(to right, #059669, #2563EB)', transform: 'scale(1.05)' }, '&:disabled': { opacity: 0.5 } }}
                >
                  {isLoading ? 'Booking...' : 'Book Now'}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
