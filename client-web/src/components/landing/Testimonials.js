import React from 'react';
import { FiStar } from 'react-icons/fi';

const testimonials = [
  {
    name: 'Sarah Johnson',
    role: 'Software Engineer',
    avatar: 'SJ',
    text: 'JobShield saved me from a sophisticated fake job offer. The AI detected subtle red flags I would have missed. Highly recommend for every job seeker!',
    stars: 5,
  },
  {
    name: 'Michael Chen',
    role: 'Recent Graduate',
    avatar: 'MC',
    text: 'As a fresh graduate, I was targeted by multiple job scams. JobShield\'s company verification feature gave me peace of mind during my job search.',
    stars: 5,
  },
  {
    name: 'Emily Rodriguez',
    role: 'HR Professional',
    avatar: 'ER',
    text: 'I use JobShield to vet job postings for my clients. The risk score breakdown is incredibly detailed and accurate. A game-changer for recruitment safety.',
    stars: 5,
  },
  {
    name: 'David Kim',
    role: 'Marketing Manager',
    avatar: 'DK',
    text: 'The community reports feature helped me avoid a known scam company. The platform is intuitive and the results are instant. Thank you, JobShield!',
    stars: 5,
  },
];

const Testimonials = () => {
  return (
    <section className="testimonials-section" id="about">
      <h2 className="section-title reveal">What Our Users Say</h2>
      <p className="section-subtitle reveal" style={{ transitionDelay: '0.1s' }}>Join thousands of protected job seekers</p>
      <div className="testimonials-grid stagger-group reveal">
        {testimonials.map((t, i) => (
          <div key={i} className="testimonial-card stagger-item card-hover-effect">
            <div className="testimonial-stars">
              {Array.from({ length: t.stars }).map((_, s) => (
                <FiStar key={s} style={{ fill: '#ffc107', stroke: '#ffc107' }} />
              ))}
            </div>
            <p className="testimonial-text">"{t.text}"</p>
            <div className="testimonial-author">
              <div className="testimonial-avatar">{t.avatar}</div>
              <div>
                <div className="testimonial-name">{t.name}</div>
                <div className="testimonial-role">{t.role}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Testimonials;
