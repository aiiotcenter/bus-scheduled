//===============================================================================================
//? Importing
//===============================================================================================

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import loginPicture from '../../assets/loginPicture.png';
import busTrackerLogo from '../../assets/busTrackerlogo.png';
import { burgundy } from '../../styles/colorPalette';
import LanguageSwitcher from '../../components/common/LanguageSwitcher';
import { useTranslation } from 'react-i18next';

import { apiClient } from '../../services/apiClient';
import { tryGetApiErrorMessageKey } from '../../services/apiError';


// ===============================================================================================

const ForgotPassword = () => {
  const { t } = useTranslation('auth/forgot-passwordPage');
  const { t: tGlobal } = useTranslation('translation');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [EmailSent, setEmailSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // function to send password reset links via gmail -------------------------------------------------------------------------------
  const sendResetEmail = async (targetEmail: string) => {
    setError('');
    setLoading(true);
    try {
      const response = await apiClient.post('/api/auth/admin/forgot-password', 
        { email: targetEmail},
        {
          headers: {
            'Content-Type': 'application/json',
          },
          withCredentials: true,
        }
      );
      if (response.status === 200) {
        setEmailSent(true);
      }

      console.log(response);
      console.log(response.data);
      
    // ---------------------------------------------      
    } catch (error: unknown) {
      const messageKey = tryGetApiErrorMessageKey(error);
      setError(messageKey ? tGlobal(messageKey, { defaultValue: messageKey }) : tGlobal('common.errors.internal'));

      console.error('forgot password error:', error);
    // ---------------------------------------------
    } finally {
      setLoading(false);
    }
  };
  //-------------------------------------------------------------------------------------------------------------------------

  // handle logic when user submits the email form 
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault(); // stop default behaviour of reloading the page and let react handle submit logic
    if (!email) {
      setError(t('errors.missingEmail'));
      return;
    }
    await sendResetEmail(email);
  };

  // handle logic when user asks for a Resend
  const handleResend = async () => {
    if (!email) {
      setError(t('errors.missingEmail'));
      return;
    }
    await sendResetEmail(email);
  };

  //=====================================================================================================================================================================
  return (
    <div className="min-h-screen flex relative">
 
      {/* button to change the language  */}
        <div className="absolute top-4 right-4 z-50">
          <div className="px-2 py-1 rounded-md" style={{ backgroundColor: burgundy }}>
            <LanguageSwitcher />
          </div>
        </div>

      {/* Left side - operation ========================================================*/}
      <div className="relative w-full lg:w-1/2 flex items-center justify-center p-8" style={{marginTop:'-20px'}}>

        
        {/* retunr button -----------------------------------------------------------------*/}
        <div className="relative h-full px-0 py-10">
          <button
            type="button"
            aria-label="Return to login"
            onClick={() => navigate('/')}
            className="
              absolute top-6 
              inline-flex items-center justify-center
              w-9 h-9 rounded-full border-2
              transition-all duration-200 ease-out
              hover:scale-105 hover:bg-opacity-10
              focus:outline-none focus:ring-2 focus:ring-offset-2
            "
            style={{ borderColor: burgundy, color: burgundy }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
        </div>

        {/* -----------------------------------------------------------------*/}
        
        
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <img className='w-40 h-40 mx-auto' src={busTrackerLogo}/>
            <h1 className="text-4xl font-bold mb-2" style={{color: burgundy}}>{t('university')}</h1>
            <h1 className="text-4xl font-bold mb-2" style={{color: burgundy}}>{t('appName')}</h1>
            <p className="text-2xl font-bold mb-2 mt-5" style={{color: burgundy}}>{t('adminLogin')}</p>
          </div>

          {/* chagne the screen content accoring to the state of EmailSent--------------------------------------------------------------------------------- */}
          {!EmailSent ? (
            
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <h1 className="block font-semibold text-black mb-2 mt-10">{t('heading')}</h1>
            <p className="block font-semibold text-gray-500 mb-8">{t('subheading')}</p>



            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                {t('emailLabel')}
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent outline-none transition focus:ring-red-900"
                placeholder={t('emailPlaceholder')}
                required
              />
            </div>

        
            <button
              type="submit"
              className="w-full text-white py-3 px-4 rounded-lg transition duration-200 font-medium hover:bg-blue-500"
              style={{backgroundColor: burgundy}}
              disabled={loading}
            >
              {loading ? t('sending') : t('submit')}
            </button>
          </form>
        ) : (
          //------------------------------------------------------------------------------
          <>
          <div className="text-center">
            <p className="text-lg font-medium text-gray-700 mb-3">
              {t('checkEmail')}
            </p>
            <p className="text-base font-medium text-gray-700">
              {t('didntReceive')}{' '}
              <button
                type="button"
                onClick={handleResend}
                className="font-semibold hover:underline disabled:opacity-60"
                style={{color: burgundy}}
                disabled={loading}
              >
                {loading ? t('sending') : t('resend')}
              </button>
            </p>

          </div>
          </>
        )}

          
        </div>
      </div>

      {/* Right side - Image =======================================================================================*/}
      <div className="hidden lg:block lg:w-2/3 relative">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${loginPicture})` }}
        >
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
