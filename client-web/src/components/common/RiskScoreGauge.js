import React, { useEffect, useRef, useState } from 'react';

const RiskScoreGauge = ({ score = 0, size = 200 }) => {
  const [animatedScore, setAnimatedScore] = useState(0);
  const circleRef = useRef();
  const circumference = 2 * Math.PI * 80;
  const [offset, setOffset] = useState(circumference);

  const color = score <= 30 ? '#388e3c' : score <= 60 ? '#f57c00' : '#d32f2f';
  const label = score <= 30 ? 'Low Risk' : score <= 60 ? 'Suspicious' : 'High Risk';

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedScore(score);
      const targetOffset = circumference - (score / 100) * circumference;
      setOffset(targetOffset);
    }, 300);
    return () => clearTimeout(timer);
  }, [score, circumference]);

  return (
    <div className="risk-gauge-container">
      <div className="risk-gauge" style={{ width: size, height: size }}>
        <svg viewBox="0 0 200 200">
          <circle className="risk-gauge-bg" cx="100" cy="100" r="80" />
          <circle
            ref={circleRef}
            className="risk-gauge-fill"
            cx="100"
            cy="100"
            r="80"
            stroke={color}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 1.5s ease, stroke 0.5s ease' }}
          />
        </svg>
        <div className="risk-gauge-center">
          <div className="risk-gauge-score" style={{ color }}>{Math.round(animatedScore)}</div>
          <div className="risk-gauge-label">{label}</div>
        </div>
      </div>
    </div>
  );
};

export default RiskScoreGauge;
