//====================================================================================================================================
//? useAuth Hook - Get current user data and authentication status
//====================================================================================================================================

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { apiClient } from '../services/apiClient';
import { getApiErrorMessageKey } from '../services/apiError';

interface UserData {
  userID: string;
  userName: string;
  userRole: string;
}

interface UseAuthReturn {
  user: UserData | null;
  loading: boolean;
  isAuthenticated: boolean;
  error: string | null;
}

export const useAuth = (): UseAuthReturn => {
  const { t: tGlobal } = useTranslation('translation');
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await apiClient.get('/api/auth/user-info');
        
        const userData = response.data.data;
        setUser(userData);
        setError(null);
        //----------------------------------------------------------
      } catch (err) {
        setUser(null);
        const messageKey = getApiErrorMessageKey(err);
        setError(tGlobal(messageKey, { defaultValue: messageKey }));
        
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  return {
    user,
    loading,
    isAuthenticated: !!user,
    error
  };
};
