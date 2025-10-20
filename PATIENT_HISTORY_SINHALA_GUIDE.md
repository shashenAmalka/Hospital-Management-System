# 🏥 Patient History Tab - ලේසි උපදෙස් (Quick Guide)

## 🎯 මොකද්ද හදලා තියෙන්නෙ?

Patient Dashboard එකේ **"Visit History"** කියන tab එකක් හදලා තියෙනවා. එතනින් patient කෙනෙක්ට බලන්න පුළුවන්:

### ✅ දකින්න පුළුවන් දේවල්:
1. **පරණ Appointments** - කලින් ගිහින් තියෙන doctor visits
2. **Lab Reports** - කලින් කරලා තියෙන lab tests ගේ results
3. **සම්පූර්ණ විස්තර** - Click කරලා card එක expand කරන්න පුළුවන්
4. **Filter කරන්න පුළුවන්** - ඕනෑ දෙයක් විතරක් බලන්න

## 📱 භාවිතා කරන විදිහ

### පියවර 1: Login වෙන්න
```
1. Website එකට login වෙන්න patient account එකෙන්
2. Patient Dashboard එකට යන්න
3. "Visit History" tab එක click කරන්න
```

### පියවර 2: Filter කරන්න (ඕන නම්)
```
Top right corner එකේ buttons තුනක් තියෙනවා:
- "All" - හැමදෙයක්ම බලන්න
- "Appointments" - Appointments විතරක් බලන්න  
- "Lab Reports" - Lab reports විතරක් බලන්න
```

### පියවර 3: විස්තර බලන්න
```
Card එකක chevron icon එක (▼) click කරන්න
එතකොට:
- Appointments වලට: Reason, Notes
- Lab Reports වලට: Results, Notes, Download button
```

## 🎨 Screen එකේ පෙන්නෙ මොකද්ද?

### Appointment Card එකක්:
```
┌────────────────────────────────────────┐
│ 🗓️ General Consultation    [Completed] │
│    👤 Dr. Silva                        │
│    🕐 October 15, 2025, 10:00 AM      │
│    🏥 General Medicine                │
│                         [▼ Expand]    │
└────────────────────────────────────────┘
```

### Lab Report Card එකක්:
```
┌────────────────────────────────────────┐
│ 🧪 Blood Test              [Completed] │
│    👤 Lab Tech: John                   │
│    🕐 October 14, 2025                │
│                         [▼ Expand]    │
└────────────────────────────────────────┘

Expand කරද්දී:
├─ Result: Normal
├─ Notes: All values within range
└─ [Download] [View Report] buttons
```

## 🔍 Backend APIs

### API Endpoints:
```javascript
// Appointments fetch කරන්න
GET http://localhost:5000/api/appointments/user/:userId

// Lab Reports fetch කරන්න
GET http://localhost:5000/api/lab-reports?patientId=:userId
```

### Token භාවිතා කරනවා:
```javascript
// localStorage එකේ තියෙන token එක යවනවා
Authorization: Bearer <token>
```

## 🎨 Colors හා Icons

| දේවල      | Color      | Icon       |
|-----------|-----------|-----------|
| Appointment | 🔵 Blue    | 📅 Calendar |
| Lab Report  | 🟣 Purple  | 🧪 Test Tube |
| Completed   | 🟢 Green   | ✅         |
| Pending     | 🟡 Yellow  | ⏳         |
| Critical    | 🔴 Red     | ⚠️         |

## ❌ Errors නැති කරන්නෙ කොහොමද?

### Problem 1: Data එන්නෙ නෑ
**විසඳුම:**
```
1. Backend server run වෙනවාද බලන්න
2. Patient account එකට appointments හෝ lab reports තියෙනවාද බලන්න
3. Browser console එකේ errors තියෙනවාද බලන්න (F12)
```

### Problem 2: 401 Error
**විසඳුම:**
```
Token expire වෙලා ඇති. නැවත login වෙන්න.
```

### Problem 3: Cards expand වෙන්නෙ නෑ
**විසඳුම:**
```
Chevron icon එක (▼) properly click කරන්න
Page එක refresh කරලා try කරන්න
```

## 📊 Features ගොඩක් තියෙනවා

### දැනට තියෙන දේවල්:
- ✅ Past appointments බලන්න
- ✅ Lab reports බලන්න
- ✅ Details expand/collapse කරන්න
- ✅ Filter කරන්න (All/Appointments/Labs)
- ✅ Status badges (Completed, Pending, etc.)
- ✅ Dates format කරලා පෙන්වන්න
- ✅ Loading spinner
- ✅ Error messages
- ✅ Empty state messages

### Future වලදි එකතු කරන්න පුළුවන්:
- 🔮 Search කරන්න (date, doctor name)
- 🔮 Date range filter (last week, month)
- 🔮 PDF export කරන්න
- 🔮 Print කරන්න
- 🔮 Email share කරන්න
- 🔮 Notes add කරන්න

## 💻 Developer ලාට

### File Location:
```
frontend/src/Components/PatientDashboard/HistoryTab.jsx
```

### Component එක import කරන විදිහ:
```javascript
import HistoryTab from './HistoryTab';

// Use කරන විදිහ:
<HistoryTab user={user} />
```

### State Management:
```javascript
const [appointments, setAppointments] = useState([]);
const [labReports, setLabReports] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);
const [activeView, setActiveView] = useState('all');
const [expandedItems, setExpandedItems] = useState({});
```

### API Calls:
```javascript
// useEffect hook එකේ user._id use කරලා fetch කරනවා
useEffect(() => {
  if (user && user._id) {
    fetchHistoryData();
  }
}, [user]);
```

## 🧪 Test කරන්නෙ කොහොමද?

### Test Case 1: Data පෙන්වනවාද?
```
1. Patient login වෙන්න
2. History tab එකට යන්න
3. Appointments හා Lab reports පෙන්වෙනවාද බලන්න
```

### Test Case 2: Filter work කරනවාද?
```
1. "All" click කරන්න → හැමදෙයක්ම පෙන්වෙන්න ඕන
2. "Appointments" click කරන්න → Appointments විතරක් පෙන්වෙන්න ඕන
3. "Lab Reports" click කරන්න → Lab reports විතරක් පෙන්වෙන්න ඕන
```

### Test Case 3: Expand/Collapse
```
1. Card එකක chevron click කරන්න
2. Details පෙන්වෙන්න ඕන
3. නැවත click කරන්න
4. Details hide වෙන්න ඕන
```

### Test Case 4: Empty State
```
1. Data නැති patient account එකකින් login වෙන්න
2. "No History Found" message එක පෙන්වෙන්න ඕන
```

### Test Case 5: Error Handling
```
1. Backend server නවත්වන්න
2. Error message එකක් පෙන්වෙන්න ඕන
3. "Try Again" button එකෙන් retry කරන්න පුළුවන් වෙන්න ඕන
```

## 🎯 මතක තියාගන්න

### ✅ හරි යන දේවල්:
- Patient account එකෙන් login වෙලා තියෙන්න ඕන
- Backend server run වෙන්න ඕන (Port 5000)
- Frontend server run වෙන්න ඕන (Port 3000 හෝ 5173)
- Valid token තියෙන්න ඕන (localStorage එකේ)

### ❌ වැරදි වෙන්න පුළුවන් තැන්:
- Backend APIs නැති නම්
- Token expire වෙලා නම්
- User ID නැති නම්
- Network errors

## 🚀 Ready to Use!

**File:** `frontend/src/Components/PatientDashboard/HistoryTab.jsx`  
**Status:** ✅ **සම්පූර්ණයි - භාවිතා කරන්න පුළුවන්!**

---

**හදලා දුන්න දවස:** 2025 ඔක්තෝබර් 19  
**Developer:** GitHub Copilot  
**Project:** Hospital Management System

### ඉස්සරහට:
1. Patient ලට මෙම feature එක use කරන්න පුළුවන්
2. Errors නැතුව properly work කරනවා
3. Mobile phone එකෙන්වත් use කරන්න පුළුවන් (responsive)

### ප්‍රශ්න තියෙනවනම්:
- Browser console එක check කරන්න (F12)
- Backend logs බලන්න
- Documentation file බලන්න: `PATIENT_HISTORY_TAB_IMPLEMENTATION.md`

---

### 🎉 සාර්ථකයි! සෙනසුරු වන්දනාව! 🎉
