// ⚠️  SECURITY WARNING: This middleware decodes Firebase ID tokens WITHOUT
// verifying the cryptographic signature. This means any client can forge tokens.
// For PRODUCTION, replace this with Firebase Admin SDK verification:
//   const admin = require('firebase-admin');
//   const decoded = await admin.auth().verifyIdToken(token);
// Auth middleware — decodes Firebase ID token (DEVELOPMENT ONLY)

const authMiddleware = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    console.log(`[AUTH] ${req.method} ${req.path} — Authorization header: ${authHeader ? 'Bearer <token>' : 'MISSING'}`);

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split('Bearer ')[1];

    try {
        // Decode the JWT payload (middle part) without crypto verification
        // Firebase ID tokens are JWTs with base64url-encoded parts
        const parts = token.split('.');
        if (parts.length !== 3) {
            return res.status(401).json({ error: 'Invalid token format' });
        }

        const payload = JSON.parse(
            Buffer.from(parts[1].replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8')
        );

        // Check expiry
        if (payload.exp && payload.exp * 1000 < Date.now()) {
            return res.status(401).json({ error: 'Token expired' });
        }

        req.user = {
            uid: payload.user_id || payload.sub,
            email: payload.email,
            name: payload.name || payload.email,
        };

        next();
    } catch (err) {
        console.error('Auth error:', err.message);
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
};

export default authMiddleware;
