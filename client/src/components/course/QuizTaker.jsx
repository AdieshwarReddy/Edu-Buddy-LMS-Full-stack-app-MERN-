import React, { useState, useEffect } from 'react';
import { HelpCircle, CheckCircle2, XCircle, ChevronRight, Award, RefreshCcw } from 'lucide-react';
import api from '../../api/axios';
import { useToast } from '../../context/ToastContext';
import { LoadingSpinner } from '../common/LoadingSpinner';

export const QuizTaker = ({ lessonId, onComplete }) => {
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [showIntro, setShowIntro] = useState(true);
  
  const toast = useToast();

  const fetchQuiz = async () => {
    try {
      const res = await api.get(`/lessons/${lessonId}/quiz`);
      if (res.data?.success && res.data.quiz) {
        setQuiz(res.data.quiz);
        if (res.data.quiz.previousAttempt) {
          setResult(res.data.quiz.previousAttempt);
          setShowIntro(false);
        }
      } else {
        setQuiz(null);
      }
    } catch (err) {
      if (err.response?.status !== 404) {
        toast.error('Failed to load quiz');
      }
      setQuiz(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setResult(null);
    setShowIntro(true);
    setAnswers({});
    setLoading(true);
    fetchQuiz();
  }, [lessonId]);

  const handleSelectOption = (qIdx, oIdx) => {
    setAnswers(prev => ({ ...prev, [qIdx]: oIdx }));
  };

  const handleSubmit = async () => {
    if (Object.keys(answers).length < quiz.questions.length) {
      return toast.error('Please answer all questions before submitting.');
    }

    setSubmitting(true);
    try {
      // Build array of answers matching question index
      const answerArray = quiz.questions.map((_, idx) => answers[idx]);
      
      const res = await api.post(`/lessons/${lessonId}/quiz/submit`, { answers: answerArray });
      
      if (res.data?.success) {
        setResult(res.data);
        if (res.data.passed) {
          toast.success(`Quiz passed with ${res.data.score}%! 🎉`);
          if (onComplete) onComplete();
        } else {
          toast.error(`You scored ${res.data.score}%. You need ${quiz.passingScore}% to pass.`);
        }
      }
    } catch (err) {
      toast.error('Failed to submit quiz');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRetake = () => {
    setResult(null);
    setAnswers({});
    setShowIntro(false);
  };

  if (loading) return <div className="py-12"><LoadingSpinner text="Loading Quiz..." /></div>;

  if (!quiz) return null; // No quiz for this lesson

  // Intro Screen
  if (showIntro && !result) {
    return (
      <div className="bg-slate-900 rounded-3xl p-8 border border-slate-800 text-center space-y-5 shadow-xl">
        <div className="w-16 h-16 bg-brand-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
          <HelpCircle className="w-8 h-8 text-brand-400" />
        </div>
        <h3 className="text-2xl font-display font-bold text-white">Knowledge Check</h3>
        <p className="text-sm text-slate-400 max-w-sm mx-auto">
          Test your understanding of this lesson. You must score at least <strong className="text-slate-200">{quiz.passingScore}%</strong> to pass.
        </p>
        <div className="pt-4">
          <button 
            onClick={() => setShowIntro(false)}
            className="px-8 py-3 rounded-xl font-bold text-sm text-slate-900 bg-brand-400 hover:bg-brand-300 transition-colors inline-flex items-center space-x-2"
          >
            <span>Start Quiz ({quiz.questions.length} questions)</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // Result Screen
  if (result) {
    return (
      <div className="bg-slate-900 rounded-3xl p-8 border border-slate-800 text-center space-y-6 shadow-xl">
        <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto ${result.passed ? 'bg-emerald-500/20' : 'bg-rose-500/20'}`}>
          {result.passed ? <Award className="w-10 h-10 text-emerald-400" /> : <XCircle className="w-10 h-10 text-rose-400" />}
        </div>
        
        <div>
          <h3 className="text-3xl font-display font-extrabold text-white mb-2">
            {result.score}% Score
          </h3>
          <p className="text-sm text-slate-400">
            {result.passed 
              ? `Great job! You passed the assessment.` 
              : `You need ${quiz.passingScore}% to pass. Keep trying!`}
          </p>
        </div>

        <div className="flex justify-center space-x-4 pt-4">
          <button 
            onClick={handleRetake}
            className="px-6 py-2.5 rounded-xl font-bold text-sm text-slate-300 bg-slate-800 hover:bg-slate-700 transition-colors inline-flex items-center space-x-2"
          >
            <RefreshCcw className="w-4 h-4" />
            <span>Retake Quiz</span>
          </button>
          
          {result.passed && onComplete && (
             <button 
             onClick={onComplete}
             className="px-6 py-2.5 rounded-xl font-bold text-sm text-slate-900 bg-emerald-400 hover:bg-emerald-300 transition-colors"
           >
             Continue to Next Lesson
           </button>
          )}
        </div>
      </div>
    );
  }

  // Quiz Taking UI
  return (
    <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl space-y-8">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <h3 className="text-lg font-display font-bold text-white flex items-center space-x-2">
          <HelpCircle className="w-5 h-5 text-brand-400" />
          <span>Lesson Assessment</span>
        </h3>
        <span className="text-xs font-bold px-3 py-1 bg-slate-800 text-slate-300 rounded-lg">
          Passing Score: {quiz.passingScore}%
        </span>
      </div>

      <div className="space-y-8">
        {quiz.questions.map((q, qIdx) => (
          <div key={qIdx} className="space-y-4">
            <h4 className="text-sm sm:text-base font-bold text-slate-200">
              <span className="text-slate-500 mr-2">{qIdx + 1}.</span> 
              {q.questionText}
            </h4>
            <div className="space-y-2.5 pl-5 sm:pl-7">
              {q.options.map((opt, oIdx) => (
                <label 
                  key={oIdx} 
                  className={`flex items-start space-x-3 p-3 rounded-xl border cursor-pointer transition-all ${
                    answers[qIdx] === oIdx 
                      ? 'bg-brand-900/30 border-brand-500/50' 
                      : 'bg-slate-800/40 border-slate-700/50 hover:bg-slate-800'
                  }`}
                >
                  <div className="pt-0.5">
                    <input 
                      type="radio" 
                      name={`q-${qIdx}`} 
                      checked={answers[qIdx] === oIdx}
                      onChange={() => handleSelectOption(qIdx, oIdx)}
                      className="w-4 h-4 text-brand-500 bg-slate-900 border-slate-700 focus:ring-brand-500 focus:ring-offset-slate-900"
                    />
                  </div>
                  <span className={`text-sm ${answers[qIdx] === oIdx ? 'text-brand-100 font-medium' : 'text-slate-300'}`}>
                    {opt}
                  </span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="pt-6 border-t border-slate-800 flex justify-end">
        <button 
          onClick={handleSubmit}
          disabled={submitting || Object.keys(answers).length < quiz.questions.length}
          className="px-8 py-3 rounded-xl font-bold text-sm text-slate-900 bg-brand-400 hover:bg-brand-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? 'Submitting...' : 'Submit Answers'}
        </button>
      </div>
    </div>
  );
};
