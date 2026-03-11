import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import {
    fetchInventoryBatches,
    fetchInventoryAlerts,
    addInventoryBatch,
    updateInventoryBatch,
    fetchSuppliers,
    addSupplier,
    updateSupplier,
    deleteSupplier
} from '../services/api.js';

const InventoryContext = createContext(null);

const initialState = {
    batches: [],
    suppliers: [],
    alerts: { lowStock: [], nearExpiry: [] },
    loading: true,
    error: null,
};

function reducer(state, action) {
    switch (action.type) {
        case 'SET_LOADING':
            return { ...state, loading: action.payload };
        case 'SET_ERROR':
            return { ...state, error: action.payload, loading: false };
        case 'SET_DATA':
            return {
                ...state,
                batches: action.payload.batches,
                suppliers: action.payload.suppliers,
                alerts: action.payload.alerts,
                loading: false,
                error: null,
            };
        case 'ADD_BATCH':
            return { ...state, batches: [...state.batches, action.payload] };
        case 'UPDATE_BATCH':
            return {
                ...state,
                batches: state.batches.map(b => b._id === action.payload._id ? action.payload : b)
            };
        case 'ADD_SUPPLIER':
            return { ...state, suppliers: [action.payload, ...state.suppliers] };
        case 'UPDATE_SUPPLIER':
            return {
                ...state,
                suppliers: state.suppliers.map(s => s._id === action.payload._id ? action.payload : s)
            };
        case 'REMOVE_SUPPLIER':
            return {
                ...state,
                suppliers: state.suppliers.filter(s => s._id !== action.payload)
            };
        case 'SET_ALERTS':
            return { ...state, alerts: action.payload };
        default:
            return state;
    }
}

export function InventoryProvider({ children }) {
    const [state, dispatch] = useReducer(reducer, initialState);

    const loadData = useCallback(async () => {
        dispatch({ type: 'SET_LOADING', payload: true });
        try {
            const [batches, suppliers, alerts] = await Promise.all([
                fetchInventoryBatches(),
                fetchSuppliers(),
                fetchInventoryAlerts()
            ]);
            dispatch({ type: 'SET_DATA', payload: { batches, suppliers, alerts } });
        } catch (error) {
            console.error('Failed to load inventory data:', error);
            dispatch({ type: 'SET_ERROR', payload: error.message });
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleAddBatch = async (batchData) => {
        const batch = await addInventoryBatch(batchData);
        dispatch({ type: 'ADD_BATCH', payload: batch });
        // Refresh alerts quietly
        fetchInventoryAlerts().then(alerts =>
            dispatch({ type: 'SET_ALERTS', payload: alerts })
        );
        return batch;
    };

    const handleUpdateBatch = async (id, batchData) => {
        const batch = await updateInventoryBatch(id, batchData);
        dispatch({ type: 'UPDATE_BATCH', payload: batch });
        return batch;
    };

    const handleAddSupplier = async (supplierData) => {
        const supplier = await addSupplier(supplierData);
        dispatch({ type: 'ADD_SUPPLIER', payload: supplier });
        return supplier;
    };

    const handleUpdateSupplier = async (id, supplierData) => {
        const supplier = await updateSupplier(id, supplierData);
        dispatch({ type: 'UPDATE_SUPPLIER', payload: supplier });
        return supplier;
    };

    const handleDeleteSupplier = async (id) => {
        await deleteSupplier(id);
        dispatch({ type: 'REMOVE_SUPPLIER', payload: id });
    };

    return (
        <InventoryContext.Provider value={{
            state,
            dispatch,
            loadData,
            handleAddBatch,
            handleUpdateBatch,
            handleAddSupplier,
            handleUpdateSupplier,
            handleDeleteSupplier
        }}>
            {children}
        </InventoryContext.Provider>
    );
}

export function useInventory() {
    return useContext(InventoryContext);
}
