import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';

// Créer une instance axios avec configuration de base
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token d'authentification
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les erreurs de réponse
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expiré ou invalide
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/connexion';
    }
    return Promise.reject(error);
  }
);

// Services d'authentification
export const authService = {
  inscription: async (email, password) => {
    const response = await api.post('/auth/signup', { email, password });
    return response.data;
  },

  connexion: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  deconnexion: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  obtenirProfil: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  estConnecte: () => {
    return !!localStorage.getItem('token');
  },

  obtenirUtilisateur: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }
};

// Services des dépenses
export const depenseService = {
  obtenirDepenses: async (params = {}) => {
    const response = await api.get('/expenses', { params });
    return response.data;
  },

  creerDepense: async (depense) => {
    const response = await api.post('/expenses', depense);
    return response.data;
  },

  creerDepenseAvecFichier: async (formData) => {
    const response = await api.post('/expenses', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  obtenirDepense: async (id) => {
    const response = await api.get(`/expenses/${id}`);
    return response.data;
  },

  modifierDepense: async (id, depense) => {
    const response = await api.put(`/expenses/${id}`, depense);
    return response.data;
  },

  supprimerDepense: async (id) => {
    const response = await api.delete(`/expenses/${id}`);
    return response.data;
  },

  obtenirRecu: async (expenseId) => {
    const response = await api.get(`/receipts/${expenseId}`, {
      responseType: 'blob'
    });
    return response;
  }
};

// Services des revenus
export const revenuService = {
  obtenirRevenus: async (params = {}) => {
    const response = await api.get('/incomes', { params });
    return response.data;
  },

  creerRevenu: async (revenu) => {
    const response = await api.post('/incomes', revenu);
    return response.data;
  },

  obtenirRevenu: async (id) => {
    const response = await api.get(`/incomes/${id}`);
    return response.data;
  },

  modifierRevenu: async (id, revenu) => {
    const response = await api.put(`/incomes/${id}`, revenu);
    return response.data;
  },

  supprimerRevenu: async (id) => {
    const response = await api.delete(`/incomes/${id}`);
    return response.data;
  }
};

// Services des catégories
export const categorieService = {
  obtenirCategories: async () => {
    const response = await api.get('/categories');
    return response.data;
  },

  creerCategorie: async (categorie) => {
    const response = await api.post('/categories', categorie);
    return response.data;
  },

  modifierCategorie: async (id, categorie) => {
    const response = await api.put(`/categories/${id}`, categorie);
    return response.data;
  },

  supprimerCategorie: async (id) => {
    const response = await api.delete(`/categories/${id}`);
    return response.data;
  }
};

// Services des statistiques
export const statistiqueService = {
  obtenirResumeMensuel: async (annee, mois) => {
    const response = await api.get(`/summary/monthly?month=${annee}-${mois.toString().padStart(2, '0')}`);
    return response.data;
  },

  obtenirStatistiquesCategories: async (params = {}) => {
    const response = await api.get('/summary', { params });
    return response.data;
  },

  obtenirTendances: async (params = {}) => {
    const response = await api.get('/summary', { params });
    return response.data;
  }
};

// Services des reçus
export const recuService = {
  obtenirRecu: async (expenseId) => {
    const response = await api.get(`/receipts/${expenseId}`, {
      responseType: 'blob'
    });
    return response;
  },

  telechargerRecu: async (expenseId, fileName) => {
    const response = await recuService.obtenirRecu(expenseId);
    
    // Créer un lien de téléchargement
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName || `recu-${expenseId}`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  }
};

export default api;
