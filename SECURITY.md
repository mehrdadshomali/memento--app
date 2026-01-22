# MemoBridge Security Implementation Guide

## 🔒 Security Architecture

MemoBridge implements enterprise-grade security for healthcare applications with HIPAA-compliance considerations.

## Setup Steps

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Copy your project URL and anon key

### 2. Configure Environment Variables

**Mobile App (.env):**
```bash
cp .env.example .env
# Edit .env with your Supabase credentials
```

**Caregiver Portal (caregiver-portal/.env):**
```bash
cd caregiver-portal
cp .env.example .env
# Edit .env with your Supabase credentials
```

### 3. Run Database Setup

1. Open Supabase Dashboard → SQL Editor
2. Copy contents of `supabase-setup.sql`
3. Run the SQL script
4. Verify all tables and policies are created

### 4. Update .gitignore

Ensure `.env` files are ignored:
```
.env
.env.local
caregiver-portal/.env
caregiver-portal/.env.local
```

## Security Features

### ✅ Authentication
- Email/password authentication via Supabase Auth
- Secure token storage using Expo SecureStore
- Auto-refresh tokens
- Password reset functionality

### ✅ Authorization
- Row Level Security (RLS) on all tables
- Users can only access their own data
- Caregivers need explicit permissions
- Location data requires special permission

### ✅ Data Encryption
- Tokens encrypted in SecureStore (iOS Keychain/Android Keystore)
- HTTPS for all API calls
- Database encryption at rest (Supabase default)

### ✅ Privacy Controls
- Granular caregiver permissions
- Location tracking opt-in
- Media access controls
- Audit trail via timestamps

## Permission Levels

### Patient (Profile Owner)
- Full access to own data
- Can add/remove caregivers
- Can set caregiver permissions

### Caregiver
- `view` - View memories and routines
- `edit` - Modify memories and routines
- `location` - Access location data
- `admin` - Manage other caregivers

## Best Practices

### For Development
1. Never commit `.env` files
2. Use different Supabase projects for dev/prod
3. Test RLS policies thoroughly
4. Rotate API keys regularly

### For Production
1. Enable Supabase email verification
2. Set up rate limiting
3. Enable 2FA for admin accounts
4. Regular security audits
5. Monitor suspicious activity

### HIPAA Compliance Considerations
1. Use Supabase Enterprise for BAA
2. Enable audit logging
3. Implement data retention policies
4. Regular security training
5. Incident response plan

## API Security

### Rate Limiting
Supabase provides built-in rate limiting. Configure in Dashboard:
- Auth: 30 requests/hour per IP
- Database: 100 requests/second per user

### CORS
Configure allowed origins in Supabase Dashboard → Settings → API

## Monitoring

### Security Events to Monitor
- Failed login attempts
- Unauthorized access attempts
- Location data access
- Caregiver permission changes
- Data exports

### Supabase Dashboard
- Monitor active users
- Check API usage
- Review error logs
- Audit database queries

## Incident Response

### If Credentials Leaked
1. Rotate Supabase API keys immediately
2. Force logout all users
3. Review access logs
4. Notify affected users

### If Data Breach Suspected
1. Disable affected accounts
2. Review RLS policies
3. Check audit logs
4. Contact Supabase support
5. Follow legal requirements

## Testing Security

### Test RLS Policies
```sql
-- Test as different users
SET request.jwt.claim.sub = 'user-uuid-here';
SELECT * FROM profiles; -- Should only see own profile
```

### Test Authentication
1. Try accessing data without login
2. Try accessing other users' data
3. Test token expiration
4. Test password reset flow

## Updates & Maintenance

### Regular Tasks
- [ ] Update dependencies monthly
- [ ] Review access logs weekly
- [ ] Audit caregiver permissions monthly
- [ ] Test backup restoration quarterly
- [ ] Security training annually

### Dependency Updates
```bash
# Check for security vulnerabilities
npm audit

# Update packages
npm update

# Check for outdated packages
npm outdated
```

## Support

For security concerns:
- Email: [SECURITY_EMAIL]
- Report vulnerabilities privately
- Do not disclose publicly until patched

## Compliance Checklist

- [ ] Data encryption at rest
- [ ] Data encryption in transit (HTTPS)
- [ ] Access controls (RLS)
- [ ] Audit logging
- [ ] User authentication
- [ ] Password policies
- [ ] Session management
- [ ] Data backup
- [ ] Incident response plan
- [ ] Privacy policy
- [ ] Terms of service
- [ ] User consent forms

## Resources

- [Supabase Security](https://supabase.com/docs/guides/platform/security)
- [HIPAA Compliance Guide](https://supabase.com/docs/guides/platform/hipaa)
- [Expo SecureStore](https://docs.expo.dev/versions/latest/sdk/securestore/)
- [OWASP Mobile Security](https://owasp.org/www-project-mobile-security/)
