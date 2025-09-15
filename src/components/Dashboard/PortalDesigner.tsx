import React, { useState, useEffect } from 'react';
import { 
  Save, 
  Upload, 
  Palette, 
  Type, 
  Image, 
  Eye, 
  RefreshCw,
  Monitor,
  Smartphone,
  Tablet,
  ExternalLink,
  Gift,
  Clock
} from 'lucide-react';
import { api } from '../../utils/api';
import { PortalDesign } from '../../types';

const PortalDesigner: React.FC = () => {
  const [design, setDesign] = useState<PortalDesign | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');

  useEffect(() => {
    const loadDesign = async () => {
      try {
        const designData = await api.getPortalDesign();
        setDesign(designData);
      } catch (error) {
        console.error('Error loading design:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDesign();
  }, []);

  const handleInputChange = (field: keyof PortalDesign, value: string) => {
    if (design) {
      setDesign({
        ...design,
        [field]: value,
        updatedAt: new Date(),
        updatedBy: 'admin' // In real app, this would be current user
      });
    }
  };

  const handleBooleanChange = (field: keyof PortalDesign, value: boolean) => {
    if (design) {
      setDesign({
        ...design,
        [field]: value,
        updatedAt: new Date(),
        updatedBy: 'admin'
      });
    }
  };

  const handleNumberChange = (field: keyof PortalDesign, value: number) => {
    if (design) {
      setDesign({
        ...design,
        [field]: value,
        updatedAt: new Date(),
        updatedBy: 'admin'
      });
    }
  };

  const handleSave = async () => {
    if (!design) return;

    setSaving(true);
    try {
      await api.updatePortalDesign(design);
      alert('Portal design saved successfully!');
    } catch (error) {
      console.error('Error saving design:', error);
      alert('Error saving design. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const getPreviewWidth = () => {
    switch (previewMode) {
      case 'mobile':
        return 'w-80';
      case 'tablet':
        return 'w-96';
      default:
        return 'w-full max-w-md';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!design) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Failed to load portal design</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Portal Design Editor</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {saving ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Design Controls */}
        <div className="space-y-6">
          {/* Background Image */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <Image className="w-5 h-5 mr-2" />
              Background Image
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Background Image URL
                </label>
                <input
                  type="url"
                  value={design.backgroundImage}
                  onChange={(e) => handleInputChange('backgroundImage', e.target.value)}
                  placeholder="https://example.com/background.jpg"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="h-32 bg-gray-100 rounded-lg overflow-hidden">
                <img
                  src={design.backgroundImage}
                  alt="Background Preview"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = 'https://images.pexels.com/photos/1267320/pexels-photo-1267320.jpeg?auto=compress&cs=tinysrgb&w=1600';
                  }}
                />
              </div>
            </div>
          </div>

          {/* Logo */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <Upload className="w-5 h-5 mr-2" />
              Logo
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Logo URL
                </label>
                <input
                  type="url"
                  value={design.logo}
                  onChange={(e) => handleInputChange('logo', e.target.value)}
                  placeholder="https://example.com/logo.png"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex justify-center">
                <img
                  src={design.logo}
                  alt="Logo Preview"
                  className="w-16 h-16 object-contain"
                  onError={(e) => {
                    e.currentTarget.src = 'https://images.pexels.com/photos/6177/technology-computer-laptop-internet.jpg?auto=compress&cs=tinysrgb&w=100';
                  }}
                />
              </div>
            </div>
          </div>

          {/* Colors */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <Palette className="w-5 h-5 mr-2" />
              Colors
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Primary Color
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={design.primaryColor}
                    onChange={(e) => handleInputChange('primaryColor', e.target.value)}
                    className="w-12 h-10 border border-gray-300 rounded-lg cursor-pointer"
                  />
                  <input
                    type="text"
                    value={design.primaryColor}
                    onChange={(e) => handleInputChange('primaryColor', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Secondary Color
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={design.secondaryColor}
                    onChange={(e) => handleInputChange('secondaryColor', e.target.value)}
                    className="w-12 h-10 border border-gray-300 rounded-lg cursor-pointer"
                  />
                  <input
                    type="text"
                    value={design.secondaryColor}
                    onChange={(e) => handleInputChange('secondaryColor', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Text Content */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <Type className="w-5 h-5 mr-2" />
              Text Content
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Welcome Text
                </label>
                <input
                  type="text"
                  value={design.welcomeText}
                  onChange={(e) => handleInputChange('welcomeText', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Button Text
                </label>
                <input
                  type="text"
                  value={design.buttonText}
                  onChange={(e) => handleInputChange('buttonText', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Footer Text
                </label>
                <input
                  type="text"
                  value={design.footerText}
                  onChange={(e) => handleInputChange('footerText', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Redirect Settings */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <ExternalLink className="w-5 h-5 mr-2" />
              Redirect Settings
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Redirect URL (after login)
                </label>
                <input
                  type="url"
                  value={design.redirectUrl || ''}
                  onChange={(e) => handleInputChange('redirectUrl', e.target.value)}
                  placeholder="https://example.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Clock className="w-4 h-4 inline mr-1" />
                  Redirect Delay (seconds)
                </label>
                <input
                  type="number"
                  value={design.redirectDelay}
                  onChange={(e) => handleNumberChange('redirectDelay', parseInt(e.target.value) || 0)}
                  min="0"
                  max="60"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Set to 0 for immediate redirect
                </p>
              </div>
            </div>
          </div>

          {/* Campaign Settings */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <Gift className="w-5 h-5 mr-2" />
              Campaign Settings
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">
                  Show Campaign Modal
                </label>
                <input
                  type="checkbox"
                  checked={design.showCampaign}
                  onChange={(e) => handleBooleanChange('showCampaign', e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
              </div>
              
              {design.showCampaign && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Campaign Title
                    </label>
                    <input
                      type="text"
                      value={design.campaignTitle || ''}
                      onChange={(e) => handleInputChange('campaignTitle', e.target.value)}
                      placeholder="Special Offer!"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Campaign Description
                    </label>
                    <textarea
                      value={design.campaignDescription || ''}
                      onChange={(e) => handleInputChange('campaignDescription', e.target.value)}
                      placeholder="Describe your campaign or offer..."
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Campaign Image URL
                    </label>
                    <input
                      type="url"
                      value={design.campaignImage || ''}
                      onChange={(e) => handleInputChange('campaignImage', e.target.value)}
                      placeholder="https://example.com/campaign-image.jpg"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Campaign Button Text
                    </label>
                    <input
                      type="text"
                      value={design.campaignButtonText || ''}
                      onChange={(e) => handleInputChange('campaignButtonText', e.target.value)}
                      placeholder="Shop Now"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Campaign Button URL
                    </label>
                    <input
                      type="url"
                      value={design.campaignButtonUrl || ''}
                      onChange={(e) => handleInputChange('campaignButtonUrl', e.target.value)}
                      placeholder="https://your-store.com/offers"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Preview */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                <Eye className="w-5 h-5 mr-2" />
                Live Preview
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPreviewMode('desktop')}
                  className={`p-2 rounded-lg ${previewMode === 'desktop' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  <Monitor className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setPreviewMode('tablet')}
                  className={`p-2 rounded-lg ${previewMode === 'tablet' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  <Tablet className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setPreviewMode('mobile')}
                  className={`p-2 rounded-lg ${previewMode === 'mobile' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  <Smartphone className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div className="flex justify-center">
              <div className={`${getPreviewWidth()} transition-all duration-300`}>
                <div 
                  className="min-h-96 bg-cover bg-center rounded-lg overflow-hidden shadow-lg"
                  style={{ backgroundImage: `url(${design.backgroundImage})` }}
                >
                  <div className="min-h-96 bg-black bg-opacity-30 flex items-center justify-center p-4">
                    <div className="bg-white bg-opacity-95 backdrop-blur-sm rounded-2xl shadow-2xl p-6 w-full max-w-sm">
                      <div className="text-center mb-4">
                        <img 
                          src={design.logo} 
                          alt="Logo" 
                          className="w-12 h-12 mx-auto mb-3 object-contain"
                          onError={(e) => {
                            e.currentTarget.src = 'https://images.pexels.com/photos/6177/technology-computer-laptop-internet.jpg?auto=compress&cs=tinysrgb&w=100';
                          }}
                        />
                        <h1 
                          className="text-lg font-bold mb-2"
                          style={{ color: design.primaryColor }}
                        >
                          {design.welcomeText}
                        </h1>
                        <p className="text-gray-600 text-xs">
                          Please fill in your details to access free WiFi
                        </p>
                      </div>

                      <div className="space-y-3">
                        <input
                          type="text"
                          placeholder="Enter your full name"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          disabled
                        />
                        <input
                          type="tel"
                          placeholder="Enter your phone number"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          disabled
                        />
                        <select
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          disabled
                        >
                          <option>Male</option>
                        </select>
                        <button
                          className="w-full py-2 px-4 rounded-lg text-white text-sm font-medium"
                          style={{ backgroundColor: design.primaryColor }}
                          disabled
                        >
                          {design.buttonText}
                        </button>
                      </div>

                      <div className="mt-4 text-center">
                        <p className="text-xs text-gray-500">
                          {design.footerText}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PortalDesigner;