import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import { DEFAULTS } from '../data/defaults.js';
import { fetchProducts, fetchSettings } from '../services/api.js';

const BillContext = createContext(null);

const initialState = {
    products: DEFAULTS.map(p => ({ ...p })),
    customProds: [],
    cart: [],
    activeCat: 'all',
    invNum: 1,
    productImages: {},
    currentGSTRate: 18,
    discount: 0,
    customer: { name: '', phone: '', address: '', billType: 'Retail' },
    notes: '',
    settings: {
        businessName: 'Srinivasa Hardwares',
        address: '',
        gstin: '',
        defaultGST: 18,
    },
    productsLoaded: false,
    settingsLoaded: false,
};

function ep(item) {
    return (item.customPrice !== null && item.customPrice !== undefined) ? item.customPrice : item.price;
}

function reducer(state, action) {
    switch (action.type) {
        case 'SET_PRODUCTS':
            return { ...state, products: action.payload, productsLoaded: true };
        case 'SET_PRODUCTS_AND_CUSTOM': {
            const defaults = action.payload.filter(p => !p.isCustom);
            const custom = action.payload.filter(p => p.isCustom);
            return { ...state, products: defaults, customProds: custom, productsLoaded: true };
        }
        case 'SET_ACTIVE_CAT':
            return { ...state, activeCat: action.payload };
        case 'ADD_CUSTOM_PROD':
            return { ...state, customProds: [...state.customProds, action.payload] };
        case 'DELETE_PROD': {
            const id = action.payload;
            return {
                ...state,
                products: state.products.filter(p => p.id !== id),
                customProds: state.customProds.filter(p => p.id !== id),
                cart: state.cart.filter(c => c.id !== id),
            };
        }
        case 'RESET_PRODUCTS':
            return {
                ...state,
                products: action.payload || DEFAULTS.map(p => ({ ...p })),
                customProds: [],
                cart: state.cart.filter(c => c.cat !== 'custom'),
            };
        case 'ADD_TO_CART': {
            const { productId, batchId, customPrice } = action.payload;
            const prod = [...state.products, ...state.customProds].find(p => p.id === productId);
            if (!prod) return state;

            // Find existing item in cart; differentiate by both product and batch
            const existing = state.cart.find(c => c.id === productId && c.batchId === batchId);
            if (existing) {
                return {
                    ...state,
                    cart: state.cart.map(c => (c.id === productId && c.batchId === batchId) ? { ...c, qty: c.qty + 1 } : c),
                };
            }
            return {
                ...state,
                cart: [...state.cart, { ...prod, batchId: batchId || null, customPrice: customPrice || null, qty: 1 }]
            };
        }
        case 'CHANGE_QTY': {
            const { id, batchId, delta } = action.payload;
            const newCart = state.cart.map(c => (c.id === id && c.batchId === batchId) ? { ...c, qty: Math.max(0, c.qty + delta) } : c)
                .filter(c => c.qty > 0);
            return { ...state, cart: newCart };
        }
        case 'REMOVE_ROW': {
            const { id, batchId } = action.payload;
            return { ...state, cart: state.cart.filter(c => !(c.id === id && c.batchId === batchId)) };
        }
        case 'UPDATE_ROW_PRICE': {
            const { id, batchId, val } = action.payload;
            const n = parseFloat(val);
            return {
                ...state,
                cart: state.cart.map(c => (c.id === id && c.batchId === batchId) ? { ...c, customPrice: (!isNaN(n) && n >= 0) ? n : null } : c),
            };
        }
        case 'CLEAR_BILL': {
            const nextNum = state.invNum + 1;
            return {
                ...state,
                cart: [],
                customer: { name: '', phone: '', address: '', billType: 'Retail' },
                discount: 0,
                notes: '',
                currentGSTRate: state.settings.defaultGST || 18,
                invNum: nextNum,
            };
        }
        case 'INCREMENT_INV': {
            const nextNum = state.invNum + 1;
            return {
                ...state,
                invNum: nextNum,
                cart: [],
                customer: { name: '', phone: '', address: '', billType: 'Retail' },
                discount: 0,
                notes: '',
            };
        }
        case 'SET_INV_NUM':
            return { ...state, invNum: action.payload };
        case 'SET_CUSTOMER':
            return { ...state, customer: { ...state.customer, ...action.payload } };
        case 'SET_DISCOUNT':
            return { ...state, discount: action.payload };
        case 'SET_NOTES':
            return { ...state, notes: action.payload };
        case 'SET_GST_RATE':
            return { ...state, currentGSTRate: action.payload };
        case 'SET_PRODUCT_IMAGE':
            return { ...state, productImages: { ...state.productImages, [action.payload.id]: action.payload.src } };
        case 'REMOVE_PRODUCT_IMAGE': {
            const imgs = { ...state.productImages };
            delete imgs[action.payload];
            return { ...state, productImages: imgs };
        }
        case 'SAVE_PRODUCTS':
            return { ...state, products: action.payload.products, customProds: action.payload.customProds };
        case 'SET_SETTINGS': {
            return { ...state, settings: action.payload, settingsLoaded: true };
        }
        default:
            return state;
    }
}

export function BillProvider({ children }) {
    const [state, dispatch] = useReducer(reducer, initialState);

    // Load products & settings from API on mount
    useEffect(() => {
        fetchProducts()
            .then(prods => dispatch({ type: 'SET_PRODUCTS_AND_CUSTOM', payload: prods }))
            .catch(err => console.warn('Failed to load products from API, using defaults:', err));

        fetchSettings()
            .then(settings => {
                dispatch({ type: 'SET_SETTINGS', payload: settings });
                if (settings.invNum) {
                    dispatch({ type: 'SET_INV_NUM', payload: settings.invNum + 1 });
                }
            })
            .catch(err => console.warn('Failed to load settings from API:', err));
    }, []);

    const allProds = useCallback(() => [...state.products, ...state.customProds], [state.products, state.customProds]);

    const calcTotals = useCallback(() => {
        const sub = state.cart.reduce((s, c) => s + ep(c) * c.qty, 0);
        const afterD = sub * (1 - (state.discount || 0) / 100);
        const gst = afterD * (state.currentGSTRate / 100);
        const total = afterD + gst;
        return { sub, afterD, gst, total };
    }, [state.cart, state.discount, state.currentGSTRate]);

    return (
        <BillContext.Provider value={{ state, dispatch, allProds, calcTotals, ep }}>
            {children}
        </BillContext.Provider>
    );
}

export function useBill() {
    return useContext(BillContext);
}
