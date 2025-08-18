// context/OrderContext.tsx
'use client';
import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { CartItem, OrderItem, Order, MenuItem } from '@/types';

interface OrderState {
  currentOrder: Order | null;
  cartItems: CartItem[];
  selectedTable: number | null;
  orderStatus: 'idle' | 'ordering' | 'confirming' | 'processing' | 'completed';
  total: number;
}

type OrderAction = 
  | { type: 'SET_TABLE'; payload: number }
  | { type: 'SET_ORDER'; payload: Order }
  | { type: 'ADD_TO_CART'; payload: CartItem }
  | { type: 'UPDATE_CART_ITEM'; payload: { tempId: string; quantity: number; notes?: string } }
  | { type: 'REMOVE_FROM_CART'; payload: string }
  | { type: 'CLEAR_CART' }
  | { type: 'SET_STATUS'; payload: OrderState['orderStatus'] }
  | { type: 'CALCULATE_TOTAL' };

const initialState: OrderState = {
  currentOrder: null,
  cartItems: [],
  selectedTable: null,
  orderStatus: 'idle',
  total: 0,
};

function orderReducer(state: OrderState, action: OrderAction): OrderState {
  switch (action.type) {
    case 'SET_TABLE':
      return { ...state, selectedTable: action.payload };
    
    case 'SET_ORDER':
      return { ...state, currentOrder: action.payload };
    
    case 'ADD_TO_CART':
      const existingItem = state.cartItems.find(
        item => item.item_id === action.payload.item_id
      );
      
      if (existingItem) {
        return {
          ...state,
          cartItems: state.cartItems.map(item =>
            item.tempId === existingItem.tempId
              ? { ...item, quantity: item.quantity + action.payload.quantity }
              : item
          ),
        };
      }
      
      return {
        ...state,
        cartItems: [...state.cartItems, action.payload],
      };
    
    case 'UPDATE_CART_ITEM':
      return {
        ...state,
        cartItems: state.cartItems.map(item =>
          item.tempId === action.payload.tempId
            ? { 
                ...item, 
                quantity: action.payload.quantity,
                notes: action.payload.notes ?? item.notes,
                subtotal: action.payload.quantity * item.unit_price
              }
            : item
        ),
      };
    
    case 'REMOVE_FROM_CART':
      return {
        ...state,
        cartItems: state.cartItems.filter(item => item.tempId !== action.payload),
      };
    
    case 'CLEAR_CART':
      return {
        ...state,
        cartItems: [],
        total: 0,
      };
    
    case 'SET_STATUS':
      return { ...state, orderStatus: action.payload };
    
    case 'CALCULATE_TOTAL':
      const total = state.cartItems.reduce((sum, item) => sum + item.subtotal, 0);
      return { ...state, total };
    
    default:
      return state;
  }
}

interface OrderContextType {
  state: OrderState;
  dispatch: React.Dispatch<OrderAction>;
  addToCart: (menuItem: MenuItem, quantity: number, notes?: string) => void;
  updateCartItem: (tempId: string, quantity: number, notes?: string) => void;
  removeFromCart: (tempId: string) => void;
  clearCart: () => void;
  setTable: (tableId: number) => void;
  calculateTotal: () => void;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export function OrderProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(orderReducer, initialState);

  const addToCart = (menuItem: MenuItem, quantity: number, notes?: string) => {
    const cartItem: CartItem = {
      tempId: `temp-${Date.now()}-${Math.random()}`,
      item_id: menuItem.id,
      quantity,
      unit_price: menuItem.price,
      subtotal: quantity * menuItem.price,
      notes,
      menu_item: menuItem,
      name: menuItem.name,
    };
    
    dispatch({ type: 'ADD_TO_CART', payload: cartItem });
    dispatch({ type: 'CALCULATE_TOTAL' });
  };

  const updateCartItem = (tempId: string, quantity: number, notes?: string) => {
    dispatch({ type: 'UPDATE_CART_ITEM', payload: { tempId, quantity, notes } });
    dispatch({ type: 'CALCULATE_TOTAL' });
  };

  const removeFromCart = (tempId: string) => {
    dispatch({ type: 'REMOVE_FROM_CART', payload: tempId });
    dispatch({ type: 'CALCULATE_TOTAL' });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  const setTable = (tableId: number) => {
    dispatch({ type: 'SET_TABLE', payload: tableId });
  };

  const calculateTotal = () => {
    dispatch({ type: 'CALCULATE_TOTAL' });
  };

  return (
    <OrderContext.Provider value={{
      state,
      dispatch,
      addToCart,
      updateCartItem,
      removeFromCart,
      clearCart,
      setTable,
      calculateTotal,
    }}>
      {children}
    </OrderContext.Provider>
  );
}

export function useOrder() {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrder must be used within an OrderProvider');
  }
  return context;
}