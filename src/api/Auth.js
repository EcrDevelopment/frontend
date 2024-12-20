import axiosInstance from '../axiosConfig';

export async function validateToken(token) {
  try {
    // Obtener el token más reciente de las cookies
    const currentToken = document.cookie
      .split('; ')
      .find(row => row.startsWith('access_token='))
      ?.split('=')[1] || token;
    
    // Usar siempre el token más reciente
    const response = await axiosInstance.post('/accounts/auth/token/verify/', { 
      token: currentToken 
    });
    return true;
  } catch (error) {
    return false;
  }
}

export async function loginUser(credentials) {
  try {
    const response = await axiosInstance.post('/accounts/auth/login/', credentials);
    return {
      token: {
        access: response.data.access,
        refresh: response.data.refresh
      },
      userData: response.data.user
    };
  } catch (error) {
    console.error('Error de logeo:', error);
    return null;
  }
}

