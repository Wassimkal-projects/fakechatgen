// AuthContext.tsx
import {createContext} from 'react';

// Define the shape of the context

// Define the shape of the context
export interface AuthContextType {
  user: any;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);


// Create the context with an initial undefined value
export default AuthContext;
