# Quick Fix Reference - React Infinite Loop Prevention

## 🔴 Common Patterns That Cause Infinite Loops

### ❌ Pattern 1: Object/Array Dependencies
```javascript
// BAD - Object recreated every render
const config = { name: 'test', value: 123 };

useEffect(() => {
  doSomething(config);
}, [config]); // ❌ Triggers on every render
```

### ✅ Solution: useMemo
```javascript
// GOOD - Object reference stays stable
const config = useMemo(() => ({
  name: 'test',
  value: 123
}), []); // Only creates once

useEffect(() => {
  doSomething(config);
}, [config]); // ✅ Only triggers when actually changes
```

---

### ❌ Pattern 2: Function Dependencies
```javascript
// BAD - Function recreated every render
const handleSubmit = () => {
  saveData(data);
};

useEffect(() => {
  setupHandler(handleSubmit);
}, [handleSubmit]); // ❌ Triggers on every render
```

### ✅ Solution: useCallback
```javascript
// GOOD - Function reference stays stable
const handleSubmit = useCallback(() => {
  saveData(data);
}, [data]); // Only recreates when data changes

useEffect(() => {
  setupHandler(handleSubmit);
}, [handleSubmit]); // ✅ Only triggers when dependencies change
```

---

### ❌ Pattern 3: State Updates with Closures
```javascript
// BAD - Creates closure over stale state
const [count, setCount] = useState(0);

const increment = () => {
  setCount(count + 1); // ❌ Closure over current count
};
```

### ✅ Solution: Functional Updates
```javascript
// GOOD - Always uses latest state
const [count, setCount] = useState(0);

const increment = useCallback(() => {
  setCount(prevCount => prevCount + 1); // ✅ Always latest
}, []); // No dependencies needed!
```

---

### ❌ Pattern 4: Missing Dependencies
```javascript
// BAD - Lies about dependencies
const [data, setData] = useState({});

useEffect(() => {
  processData(data); // Uses data
  updateUI(config);  // Uses config
}, []); // ❌ Empty array but uses data and config
```

### ✅ Solution: Complete Dependencies
```javascript
// GOOD - All dependencies listed
const [data, setData] = useState({});

useEffect(() => {
  processData(data);
  updateUI(config);
}, [data, config]); // ✅ Lists everything used
```

---

### ❌ Pattern 5: State Update in Render
```javascript
// BAD - Updates state during render
const MyComponent = () => {
  const [count, setCount] = useState(0);
  
  setCount(count + 1); // ❌ Updates during render
  
  return <div>{count}</div>;
};
```

### ✅ Solution: Move to useEffect or Event Handler
```javascript
// GOOD - Updates in effect or handler
const MyComponent = () => {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    setCount(1); // ✅ Updates in effect
  }, []);
  
  // OR
  const handleClick = () => {
    setCount(prev => prev + 1); // ✅ Updates in handler
  };
  
  return <div onClick={handleClick}>{count}</div>;
};
```

---

## 🟢 Safe Patterns

### ✅ Primitive Dependencies (Always Safe)
```javascript
useEffect(() => {
  // Safe - primitives don't trigger unnecessary renders
}, [string, number, boolean, null, undefined]);
```

### ✅ Memoized Objects/Arrays
```javascript
const config = useMemo(() => ({ /* ... */ }), []);
const list = useMemo(() => [1, 2, 3], []);

useEffect(() => {
  // Safe - memoized references
}, [config, list]);
```

### ✅ Memoized Functions
```javascript
const handler = useCallback(() => {
  // ...
}, [dependencies]);

useEffect(() => {
  // Safe - memoized function
}, [handler]);
```

### ✅ Functional State Updates
```javascript
setData(prev => ({ ...prev, newField: value })); // Always safe
setArray(prev => [...prev, newItem]); // Always safe
setCount(prev => prev + 1); // Always safe
```

---

## 🛠️ Debugging Tools

### Check for Infinite Loops
```javascript
useEffect(() => {
  console.log('Effect running!'); // Add logging
  // ... effect logic
}, [dependencies]);
```

### React DevTools Profiler
1. Open React DevTools
2. Go to Profiler tab
3. Click Record
4. Interact with component
5. Stop recording
6. Check for excessive renders

### ESLint Plugin
```bash
npm install eslint-plugin-react-hooks --save-dev
```

Add to `.eslintrc`:
```json
{
  "plugins": ["react-hooks"],
  "rules": {
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "warn"
  }
}
```

---

## 📋 Checklist for Code Review

- [ ] All objects used in dependencies are memoized with `useMemo`
- [ ] All functions used in dependencies are memoized with `useCallback`
- [ ] All state updates use functional update pattern: `setState(prev => ...)`
- [ ] All useEffect hooks have complete dependency arrays
- [ ] No state updates during render (only in effects or handlers)
- [ ] No circular dependencies between hooks
- [ ] All closures use functional updates or proper dependencies

---

## 🎯 Quick Decision Tree

**Need to use an object/array in useEffect?**
→ Wrap it in `useMemo`

**Need to use a function in useEffect?**
→ Wrap it in `useCallback`

**Need to update state based on previous state?**
→ Use functional update: `setState(prev => ...)`

**Effect running too often?**
→ Check if all dependencies are memoized or primitive

**Still have infinite loop?**
→ Check for circular dependencies (A depends on B, B depends on A)
