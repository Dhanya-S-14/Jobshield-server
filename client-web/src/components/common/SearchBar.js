import React, { useState, useEffect, useRef } from 'react';
import { FiSearch } from 'react-icons/fi';

const SearchBar = ({ onSearch, placeholder = 'Search...', debounceMs = 400 }) => {
  const [value, setValue] = useState('');
  const timeoutRef = useRef();

  useEffect(() => {
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      onSearch(value);
    }, debounceMs);
    return () => clearTimeout(timeoutRef.current);
  }, [value, debounceMs, onSearch]);

  return (
    <div className="search-bar">
      <FiSearch />
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
    </div>
  );
};

export default SearchBar;
