import React, { useState, useEffect } from 'react';
import { MessageSquare, Reply, CheckCircle2, User, Send, Check } from 'lucide-react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { LoadingSpinner } from '../common/LoadingSpinner';

export const QnABoard = ({ courseId, currentLessonId }) => {
  const { user, isInstructor, isAdmin } = useAuth();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  const [newQuestionTitle, setNewQuestionTitle] = useState('');
  const [newQuestionContent, setNewQuestionContent] = useState('');
  const [asking, setAsking] = useState(false);
  const [activeQuestionId, setActiveQuestionId] = useState(null);
  const [replyContent, setReplyContent] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);

  const fetchQuestions = async () => {
    try {
      const res = await api.get(`/courses/${courseId}/questions`);
      if (res.data?.success) {
        setQuestions(res.data.questions);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, [courseId]);

  const handleAskQuestion = async (e) => {
    e.preventDefault();
    if (!newQuestionTitle.trim() || !newQuestionContent.trim()) return;
    setAsking(true);
    try {
      const res = await api.post(`/courses/${courseId}/questions`, {
        title: newQuestionTitle,
        content: newQuestionContent,
        lessonId: currentLessonId
      });
      if (res.data?.success) {
        toast.success('Question posted!');
        setNewQuestionTitle('');
        setNewQuestionContent('');
        fetchQuestions();
      }
    } catch (err) {
      toast.error('Failed to post question');
    } finally {
      setAsking(false);
    }
  };

  const handleReply = async (e, qId) => {
    e.preventDefault();
    if (!replyContent.trim()) return;
    setReplyingTo(qId);
    try {
      const res = await api.post(`/questions/${qId}/reply`, { content: replyContent });
      if (res.data?.success) {
        setReplyContent('');
        fetchQuestions();
      }
    } catch (err) {
      toast.error('Failed to reply');
    } finally {
      setReplyingTo(null);
    }
  };

  const handleResolve = async (qId) => {
    try {
      const res = await api.patch(`/questions/${qId}/resolve`);
      if (res.data?.success) {
        toast.success(res.data.isResolved ? 'Marked as resolved' : 'Reopened question');
        fetchQuestions();
      }
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  if (loading) return <div className="py-10"><LoadingSpinner text="Loading Q&A..." /></div>;

  return (
    <div className="space-y-6">
      {/* Ask Question Form */}
      <div className="bg-slate-900 rounded-2xl p-5 sm:p-6 border border-slate-800 shadow-md">
        <h3 className="text-lg font-bold text-white flex items-center space-x-2 mb-4">
          <MessageSquare className="w-5 h-5 text-brand-400" />
          <span>Ask a New Question</span>
        </h3>
        <form onSubmit={handleAskQuestion} className="space-y-4">
          <input
            type="text"
            required
            value={newQuestionTitle}
            onChange={(e) => setNewQuestionTitle(e.target.value)}
            placeholder="Question Title (e.g., 'How does useEffect work?')"
            className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-brand-500 placeholder-slate-500"
          />
          <textarea
            required
            rows={3}
            value={newQuestionContent}
            onChange={(e) => setNewQuestionContent(e.target.value)}
            placeholder="Explain your problem or doubt in detail..."
            className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-brand-500 placeholder-slate-500"
          />
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={asking}
              className="px-6 py-2.5 rounded-xl font-bold text-sm text-slate-900 bg-brand-400 hover:bg-brand-300 transition-colors disabled:opacity-50 flex items-center space-x-2"
            >
              <span>{asking ? 'Posting...' : 'Post Question'}</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      </div>

      {/* Questions List */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-slate-200">
          All Questions ({questions.length})
        </h3>
        
        {questions.length === 0 ? (
          <div className="text-center py-10 bg-slate-900/50 rounded-2xl border border-slate-800/50">
            <MessageSquare className="w-10 h-10 text-slate-600 mx-auto mb-2" />
            <p className="text-slate-400 text-sm">No questions asked yet. Be the first!</p>
          </div>
        ) : (
          questions.map(q => (
            <div key={q._id} className={`bg-slate-900 rounded-2xl border transition-colors ${q.isResolved ? 'border-emerald-500/30' : 'border-slate-800'}`}>
              <div 
                className="p-5 cursor-pointer flex gap-4"
                onClick={() => setActiveQuestionId(activeQuestionId === q._id ? null : q._id)}
              >
                <img 
                  src={q.student?.avatar || `https://ui-avatars.com/api/?name=${q.student?.name || 'U'}&background=334155&color=fff`} 
                  alt="avatar" 
                  className="w-10 h-10 rounded-full object-cover shrink-0 ring-2 ring-slate-800"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-bold text-white text-base leading-tight break-words">{q.title}</h4>
                    {q.isResolved && (
                      <span className="flex items-center space-x-1 px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-bold uppercase tracking-wider shrink-0 border border-emerald-500/20">
                        <Check className="w-3 h-3" />
                        <span>Resolved</span>
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    <strong className="text-slate-300">{q.student?.name}</strong> • {new Date(q.createdAt).toLocaleDateString()}
                    {q.lesson && <span className="ml-2 px-1.5 py-0.5 bg-brand-500/10 text-brand-400 rounded">Lesson: {q.lesson.title}</span>}
                  </p>
                  <p className="text-sm text-slate-300 mt-3 whitespace-pre-wrap">{q.content}</p>
                  
                  <div className="flex items-center space-x-4 mt-4 text-xs font-bold text-slate-500">
                    <span className="flex items-center space-x-1.5 hover:text-slate-300 transition-colors">
                      <Reply className="w-4 h-4" />
                      <span>{q.replies?.length || 0} Replies</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Expanded Replies Section */}
              {activeQuestionId === q._id && (
                <div className="border-t border-slate-800 bg-slate-950/50 rounded-b-2xl p-5 space-y-4">
                  {q.replies?.map(r => (
                    <div key={r._id} className="flex gap-3">
                      <img 
                        src={r.user?.avatar || `https://ui-avatars.com/api/?name=${r.user?.name || 'U'}&background=475569&color=fff`} 
                        alt="avatar" 
                        className="w-8 h-8 rounded-full object-cover shrink-0"
                      />
                      <div className="bg-slate-900 rounded-xl rounded-tl-none p-3 border border-slate-800 flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold text-slate-200">
                            {r.user?.name}
                            {r.user?.role === 'instructor' && <span className="ml-2 px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-500 text-[10px]">Instructor</span>}
                          </span>
                          <span className="text-[10px] text-slate-500">{new Date(r.createdAt).toLocaleDateString()}</span>
                        </div>
                        <p className="text-sm text-slate-300">{r.content}</p>
                      </div>
                    </div>
                  ))}

                  <form onSubmit={(e) => handleReply(e, q._id)} className="flex gap-3 pt-2">
                    <img 
                      src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.name || 'U'}&background=334155&color=fff`} 
                      alt="avatar" 
                      className="w-8 h-8 rounded-full object-cover shrink-0"
                    />
                    <div className="flex-1 flex gap-2">
                      <input
                        type="text"
                        required
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        placeholder="Write a reply..."
                        className="flex-1 px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-brand-500"
                      />
                      <button
                        type="submit"
                        disabled={replyingTo === q._id}
                        className="px-4 py-2 rounded-xl text-slate-900 bg-brand-400 hover:bg-brand-300 font-bold text-sm disabled:opacity-50"
                      >
                        Reply
                      </button>
                    </div>
                  </form>

                  {(user._id === q.student?._id || isInstructor || isAdmin) && !q.isResolved && (
                    <div className="flex justify-end pt-2">
                      <button 
                        onClick={() => handleResolve(q._id)}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/10 transition-colors flex items-center space-x-1"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Mark as Resolved</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
