import React, { useState, useEffect } from 'react';
import { Map } from './components/Map';
import { Navigation, MapPin, Car, Clock, IndianRupee, Sun, Cloud, TrafficCone as Traffic, Star } from 'lucide-react';
import { useStore } from './store/useStore';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './components/ui/select';
import { Button } from './components/ui/button';
import { Switch } from './components/ui/switch';
import { AuthModal } from './components/AuthModal';
import { PremiumModal } from './components/PremiumModal';
import { DriverDashboard } from './components/DriverDashboard';
import { SOSButton } from './components/SOSButton';
import { ServiceSelector } from './components/ServiceSelector';
import { RideOptions } from './components/RideOptions';
import { DriverCard } from './components/DriverCard';
import { TN_LOCATIONS } from './store/useStore';
import { DurationSelector } from './components/DurationSelector';
import { DriverSkillsFilter } from './components/DriverSkillsFilter';
import { HopInAlert } from './components/HopInAlert';
import { VoiceBooking } from './components/VoiceBooking';

function App() {
  const { 
    setPickup, 
    setDropoff, 
    findNearbyDrivers, 
    nearbyDrivers,
    selectedDriver,
    setSelectedDriver,
    rideStatus,
    setRideStatus,
    surgeFactor,
    setSurgeFactor,
    handleSOS,
    auth,
    setAuth,
    setDriverStats,
    driverStats,
    selectedService,
    setSelectedService,
    womenOnlyDriver,
    setWomenOnlyDriver,
    perMinuteBilling,
    setPerMinuteBilling,
    durationHours,
    setDurationHours,
    selectedSkills,
    setSelectedSkills
  } = useStore();
  
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [rideSharing, setRideSharing] = useState(false);
  const [deliveryOption, setDeliveryOption] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [isDriverOnlyMode, setIsDriverOnlyMode] = useState(false);
  const [hopInTransition, setHopInTransition] = useState(false);

  useEffect(() => {
    if (auth.isAuthenticated && auth.userRole === 'driver' && !driverStats) {
      setDriverStats({
        todayEarnings: 2500,
        weeklyEarnings: 15000,
        monthlyEarnings: 60000,
        totalTrips: 1250,
        rating: 4.8,
        activeHours: 8,
        skills: ['tourist-guide', 'senior-care'],
        verifications: ['license', 'background-check', 'insurance']
      });
    }
  }, [auth.isAuthenticated, auth.userRole]);

  useEffect(() => {
    const interval = setInterval(() => {
      setSurgeFactor(Math.random() * 0.5 + 1);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (origin) {
      setPickup(TN_LOCATIONS[origin]);
    }
    if (destination) {
      setDropoff(TN_LOCATIONS[destination]);
    }
  }, [origin, destination]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (rideStatus === 'in_progress') {
        monitorDriverDistance();
      }
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [rideStatus]);

  const handleFindRides = () => {
    setRideStatus('searching');
    findNearbyDrivers({
      isShared: rideSharing,
      hasDelivery: deliveryOption,
      isDriverOnly: isDriverOnlyMode,
      requiredSkills: selectedSkills,
      duration: durationHours
    });
  };

  const handleSelectDriver = (driverInfo) => {
    setSelectedDriver(driverInfo.driver);
    setRideStatus('confirmed');
    setTimeout(() => {
      setRideStatus('on_way');
    }, 2000);
  };

  const handleLocationSelect = (type: 'origin' | 'destination', location: string) => {
    if (type === 'origin') {
      setOrigin(location);
    } else {
      setDestination(location);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Navigation className="w-6 h-6 text-blue-600" />
            <h1 className="text-xl font-semibold text-gray-900">Smart Ride Tamil Nadu</h1>
          </div>
          <nav className="flex items-center space-x-4">
            {auth.isAuthenticated && !auth.isPremium && (
              <Button
                onClick={() => setShowPremiumModal(true)}
                className="flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700"
              >
                <Star className="w-4 h-4" />
                Upgrade to Premium
              </Button>
            )}
            {!auth.isAuthenticated ? (
              <Button onClick={() => setShowAuthModal(true)}>Sign In</Button>
            ) : (
              <Button onClick={() => setAuth({ isAuthenticated: false, userRole: null, userId: null })}>
                Sign Out
              </Button>
            )}
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            {auth.isAuthenticated && auth.userRole === 'driver' ? (
              <DriverDashboard />
            ) : (
              <>
                {hopInTransition && (
                  <HopInAlert transition={hopInTransition} />
                )}
                {rideStatus === 'on_way' ? (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-green-600">
                        <Car className="inline mr-2" /> Driver is on the way!
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center space-x-4">
                          <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                            <Car className="h-6 w-6 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-semibold">{selectedDriver?.name}</p>
                            <p className="text-sm text-gray-600">
                              {selectedDriver?.vehicle.model} • {selectedDriver?.vehicle.color}
                            </p>
                            <p className="text-sm text-gray-600">
                              License Plate: {selectedDriver?.vehicle.plateNumber}
                            </p>
                          </div>
                        </div>
                        <div className="bg-green-50 p-4 rounded-md">
                          <p className="text-green-700">Your driver is heading to the pickup location!</p>
                        </div>
                        
                        <SOSButton 
                          onTrigger={handleSOS}
                          driverInfo={selectedDriver ? {
                            name: selectedDriver.name,
                            vehicleModel: selectedDriver.vehicle.model,
                            plateNumber: selectedDriver.vehicle.plateNumber
                          } : undefined}
                        />
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardHeader>
                      <CardTitle>
                        <MapPin className="inline mr-2" /> Book Your Ride
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <VoiceBooking onLocationSelect={handleLocationSelect} />

                        <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                          <span className="font-medium">Driver-Only Mode</span>
                          <Switch
                            checked={isDriverOnlyMode}
                            onCheckedChange={setIsDriverOnlyMode}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Origin</label>
                          <Select value={origin} onValueChange={setOrigin}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select Origin" />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.keys(TN_LOCATIONS).map((location) => (
                                <SelectItem key={location} value={location}>
                                  {location}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Destination</label>
                          <Select value={destination} onValueChange={setDestination}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select Destination" />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.keys(TN_LOCATIONS)
                                .filter(loc => loc !== origin)
                                .map((location) => (
                                  <SelectItem key={location} value={location}>
                                    {location}
                                  </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {isDriverOnlyMode ? (
                          <>
                            <DurationSelector
                              duration={durationHours}
                              onDurationChange={setDurationHours}
                            />
                            <DriverSkillsFilter
                              selectedSkills={selectedSkills}
                              onSkillsChange={setSelectedSkills}
                            />
                          </>
                        ) : (
                          <>
                            <div className="border-t pt-4">
                              <h3 className="text-sm font-medium text-gray-700 mb-3">Service Type</h3>
                              <ServiceSelector
                                selectedService={selectedService}
                                onServiceSelect={setSelectedService}
                              />
                            </div>

                            <div className="border-t pt-4">
                              <h3 className="text-sm font-medium text-gray-700 mb-3">Ride Options</h3>
                              <RideOptions
                                womenOnlyDriver={womenOnlyDriver}
                                onWomenOnlyChange={setWomenOnlyDriver}
                                perMinuteBilling={perMinuteBilling}
                                onPerMinuteBillingChange={setPerMinuteBilling}
                              />
                            </div>

                            <div className="flex items-center space-x-2">
                              <Switch checked={rideSharing} onCheckedChange={setRideSharing} />
                              <label className="text-sm text-gray-700">
                                Enable Ride Sharing
                                <span className="text-sm text-gray-500 ml-2">
                                  (30% fare reduction)
                                </span>
                              </label>
                            </div>

                            <div className="flex items-center space-x-2">
                              <Switch checked={deliveryOption} onCheckedChange={setDeliveryOption} />
                              <label className="text-sm text-gray-700">
                                Allow Delivery Pickups
                                <span className="text-sm text-gray-500 ml-2">
                                  (10% additional discount)
                                </span>
                              </label>
                            </div>
                          </>
                        )}

                        {auth.isPremium && (
                          <div className="bg-yellow-50 p-3 rounded-md">
                            <p className="text-sm text-yellow-800 flex items-center">
                              <Star className="w-4 h-4 mr-2 text-yellow-600" />
                              Premium Member: 15% discount applied to all rides!
                            </p>
                          </div>
                        )}

                        <div className="bg-yellow-50 p-3 rounded-md">
                          <p className="text-sm text-yellow-800 flex items-center">
                            <Clock className="w-4 h-4 mr-2" />
                            Current Surge Factor: {surgeFactor.toFixed(2)}x
                          </p>
                        </div>

                        <Button
                          onClick={handleFindRides}
                          className="w-full"
                          disabled={!origin || !destination || !auth.isAuthenticated}
                        >
                          {auth.isAuthenticated ? 'Find Drivers' : 'Sign in to Book'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {nearbyDrivers.length > 0 && rideStatus !== 'on_way' && (
                  <Card>
                    <CardHeader>
                      <CardTitle>
                        <Car className="inline mr-2" /> Available Drivers
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {nearbyDrivers.map((driverInfo) => (
                          <DriverCard
                            key={driverInfo.driver.id}
                            driver={driverInfo.driver}
                            price={driverInfo.price}
                            estimatedTime={driverInfo.estimatedTime}
                            onSelect={() => handleSelectDriver(driverInfo)}
                            isDriverOnly={isDriverOnlyMode}
                            duration={durationHours}
                          />
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </div>

          <div className="lg:col-span-2 h-[800px] bg-white rounded-lg shadow-sm overflow-hidden relative">
            <Map />
          </div>
        </div>
      </main>

      {showAuthModal && (
        <AuthModal onClose={() => setShowAuthModal(false)} />
      )}

      {showPremiumModal && (
        <PremiumModal onClose={() => setShowPremiumModal(false)} />
      )}
    </div>
  );
}

export default App;