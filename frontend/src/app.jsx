import React, { useState, useEffect, useMemo, useCallback, useReducer, createContext, useContext, memo, lazy, Suspense, useRef } from 'react';
import { ChevronRight, ChevronLeft, Car, Bike, Calendar, User, Check, Building, Shapes, ClipboardCheck, XCircle, MapPin, Clock, Star, Shield, Zap, Sun, Moon } from 'lucide-react';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';

// Using a CDN for Framer Motion to add sophisticated animations
import { motion, AnimatePresence } from 'https://cdn.skypack.dev/framer-motion@10';

// ====================================================================================
// --- 1. ARCHITECTURE: ADVANCED REACT CONCEPTS & GLOBAL STATE MANAGEMENT ---
// ====================================================================================

// --- a) Error Boundary: A key production-level React concept ---
// This class component catches JavaScript errors anywhere in its child component tree.
// It's a great talking point about building resilient applications.
class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        // You can log the error to an error reporting service here
        console.error("ErrorBoundary caught an error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="flex flex-col items-center justify-center min-h-screen bg-red-50 text-red-700 p-8">
                    <XCircle className="w-16 h-16 mb-4" />
                    <h1 className="text-3xl font-bold mb-2">Something went wrong.</h1>
                    <p className="text-lg">We're sorry for the inconvenience. Please try refreshing the page.</p>
                    <button
                        onClick={() => this.setState({ hasError: false })}
                        className="mt-6 px-6 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            );
        }
        return this.props.children;
    }
}


// --- b) Multiple Contexts for Scalable State Management (Booking & Theming) ---
const BookingContext = createContext();
const ThemeContext = createContext();

const useBookingContext = () => useContext(BookingContext);
const useTheme = () => useContext(ThemeContext);

// --- c) Theming Provider: Demonstrates advanced context usage for UI state ---
const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState('light');
    
    useEffect(() => {
        const root = window.document.documentElement;
        root.classList.remove(theme === 'light' ? 'dark' : 'light');
        root.classList.add(theme);
    }, [theme]);

    const toggleTheme = useCallback(() => {
        setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
    }, []);

    const value = useMemo(() => ({ theme, toggleTheme }), [theme, toggleTheme]);
    
    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

// --- d) Main Booking Provider with Reducer for Complex State Logic ---
const bookingFormReducer = (state, action) => {
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
            throw new Error(`Unhandled action type: ${action.type}`);
    }
};

const BookingProvider = ({ children }) => {
    const initialState = {
        firstName: '', lastName: '', wheels: '', vehicleType: '',
        specificModel: '', startDate: '', endDate: '',
        startDateObj: null, endDateObj: null, errors: {}
    };

    const [formState, dispatch] = useReducer(bookingFormReducer, initialState);
    
    // Other state remains managed by useState for simplicity where appropriate
    const [currentStep, setCurrentStep] = useState(0);
    const [vehicles, setVehicles] = useState([]);
    const [allVehicles, setAllVehicles] = useState([]);
    const [bookingError, setBookingError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const value = useMemo(() => ({
        formState, dispatch, currentStep, setCurrentStep,
        vehicles, setVehicles, allVehicles, setAllVehicles,
        bookingError, setBookingError, isLoading, setIsLoading
    }), [formState, currentStep, vehicles, allVehicles, bookingError, isLoading]);

    return (
        <BookingContext.Provider value={value}>
            {children}
        </BookingContext.Provider>
    );
};

// ====================================================================================
// --- 2. CUSTOM HOOKS: ENCAPSULATING & REUSING LOGIC ---
// ====================================================================================

// --- a) useDebounce: Efficiently handles input changes for performance ---
const useDebounce = (value, delay) => {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        const handler = setTimeout(() => setDebouncedValue(value), delay);
        return () => clearTimeout(handler);
    }, [value, delay]);
    return debouncedValue;
};


// ====================================================================================
// --- 3. MOCK DATA & CONFIGURATION (PRESERVING ORIGINAL DATA) ---
// ====================================================================================
const VEHICLE_TYPES_DATA = [
  { id: 1, name: 'Hatchback', wheels: 4 }, { id: 2, name: 'SUV', wheels: 4 },
  { id: 3, name: 'Sedan', wheels: 4 }, { id: 4, name: 'Cruiser', wheels: 2 }
];
const VEHICLES_DATA = [
  { id: 1, name: 'Swift', type_id: 1, price_per_day: 1500.00 },
  { id: 2, name: 'Alto', type_id: 1, price_per_day: 1200.00 },
  { id: 3, name: 'Tiago', type_id: 1, price_per_day: 1400.00 },
  { id: 4, name: 'Scorpio', type_id: 2, price_per_day: 2500.00 },
  { id: 5, name: 'XUV500', type_id: 2, price_per_day: 2800.00 },
  { id: 6, name: 'Creta', type_id: 2, price_per_day: 2200.00 },
  { id: 7, name: 'City', type_id: 3, price_per_day: 2000.00 },
  { id: 8, name: 'Verna', type_id: 3, price_per_day: 1900.00 },
  { id: 9, name: 'Ciaz', type_id: 3, price_per_day: 1800.00 },
  { id: 10, name: 'Royal Enfield Classic 350', type_id: 4, price_per_day: 800.00 },
  { id: 11, name: 'Avenger 220 Cruise', type_id: 4, price_per_day: 700.00 },
  { id: 12, name: 'Jawa Perak', type_id: 4, price_per_day: 900.00 }
];
const VEHICLE_IMAGES = {
    'Swift': 'https://i.postimg.cc/wxRHBsQ4/Picsart-25-09-01-10-13-14-464.png', 'Alto': 'https://i.postimg.cc/25GhSvZd/Picsart-25-09-01-21-21-37-456.png',
    'Tiago': 'https://i.postimg.cc/0NP7vZb2/Picsart-25-09-01-21-22-38-483.png', 'Scorpio': 'https://i.postimg.cc/YCsv9H29/Picsart-25-09-01-21-20-16-626.png',
    'XUV500': 'https://i.postimg.cc/LXZLRsz2/Picsart-25-09-01-21-20-35-263.png', 'Creta': 'https://i.postimg.cc/vmKfpnx0/Picsart-25-09-01-21-20-46-904.png',
    'City': 'https://i.postimg.cc/c1B63Y1P/Picsart-25-09-01-21-19-54-562.png', 'Verna': 'https://i.postimg.cc/HnRfQ30v/Picsart-25-09-01-10-17-09-430.png',
    'Ciaz': 'https://i.postimg.cc/28H6cDZw/Picsart-25-09-01-21-19-33-817.png', 'Royal Enfield Classic 350': 'https://i.postimg.cc/8cczBkvt/Picsart-25-09-01-14-57-17-934.png',
    'Avenger 220 Cruise': 'https://i.postimg.cc/DwVqj7hG/Picsart-25-09-01-21-23-05-676.png', 'Jawa Perak': 'https://i.postimg.cc/RVfMgn3J/Picsart-25-09-01-10-09-53-588.png'
};

// ====================================================================================
// --- 4. UI COMPONENTS: MEMOIZED, STYLED, & REUSABLE ---
// ====================================================================================

// --- a) Reusable Form Input: Demonstrates `memo` and `useRef` for focus management ---
const FormInput = memo(({ id, placeholder, value, onChange, error, icon: Icon, autoFocus = false }) => {
    const inputRef = useRef(null);

    // Using `useRef` and `useEffect` to programmatically focus an element.
    useEffect(() => {
        if (autoFocus && inputRef.current) {
            inputRef.current.focus();
        }
    }, [autoFocus]);

    return (
        <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                {Icon && <Icon className="h-5 w-5 text-gray-400 dark:text-gray-500 group-focus-within:text-indigo-500 transition-colors" />}
            </div>
            <input
                ref={inputRef}
                id={id} type="text" placeholder={placeholder} value={value} onChange={onChange}
                className={`w-full ${Icon ? 'pl-11' : 'pl-4'} pr-4 py-3.5 rounded-xl border-2 bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-white transition-all duration-300 placeholder:text-gray-500 focus:scale-[1.03] ${
                    error ? 'border-red-500 focus:border-red-500 ring-red-500/20' : 'border-gray-200 focus:border-indigo-500 ring-indigo-500/20'
                } focus:outline-none focus:ring-4 focus:shadow-lg dark:focus:border-indigo-400`}
            />
            <AnimatePresence>
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                        className="absolute -bottom-6 left-0 text-red-500 text-sm flex items-center"
                    >
                        <XCircle className="w-4 h-4 mr-1" />
                        {error}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
});

// --- b) Theme Toggle: A simple component to showcase context in action ---
const ThemeToggle = () => {
    const { theme, toggleTheme } = useTheme();
    return (
        <button
            onClick={toggleTheme}
            className="absolute top-6 right-6 p-2 rounded-full bg-gray-200/50 dark:bg-gray-800/50 backdrop-blur-sm text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white transition-all transform hover:scale-110"
        >
            <AnimatePresence mode="wait">
                <motion.div
                    key={theme}
                    initial={{ opacity: 0, rotate: -90, scale: 0.5 }}
                    animate={{ opacity: 1, rotate: 0, scale: 1 }}
                    exit={{ opacity: 0, rotate: 90, scale: 0.5 }}
                    transition={{ duration: 0.25 }}
                >
                    {theme === 'light' ? <Moon className="w-6 h-6" /> : <Sun className="w-6 h-6" />}
                </motion.div>
            </AnimatePresence>
        </button>
    );
};

// --- c) Vehicle Skeleton Loader: A modern UX pattern for better perceived performance ---
const VehicleSkeleton = () => (
    <div className="rounded-2xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 p-5 space-y-4 animate-pulse">
        <div className="bg-gray-200 dark:bg-gray-700 h-40 rounded-lg"></div>
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
        <div className="flex justify-between">
            <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
            <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
        </div>
    </div>
);

// --- d) Lazy Loaded Success Component with Suspense for code-splitting ---
const SuccessAnimation = lazy(() => Promise.resolve({
    default: memo(() => (
        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, delay: 0.2, type: 'spring' }} className="text-center space-y-6 py-12">
            <div className="relative">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3, duration: 0.7, type: 'spring', bounce: 0.5 }} className="w-32 h-32 mx-auto bg-gradient-to-br from-green-400 to-green-500 rounded-full flex items-center justify-center ring-8 ring-green-100 dark:ring-green-900/50 shadow-2xl shadow-green-500/30">
                    <Check className="w-16 h-16 text-white" />
                </motion.div>
            </div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7, duration: 0.5 }}>
                <h3 className="text-3xl font-bold text-gray-900 dark:text-white">Booking Confirmed!</h3>
                <p className="text-gray-600 dark:text-gray-300 text-lg">Your adventure awaits!</p>
            </motion.div>
        </motion.div>
    ))
}));


// ====================================================================================
// --- 5. MAIN APPLICATION LOGIC & FLOW ---
// ====================================================================================
function BookingFlow() {
    const {
        formState, dispatch, currentStep, setCurrentStep,
        vehicles, setVehicles, allVehicles, setAllVehicles,
        bookingError, setBookingError, isLoading, setIsLoading
    } = useBookingContext();

    // --- Data Fetching & State Synchronization with useEffect ---
    const vehicleTypes = useMemo(() => VEHICLE_TYPES_DATA, []);

    useEffect(() => {
        if (formState.vehicleType) {
            setIsLoading(true);
            // Simulating API call with a delay for a better UX demonstration
            setTimeout(() => {
                const filtered = VEHICLES_DATA.filter(v => v.type_id == formState.vehicleType);
                setVehicles(filtered);
                // Caching all loaded vehicles to prevent re-fetching
                setAllVehicles(prev => {
                    const newVehicles = new Map(prev.map(v => [v.id, v]));
                    filtered.forEach(v => newVehicles.set(v.id, v));
                    return Array.from(newVehicles.values());
                });
                setIsLoading(false);
            }, 800);
        }
    }, [formState.vehicleType, setIsLoading, setVehicles, setAllVehicles]);

    // --- Memoized Validation Logic ---
    const validateStep = useCallback((step) => {
        const newErrors = {};
        switch (step) {
            case 0:
                if (!formState.firstName.trim() || formState.firstName.length < 2) newErrors.firstName = 'Valid first name is required';
                if (!formState.lastName.trim() || formState.lastName.length < 2) newErrors.lastName = 'Valid last name is required';
                break;
            case 1: if (!formState.wheels) newErrors.wheels = 'Please select wheel type'; break;
            case 2: if (!formState.vehicleType) newErrors.vehicleType = 'Please select a vehicle type'; break;
            case 3: if (!formState.specificModel) newErrors.specificModel = 'Please select a specific model'; break;
            case 4:
                if (!formState.startDate) newErrors.startDate = 'Start date is required';
                if (!formState.endDate) newErrors.endDate = 'End date is required';
                if (formState.startDate && formState.endDate && dayjs(formState.startDate).isAfter(dayjs(formState.endDate))) {
                    newErrors.dateRange = 'End date must be after start date';
                }
                break;
            default: break;
        }
        dispatch({ type: 'SET_ERRORS', payload: newErrors });
        return Object.keys(newErrors).length === 0;
    }, [formState, dispatch]);

    // --- Navigation Handlers with useCallback for Performance ---
    const handleNext = useCallback(() => {
        if (validateStep(currentStep)) {
            setBookingError(null);
            setCurrentStep(s => s + 1);
            dispatch({ type: 'CLEAR_ERRORS' });
        }
    }, [currentStep, validateStep, setCurrentStep, setBookingError, dispatch]);

    const handlePrev = useCallback(() => {
        setCurrentStep(s => s - 1);
        dispatch({ type: 'CLEAR_ERRORS' });
    }, [setCurrentStep, dispatch]);

    const handleReset = useCallback(() => {
        const initialState = { firstName: '', lastName: '', wheels: '', vehicleType: '', specificModel: '', startDate: '', endDate: '', startDateObj: null, endDateObj: null, errors: {} };
        dispatch({ type: 'RESET_FORM', payload: initialState });
        setCurrentStep(0);
        setBookingError(null);
    }, [dispatch, setCurrentStep, setBookingError]);

    // --- Asynchronous Submission Logic ---
    const handleSubmit = useCallback(async () => {
        if (validateStep(4)) {
            setIsLoading(true);
            setBookingError(null);
            try {
                // Simulating an API call with a 2-second delay
                await new Promise(resolve => setTimeout(resolve, 2000));
                
                // Demo logic: 90% success rate
                if (Math.random() > 0.1) {
                    handleNext();
                } else {
                    setBookingError('This vehicle is booked for the selected dates. Please try another date.');
                }
            } catch (error) {
                setBookingError('An unexpected error occurred. Please try again.');
            } finally {
                setIsLoading(false);
            }
        }
    }, [formState, validateStep, setIsLoading, setBookingError, handleNext]);

    const getVehicleInfo = useCallback((id) => allVehicles.find(v => v.id === id), [allVehicles]);

    // --- Memoizing step configuration to prevent recalculation on every render ---
    const allSteps = useMemo(() => {
        const selectedVehicle = getVehicleInfo(formState.specificModel);
        const rentalDays = (formState.startDateObj && formState.endDateObj && formState.endDateObj.isAfter(formState.startDateObj, 'day'))
            ? formState.endDateObj.diff(formState.startDateObj, 'day') + 1
            : 0;
        const totalPrice = selectedVehicle && rentalDays > 0 ? selectedVehicle.price_per_day * rentalDays : 0;
        
        // This is where each step's UI and logic is defined.
        return [
            // STEP 0: User Details
            {
                icon: User, label: "Details", title: "Let's start with your details",
                component: () => (
                    <div className="space-y-8 w-full max-w-lg">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <FormInput autoFocus id="firstName" placeholder="First Name" value={formState.firstName} onChange={e => dispatch({ type: 'UPDATE_FIELD', field: 'firstName', value: e.target.value })} error={formState.errors.firstName} icon={User} />
                            <FormInput id="lastName" placeholder="Last Name" value={formState.lastName} onChange={e => dispatch({ type: 'UPDATE_FIELD', field: 'lastName', value: e.target.value })} error={formState.errors.lastName} icon={User} />
                        </div>
                    </div>
                )
            },
            // STEP 1: Wheels Selection
            {
                icon: Shapes, label: "Type", title: `Welcome, ${formState.firstName}!`, subtitle: "Choose your adventure style.",
                component: () => (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-2xl">
                        {[
                            { wheels: '4', Icon: Car, title: '4 Wheels', desc: 'Cars & SUVs', color: 'blue' },
                            { wheels: '2', Icon: Bike, title: '2 Wheels', desc: 'Motorcycles', color: 'orange' }
                        ].map(item => (
                            <motion.div key={item.wheels} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
                                <div onClick={() => dispatch({ type: 'UPDATE_MULTIPLE', payload: { wheels: item.wheels, vehicleType: '', specificModel: '' }})}
                                    className={`relative p-6 rounded-2xl border-2 text-center cursor-pointer transition-all duration-300 group overflow-hidden ${formState.wheels === item.wheels ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 ring-4 ring-indigo-500/20' : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 hover:border-gray-400 dark:hover:border-gray-500'}`}>
                                    <item.Icon className={`w-16 h-16 mx-auto mb-4 text-${item.color}-500 transition-transform duration-300 group-hover:scale-110`} />
                                    <h3 className="font-bold text-xl text-black dark:text-white mb-1">{item.title}</h3>
                                    <p className="text-gray-500 dark:text-gray-400">{item.desc}</p>
                                    {formState.wheels === item.wheels && <div className="absolute top-3 right-3 w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center"><Check className="w-4 h-4 text-white" /></div>}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )
            },
            // STEP 2: Category Selection
            {
                icon: Building, label: "Category", title: "What style fits your mood?",
                component: () => (
                    <div className="w-full max-w-3xl grid grid-cols-2 md:grid-cols-3 gap-4">
                        {vehicleTypes.filter(type => type.wheels == formState.wheels).map((type, index) => (
                            <motion.div key={type.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
                                <div onClick={() => dispatch({ type: 'UPDATE_MULTIPLE', payload: { vehicleType: type.id, specificModel: '' }})}
                                    className={`p-6 rounded-2xl border-2 text-center cursor-pointer transition-colors duration-300 ${formState.vehicleType === type.id ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 hover:border-gray-400 dark:hover:border-gray-500'}`}>
                                    <h3 className="font-bold text-lg text-black dark:text-white">{type.name}</h3>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )
            },
            // STEP 3: Model Selection
            {
                icon: Car, label: "Model", title: "Pick your perfect ride",
                component: () => (
                    <div className="w-full max-w-6xl">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-h-[500px] overflow-y-auto p-2 -mr-2 pr-6 custom-scrollbar">
                            {isLoading ? Array.from({ length: 3 }).map((_, i) => <VehicleSkeleton key={i} />)
                                : vehicles.map((model, index) => (
                                    <motion.div key={model.id} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1, type: 'spring', stiffness: 100 }}>
                                        <div onClick={() => dispatch({ type: 'UPDATE_FIELD', field: 'specificModel', value: model.id })}
                                            className={`relative rounded-2xl border-2 cursor-pointer transition-all duration-300 group overflow-hidden transform-gpu ${formState.specificModel === model.id ? 'border-indigo-500 ring-4 ring-indigo-500/20 scale-105 shadow-2xl' : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 hover:shadow-xl'}`}>
                                            <div className="bg-gray-100 dark:bg-gray-900 aspect-video overflow-hidden"><img src={VEHICLE_IMAGES[model.name]} alt={model.name} className="w-full h-full object-contain p-4 group-hover:scale-110 transition-transform duration-500" /></div>
                                            <div className="p-5">
                                                <h3 className="font-bold text-xl text-black dark:text-white mb-2">{model.name}</h3>
                                                <p className="text-gray-800 dark:text-gray-200 font-bold text-lg">₹{model.price_per_day.toLocaleString()}/day</p>
                                            </div>
                                            {formState.specificModel === model.id && <div className="absolute top-3 right-3 w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center"><Check className="w-4 h-4 text-white" /></div>}
                                        </div>
                                    </motion.div>
                                ))}
                        </div>
                    </div>
                )
            },
            // STEP 4: Dates Selection
            {
                icon: Calendar, label: "Dates", title: "When's your adventure?",
                component: () => (
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <div className="space-y-8 w-full max-w-2xl">
                            <div className="flex flex-col sm:flex-row gap-6 items-center justify-center">
                               <DatePicker label="Start Date" value={formState.startDateObj} onChange={(val) => dispatch({ type: 'UPDATE_MULTIPLE', payload: { startDateObj: val, startDate: val ? val.format('YYYY-MM-DD') : '' } })} minDate={dayjs()} />
                               <DatePicker label="End Date" value={formState.endDateObj} onChange={(val) => dispatch({ type: 'UPDATE_MULTIPLE', payload: { endDateObj: val, endDate: val ? val.format('YYYY-MM-DD') : '' } })} minDate={formState.startDateObj ? formState.startDateObj.add(1, 'day') : dayjs().add(1, 'day')} disabled={!formState.startDateObj} />
                            </div>
                             {rentalDays > 0 && (
                                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
                                    <div className="p-6 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 inline-block shadow-lg">
                                        <p className="text-lg">Duration: <span className="font-bold text-black dark:text-white">{rentalDays} day{rentalDays > 1 ? 's' : ''}</span></p>
                                        <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400 mt-2">₹{totalPrice.toLocaleString()}</p>
                                    </div>
                                </motion.div>
                            )}
                        </div>
                    </LocalizationProvider>
                )
            },
            // STEP 5: Review
            {
                icon: ClipboardCheck, label: "Review", title: "Everything looks perfect!",
                component: () => (
                    <div className="w-full max-w-3xl space-y-6">
                        <div className="p-8 rounded-2xl bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 shadow-xl">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-6">
                                    <div>
                                        <p className="text-xs font-bold text-gray-500 mb-2">CUSTOMER</p>
                                        <p className="font-bold text-black dark:text-white text-xl">{formState.firstName} {formState.lastName}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-gray-500 mb-2">VEHICLE</p>
                                        <p className="font-bold text-black dark:text-white text-xl">{selectedVehicle?.name}</p>
                                    </div>
                                </div>
                                <div className="space-y-6">
                                    <div>
                                        <p className="text-xs font-bold text-gray-500 mb-2">RENTAL PERIOD</p>
                                        <p className="font-semibold text-black dark:text-white">{dayjs(formState.startDate).format('MMM DD, YYYY')} - {dayjs(formState.endDate).format('MMM DD, YYYY')}</p>
                                    </div>
                                    <div className="bg-indigo-50 dark:bg-indigo-900/30 p-4 rounded-xl">
                                        <p className="text-lg">Total Price:</p>
                                        <p className="font-bold text-3xl text-indigo-600 dark:text-indigo-400">₹{totalPrice.toLocaleString()}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {bookingError && (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-4 rounded-xl bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-center">
                                <p className="font-semibold">{bookingError}</p>
                            </motion.div>
                        )}
                    </div>
                )
            },
            // STEP 6: Success
            {
                icon: Check, label: "Success", title: `Confirmed, ${formState.firstName}!`,
                component: () => (
                    <Suspense fallback={<div className="text-center">Loading confirmation...</div>}>
                        <div className="text-center space-y-8">
                            <SuccessAnimation />
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1 }}>
                                <button onClick={handleReset} className="px-10 py-4 bg-indigo-600 text-white font-bold rounded-xl transition-transform transform hover:scale-105">Book Another Ride</button>
                            </motion.div>
                        </div>
                    </Suspense>
                )
            }
        ];
    }, [formState, isLoading, vehicles, allVehicles, bookingError, getVehicleInfo, vehicleTypes, dispatch, handleReset]);
    
    const activeStep = allSteps[currentStep];

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 py-10 px-4 font-sans antialiased transition-colors duration-500">
            <div className="absolute inset-0 z-0 opacity-50 dark:opacity-100">
              <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)] dark:bg-[radial-gradient(#2d3748_1px,transparent_1px)]"></div>
            </div>
            <div className="relative max-w-6xl mx-auto z-10">
                <ThemeToggle />
                <header className="text-center mb-12">
                    <h1 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 mb-4">
                        Book Your Perfect Ride
                    </h1>
                </header>

                {/* --- Dynamic Progress Stepper --- */}
                <div className="mb-12 hidden lg:flex items-center justify-center">
                    {allSteps.slice(0, 6).map((step, index) => (
                        <React.Fragment key={index}>
                            <div className="flex flex-col items-center text-center">
                                <div className={`relative flex items-center justify-center w-12 h-12 rounded-full transition-all duration-500 border-2 ${
                                    index < currentStep ? 'bg-indigo-600 border-indigo-600 text-white' : index === currentStep ? 'bg-white dark:bg-gray-800 border-indigo-600 scale-110 shadow-lg' : 'bg-gray-200 dark:bg-gray-700 border-gray-300 dark:border-gray-600'
                                }`}>
                                    {index < currentStep ? <Check /> : <step.icon />}
                                </div>
                                <p className={`mt-2 text-sm font-semibold transition-colors ${index === currentStep ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-500'}`}>{step.label}</p>
                            </div>
                            {index < 5 && <div className={`flex-auto h-1 transition-colors duration-500 mx-4 ${index < currentStep ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-700'}`}></div>}
                        </React.Fragment>
                    ))}
                </div>

                <main className="bg-white/80 dark:bg-gray-800/50 backdrop-blur-lg rounded-3xl shadow-2xl shadow-gray-900/10 p-8 sm:p-12 border border-gray-200/50 dark:border-gray-700/50 relative overflow-hidden">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentStep}
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -50 }}
                            transition={{ duration: 0.3 }}
                        >
                            <header className="text-center mb-10">
                                <h2 className="text-4xl font-black text-black dark:text-white mb-2">{activeStep.title}</h2>
                                {activeStep.subtitle && <p className="text-gray-600 dark:text-gray-300 text-xl">{activeStep.subtitle}</p>}
                            </header>

                            <div className="mb-12 min-h-[300px] flex items-center justify-center">
                                {activeStep.component()}
                            </div>

                            {currentStep < allSteps.length - 1 && (
                                <div className="flex flex-col-reverse sm:flex-row justify-between items-center mt-12 pt-8 border-t border-gray-200/50 dark:border-gray-700/50">
                                    <button onClick={handlePrev} disabled={currentStep === 0} className="mt-4 sm:mt-0 flex items-center gap-2 text-gray-500 font-bold disabled:opacity-40"><ChevronLeft /> Back</button>
                                    <button
                                        onClick={currentStep < allSteps.length - 2 ? handleNext : handleSubmit}
                                        disabled={isLoading}
                                        className="w-full sm:w-auto px-10 py-4 font-bold rounded-xl text-white transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed"
                                    >
                                        {isLoading ? 'Processing...' : (currentStep < allSteps.length - 2 ? 'Continue' : 'Confirm & Book')}
                                        {!isLoading && (currentStep < allSteps.length - 2 ? <ChevronRight /> : <Check />)}
                                    </button>
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </main>
            </div>
            
            <style>{`
                /* Dark Mode Support & Custom Scrollbar */
                .dark .MuiOutlinedInput-root { background: #1f2937 !important; }
                .dark .MuiInputLabel-root, .dark .MuiSvgIcon-root, .dark .MuiInputBase-input { color: #d1d5db !important; }
                .dark .MuiOutlinedInput-notchedOutline { border-color: #4b5563 !important; }
                .dark .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline { border-color: #818cf8 !important; }
                .dark .MuiDateCalendar-root { background: #1f2937 !important; color: #f9fafb !important; }
                .dark .MuiDayCalendar-weekDayLabel, .dark .MuiPickersDay-root { color: #f9fafb !important; }
                .dark .MuiPickersDay-root.Mui-selected { background: linear-gradient(135deg, #6366f1, #8b5cf6) !important; }
                .dark .MuiPickersDay-today { border-color: #818cf8 !important; }
                .custom-scrollbar::-webkit-scrollbar { width: 8px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: #f1f1f1; border-radius: 4px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #a5b4fc; border-radius: 4px; }
                .dark .custom-scrollbar::-webkit-scrollbar-track { background: #2d3748; }
                .dark .custom-scrollbar::-webkit-scrollbar-thumb { background: #4f46e5; }
            `}</style>
        </div>
    );
}

// ====================================================================================
// --- 6. ROOT COMPONENT: COMPOSING THE APPLICATION ---
// ====================================================================================
export default function App() {
    return (
        <ErrorBoundary>
            <ThemeProvider>
                <BookingProvider>
                    <BookingFlow />
                </BookingProvider>
            </ThemeProvider>
        </ErrorBoundary>
    );
}

