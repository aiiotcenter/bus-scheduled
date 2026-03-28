//======================================================================================
//? Importing
//======================================================================================
import { useState, useEffect } from 'react';
import { busStatus } from '../../enums/statusEnums';

import { COLORS } from '../../styles/colorPalette';
import { useTranslation } from 'react-i18next';

import { apiClient } from '../../services/apiClient';
import { tryGetApiErrorMessageKey } from '../../services/apiError';

interface BusData{
    id: string,
    plate: string,
    brand: string, 
    status : keyof typeof busStatus | '',
}

interface UpdateBusProps {
  onClose: () => void;
  onSuccess: () => void;
  busId: string;
}

//======================================================================================
//? UpdateBus
//======================================================================================
const UpdateBus = ({ onClose, onSuccess, busId }: UpdateBusProps) => {
  const { t } = useTranslation('buses');
  const { t: tGlobal } = useTranslation('translation');
  const [formData, setFormData] = useState<BusData>({
    id: busId,
    plate: '',
    brand: '',
    status: '',
  });

  const [initialData, setInitialData] = useState<BusData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [initialLoading, setInitialLoading] = useState(true);


  ///-------------------------------------------------------------------------
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  useEffect(() => {
    fetchBusData();
  }, [busId]);


  ///-------------------------------------------------------------------------
  // Fetch current bus data
  const fetchBusData = async () => {
    try {
      const response = await apiClient.get('/api/admin/buses/all');
      const buses = response.data.data || [];
      const currentBus = buses.find((bus: any) => bus.id === busId);
      
      if (currentBus) {
        const nextData: BusData = {
          id: currentBus.id,
          plate: currentBus.plate,
          brand: currentBus.brand,
          status: currentBus.status,
        };


        setFormData(nextData);
        setInitialData(nextData);
      }
    } catch (err) {
      console.error('Error fetching bus data:', err);
      setError(t('updateForm.loadError'));
    } finally {
      setInitialLoading(false);
    }
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const updates: Record<string, any> = { id: formData.id };

      if (initialData) {
        (Object.keys(formData) as Array<keyof BusData>).forEach((key) => {
          if (key === 'id') return;
          if (formData[key] !== initialData[key]) {
            updates[key] = formData[key];
          }
        });
      } else {
        Object.assign(updates, formData);
      }

      console.log('Form data being sent to backend:', JSON.stringify(updates, null, 2));
      await apiClient.patch('/api/admin/bus/update', updates, {
        headers: {
          'Content-Type': 'application/json',
        }
      });
      onSuccess();
      onClose();
    //-----------------------------------------------
    } catch (err: unknown) {
      const messageKey = tryGetApiErrorMessageKey(err);
      setError(messageKey ? tGlobal(messageKey, { defaultValue: messageKey }) : t('updateForm.error'));
    //-----------------------------------------------
    } finally {
      setLoading(false);
    }
  };

  //======================================================================================
  if (initialLoading) {
    return (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md">
          <div className="text-center">{t('updateForm.loadingData')}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">{t('updateForm.title')}</h2>
        
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              {t('updateForm.plate')}
               
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
              {t('updateForm.brand')}
               
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
              {t('updateForm.status')}
               
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">{t('updateForm.selectStatus')}</option>
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
              {t('updateForm.cancel')}
            </button>


            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
              style= {{background: COLORS.burgundy}}
            >
              {loading ? t('updateForm.loading') : t('updateForm.submit')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateBus;
