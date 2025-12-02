import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { AuthResponse, UserInterface } from '../services/authApi';

interface AuthState {
	token: string | null;
	user: UserInterface | null;
}

// Helper functions for localStorage
const loadUserFromStorage = (): UserInterface | null => {
	try {
		const userStr = localStorage.getItem('authUser');
		return userStr ? JSON.parse(userStr) : null;
	} catch (error) {
		console.error('Error loading user from storage:', error);
		return null;
	}
};

const saveUserToStorage = (user: UserInterface) => {
	try {
		localStorage.setItem('authUser', JSON.stringify(user));
	} catch (error) {
		console.error('Error saving user to storage:', error);
	}
};

const initialState: AuthState = {
	token: localStorage.getItem('authToken'),
	user: loadUserFromStorage(),
};

const authSlice = createSlice({
	name: 'auth',
	initialState,
	reducers: {
		setCredentials: (state, action: PayloadAction<AuthResponse>) => {
			state.token = action.payload.token;
			state.user = action.payload.user;
			localStorage.setItem('authToken', action.payload.token);
			saveUserToStorage(action.payload.user);
		},
		logout: (state) => {
			state.token = null;
			state.user = null;
			localStorage.removeItem('authToken');
			localStorage.removeItem('authUser');
		},
	},
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;
