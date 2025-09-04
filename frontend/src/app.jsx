import React, { useState, useEffect, useMemo, useCallback, useReducer, createContext, useContext, memo, lazy, Suspense } from 'react';
import { ChevronRight, ChevronLeft, Car, Bike, Calendar, User, Check, Building, Shapes, ClipboardCheck, XCircle, MapPin, Clock, Star, Shield, Zap } from 'lucide-react';
import { CircularProgress } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';

// --- REACT CONTEXT API FOR GLOBAL STATE MANAGEMENT ---
const BookingContext = createContext();
const useBookingContext = () => {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error('useBookingContext must be used within a BookingProvider');
  }
  return context;
};

// --- CUSTOM HOOKS FOR BUSINESS LOGIC ---
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  
  return debouncedValue;
};

const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      // Note: In Claude environment, we'll use memory storage
      return initialValue;
    } catch (error) {
      return initialValue;
    }
  });

  const setValue = useCallback((value) => {
    try {
      setStoredValue(value);
    } catch (error) {
      console.error(`Error saving to localStorage:`, error);
    }
  }, []);

  return [storedValue, setValue];
};

const useApiCall = (url, dependencies = []) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [url]);

  useEffect(() => {
    if (url) {
      fetchData();
    }
  }, dependencies);

  return { data, loading, error, refetch: fetchData };
};

// --- REDUCER FOR COMPLEX STATE MANAGEMENT ---
const formReducer = (state, action) => {
  switch (action.type) {
    case 'UPDATE_FIELD':
      return { ...state, [action.field]: action.value };
    case 'UPDATE_MULTIPLE':
      return { ...state, ...action.payload };
    case 'RESET_FORM':
      return action.payload;
    case 'SET_ERRORS':
      return { ...state, errors: action.payload };
    case 'CLEAR_ERRORS':
      return { ...state, errors: {} };
    default:
      return state;
  }
};

// --- HARDCODED DATA TO REPLACE BACKEND CALLS ---
const VEHICLE_TYPES_DATA = [
  { id: 1, name: 'Hatchback', wheels: 4 },
  { id: 2, name: 'SUV', wheels: 4 },
  { id: 3, name: 'Sedan', wheels: 4 },
  { id: 4, name: 'Cruiser', wheels: 2 }
];

const VEHICLES_DATA = [
  // Hatchback vehicles (type_id: 1)
  { id: 1, name: 'Swift', type_id: 1, price_per_day: 1500.00, is_available: true },
  { id: 2, name: 'Alto', type_id: 1, price_per_day: 1200.00, is_available: true },
  { id: 3, name: 'Tiago', type_id: 1, price_per_day: 1400.00, is_available: true },
  // SUV vehicles (type_id: 2)
  { id: 4, name: 'Scorpio', type_id: 2, price_per_day: 2500.00, is_available: true },
  { id: 5, name: 'XUV500', type_id: 2, price_per_day: 2800.00, is_available: true },
  { id: 6, name: 'Creta', type_id: 2, price_per_day: 2200.00, is_available: true },
  // Sedan vehicles (type_id: 3)
  { id: 7, name: 'City', type_id: 3, price_per_day: 2000.00, is_available: true },
  { id: 8, name: 'Verna', type_id: 3, price_per_day: 1900.00, is_available: true },
  { id: 9, name: 'Ciaz', type_id: 3, price_per_day: 1800.00, is_available: true },
  // Cruiser vehicles (type_id: 4)
  { id: 10, name: 'Royal Enfield Classic 350', type_id: 4, price_per_day: 800.00, is_available: true },
  { id: 11, name: 'Avenger 220 Cruise', type_id: 4, price_per_day: 700.00, is_available: true },
  { id: 12, name: 'Jawa Perak', type_id: 4, price_per_day: 900.00, is_available: true }
];

// --- CONFIGURATION & API ---
const API_BASE_URL = 'http://localhost:5000/api';

// --- VEHICLE IMAGE URLs ---
const VEHICLE_IMAGES = {
    'Swift': 'https://i.postimg.cc/wxRHBsQ4/Picsart-25-09-01-10-13-14-464.png',
    'Alto': 'https://i.postimg.cc/25GhSvZd/Picsart-25-09-01-21-21-37-456.png',
    'Tiago': 'https://i.postimg.cc/0NP7vZb2/Picsart-25-09-01-21-22-38-483.png',
    'Scorpio': 'https://i.postimg.cc/YCsv9H29/Picsart-25-09-01-21-20-16-626.png',
    'XUV500': 'https://i.postimg.cc/LXZLRsz2/Picsart-25-09-01-21-20-35-263.png',
    'Creta': 'https://i.postimg.cc/vmKfpnx0/Picsart-25-09-01-21-20-46-904.png',
    'City': 'https://i.postimg.cc/c1B63Y1P/Picsart-25-09-01-21-19-54-562.png',
    'Verna': 'https://i.postimg.cc/HnRfQ30v/Picsart-25-09-01-10-17-09-430.png',
    'Ciaz': 'https://i.postimg.cc/28H6cDZw/Picsart-25-09-01-21-19-33-817.png',
    'Royal Enfield Classic 350': 'https://i.postimg.cc/8cczBkvt/Picsart-25-09-01-14-57-17-934.png',
    'Avenger 220 Cruise': 'https://i.postimg.cc/DwVqj7hG/Picsart-25-09-01-21-23-05-676.png',
    'Jawa Perak': 'https://i.postimg.cc/RVfMgn3J/Picsart-25-09-01-10-09-53-588.png'
};

// --- MEMOIZED COMPONENTS FOR PERFORMANCE ---
const FormInput = memo(({ id, placeholder, value, onChange, error, icon: Icon }) => (
    <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            {Icon && <Icon className="h-5 w-5 text-gray-400 group-focus-within:text-black transition-colors" />}
        </div>
        <input 
            id={id} 
            type="text" 
            placeholder={placeholder} 
            value={value} 
            onChange={onChange}
            className={`w-full ${Icon ? 'pl-10' : 'pl-4'} pr-4 py-3.5 rounded-xl border-2 bg-gradient-to-r from-gray-50 to-white transition-all duration-300 placeholder:text-gray-500 focus:scale-[1.02] ${
                error 
                    ? 'border-red-500 focus:border-red-500 ring-red-200 shadow-red-100' 
                    : 'border-gray-200 focus:border-black ring-gray-200 shadow-gray-100'
            } focus:outline-none focus:ring-2 focus:shadow-lg`} 
        />
        {error && (
            <div className="absolute -bottom-6 left-0 text-red-500 text-sm flex items-center animate-in slide-in-from-bottom-1">
                <XCircle className="w-4 h-4 mr-1" />
                {error}
            </div>
        )}
    </div>
));

const SelectionCard = memo(({ isSelected, onClick, children, disabled = false, className = "" }) => (
    <div 
        onClick={disabled ? undefined : onClick} 
        className={`relative p-6 rounded-2xl border-2 text-center cursor-pointer transition-all duration-500 transform-gpu group overflow-hidden ${
            disabled 
                ? 'opacity-50 cursor-not-allowed border-gray-200 bg-gray-100'
                : isSelected 
                    ? 'border-black bg-gradient-to-br from-gray-50 to-white ring-4 ring-gray-900/10 ring-offset-2 scale-105 shadow-2xl' 
                    : 'border-gray-200 bg-gradient-to-br from-white to-gray-50 hover:border-gray-400 hover:scale-105 hover:shadow-xl hover:shadow-gray-200/50'
        } ${className}`}
    >
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        {children}
        {isSelected && (
            <div className="absolute -top-3 -right-3 w-8 h-8 bg-gradient-to-r from-black to-gray-800 rounded-full flex items-center justify-center border-4 border-white shadow-lg animate-in zoom-in-75">
                <Check className="w-4 h-4 text-white" />
            </div>
        )}
    </div>
));

const VehicleCard = memo(({ model, isSelected, onClick }) => (
    <div 
        onClick={onClick}
        className={`relative rounded-2xl border-2 cursor-pointer transition-all duration-500 group overflow-hidden transform-gpu ${
            isSelected 
                ? 'border-black bg-gradient-to-br from-gray-50 to-white ring-4 ring-gray-900/10 ring-offset-2 scale-105 shadow-2xl' 
                : 'border-gray-200 bg-gradient-to-br from-white to-gray-50 hover:border-gray-400 hover:shadow-xl hover:shadow-gray-200/50 hover:scale-105'
        }`}
    >
        <div className="bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden aspect-video relative">
            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/30 to-transparent"></div>
            <img 
                src={VEHICLE_IMAGES[model.name] || 'https://placehold.co/400x225/e5e7eb/374151?text=Image'} 
                alt={model.name} 
                className="w-full h-full object-contain p-4 group-hover:scale-110 transition-transform duration-700 ease-out relative z-10"
                onError={(e) => { e.target.onerror = null; e.target.src='https://placehold.co/400x225/e5e7eb/374151?text=Image+Not+Found'; }}
            />
        </div>
        <div className="p-5 relative z-10">
            <h3 className="font-bold text-xl text-black mb-2 group-hover:text-gray-800 transition-colors">{model.name}</h3>
            <div className="flex items-center justify-between">
                <p className="text-gray-800 font-bold text-lg">₹{model.price_per_day.toLocaleString()}/day</p>
                <div className="flex items-center gap-1 text-amber-500">
                    <Star className="w-4 h-4 fill-current" />
                    <span className="text-sm font-medium text-gray-600">4.8</span>
                </div>
            </div>
            <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                    <Zap className="w-4 h-4" />
                    <span>Auto</span>
                </div>
                <div className="flex items-center gap-1">
                    <Shield className="w-4 h-4" />
                    <span>Insured</span>
                </div>
            </div>
        </div>
        {isSelected && (
            <div className="absolute -top-3 -right-3 w-8 h-8 bg-gradient-to-r from-black to-gray-800 rounded-full flex items-center justify-center border-4 border-white shadow-lg animate-in zoom-in-75">
                <Check className="w-4 h-4 text-white" />
            </div>
        )}
    </div>
));

// --- ENHANCED LOADING COMPONENT ---
const LoadingSpinner = memo(({ size = 'default', text = 'Loading...' }) => {
    const sizeClasses = {
        small: 'w-4 h-4',
        default: 'w-8 h-8',
        large: 'w-12 h-12'
    };

    return (
        <div className="flex flex-col items-center justify-center gap-3">
            <div className={`${sizeClasses[size]} animate-spin rounded-full border-4 border-gray-200 border-t-black`}></div>
            <p className="text-gray-500 font-medium">{text}</p>
        </div>
    );
});

// --- LAZY LOADED SUCCESS COMPONENT ---
const SuccessAnimation = lazy(() => Promise.resolve({ 
    default: memo(() => (
        <div className="text-center space-y-6 py-12 animate-in fade-in zoom-in duration-1000">
            <div className="relative">
                <div className="w-32 h-32 mx-auto bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center ring-8 ring-green-100 shadow-2xl">
                    <Check className="w-16 h-16 text-white animate-in zoom-in delay-300" />
                </div>
                <div className="absolute inset-0 w-32 h-32 mx-auto bg-green-400 rounded-full animate-ping opacity-20"></div>
            </div>
            <div className="space-y-2 animate-in slide-in-from-bottom delay-500">
                <h3 className="text-3xl font-bold text-gray-900">Booking Confirmed!</h3>
                <p className="text-gray-600 text-lg">Your adventure awaits!</p>
            </div>
        </div>
    ))
}));

// --- MAIN BOOKING PROVIDER COMPONENT ---
const BookingProvider = ({ children }) => {
    const initialState = {
        firstName: '',
        lastName: '',
        wheels: '',
        vehicleType: '',
        specificModel: '',
        startDate: '',
        endDate: '',
        startDateObj: null,
        endDateObj: null,
        errors: {}
    };

    const [formState, dispatch] = useReducer(formReducer, initialState);
    const [currentStep, setCurrentStep] = useState(0);
    const [isAnimatingOut, setIsAnimatingOut] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [vehicleTypes, setVehicleTypes] = useState([]);
    const [vehicles, setVehicles] = useState([]);
    const [allVehicles, setAllVehicles] = useState([]);
    const [bookingError, setBookingError] = useState(null);
    const [savedBookings, setSavedBookings] = useLocalStorage('bookingHistory', []);

    // Debounced search for performance
    const debouncedSearchTerm = useDebounce(formState.firstName + formState.lastName, 300);

    const value = {
        formState,
        dispatch,
        currentStep,
        setCurrentStep,
        isAnimatingOut,
        setIsAnimatingOut,
        isLoading,
        setIsLoading,
        vehicleTypes,
        setVehicleTypes,
        vehicles,
        setVehicles,
        allVehicles,
        setAllVehicles,
        bookingError,
        setBookingError,
        savedBookings,
        setSavedBookings,
        debouncedSearchTerm
    };

    return (
        <BookingContext.Provider value={value}>
            {children}
        </BookingContext.Provider>
    );
};

// --- MAIN APP COMPONENT ---
const App = () => {
    return (
        <BookingProvider>
            <BookingFlow />
        </BookingProvider>
    );
};

const BookingFlow = () => {
    const {
        formState,
        dispatch,
        currentStep,
        setCurrentStep,
        isAnimatingOut,
        setIsAnimatingOut,
        isLoading,
        setIsLoading,
        vehicleTypes,
        setVehicleTypes,
        vehicles,
        setVehicles,
        allVehicles,
        setAllVehicles,
        bookingError,
        setBookingError,
        savedBookings,
        setSavedBookings
    } = useBookingContext();

    // --- DATA FETCHING WITH CUSTOM HOOKS ---
    const vehicleTypesData = VEHICLE_TYPES_DATA;
const typesLoading = false;
    
    useEffect(() => {
    // Use hardcoded data directly
    const filteredData = VEHICLE_TYPES_DATA.filter(type => type.name.toLowerCase() !== 'sports');
    const uniqueTypes = Array.from(new Map(filteredData.map(item => [item.id, item])).values());
    setVehicleTypes(uniqueTypes);
}, [setVehicleTypes]);
    useEffect(() => {
    if (formState.vehicleType) {
        setIsLoading(true);
        
        // Simulate loading delay for better UX
        setTimeout(() => {
            // Filter vehicles by selected type
            const filteredVehicles = VEHICLES_DATA.filter(vehicle => vehicle.type_id == formState.vehicleType);
            
            const duplicatesToRemove = ['Maruti Swift', 'Mahindra Scorpio', 'Honda City'];
            let cleanedData = filteredVehicles.filter(vehicle => !duplicatesToRemove.includes(vehicle.name));
            const uniqueVehicles = Array.from(new Map(cleanedData.map(item => [item.name, item])).values());

            setVehicles(uniqueVehicles);
            setAllVehicles(prev => {
                const newVehicles = [...prev];
                uniqueVehicles.forEach(v => {
                    if (!newVehicles.find(nv => nv.id === v.id)) {
                        newVehicles.push(v);
                    }
                });
                return newVehicles;
            });
            setIsLoading(false);
        }, 800); // 800ms delay to simulate API call
    }
}, [formState.vehicleType, setIsLoading, setVehicles, setAllVehicles]);
    // --- VALIDATION LOGIC WITH USECALLBACK ---
    const validateStep = useCallback((step) => {
        const newErrors = {};
        switch(step) {
            case 0:
                if (!formState.firstName.trim()) newErrors.firstName = 'First name is required';
                if (!formState.lastName.trim()) newErrors.lastName = 'Last name is required';
                if (formState.firstName.length < 2) newErrors.firstName = 'First name too short';
                if (formState.lastName.length < 2) newErrors.lastName = 'Last name too short';
                break;
            case 1:
                if (!formState.wheels) newErrors.wheels = 'Please select the number of wheels';
                break;
            case 2:
                if (!formState.vehicleType) newErrors.vehicleType = 'Please select a vehicle type';
                break;
            case 3:
                if (!formState.specificModel) newErrors.specificModel = 'Please select a specific model';
                break;
            case 4:
                if (!formState.startDate) newErrors.startDate = 'Start date is required';
                if (!formState.endDate) newErrors.endDate = 'End date is required';
                if (formState.startDate && formState.endDate && dayjs(formState.startDate).isAfter(dayjs(formState.endDate))) {
                    newErrors.dateRange = 'End date must be after start date';
                }
                break;
            default:
                break;
        }
        dispatch({ type: 'SET_ERRORS', payload: newErrors });
        return Object.keys(newErrors).length === 0;
    }, [formState, dispatch]);

    const handleNext = useCallback(() => {
        if (validateStep(currentStep)) {
            setBookingError(null);
            setIsAnimatingOut(true);
            setTimeout(() => {
                setCurrentStep(currentStep + 1);
                dispatch({ type: 'CLEAR_ERRORS' });
                setIsAnimatingOut(false);
            }, 300);
        }
    }, [currentStep, validateStep, setIsAnimatingOut, setCurrentStep, setBookingError, dispatch]);

    const handlePrev = useCallback(() => {
        setIsAnimatingOut(true);
        setTimeout(() => {
            setCurrentStep(currentStep - 1);
            dispatch({ type: 'CLEAR_ERRORS' });
            setIsAnimatingOut(false);
        }, 300);
    }, [currentStep, setCurrentStep, setIsAnimatingOut, dispatch]);
    
    const handleReset = useCallback(() => {
        const initialState = {
            firstName: '',
            lastName: '',
            wheels: '',
            vehicleType: '',
            specificModel: '',
            startDate: '',
            endDate: '',
            startDateObj: null,
            endDateObj: null,
            errors: {}
        };
        dispatch({ type: 'RESET_FORM', payload: initialState });
        setCurrentStep(0);
        setBookingError(null);
    }, [dispatch, setCurrentStep, setBookingError]);

    const handleSubmit = useCallback(async () => {
        if (validateStep(4)) {
            setIsLoading(true);
            try {
                const payload = {
                    firstName: formState.firstName,
                    lastName: formState.lastName,
                    vehicleId: formState.specificModel,
                    startDate: formState.startDate,
                    endDate: formState.endDate
                };
                // Simulate API delay
await new Promise(resolve => setTimeout(resolve, 2000));

// For demo purposes, randomly simulate success/failure
const shouldSucceed = Math.random() > 0.1; // 90% success rate

if (shouldSucceed) {
    // Save to booking history
    const newBooking = { ...payload, id: Date.now(), createdAt: new Date().toISOString() };
    setSavedBookings(prev => [newBooking, ...prev.slice(0, 4)]);
    handleNext();
} else {
    // Simulate a booking conflict for demo
    setBookingError('This vehicle is already booked for the selected dates. Please choose different dates or another vehicle.');
}    
            } catch (error) {
                setBookingError('An unexpected error occurred. Please try again.');
            } finally {
                setIsLoading(false);
            }
        }
    }, [formState, validateStep, setIsLoading, setSavedBookings, handleNext, setBookingError]);

    const getVehicleInfo = useCallback((id) => allVehicles.find(v => v.id === id), [allVehicles]);

    // --- MEMOIZED STEP CONFIGURATION ---
    const allSteps = useMemo(() => {
        const selectedVehicle = getVehicleInfo(formState.specificModel);
        const rentalDays = (formState.startDateObj && formState.endDateObj && formState.endDateObj.isAfter(formState.startDateObj, 'day')) 
            ? formState.endDateObj.diff(formState.startDateObj, 'day') + 1
            : 0;
        const totalPrice = selectedVehicle && rentalDays > 0 ? selectedVehicle.price_per_day * rentalDays : 0;

        const steps = [
            {
                icon: User,
                label: "Details",
                title: "Let's start with your details",
                subtitle: "We need this information to personalize your booking experience",
                component: () => (
                    <div className="space-y-8 w-full max-w-lg">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <FormInput 
                                id="firstName" 
                                placeholder="First Name" 
                                value={formState.firstName} 
                                onChange={e => dispatch({ type: 'UPDATE_FIELD', field: 'firstName', value: e.target.value })}
                                error={formState.errors.firstName} 
                                icon={User}
                            />
                            <FormInput 
                                id="lastName" 
                                placeholder="Last Name" 
                                value={formState.lastName} 
                                onChange={e => dispatch({ type: 'UPDATE_FIELD', field: 'lastName', value: e.target.value })}
                                error={formState.errors.lastName} 
                                icon={User}
                            />
                        </div>
                        {savedBookings.length > 0 && (
                            <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                                <p className="text-sm text-blue-800 font-medium">Previous bookings found for similar names</p>
                            </div>
                        )}
                    </div>
                )
            },
            {
                icon: Shapes,
                label: "Type",
                title: `Welcome ${formState.firstName}! Choose your adventure`,
                subtitle: "Select the type of vehicle that matches your journey",
                component: () => (
                    <div className="w-full max-w-2xl space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <SelectionCard 
                                isSelected={formState.wheels === '4'} 
                                onClick={() => dispatch({ type: 'UPDATE_MULTIPLE', payload: { wheels: '4', vehicleType: '', specificModel: '' }})}
                                className="group-hover:bg-gradient-to-br group-hover:from-blue-50 group-hover:to-white"
                            >
                                <Car className="w-16 h-16 mx-auto mb-4 text-blue-600 group-hover:scale-110 transition-transform duration-300"/>
                                <h3 className="font-bold text-xl text-black mb-2">4 Wheels</h3>
                                <p className="text-gray-500">Cars & SUVs for comfortable rides</p>
                                <div className="flex items-center justify-center gap-2 mt-3 text-sm text-gray-400">
                                    <MapPin className="w-4 h-4" />
                                    <span>Perfect for long trips</span>
                                </div>
                            </SelectionCard>
                            <SelectionCard 
                                isSelected={formState.wheels === '2'} 
                                onClick={() => dispatch({ type: 'UPDATE_MULTIPLE', payload: { wheels: '2', vehicleType: '', specificModel: '' }})}
                                className="group-hover:bg-gradient-to-br group-hover:from-orange-50 group-hover:to-white"
                            >
                                <Bike className="w-16 h-16 mx-auto mb-4 text-orange-600 group-hover:scale-110 transition-transform duration-300"/>
                                <h3 className="font-bold text-xl text-black mb-2">2 Wheels</h3>
                                <p className="text-gray-500">Motorcycles for quick rides</p>
                                <div className="flex items-center justify-center gap-2 mt-3 text-sm text-gray-400">
                                    <Clock className="w-4 h-4" />
                                    <span>Beat the traffic</span>
                                </div>
                            </SelectionCard>
                        </div>
                    </div>
                )
            },
            {
                icon: Building,
                label: "Category",
                title: "What style fits your mood?",
                subtitle: "Choose the perfect category for your journey",
                component: () => (
                    <div className="w-full max-w-3xl space-y-6">
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {vehicleTypes.filter(type => type.wheels == formState.wheels).map((type, index) => (
                                <SelectionCard 
                                    key={type.id} 
                                    isSelected={formState.vehicleType === type.id} 
                                    onClick={() => dispatch({ type: 'UPDATE_MULTIPLE', payload: { vehicleType: type.id, specificModel: '' }})}
                                    className={`animate-in fade-in slide-in-from-bottom duration-500`}
                                    style={{ animationDelay: `${index * 100}ms` }}
                                >
                                    <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-r from-gray-800 to-black rounded-full flex items-center justify-center">
                                        <Building className="w-6 h-6 text-white" />
                                    </div>
                                    <h3 className="font-bold text-lg text-black">{type.name}</h3>
                                </SelectionCard>
                            ))}
                        </div>
                        {typesLoading && <LoadingSpinner text="Loading categories..." />}
                    </div>
                )
            },
            {
                icon: Car,
                label: "Model",
                title: "Pick your perfect ride",
                subtitle: "These are the available models in your selected category",
                component: () => (
                    <div className="space-y-6 w-full max-w-6xl">
                        {isLoading ? (
                            <div className="flex justify-center items-center h-64">
                                <LoadingSpinner size="large" text="Loading awesome rides..." />
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-h-[500px] overflow-y-auto p-2 -mr-2 pr-6">
                                {vehicles.map((model, index) => (
                                    <div 
                                        key={model.id}
                                        className="animate-in fade-in slide-in-from-bottom duration-500"
                                        style={{ animationDelay: `${index * 150}ms` }}
                                    >
                                        <VehicleCard 
                                            model={model} 
                                            isSelected={formState.specificModel === model.id} 
                                            onClick={() => dispatch({ type: 'UPDATE_FIELD', field: 'specificModel', value: model.id })} 
                                        />
                                    </div>
                                ))}
                            </div>
                        )}
                        {formState.errors.specificModel && (
                            <p className="text-red-500 text-sm text-center pt-2 animate-in slide-in-from-bottom">
                                {formState.errors.specificModel}
                            </p>
                        )}
                    </div>
                )
            },
            {
                icon: Calendar,
                label: "Dates",
                title: "When's your adventure?",
                subtitle: "Choose your rental dates and get instant pricing",
                component: () => (
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <div className="space-y-8 w-full max-w-2xl">
                            <div className="flex flex-col sm:flex-row gap-6 items-center justify-center">
                                <div className="w-full sm:w-auto">
                                    <DatePicker 
                                        label="Start Date" 
                                        value={formState.startDateObj} 
                                        onChange={(newValue) => dispatch({ 
                                            type: 'UPDATE_MULTIPLE', 
                                            payload: { 
                                                startDateObj: newValue, 
                                                startDate: newValue ? newValue.format('YYYY-MM-DD') : '', 
                                                endDateObj: (formState.endDateObj && newValue && formState.endDateObj.isBefore(newValue)) ? null : formState.endDateObj, 
                                                endDate: (formState.endDateObj && newValue && formState.endDateObj.isBefore(newValue)) ? '' : formState.endDate 
                                            }
                                        })} 
                                        minDate={dayjs()} 
                                        slotProps={{ 
                                            textField: { 
                                                fullWidth: true,
                                                className: 'animate-in slide-in-from-left duration-500'
                                            } 
                                        }}
                                    />
                                </div>
                                <div className="w-full sm:w-auto">
                                    <DatePicker 
                                        label="End Date" 
                                        value={formState.endDateObj} 
                                        onChange={(newValue) => dispatch({ 
                                            type: 'UPDATE_MULTIPLE', 
                                            payload: { 
                                                endDateObj: newValue, 
                                                endDate: newValue ? newValue.format('YYYY-MM-DD') : '' 
                                            }
                                        })} 
                                        minDate={formState.startDateObj ? formState.startDateObj.add(1, 'day') : dayjs().add(1, 'day')} 
                                        disabled={!formState.startDateObj} 
                                        slotProps={{ 
                                            textField: { 
                                                fullWidth: true,
                                                className: 'animate-in slide-in-from-right duration-500 delay-200'
                                            } 
                                        }}
                                    />
                                </div>
                            </div>
                            
                            {rentalDays > 0 && (
                                <div className="text-center animate-in fade-in slide-in-from-bottom duration-700 delay-300">
                                    <div className="p-6 rounded-2xl bg-gradient-to-r from-gray-50 to-white border-2 border-gray-200 inline-block shadow-lg">
                                        <div className="flex items-center gap-3 mb-3">
                                            <Calendar className="w-6 h-6 text-gray-600" />
                                            <p className="text-gray-700 text-lg">
                                                Duration: <span className="font-bold text-black text-xl">{rentalDays} day{rentalDays > 1 ? 's' : ''}</span>
                                            </p>
                                        </div>
                                        {totalPrice > 0 && (
                                            <div className="pt-3 border-t border-gray-200">
                                                <p className="text-3xl font-bold text-black bg-gradient-to-r from-black to-gray-700 bg-clip-text text-transparent">
                                                    ₹{totalPrice.toLocaleString()}
                                                </p>
                                                <p className="text-sm text-gray-500 mt-1">Total estimated cost</p>
                                            </div>
                                        )}
                                        <div className="flex items-center justify-center gap-4 mt-4 text-sm text-gray-500">
                                            <div className="flex items-center gap-1">
                                                <Shield className="w-4 h-4" />
                                                <span>Insured</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Clock className="w-4 h-4" />
                                                <span>24/7 Support</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                            
                            {formState.errors.dateRange && (
                                <p className="text-red-500 text-sm text-center animate-in slide-in-from-bottom">
                                    {formState.errors.dateRange}
                                </p>
                            )}
                        </div>
                    </LocalizationProvider>
                )
            },
            {
                icon: ClipboardCheck,
                label: "Review",
                title: "Everything looks perfect!",
                subtitle: "Review your booking details before we confirm",
                component: () => (
                    <div className="w-full max-w-3xl space-y-6">
                        <div className="p-8 rounded-2xl bg-gradient-to-br from-white to-gray-50 border-2 border-gray-200 shadow-xl">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-6">
                                    <div className="animate-in slide-in-from-left duration-500">
                                        <p className="text-xs uppercase tracking-wider font-bold text-gray-500 mb-2">Customer Details</p>
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 bg-gradient-to-r from-black to-gray-800 rounded-full flex items-center justify-center">
                                                <User className="w-6 h-6 text-white" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-black text-xl">{formState.firstName} {formState.lastName}</p>
                                                <p className="text-gray-500 text-sm">Verified Customer</p>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="animate-in slide-in-from-left duration-500 delay-100">
                                        <p className="text-xs uppercase tracking-wider font-bold text-gray-500 mb-2">Selected Vehicle</p>
                                        <div className="flex items-center gap-3">
                                            <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100">
                                                <img 
                                                    src={VEHICLE_IMAGES[selectedVehicle?.name] || 'https://placehold.co/64x64/e5e7eb/374151?text=Car'} 
                                                    alt={selectedVehicle?.name} 
                                                    className="w-full h-full object-contain p-1"
                                                />
                                            </div>
                                            <div>
                                                <p className="font-bold text-black text-lg">{selectedVehicle?.name || 'N/A'}</p>
                                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                                                    <span>4.8 Rating</span>
                                                    <span>•</span>
                                                    <span>₹{selectedVehicle?.price_per_day || 0}/day</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="space-y-6">
                                    <div className="animate-in slide-in-from-right duration-500 delay-200">
                                        <p className="text-xs uppercase tracking-wider font-bold text-gray-500 mb-2">Rental Period</p>
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-3">
                                                <Calendar className="w-5 h-5 text-green-600" />
                                                <div>
                                                    <p className="font-semibold text-black">Start: {dayjs(formState.startDate).format('MMM DD, YYYY')}</p>
                                                    <p className="text-sm text-gray-500">{dayjs(formState.startDate).format('dddd')}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <Calendar className="w-5 h-5 text-red-600" />
                                                <div>
                                                    <p className="font-semibold text-black">End: {dayjs(formState.endDate).format('MMM DD, YYYY')}</p>
                                                    <p className="text-sm text-gray-500">{dayjs(formState.endDate).format('dddd')}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="animate-in slide-in-from-right duration-500 delay-300">
                                        <p className="text-xs uppercase tracking-wider font-bold text-gray-500 mb-2">Booking Summary</p>
                                        <div className="bg-gradient-to-r from-gray-900 to-black p-4 rounded-xl text-white">
                                            <div className="flex justify-between items-center mb-2">
                                                <span>Duration:</span>
                                                <span className="font-bold">{rentalDays} day{rentalDays > 1 ? 's' : ''}</span>
                                            </div>
                                            <div className="flex justify-between items-center text-lg">
                                                <span>Total Price:</span>
                                                <span className="font-bold text-2xl">₹{totalPrice.toLocaleString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="mt-8 pt-6 border-t border-gray-200">
                                <div className="flex items-center justify-center gap-6 text-sm text-gray-500">
                                    <div className="flex items-center gap-2">
                                        <Shield className="w-4 h-4 text-green-600" />
                                        <span>Fully Insured</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Clock className="w-4 h-4 text-blue-600" />
                                        <span>24/7 Support</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Zap className="w-4 h-4 text-yellow-600" />
                                        <span>Instant Confirmation</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        {bookingError && (
                            <div className="p-6 rounded-2xl bg-red-50 border-2 border-red-200 text-center space-y-3 animate-in fade-in slide-in-from-bottom">
                                <div className="flex items-center justify-center text-red-600">
                                    <XCircle className="w-8 h-8 mr-3" />
                                    <div>
                                        <p className="font-bold text-lg">Booking Failed</p>
                                        <p className="text-red-500 text-sm">{bookingError}</p>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => setBookingError(null)} 
                                    className="text-red-600 font-medium hover:text-red-800 transition-colors underline"
                                >
                                    Try Again
                                </button>
                            </div>
                        )}
                    </div>
                )
            },
            {
                icon: Check,
                label: "Success",
                title: `Amazing choice, ${formState.firstName}!`,
                subtitle: "Your booking has been confirmed successfully",
                component: () => (
                    <Suspense fallback={<LoadingSpinner size="large" text="Preparing your confirmation..." />}>
                        <div className="text-center space-y-8 py-12">
                            <SuccessAnimation />
                            
                            <div className="max-w-md mx-auto p-6 bg-gradient-to-r from-green-50 to-white border-2 border-green-200 rounded-2xl animate-in slide-in-from-bottom duration-700 delay-700">
                                <p className="text-gray-700 text-lg mb-4">
                                    Your <span className="font-bold text-black">{selectedVehicle?.name}</span> is ready for pickup!
                                </p>
                                <div className="text-sm text-gray-600 space-y-2">
                                    <p>📧 Confirmation sent to your email</p>
                                    <p>📱 SMS notifications enabled</p>
                                    <p>🚗 Vehicle sanitized & ready</p>
                                </div>
                            </div>
                            
                            <div className="space-y-4">
                                <button
                                    onClick={handleReset}
                                    className="inline-flex items-center justify-center gap-3 bg-gradient-to-r from-black to-gray-800 text-white font-bold rounded-2xl px-10 py-4 transition-all duration-500 ease-in-out hover:from-gray-800 hover:to-black transform hover:-translate-y-2 hover:shadow-2xl shadow-black/20"
                                >
                                    <Car className="w-5 h-5" />
                                    <span>Book Another Ride</span>
                                </button>
                                <p className="text-gray-500 text-sm">
                                    Need help? Contact us at <span className="font-semibold text-black">support@rentalservice.com</span>
                                </p>
                            </div>
                        </div>
                    </Suspense>
                )
            }
        ];
        return steps;
    }, [formState, isLoading, vehicleTypes, vehicles, allVehicles, bookingError, getVehicleInfo, typesLoading, dispatch, setBookingError, handleReset]);

    return (
        <>
            <style>{`
                /* Enhanced MUI DatePicker Styling */
                .MuiOutlinedInput-root {
                    background: linear-gradient(135deg, #f9fafb 0%, #ffffff 100%) !important;
                    border-radius: 12px !important;
                    transition: all 0.3s ease !important;
                }
                .MuiOutlinedInput-root:hover {
                    transform: translateY(-2px) !important;
                    box-shadow: 0 8px 25px rgba(0,0,0,0.1) !important;
                }
                .MuiOutlinedInput-notchedOutline {
                    border-color: #e5e7eb !important;
                    border-width: 2px !important;
                }
                .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline {
                    border-color: #9ca3af !important;
                }
                .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline {
                    border-color: #000000 !important;
                    box-shadow: 0 0 0 3px rgba(0,0,0,0.1) !important;
                }
                .MuiInputLabel-root {
                    color: #6b7280 !important;
                    font-weight: 500 !important;
                }
                .MuiInputLabel-root.Mui-focused {
                    color: #000000 !important;
                    font-weight: 600 !important;
                }
                .MuiSvgIcon-root {
                    color: #6b7280 !important;
                }
                .MuiInputBase-input {
                    color: #111827 !important;
                    font-weight: 500 !important;
                }
                
                /* Enhanced Calendar Styling */
                .MuiDateCalendar-root {
                    background: linear-gradient(135deg, #ffffff 0%, #f9fafb 100%) !important;
                    border-radius: 16px !important;
                    box-shadow: 0 20px 40px rgba(0,0,0,0.1) !important;
                    color: #111827 !important;
                }
                .MuiDayCalendar-weekDayLabel {
                    color: #6b7280 !important;
                    font-weight: 600 !important;
                }
                .MuiPickersDay-root {
                    color: #111827 !important;
                    font-weight: 500 !important;
                    transition: all 0.2s ease !important;
                }
                .MuiPickersDay-root:hover {
                    background-color: #f3f4f6 !important;
                    transform: scale(1.1) !important;
                }
                .MuiPickersDay-root.Mui-selected {
                    background: linear-gradient(135deg, #000000 0%, #374151 100%) !important;
                    color: #ffffff !important;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.3) !important;
                }
                .MuiPickersDay-today {
                    border: 2px solid #000000 !important;
                    font-weight: 700 !important;
                }
                .MuiDialogActions-root .MuiButton-text {
                    color: #000000 !important;
                    font-weight: 600 !important;
                }
                
                /* Custom Animations */
                @keyframes slideInFromBottom {
                    from {
                        opacity: 0;
                        transform: translateY(30px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                
                @keyframes slideInFromLeft {
                    from {
                        opacity: 0;
                        transform: translateX(-30px);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(0);
                    }
                }
                
                @keyframes slideInFromRight {
                    from {
                        opacity: 0;
                        transform: translateX(30px);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(0);
                    }
                }
                
                .animate-in {
                    animation-fill-mode: both;
                }
                
                .slide-in-from-bottom {
                    animation-name: slideInFromBottom;
                }
                
                .slide-in-from-left {
                    animation-name: slideInFromLeft;
                }
                
                .slide-in-from-right {
                    animation-name: slideInFromRight;
                }
                
                .fade-in {
                    animation-name: fadeIn;
                }
                
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                
                .zoom-in {
                    animation-name: zoomIn;
                }
                
                @keyframes zoomIn {
                    from {
                        opacity: 0;
                        transform: scale(0.8);
                    }
                    to {
                        opacity: 1;
                        transform: scale(1);
                    }
                }
                
                .zoom-in-75 {
                    animation-name: zoomIn75;
                }
                
                @keyframes zoomIn75 {
                    from {
                        opacity: 0;
                        transform: scale(0.75);
                    }
                    to {
                        opacity: 1;
                        transform: scale(1);
                    }
                }
                
                /* Scrollbar Styling */
                ::-webkit-scrollbar {
                    width: 8px;
                }
                
                ::-webkit-scrollbar-track {
                    background: #f1f1f1;
                    border-radius: 4px;
                }
                
                ::-webkit-scrollbar-thumb {
                    background: linear-gradient(135deg, #6b7280 0%, #374151 100%);
                    border-radius: 4px;
                }
                
                ::-webkit-scrollbar-thumb:hover {
                    background: linear-gradient(135deg, #374151 0%, #111827 100%);
                }
            `}</style>
            
            <div className="min-h-screen bg-gradient-to-br from-gray-100 via-white to-gray-100 text-gray-900 py-10 px-4 font-sans antialiased">
                <div className="relative max-w-6xl mx-auto z-10">
                    <header className="text-center mb-12 animate-in fade-in slide-in-from-bottom duration-1000">
                        <h1 className="text-5xl md:text-7xl font-black text-transparent bg-gradient-to-r from-black via-gray-800 to-black bg-clip-text mb-4 tracking-tighter">
                            Book Your Perfect Ride
                        </h1>
                        <p className="text-gray-600 text-xl font-medium">Fast, Simple, and Secure Vehicle Rentals</p>
                        <div className="mt-6 flex items-center justify-center gap-8 text-sm text-gray-500">
                            <div className="flex items-center gap-2">
                                <Shield className="w-4 h-4 text-green-600" />
                                <span>100% Secure</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-blue-600" />
                                <span>Instant Booking</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Star className="w-4 h-4 text-amber-500 fill-current" />
                                <span>4.9/5 Rating</span>
                            </div>
                        </div>
                    </header>
                    
                    {/* Enhanced Progress Indicator */}
                    <div className="mb-12 px-4 hidden lg:block">
                        <div className="flex items-center justify-center">
                            {allSteps.slice(0, 6).map((step, index) => (
                                <React.Fragment key={index}>
                                    <div className="flex flex-col items-center z-10 text-center group">
                                        <div className={`relative flex items-center justify-center w-16 h-16 rounded-2xl transition-all duration-700 border-3 transform-gpu ${
                                            index < currentStep 
                                                ? 'bg-gradient-to-r from-black to-gray-800 border-black text-white scale-110 shadow-2xl shadow-black/30' 
                                                : index === currentStep 
                                                    ? 'bg-white border-black scale-125 shadow-2xl ring-4 ring-gray-200 ring-offset-2' 
                                                    : 'bg-gray-100 border-gray-300 group-hover:border-gray-400 group-hover:scale-105'
                                        }`}>
                                            {index < currentStep ? (
                                                <Check className="w-7 h-7 animate-in zoom-in duration-500" />
                                            ) : (
                                                <step.icon className={`w-7 h-7 transition-all duration-500 ${
                                                    index === currentStep ? 'text-black scale-110' : 'text-gray-500 group-hover:text-gray-700'
                                                }`} />
                                            )}
                                            {index === currentStep && (
                                                <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent rounded-2xl animate-pulse"></div>
                                            )}
                                        </div>
                                        <p className={`mt-3 text-sm font-bold transition-all duration-500 ${
                                            index === currentStep 
                                                ? 'text-black scale-110' 
                                                : index < currentStep
                                                    ? 'text-gray-700'
                                                    : 'text-gray-400 group-hover:text-gray-600'
                                        }`}>
                                            {step.label}
                                        </p>
                                    </div>
                                    {index < 5 && (
                                        <div className={`flex-auto h-1 mx-4 rounded-full transition-all duration-700 ${
                                            index < currentStep 
                                                ? 'bg-gradient-to-r from-black to-gray-800 shadow-lg' 
                                                : 'bg-gray-200'
                                        }`}>
                                            <div className={`h-full rounded-full transition-all duration-1000 ${
                                                index < currentStep ? 'bg-gradient-to-r from-white/30 to-transparent w-full' : 'w-0'
                                            }`}></div>
                                        </div>
                                    )}
                                </React.Fragment>
                            ))}
                        </div>
                    </div>

                    <main className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl shadow-gray-900/10 p-8 sm:p-12 border border-gray-200/50 relative overflow-hidden">
                        {/* Background Pattern */}
                        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-gray-50/30 to-transparent pointer-events-none"></div>
                        
                        <div className={`relative z-10 transition-all duration-500 ease-in-out ${
                            isAnimatingOut 
                                ? 'opacity-0 transform -translate-x-8 scale-95' 
                                : 'opacity-100 transform translate-x-0 scale-100'
                        }`}>
                            <header className="text-center mb-12">
                                <h2 className="text-4xl font-black text-black mb-3 tracking-tight">
                                    {allSteps[currentStep]?.title}
                                </h2>
                                <p className="text-gray-600 text-xl font-medium">{allSteps[currentStep]?.subtitle}</p>
                            </header>
                            
                            <div className="mb-12 min-h-[400px] flex items-center justify-center">
                                {allSteps[currentStep]?.component()}
                            </div>
                            
                            {/* Enhanced Navigation */}
                            {currentStep < allSteps.length - 1 && (
                                <div className="flex flex-col-reverse sm:flex-row justify-between items-center mt-12 pt-8 border-t border-gray-200/50">
                                    <button 
                                        onClick={handlePrev} 
                                        disabled={currentStep === 0} 
                                        className="mt-6 sm:mt-0 group flex items-center gap-3 text-gray-500 font-bold rounded-2xl px-8 py-4 transition-all duration-300 hover:text-black hover:bg-gray-50 disabled:opacity-40 disabled:hover:text-gray-500 disabled:hover:bg-transparent"
                                    >
                                        <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-300" />
                                        <span>Back</span>
                                    </button>
                                    
                                    {currentStep < allSteps.length - 2 ? (
                                        <button 
                                            onClick={handleNext} 
                                            className="group w-full sm:w-auto flex items-center justify-center gap-3 bg-gradient-to-r from-black to-gray-800 text-white font-bold rounded-2xl px-10 py-4 transition-all duration-500 ease-in-out hover:from-gray-800 hover:to-black transform hover:-translate-y-2 hover:shadow-2xl shadow-black/20"
                                        >
                                            <span>Continue</span>
                                            <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                                        </button>
                                    ) : (
                                        <button 
                                            onClick={handleSubmit} 
                                            disabled={isLoading} 
                                            className="group w-full sm:w-auto flex items-center justify-center gap-3 bg-gradient-to-r from-green-600 to-green-700 text-white font-bold rounded-2xl px-10 py-4 transition-all duration-500 ease-in-out hover:from-green-700 hover:to-green-800 transform hover:-translate-y-2 hover:shadow-2xl shadow-green-600/30 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
                                        >
                                            {isLoading ? (
                                                <>
                                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                                    <span>Confirming...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <span>Confirm & Book</span>
                                                    <Check className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                                                </>
                                            )}
                                        </button>
                                    )}
                               </div>
                            )}
                        </div>
                    </main>
                    
                    <footer className="text-center mt-12 animate-in fade-in slide-in-from-bottom duration-1000 delay-500">
                        <p className="text-gray-500 text-sm font-medium">
                            Powered by <span className="font-bold text-black">Shreyash Desai</span> • 
                            <span className="ml-2">Built with ❤️ using React</span>
                        </p>
                    </footer>
                </div>
            </div>
        </>
    );
};

export default App;
