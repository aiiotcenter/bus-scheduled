//====================================================================================================================================
//? Importing
//====================================================================================================================================
import React, { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

import { userGender, userRole, userStatus } from '../../enums/statusEnums';
import { COLORS } from '../../styles/colorPalette';
import { useTranslation } from 'react-i18next';

import { apiClient } from '../../services/apiClient';
import { tryGetApiErrorMessageKey } from '../../services/apiError';

//====================================================================================================================================
interface AddDriverProps {
  onClose: () => void;
  onSuccess: () => void;
}

interface DriverData{
  name: string,
  gender: keyof typeof userGender | '';
  role: keyof typeof userRole | '';
  phone: string;
  email: string;
  birthDate: string;
  licenseNumber: string;
  licenseExpiryDate: string;
  status: keyof typeof userStatus | '';

  
}
//====================================================================================================================================
//? AddDriver
//=======================================================================================

const AddDriver: React.FC<AddDriverProps> = ({ onClose, onSuccess }) => {
  const { t } = useTranslation('drivers');
  const { t: tGlobal } = useTranslation('translation');
  const [driverData, setDriverData] = useState<DriverData>({
    name: '',
    gender: '',
    role: 'driver',
    phone: '',
    email: '',
    birthDate: '',
    licenseNumber: '',
    licenseExpiryDate: '',
    status: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  
  //-----------------------------------------------------------------------------------------------------
  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = event.target; // the name and value of filed that was changed
    // prev hold current formd data (driverData), we update data by coping all fields and update only one filed, which is [name]: value, the one got updated)
    setDriverData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  //-----------------------------------------------------------------------------------------------------

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault(); //stops page from refreshing on form submit
    setLoading(true);
    setError('');//clears any previous error messages


  //===================================================================================================

    try {
      console.log(document.cookie)
      await apiClient.post('/api/admin/driver/add', driverData, {
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      onSuccess(); // refresh table and trigger success message
      onClose(); //close the model
    //-----------------------------------------------

    } catch (error: unknown) {
      const messageKey = tryGetApiErrorMessageKey(error);
      setError(messageKey ? tGlobal(messageKey, { defaultValue: messageKey }) : t('addForm.error'));
    
    //-----------------------------------------------
    } finally {
      setLoading(false);
    }
  };

  //===================================================================================================
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">{t('addForm.title')}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('addForm.name')}
              <span className="text-red-600"> *</span>
            </label>
            <input
              type="text"
              name="name"
              value={driverData.name}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('addForm.gender')}
              <span className="text-red-600"> *</span>
            </label>
            <select
              name="gender"
              value={driverData.gender}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">{t('addForm.selectGender')}</option>
              {
                Object.values(userGender).map((statusValue)=>(
                  <option key={statusValue} value={statusValue}>
                    {statusValue}
                  </option>
                ))
              }
            </select>
          </div>

  

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('addForm.phone')}
              <span className="text-red-600"> *</span>
            </label>
            <input
              type="tel"
              name="phone"
              value={driverData.phone}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('addForm.email')}
              <span className="text-red-600"> *</span>
            </label>
            <input
              type="email"
              name="email"
              value={driverData.email}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('addForm.birthDate')}
              <span className="text-red-600"> *</span>
            </label>
            <input
              type="date"
              name="birthDate"
              value={driverData.birthDate}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('addForm.licenseNumber')}
              <span className="text-red-600"> *</span>
            </label>
            <input
              type="text"
              name="licenseNumber"
              value={driverData.licenseNumber}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('addForm.licenseExpiryDate')}
              <span className="text-red-600"> *</span>
            </label>
            <input
              type="date"
              name="licenseExpiryDate"
              value={driverData.licenseExpiryDate}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('addForm.status')}
              <span className="text-red-600"> *</span>
            </label>
            <select
              name="status"
              value={driverData.status}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">{t('addForm.selectStatus')}</option>
              {
                Object.values(userStatus).map((statusValue)=>(
                  <option key={statusValue} value={statusValue}>
                    {statusValue}
                  </option>
                ))
              }
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              {t('addForm.cancel')}
            </button>

            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2  text-white rounded-md hover:bg-red-600 transition-colors disabled:opacity-50"
              style= {{background: COLORS.burgundy}}
            >
              {loading ? t('addForm.loading') : t('addForm.submit')}
            </button>

          </div>
        </form>
      </div>
    </div>
  );
};


//=========================================================================================================
export default AddDriver;
