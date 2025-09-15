import React, { useState, useEffect } from 'react';
import { Wifi, User, Phone, Users, ExternalLink, Gift, Clock } from 'lucide-react';
import { api } from '../utils/api';
import { PortalDesign } from '../types';

const CaptivePortal: React.FC = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    gender: 'male' as 'male' | 'female' | 'other'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [showCampaign, setShowCampaign] = useState(false);
  const [redirectCountdown, setRedirectCountdown] = useState(0);
  const [portalDesign, setPortalDesign] = useState<PortalDesign | null>(null);

  useEffect(() => {
    const loadPortalDesign = async () => {
      try {
        const design = await api.getPortalDesign();
        setPortalDesign(design);
      } catch (error) {
        console.error('Error loading portal design:', error);
      }
    };

    loadPortalDesign();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Simulate getting device info
      const deviceInfo = {
        macAddress: '00:11:22:33:44:55',
        deviceType: 'Mobile',
        dataUsage: 0,
        ipAddress: '192.168.1.100'
      };

      await api.createUser({
        ...formData,
        ...deviceInfo
      });

      setIsConnected(true);
      
      // Show campaign if enabled
      if (portalDesign?.showCampaign) {
        setShowCampaign(true);
      }
      
      // Start redirect countdown
      if (portalDesign?.redirectUrl && portalDesign?.redirectDelay > 0) {
        setRedirectCountdown(portalDesign.redirectDelay);
        const countdown = setInterval(() => {
          setRedirectCountdown(prev => {
            if (prev <= 1) {
              clearInterval(countdown);
              window.location.href = portalDesign.redirectUrl!;
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      } else if (portalDesign?.redirectUrl) {
        // Immediate redirect if no delay
        setTimeout(() => {
          window.location.href = portalDesign.redirectUrl!;
        }, 2000);
      }
    } catch (error) {
      console.error('Error creating user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleCampaignClick = () => {
    if (portalDesign?.campaignButtonUrl) {
      window.open(portalDesign.campaignButtonUrl, '_blank');
    }
  };

  if (!portalDesign) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Campaign Modal
  if (showCampaign && portalDesign.showCampaign) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center bg-cover bg-center"
        style={{ backgroundImage: `url(${portalDesign.backgroundImage})` }}
      >
        <div className="bg-black bg-opacity-50 min-h-screen w-full flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-lg mx-4 relative">
            <button
              onClick={() => setShowCampaign(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
            
            <div className="text-center">
              <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Gift className="w-8 h-8 text-purple-600" />
              </div>
              
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                {portalDesign.campaignTitle}
              </h2>
              
              {portalDesign.campaignImage && (
                <div className="mb-4 rounded-lg overflow-hidden">
                  <img
                    src={portalDesign.campaignImage}
                    alt="Campaign"
                    className="w-full h-48 object-cover"
                  />
                </div>
              )}
              
              <p className="text-gray-600 mb-6 leading-relaxed">
                {portalDesign.campaignDescription}
              </p>
              
              <div className="space-y-3">
                {portalDesign.campaignButtonUrl && (
                  <button
                    onClick={handleCampaignClick}
                    className="w-full py-3 px-6 rounded-lg text-white font-medium transition-colors duration-200 flex items-center justify-center"
                    style={{ backgroundColor: portalDesign.primaryColor }}
                  >
                    <ExternalLink className="w-5 h-5 mr-2" />
                    {portalDesign.campaignButtonText || 'Learn More'}
                  </button>
                )}
                
                <button
                  onClick={() => setShowCampaign(false)}
                  className="w-full py-3 px-6 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors duration-200"
                >
                  Continue to Internet
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isConnected) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center bg-cover bg-center"
        style={{ backgroundImage: `url(${portalDesign.backgroundImage})` }}
      >
        <div className="bg-white bg-opacity-95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 w-full max-w-md mx-4">
          <div className="text-center">
            <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Wifi className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Connected!</h2>
            <p className="text-gray-600 mb-4">You are now connected to the internet</p>
            
            {redirectCountdown > 0 ? (
              <div className="animate-pulse">
                <div className="flex items-center justify-center mb-2">
                  <Clock className="w-4 h-4 mr-2 text-blue-600" />
                  <p className="text-sm text-gray-500">
                    Redirecting in {redirectCountdown} seconds...
                  </p>
                </div>
                <p className="text-xs text-gray-400">
                  Going to: {portalDesign.redirectUrl}
                </p>
              </div>
            ) : (
              <div className="animate-pulse">
                <p className="text-sm text-gray-500">Redirecting to your destination...</p>
              </div>
            )}
           </div>
         </div>
       </div>
    );
  }

  return (
    <div 
      className="min-h-screen flex items-center justify-center bg-cover bg-center"
      style={{ backgroundImage: `url(${portalDesign.backgroundImage})` }}
    >
      <div className="bg-white bg-opacity-95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 w-full max-w-md mx-4">
        <div className="text-center mb-6">
          <img 
            src={portalDesign.logo} 
            alt="Logo" 
            className="w-16 h-16 mx-auto mb-4 object-contain"
          />
          <h1 
            className="text-2xl font-bold mb-2"
            style={{ color: portalDesign.primaryColor }}
          >
            {portalDesign.welcomeText}
          </h1>
          <p className="text-gray-600 text-sm">
            Please fill in your details to access free WiFi
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <User className="w-4 h-4 inline mr-1" />
              Full Name
            </label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your full name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Phone className="w-4 h-4 inline mr-1" />
              Phone Number
            </label>
            <input
              type="tel"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your phone number"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Users className="w-4 h-4 inline mr-1" />
              Gender
            </label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 rounded-lg text-white font-medium transition-colors duration-200 flex items-center justify-center"
            style={{ backgroundColor: portalDesign.primaryColor }}
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Connecting...
              </>
            ) : (
              <>
                <Wifi className="w-5 h-5 mr-2" />
                {portalDesign.buttonText}
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            {portalDesign.footerText}
          </p>
        </div>
      </div>
    </div>
  );
};

export default CaptivePortal;