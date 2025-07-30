# FinT Application - Quick Troubleshooting Guide

## Quick Start

If you're experiencing issues, try these steps in order:

1. **Restart Applications**
   ```bash
   # Stop all applications
   # Then restart them
   cd server && npm run start:dev
   cd client && npm start
   ```

2. **Clear Browser Cache**
   - Open browser developer tools (F12)
   - Right-click refresh button → "Empty Cache and Hard Reload"

3. **Check Environment Variables**
   ```bash
   # Verify client environment
   cat client/.env
   
   # Verify server environment
   cat server/.env
   ```

4. **Run Debug Script**
   ```bash
   node scripts/debug-app.js
   ```

---

## Common Issues and Solutions

### 🔐 Authentication Issues

#### Problem: "Cannot POST /api/api/v1/auth/login"
**Solution**: This was a configuration issue that has been resolved. If you see this error:
1. Check that `client/.env` has: `REACT_APP_API_URL=http://localhost:5000/api/v1`
2. Check that `client/package.json` has: `"proxy": null`
3. Restart both applications

#### Problem: "401 Unauthorized"
**Solution**:
1. Clear browser localStorage: `localStorage.clear()`
2. Check if JWT token is valid
3. Try logging in again

#### Problem: "403 Forbidden"
**Solution**:
1. Check if user has proper permissions
2. Verify JWT token is being sent correctly
3. Check server logs for permission errors

### 🌐 Network Issues

#### Problem: "CORS policy blocked"
**Solution**:
1. Check server CORS configuration in `server/src/main.ts`
2. Verify frontend origin is in allowed list
3. Restart server after CORS changes

#### Problem: "Network Error"
**Solution**:
1. Check if server is running on port 5000
2. Check if client is running on port 3000
3. Verify firewall settings
4. Check network connectivity

### 🗄️ Database Issues

#### Problem: "Database connection failed"
**Solution**:
1. Check if PostgreSQL is running: `docker-compose ps`
2. Verify DATABASE_URL in server `.env`
3. Run migrations: `npx prisma migrate dev`
4. Check database logs: `docker-compose logs postgres`

#### Problem: "Prisma Client not found"
**Solution**:
1. Generate Prisma client: `npx prisma generate`
2. Restart server
3. Check Prisma schema: `npx prisma validate`

### 📱 Frontend Issues

#### Problem: "Module not found"
**Solution**:
1. Install dependencies: `npm install`
2. Clear node_modules: `rm -rf node_modules && npm install`
3. Check import paths

#### Problem: "Build failed"
**Solution**:
1. Check for syntax errors in console
2. Verify all dependencies are installed
3. Clear build cache: `npm run clean`

#### Problem: "Component not rendering"
**Solution**:
1. Check browser console for errors
2. Verify component imports
3. Check React DevTools for component state

### 🔧 Development Issues

#### Problem: "Hot reload not working"
**Solution**:
1. Check if file watchers are working
2. Restart development server
3. Check for file system permissions

#### Problem: "Tests failing"
**Solution**:
1. Run tests with verbose output: `npm test -- --verbose`
2. Check test environment variables
3. Verify test database is clean

---

## Debugging Tools

### Browser Developer Tools
1. **Console Tab**: Check for JavaScript errors
2. **Network Tab**: Monitor API calls and responses
3. **Application Tab**: Check localStorage and sessionStorage
4. **Sources Tab**: Set breakpoints and debug JavaScript

### Server Logs
```bash
# View server logs
cd server && npm run start:dev

# Look for these patterns:
# - Route mapping logs
# - Error messages
# - Database connection logs
```

### Database Debugging
```bash
# Check database status
docker-compose ps

# View database logs
docker-compose logs postgres

# Connect to database
docker-compose exec postgres psql -U postgres -d fint_db
```

### API Testing
```bash
# Test API endpoints
curl -X GET http://localhost:5000/api/v1/health

# Test authentication
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

---

## Environment Setup Checklist

### Prerequisites
- [ ] Node.js 18+ installed
- [ ] Docker and Docker Compose installed
- [ ] Git installed
- [ ] Code editor (VS Code recommended)

### Backend Setup
- [ ] Navigate to server directory: `cd server`
- [ ] Install dependencies: `npm install`
- [ ] Copy environment file: `cp .env.example .env`
- [ ] Update environment variables
- [ ] Start database: `docker-compose up -d postgres`
- [ ] Run migrations: `npx prisma migrate dev`
- [ ] Generate Prisma client: `npx prisma generate`
- [ ] Start server: `npm run start:dev`

### Frontend Setup
- [ ] Navigate to client directory: `cd client`
- [ ] Install dependencies: `npm install`
- [ ] Copy environment file: `cp .env.example .env`
- [ ] Update environment variables
- [ ] Start client: `npm start`

### Verification
- [ ] Backend running on http://localhost:5000
- [ ] Frontend running on http://localhost:3000
- [ ] Database accessible
- [ ] API endpoints responding
- [ ] Authentication working

---

## Performance Issues

### Slow API Responses
1. Check database query performance
2. Monitor server CPU/memory usage
3. Check for N+1 query problems
4. Implement caching if needed

### Slow Frontend Loading
1. Check bundle size with webpack analyzer
2. Implement code splitting
3. Optimize imports
4. Use lazy loading for routes

### Memory Leaks
1. Check for event listeners not being removed
2. Monitor component unmounting
3. Check for circular references
4. Use React DevTools Profiler

---

## Security Issues

### JWT Token Security
1. Store tokens securely (not in localStorage)
2. Implement token refresh mechanism
3. Use httpOnly cookies for sensitive data
4. Validate tokens on server side

### Input Validation
1. Implement server-side validation
2. Use DTOs with class-validator
3. Sanitize user inputs
4. Implement rate limiting

### CORS Configuration
1. Only allow necessary origins
2. Use credentials: true for authenticated requests
3. Implement proper CORS error handling
4. Monitor CORS errors in logs

---

## Emergency Procedures

### Application Down
1. Check server logs for errors
2. Verify database connection
3. Restart applications
4. Check system resources

### Data Loss
1. Check database backups
2. Verify migration status
3. Check transaction logs
4. Contact database administrator

### Security Breach
1. Immediately revoke all tokens
2. Check access logs
3. Update security configurations
4. Notify security team

---

## Getting Help

### Documentation
- Check `docs/ISSUES_AND_DEBUGGING.md` for detailed issues
- Check `docs/ISSUE_TRACKER.md` for current issues
- Review API documentation at http://localhost:5000/api/docs

### Debugging Script
Run the automated debugging script:
```bash
node scripts/debug-app.js
```

### Logs and Monitoring
- Server logs: Check terminal where server is running
- Client logs: Check browser console
- Database logs: `docker-compose logs postgres`
- Network logs: Browser Network tab

### Contact Information
- **Development Team**: [Contact]
- **DevOps Team**: [Contact]
- **Security Team**: [Contact]

---

**Last Updated**: 2025-07-30  
**Document Version**: 1.0 