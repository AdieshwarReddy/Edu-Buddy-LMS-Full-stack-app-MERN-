import React, { useState, useEffect } from 'react';
import { PlusCircle, Trash2, Save, HelpCircle } from 'lucide-react';
import api from '../../api/axios';
import { useToast } from '../../context/ToastContext';
import { LoadingSpinner } from '../common/LoadingSpinner';

export const QuizBuilder = ({ lessonId, onClose }) => {
  const [questions, setQuestions] = useState([{ questionText: '', options: ['', ''], correctOptionIndex: 0 }]);
  const [passingScore, setPassingScore] = useState(80);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  useEffect(() => {
    fetchQuiz();
  }, [lessonId]);

  const fetchQuiz = async () => {
    try {
      const res = await api.get(`/lessons/${lessonId}/quiz`);
      if (res.data?.success && res.data.quiz) {
        setQuestions(res.data.quiz.questions);
        setPassingScore(res.data.quiz.passingScore);
      }
    } catch (err) {
      if (err.response?.status !== 404) {
        toast.error('Failed to fetch existing quiz');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAddQuestion = () => {
    setQuestions([...questions, { questionText: '', options: ['', ''], correctOptionIndex: 0 }]);
  };

  const handleRemoveQuestion = (idx) => {
    if (questions.length <= 1) {
      toast.error('A quiz must have at least one question');
      return;
    }
    const newQs = [...questions];
    newQs.splice(idx, 1);
    setQuestions(newQs);
  };

  const handleQuestionChange = (idx, field, value) => {
    const newQs = [...questions];
    newQs[idx][field] = value;
    setQuestions(newQs);
  };

  const handleOptionChange = (qIdx, oIdx, value) => {
    const newQs = [...questions];
    newQs[qIdx].options[oIdx] = value;
    setQuestions(newQs);
  };

  const handleAddOption = (qIdx) => {
    const newQs = [...questions];
    newQs[qIdx].options.push('');
    setQuestions(newQs);
  };

  const handleRemoveOption = (qIdx, oIdx) => {
    const newQs = [...questions];
    if (newQs[qIdx].options.length <= 2) {
      toast.error('A question must have at least 2 options');
      return;
    }
    newQs[qIdx].options.splice(oIdx, 1);
    // Adjust correct index if needed
    if (newQs[qIdx].correctOptionIndex >= newQs[qIdx].options.length) {
      newQs[qIdx].correctOptionIndex = 0;
    }
    setQuestions(newQs);
  };

  const handleSave = async () => {
    // Validate
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.questionText.trim()) return toast.error(`Question ${i + 1} is missing text`);
      for (let j = 0; j < q.options.length; j++) {
        if (!q.options[j].trim()) return toast.error(`Question ${i + 1} has an empty option`);
      }
    }

    setSaving(true);
    try {
      const res = await api.post(`/lessons/${lessonId}/quiz`, {
        questions,
        passingScore: Number(passingScore)
      });
      if (res.data?.success) {
        toast.success('Quiz saved successfully!');
        if (onClose) onClose();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save quiz');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-slate-50 p-4 rounded-xl border border-slate-200">
        <div>
          <h3 className="font-bold text-slate-800">Quiz Settings</h3>
          <p className="text-xs text-slate-500">Define the passing criteria for this quiz.</p>
        </div>
        <div className="flex items-center space-x-3">
          <label className="text-xs font-bold text-slate-700">Passing Score (%)</label>
          <input 
            type="number" 
            min="1" max="100" 
            value={passingScore}
            onChange={(e) => setPassingScore(e.target.value)}
            className="w-20 px-3 py-1.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:border-brand-500 text-center"
          />
        </div>
      </div>

      <div className="space-y-6">
        {questions.map((q, qIdx) => (
          <div key={qIdx} className="p-5 bg-white border border-slate-200 shadow-sm rounded-2xl space-y-4">
            <div className="flex justify-between items-start gap-4">
              <div className="flex-1">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Question {qIdx + 1}
                </label>
                <input 
                  type="text"
                  value={q.questionText}
                  onChange={(e) => handleQuestionChange(qIdx, 'questionText', e.target.value)}
                  placeholder="e.g. What is the virtual DOM?"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand-500 focus:bg-white"
                />
              </div>
              <button 
                onClick={() => handleRemoveQuestion(qIdx)}
                className="mt-6 p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                title="Remove Question"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 pl-4 border-l-2 border-slate-100">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                Options
              </label>
              {q.options.map((opt, oIdx) => (
                <div key={oIdx} className="flex items-center space-x-3">
                  <input 
                    type="radio" 
                    name={`correct-${qIdx}`}
                    checked={q.correctOptionIndex === oIdx}
                    onChange={() => handleQuestionChange(qIdx, 'correctOptionIndex', oIdx)}
                    className="w-4 h-4 text-brand-600 focus:ring-brand-500"
                    title="Mark as correct answer"
                  />
                  <input 
                    type="text"
                    value={opt}
                    onChange={(e) => handleOptionChange(qIdx, oIdx, e.target.value)}
                    placeholder={`Option ${oIdx + 1}`}
                    className="flex-1 px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-brand-500"
                  />
                  <button 
                    onClick={() => handleRemoveOption(qIdx, oIdx)}
                    className="text-slate-400 hover:text-rose-500 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <button 
                onClick={() => handleAddOption(qIdx)}
                className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center space-x-1 mt-2"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Add Option</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-slate-200">
        <button 
          onClick={handleAddQuestion}
          className="flex items-center space-x-2 px-4 py-2 text-sm font-bold text-brand-600 bg-brand-50 hover:bg-brand-100 rounded-xl transition-colors"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Add Question</span>
        </button>

        <button 
          onClick={handleSave}
          disabled={saving}
          className="flex items-center space-x-2 px-6 py-2.5 text-sm font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-sm transition-colors disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Saving Quiz...' : 'Save Quiz'}</span>
        </button>
      </div>
    </div>
  );
};
