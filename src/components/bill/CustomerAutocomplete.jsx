import React, { useState, useEffect } from 'react';
import { TextField, Autocomplete } from '@mui/material';
import { useBill } from '../../store/BillContext.jsx';
import { fetchBills } from '../../services/api.js';

export default function CustomerAutocomplete() {
    const { state, dispatch } = useBill();
    const [customers, setCustomers] = useState([]);

    useEffect(() => {
        fetchBills()
            .then(bills => {
                const names = [...new Set(bills.map(b => b.customer).filter(n => n && n !== 'Walk-in'))];
                setCustomers(names);
            })
            .catch(() => {});
    }, []);

    return (
        <Autocomplete
            freeSolo
            options={customers}
            value={state.customer.name}
            onInputChange={(_, val) => dispatch({ type: 'SET_CUSTOMER', payload: { name: val } })}
            renderInput={(params) => (
                <TextField
                    {...params}
                    label="Customer Name"
                    size="small"
                    placeholder="Walk-in customer"
                />
            )}
            size="small"
        />
    );
}
