# Admin Dashboard, Reports & Settings API Documentation
**Developer:** Satish  
**Module:** Backend Module 5 — Admin Dashboard, Reports & Settings  
**Target Consumer:** Frontend Admin Panel (Suraj) & System Administrators  

---

## Overview

This module provides administrative analytics, system reporting, and library configuration management for the BookBase platform. All endpoints are protected with JWT authentication and restricted to users with the `admin` role.

---

## Authentication & Headers

All requests to `/api/admin/*` require an Authorization header:
```http
Authorization: Bearer <your_admin_jwt_token>
```

---

## 1. Admin Dashboard Statistics API

### `GET /api/admin/dashboard`
Fetches high-level metrics for dashboard cards and summary tables.

* **Access:** Private (`admin`)
* **Response Status:** `200 OK`
* **Response Body:**
```json
{
  "success": true,
  "data": {
    "totalBooks": 250,
    "availableBooks": 205,
    "uniqueBookTitles": 54,
    "totalUsers": 120,
    "blockedUsers": 3,
    "borrowedBooks": 45,
    "returnedBooks": 80,
    "overdueBooks": 12,
    "recentBorrowings": [
      {
        "_id": "660c1d...",
        "userId": {
          "_id": "660c1a...",
          "name": "Amay",
          "email": "amay@example.com"
        },
        "bookId": {
          "_id": "660c1b...",
          "title": "Java Basics",
          "author": "Herbert Schildt"
        },
        "borrowedAt": "2026-09-01T10:00:00.000Z",
        "dueDate": "2026-09-15T10:00:00.000Z",
        "status": "BORROWED"
      }
    ],
    "recentOverdue": [
      {
        "_id": "660c1e...",
        "userId": {
          "_id": "660c1c...",
          "name": "Sonal",
          "email": "sonal@example.com"
        },
        "bookId": {
          "_id": "660c1d...",
          "title": "DBMS Concepts",
          "author": "Silberschatz"
        },
        "dueDate": "2026-09-10T10:00:00.000Z",
        "status": "OVERDUE"
      }
    ]
  }
}
```

---

## 2. Reports APIs

### `GET /api/admin/reports/books`
Provides inventory status and category distribution.
* **Access:** Private (`admin`)
* **Response Body:**
```json
{
  "success": true,
  "data": {
    "totalTitles": 54,
    "outOfStockTitles": 2,
    "lowStockBooks": [
      {
        "_id": "...",
        "title": "Operating Systems",
        "author": "Tanenbaum",
        "category": "Computer Science",
        "quantity": 3,
        "availableQuantity": 1,
        "isbn": "978-0133591620"
      }
    ],
    "categoryBreakdown": [
      {
        "_id": "Computer Science",
        "totalTitles": 20,
        "totalQuantity": 110,
        "availableQuantity": 90
      },
      {
        "_id": "Mathematics",
        "totalTitles": 15,
        "totalQuantity": 65,
        "availableQuantity": 50
      }
    ]
  }
}
```

---

### `GET /api/admin/reports/users`
Provides member demographic reports and account status.
* **Access:** Private (`admin`)
* **Response Body:**
```json
{
  "success": true,
  "data": {
    "totalUsers": 120,
    "activeUsers": 117,
    "blockedUsers": 3,
    "countryBreakdown": [
      { "_id": "India", "count": 95 },
      { "_id": "USA", "count": 15 },
      { "_id": "Germany", "count": 10 }
    ],
    "recentUsers": [ ... ]
  }
}
```

---

### `GET /api/admin/reports/borrowings`
Provides full history of borrowings with status breakdown.
* **Access:** Private (`admin`)
* **Response Body:**
```json
{
  "success": true,
  "data": {
    "totalBorrowings": 137,
    "currentlyBorrowed": 45,
    "returnedCount": 80,
    "overdueCount": 12,
    "statusBreakdown": [
      { "_id": "RETURNED", "count": 80 },
      { "_id": "BORROWED", "count": 45 },
      { "_id": "OVERDUE", "count": 12 }
    ],
    "borrowings": [ ... ]
  }
}
```

---

### `GET /api/admin/reports/overdue`
Provides comprehensive details on overdue loans, borrowers, and overdue duration in days.
* **Access:** Private (`admin`)
* **Response Body:**
```json
{
  "success": true,
  "data": {
    "totalOverdue": 12,
    "overdueList": [
      {
        "_id": "660c1e...",
        "user": {
          "_id": "...",
          "name": "Sonal",
          "email": "sonal@example.com",
          "country": "India",
          "isBlocked": false
        },
        "book": {
          "_id": "...",
          "title": "DBMS Concepts",
          "author": "Silberschatz",
          "isbn": "978-0078022159"
        },
        "borrowedAt": "2026-08-20T10:00:00.000Z",
        "dueDate": "2026-09-03T10:00:00.000Z",
        "daysOverdue": 22,
        "status": "OVERDUE"
      }
    ]
  }
}
```

---

## 3. Settings APIs

### `GET /api/admin/settings`
Retrieves library configuration (auto-creates default configuration if none exists).
* **Access:** Private (`admin`)
* **Response Body:**
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "libraryName": "BookBase Central Library",
    "maxBooksPerUser": 5,
    "borrowDuration": 14,
    "contactEmail": "admin@bookbase.library",
    "contactPhone": "+91 98765 43210",
    "libraryAddress": "123 Campus Central Library",
    "finePerDay": 5
  }
}
```

---

### `PUT /api/admin/settings`
Updates library settings.
* **Access:** Private (`admin`)
* **Request Body:**
```json
{
  "libraryName": "Apex Institute Central Library",
  "maxBooksPerUser": 7,
  "borrowDuration": 21,
  "contactEmail": "library@apexinstitute.edu",
  "contactPhone": "+91 91234 56789",
  "finePerDay": 10
}
```
* **Response Body:**
```json
{
  "success": true,
  "message": "Library settings updated successfully",
  "data": { ... }
}
```
