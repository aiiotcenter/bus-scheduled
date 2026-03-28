//======================================================================================
//? Importing
//======================================================================================
import { useState } from 'react';
import { busStatus } from '../../enums/statusEnums';
import { COLORS } from '../../styles/colorPalette';
import { useTranslation } from 'react-i18next';

import { apiClient } from '../../services/apiClient';
import { tryGetApiErrorMessageKey } from '../../services/apiError';


interface BusData{
    brand: string,
    plate: string, 
    status : keyof typeof busStatus | '',
}
//======================================================================================
//? AddBus
//======================================================================================
const AddBus = ({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) => {
  const { t } = useTranslation('buses');
  const { t: tGlobal } = useTranslation('translation');
  const [formData, setFormData] = useState<BusData>({
    plate: '',
    brand: '',
    status: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  ///-------------------------------------------------------------------------
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  ///-------------------------------------------------------------------------

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      console.log('Form data being sent to backend:', JSON.stringify(formData, null, 2));
      await apiClient.post('/api/admin/bus/add', formData, {
        headers: {
          'Content-Type': 'application/json',
        }
      });
      onSuccess();
      onClose();
      
    } catch (error: unknown) {
      const messageKey = tryGetApiErrorMessageKey(error);
      setError(messageKey ? tGlobal(messageKey, { defaultValue: messageKey }) : t('addForm.error'));
    
    } finally {
      setLoading(false);
    }
  };

  //======================================================================================
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">{t('addForm.title')}</h2>

        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              {t('addForm.plate')}
              <span className="text-red-600"> *</span>
            </label>
            <input
              type="text"
              name="plate"
              value={formData.plate}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
        {/* --------------------------------------------------------------------------------------- */}

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              {t('addForm.brand')}
              <span className="text-red-600"> *</span>
            </label>
            <input
              type="text"
              name="brand"
              value={formData.brand}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>


        {/* --------------------------------------------------------------------------------------- */}

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              {t('addForm.status')}
              <span className="text-red-600"> *</span>
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">{t('addForm.selectStatus')}</option>
              {Object.values(busStatus).map((statusValue) => (
                <option key={statusValue} value={statusValue}>
                  {statusValue}
                </option>
              ))}
            </select>
          </div>


          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              {t('addForm.cancel')}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
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

export default AddBus;
