import React from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, Github, Linkedin, Twitter, Heart, Youtube, Instagram, Mail } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand Col */}
          <div className="md:col-span-1 space-y-4">
            <Link to="/" className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-xl bg-brand-500 flex items-center justify-center text-white shadow-lg shadow-brand-500/30">
                <GraduationCap className="w-5 h-5" />
              </div>
              <span className="font-display font-bold text-xl text-white">
                Adhi <span className="text-brand-400">EduBuddy</span>
              </span>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed">
              Empowering learners worldwide through production-grade engineering courses, interactive video lessons, and verifiable portfolio outcomes.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-4">
              Explore
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/courses" className="hover:text-white transition-colors">
                  All Courses
                </Link>
              </li>
              <li>
                <Link to="/courses?category=Web+Development" className="hover:text-white transition-colors">
                  Web Development
                </Link>
              </li>
              <li>
                <Link to="/courses?category=Cloud+%26+DevOps" className="hover:text-white transition-colors">
                  Cloud & DevOps
                </Link>
              </li>
              <li>
                <Link to="/courses?category=Data+Science+%26+AI" className="hover:text-white transition-colors">
                  Data Science & AI
                </Link>
              </li>
            </ul>
          </div>

          {/* Instructors & Admin */}
          <div>
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-4">
              Teach & Lead
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/register?role=instructor" className="hover:text-white transition-colors">
                  Become an Instructor
                </Link>
              </li>
              <li>
                <Link to="/instructor/dashboard" className="hover:text-white transition-colors">
                  Instructor Studio
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-white transition-colors">
                  Instructor Sign In
                </Link>
              </li>
            </ul>
          </div>

          {/* Tech Stack info */}
          <div>
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-4">
              Tech Stack
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Built with React 18, Vite, Node.js, Express, MongoDB Mongoose, Stripe Checkout, and Cloudinary Media.
            </p>
            <div className="flex flex-wrap gap-3">
              <a
                href="https://github.com/AdieshwarReddy"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
                aria-label="GitHub"
              >
                <Github className="w-4 h-4" />
              </a>
              <a
                href="https://www.linkedin.com/in/adieshwar-reddy-mogili-3b4b11332/"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-blue-400 transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-4 h-4" />
              </a>
              <a
                href="https://www.youtube.com/@AdieshwarReddyMogili"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-red-500 transition-colors"
                aria-label="YouTube"
              >
                <Youtube className="w-4 h-4" />
              </a>
              <a
                href="https://www.instagram.com/theconfident_circle?stkn=MWFlbnd5YmprbGhtNw%3D%3D"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-pink-500 transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="mailto:mogiliadieshwarreddy5919@gmail.com"
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-emerald-400 transition-colors"
                aria-label="Email"
              >
                <Mail className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Adhi EduBuddy LMS. All rights reserved.</p>
          <p className="flex items-center space-x-1 mt-2 sm:mt-0">
            <span>Crafted for high-impact software engineering portfolios</span>
          </p>
        </div>
      </div>
    </footer>
  );
};
