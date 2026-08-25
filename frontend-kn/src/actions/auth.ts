'use server';

import { ref, get, push, set, query, orderByChild, equalTo } from 'firebase/database';
import { db, cleanupLoginLogs } from '@/lib/firebase';
import { headers } from 'next/headers';

// Simple in-memory rate limiter (resets on server restart/cold start)
const rateLimitCache = new Map<string, { count: number, resetAt: number }>();

function checkRateLimit(ip: string, maxAttempts: number = 5, windowMs: number = 60000) {
  const now = Date.now();
  const record = rateLimitCache.get(ip);
  
  if (record) {
    if (now > record.resetAt) {
      // Window expired, reset
      rateLimitCache.set(ip, { count: 1, resetAt: now + windowMs });
      return true;
    }
    
    if (record.count >= maxAttempts) {
      return false; // Rate limited
    }
    
    record.count += 1;
    rateLimitCache.set(ip, record);
    return true;
  }
  
  rateLimitCache.set(ip, { count: 1, resetAt: now + windowMs });
  return true;
}

export async function loginEmployee(empId: string, pass: string) {
  try {
    const headersList = headers();
    const ip = headersList.get('x-forwarded-for') || headersList.get('x-real-ip') || 'unknown';
    
    // Max 5 attempts per minute per IP
    if (!checkRateLimit(`emp-login-${ip}`, 5, 60000)) {
      return { success: false, error: 'Too many login attempts. Please try again later.' };
    }

    const empQuery = query(ref(db, 'employees'), orderByChild('employee_id'), equalTo(empId.toUpperCase()));
    const snapshot = await get(empQuery);
    const employees = snapshot.val();
    
    if (employees) {
      for (const [key, emp] of Object.entries(employees)) {
        if ((emp as any).employee_id === empId.toUpperCase() && (emp as any).password === pass) {
          if ((emp as any).status === 'Inactive') {
            return { success: false, error: 'Your profile is inactive. Please contact admin.' };
          }
          
          try {
            const logRef = push(ref(db, 'logs/logins'));
            await set(logRef, {
              role: 'Employee',
              username: empId.toUpperCase(),
              ip: ip,
              timestamp: new Date().toISOString()
            });
            await cleanupLoginLogs();
          } catch (e) {
            console.error('Error logging employee login', e);
          }
          
          return { success: true, employeeId: key };
        }
      }
    }
    
    return { success: false, error: 'Login failed. Please verify your Employee ID and password.' };
  } catch (err) {
    const errorId = Math.random().toString(36).substring(7);
    console.error(`[ErrorID: ${errorId}] Employee Login Error:`, err);
    return { success: false, error: `Connection error: ${err instanceof Error ? err.message : String(err)}`, errorId };
  }
}

export async function loginClient(clientId: string, pass: string) {
  try {
    const headersList = headers();
    const ip = headersList.get('x-forwarded-for') || headersList.get('x-real-ip') || 'unknown';
    
    // Max 5 attempts per minute per IP
    if (!checkRateLimit(`client-login-${ip}`, 5, 60000)) {
      return { success: false, error: 'Too many login attempts. Please try again later.' };
    }

    const clientQuery = query(ref(db, 'clients'), orderByChild('clientId'), equalTo(clientId.toUpperCase()));
    const snapshot = await get(clientQuery);
    const clients = snapshot.val();
    
    if (clients) {
      for (const [key, client] of Object.entries(clients)) {
        if ((client as any).clientId === clientId.toUpperCase() && (client as any).password === pass) {
          if ((client as any).status === 'Inactive') {
            return { success: false, error: 'Your profile is inactive. Please contact admin.' };
          }
          
          try {
            const logRef = push(ref(db, 'logs/logins'));
            await set(logRef, {
              role: 'Client',
              username: clientId.toUpperCase(),
              ip: ip,
              timestamp: new Date().toISOString()
            });
            await cleanupLoginLogs();
          } catch (e) {
            console.error('Error logging client login', e);
          }
          
          return { success: true, clientId: key };
        }
      }
    }
    
    return { success: false, error: 'Login failed. Please verify your Client ID and password.' };
  } catch (err) {
    const errorId = Math.random().toString(36).substring(7);
    console.error(`[ErrorID: ${errorId}] Client Login Error:`, err);
    return { success: false, error: `Connection error: ${err instanceof Error ? err.message : String(err)}`, errorId };
  }
}
