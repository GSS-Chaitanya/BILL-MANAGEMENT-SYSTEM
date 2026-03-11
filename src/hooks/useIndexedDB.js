import { useEffect } from 'react';

const DB_NAME = 'SrinivasaHardwares';
const DB_VERSION = 1;
const STORE_NAME = 'bills';
let db = null;

function openDB() {
    return new Promise((res, rej) => {
        const req = indexedDB.open(DB_NAME, DB_VERSION);
        req.onupgradeneeded = e => {
            const d = e.target.result;
            if (!d.objectStoreNames.contains(STORE_NAME)) {
                const s = d.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
                s.createIndex('date', 'date', { unique: false });
                s.createIndex('dateStr', 'dateStr', { unique: false });
            }
        };
        req.onsuccess = e => { db = e.target.result; res(db); };
        req.onerror = e => rej(e.target.error);
    });
}

async function ensureDB() {
    if (!db) await openDB();
    return db;
}

export async function dbPut(record) {
    await ensureDB();
    return new Promise((res, rej) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const rq = tx.objectStore(STORE_NAME).add(record);
        rq.onsuccess = () => res(rq.result);
        rq.onerror = () => rej(rq.error);
    });
}

export async function dbDelete(id) {
    await ensureDB();
    return new Promise((res, rej) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const rq = tx.objectStore(STORE_NAME).delete(id);
        rq.onsuccess = () => res();
        rq.onerror = () => rej(rq.error);
    });
}

export async function dbGetAll() {
    await ensureDB();
    return new Promise((res, rej) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const rq = tx.objectStore(STORE_NAME).getAll();
        rq.onsuccess = () => res(rq.result);
        rq.onerror = () => rej(rq.error);
    });
}

export async function dbClear() {
    await ensureDB();
    return new Promise((res, rej) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const rq = tx.objectStore(STORE_NAME).clear();
        rq.onsuccess = () => res();
        rq.onerror = () => rej(rq.error);
    });
}

// Initialize DB on import
openDB().catch(e => console.warn('IndexedDB init error:', e));
