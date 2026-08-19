import React, { useEffect, useRef, useState } from 'react';
import { FiShield, FiUsers, FiBriefcase, FiFlag } from 'react-icons/fi';

const stats = [
  { icon: <FiShield />, label: 'Scams Detected', target: 15420, suffix: '+' },
  { icon: <FiUsers />, label: 'Users Protected', target: 87340, suffix: '+' },
  { icon: <FiBriefcase />, label: 'Companies Verified', target: 12500, suffix: '+' },
  { icon: <FiFlag />, label: 'Reports Filed', target: 8920, suffix: '+' },
];

const CountUp = ({ target, suffix }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const counted = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !counted.current) {
          counted.current = true;
          const steps = 60;
          const increment = target / steps;
          let current = 0;
          const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
              setCount(target);
              clearInterval(timer);
            } else {
              setCount(Math.floor(current));
            }
          }, 25);
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
};

const StatsCounter = () => {
  return (
    <section className="stats-section">
      <div className="stats-grid stagger-group reveal">
        {stats.map((s, i) => (
          <div key={i} className="stat-card stagger-item hover-scale">
            <div className="stat-icon animate-float" style={{ animationDelay: `${i * 0.5}s` }}>{s.icon}</div>
            <div className="stat-number">
              <CountUp target={s.target} suffix={s.suffix} />
            </div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default StatsCounter;
