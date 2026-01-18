import React, { useState, useEffect, useRef } from 'react';
import { Problem, TOPICS, Difficulty, AISettings } from '../types';
import { autoFillProblemDetails } from '../utils/aiService';
import { X, Sparkles, Loader2, Image as ImageIcon, Link2, Pencil, Eraser, Undo } from 'lucide-react';
import { getNextReviewDate } from '../utils/sm2';
import ModelSelector from './ModelSelector';

interface ProblemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (problem: Problem) => void;
  onDelete?: (id: string) => void;
  existingProblem?: Problem | null;
  aiSettings: AISettings;
}

const emptyProblem: Problem = {
  id: '',
  title: '',
  link: '',
  topic: TOPICS[0],
  pattern: '',
  difficulty: 'Medium',
  confidence: 1,
  constraints: '',
  trigger: '',
  aha: '',
  mistake: '',
  relatedTo: '',
  codeSnippet: '',
  imageUrl: '',
  sketchBase64: '',
  lastReviewed: Date.now(),
  nextReviewDate: Date.now(),
  // SM-2 Defaults
  revisionCount: 0,
  easinessFactor: 2.5,
  interval: 0,
  reviewHistory: []
};

const ProblemModal: React.FC<ProblemModalProps> = ({ isOpen, onClose, onSave, onDelete, existingProblem, aiSettings }) => {
  const [formData, setFormData] = useState<Problem>(emptyProblem);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Local AI Provider Override
  const [activeProvider, setActiveProvider] = useState<'gemini' | 'ollama'>(aiSettings.provider);

  // Canvas State
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [showCanvas, setShowCanvas] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (existingProblem) {
        setFormData(existingProblem);
        if (existingProblem.sketchBase64) {
          setShowCanvas(true);
        }
      } else {
        setFormData({ ...emptyProblem, id: Date.now().toString() });
        setShowCanvas(false);
      }
      setError(null);
    }
  }, [isOpen, existingProblem]);

  // Load sketch into canvas when it becomes visible
  useEffect(() => {
    if (showCanvas && canvasRef.current && formData.sketchBase64) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const img = new Image();
      img.onload = () => {
        ctx?.drawImage(img, 0, 0);
      };
      img.src = formData.sketchBase64;
    }
  }, [showCanvas]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleMagicFill = async () => {
    if (!formData.title) {
      setError("Please enter a Title first.");
      return;
    }

    setIsAiLoading(true);
    setError(null);

    try {
      const aiData = await autoFillProblemDetails(formData.title, formData.trigger || "", aiSettings, activeProvider);
      setFormData(prev => ({
        ...prev,
        ...aiData,
        topic: aiData.topic || prev.topic,
        pattern: aiData.pattern || prev.pattern,
        difficulty: (aiData.difficulty as Difficulty) || prev.difficulty,
        trigger: aiData.trigger || prev.trigger,
        aha: aiData.aha || prev.aha,
        codeSnippet: aiData.codeSnippet || prev.codeSnippet,
        relatedTo: aiData.relatedTo || prev.relatedTo,
        constraints: aiData.constraints || prev.constraints,
      }));
    } catch (err) {
      setError("Failed to auto-fill. Check API Key or try again.");
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let sketchData = formData.sketchBase64;
    if (showCanvas && canvasRef.current) {
      sketchData = canvasRef.current.toDataURL();
    }

    // Default 1 day review if new
    const nextDate = existingProblem ? formData.nextReviewDate : getNextReviewDate(1);

    onSave({
      ...formData,
      sketchBase64: sketchData,
      lastReviewed: Date.now(),
      nextReviewDate: nextDate,
      interval: existingProblem ? formData.interval : 1
    });
    onClose();
  };

  // Canvas Drawing Logic
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#38BDF8'; // Accent Blue
    ctx.lineCap = 'round';
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-900/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-navy-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-navy-700">
        <div className="flex justify-between items-center p-6 border-b border-navy-700 sticky top-0 bg-navy-800 z-10">
          <div>
            <h2 className="text-xl font-bold text-white">
              {existingProblem ? 'Edit Logic Card' : 'New Logic Card'}
            </h2>
          </div>
          <div className="flex items-center gap-4">
            {!existingProblem && (
              <ModelSelector
                selectedProvider={activeProvider}
                onSelect={setActiveProvider}
                settings={aiSettings}
              />
            )}
            <button onClick={onClose} className="p-2 hover:bg-navy-700 rounded-full text-gray-400">
              <X size={20} />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="p-3 bg-red-900/20 text-accent-coral rounded-lg text-sm border border-red-900/50">
              {error}
            </div>
          )}

          {/* Core Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="col-span-2 md:col-span-1">
              <label className="block text-sm font-medium text-gray-300 mb-1">Problem Title</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g. Two Sum"
                className="w-full rounded-lg border border-navy-700 bg-navy-900 px-3 py-2 text-sm focus:ring-2 focus:ring-accent-purple outline-none text-white"
                required
              />
            </div>
            <div className="col-span-2 md:col-span-1">
              <label className="block text-sm font-medium text-gray-300 mb-1">Direct Link</label>
              <input
                type="url"
                name="link"
                value={formData.link}
                onChange={handleChange}
                placeholder="https://leetcode.com/..."
                className="w-full rounded-lg border border-navy-700 bg-navy-900 px-3 py-2 text-sm focus:ring-2 focus:ring-accent-purple outline-none text-white"
              />
            </div>
          </div>

          {/* AI Action */}
          {!existingProblem && (
            <div className="flex justify-between items-center">
              <div className="text-xs text-gray-500">
                Using: <span className="text-gray-300 font-bold uppercase">{activeProvider}</span>
              </div>
              <button
                type="button"
                onClick={handleMagicFill}
                disabled={isAiLoading}
                className="flex items-center gap-2 text-accent-purple text-sm font-medium hover:text-white disabled:opacity-50 transition-colors"
                title={`Auto-Fill using ${activeProvider}`}
              >
                {isAiLoading ? <Loader2 className="animate-spin h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
                Magic Fill
              </button>
            </div>
          )}

          {/* Classification */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Topic</label>
              <select
                name="topic"
                value={formData.topic}
                onChange={handleChange}
                className="w-full rounded-lg border border-navy-700 bg-navy-900 px-3 py-2 text-sm text-white"
              >
                {TOPICS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            {/* Difficulty Selector */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Difficulty</label>
              <select
                name="difficulty"
                value={formData.difficulty}
                onChange={handleChange}
                className={`w-full rounded-lg border border-navy-700 bg-navy-900 px-3 py-2 text-sm font-bold ${formData.difficulty === 'Easy' ? 'text-green-400' :
                  formData.difficulty === 'Medium' ? 'text-yellow-400' :
                    'text-red-400'
                  }`}
              >
                <option value="Easy" className="text-green-400">Easy</option>
                <option value="Medium" className="text-yellow-400">Medium</option>
                <option value="Hard" className="text-red-400">Hard</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Pattern</label>
              <input
                type="text"
                name="pattern"
                value={formData.pattern}
                onChange={handleChange}
                placeholder="e.g. Fast & Slow Pointers"
                className="w-full rounded-lg border border-navy-700 bg-navy-900 px-3 py-2 text-sm text-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Confidence (Manual)</label>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="1"
                  max="5"
                  name="confidence"
                  value={formData.confidence}
                  onChange={(e) => setFormData(p => ({ ...p, confidence: parseInt(e.target.value) }))}
                  className="w-full h-2 bg-navy-700 rounded-lg appearance-none cursor-pointer accent-accent-purple"
                />
                <span className="text-white font-mono w-4">{formData.confidence}</span>
              </div>
            </div>
          </div>

          {/* Deep Logic */}
          <div className="space-y-4 border-t border-navy-700 pt-4">

            {/* Polya Step 1 */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Constraints <span className="text-gray-500 font-normal">(Polya Step 1)</span>
              </label>
              <input
                type="text"
                name="constraints"
                value={formData.constraints}
                onChange={handleChange}
                placeholder="e.g. 1 <= n <= 10^5 (Implies O(n) or O(nlogn))"
                className="w-full rounded-lg border border-navy-700 bg-navy-900 px-3 py-2 text-sm text-white font-mono"
              />
            </div>

            {/* Polya Step 2 */}
            <div>
              <label className="block text-sm font-medium text-accent-purple mb-1">
                The Signal <span className="text-gray-500 font-normal">(Polya Step 2)</span>
              </label>
              <input
                type="text"
                name="trigger"
                value={formData.trigger}
                onChange={handleChange}
                placeholder="e.g. 'Shortest path' in unweighted graph -> BFS"
                className="w-full rounded-lg border border-navy-700 bg-navy-900 px-3 py-2 text-sm text-white"
              />
            </div>

            {/* Mental Sandbox */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                  <Pencil size={14} className="text-accent-blue" /> Mental Sandbox (Visual Coding)
                </label>
                <button
                  type="button"
                  onClick={() => setShowCanvas(!showCanvas)}
                  className="text-xs text-accent-blue hover:text-white underline"
                >
                  {showCanvas ? 'Hide Canvas' : 'Show Canvas'}
                </button>
              </div>

              {showCanvas && (
                <div className="border border-navy-700 rounded-lg overflow-hidden bg-navy-900 relative">
                  <canvas
                    ref={canvasRef}
                    width={500}
                    height={250}
                    className="w-full h-[250px] cursor-crosshair touch-none"
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                  />
                  <button
                    type="button"
                    onClick={clearCanvas}
                    className="absolute top-2 right-2 p-1.5 bg-navy-800 rounded text-gray-400 hover:text-white border border-navy-700"
                    title="Clear"
                  >
                    <Eraser size={14} />
                  </button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1 flex items-center gap-2">
                  <ImageIcon size={14} /> External Image URL
                </label>
                <input
                  type="url"
                  name="imageUrl"
                  value={formData.imageUrl}
                  onChange={handleChange}
                  placeholder="https://i.imgur.com/..."
                  className="w-full rounded-lg border border-navy-700 bg-navy-900 px-3 py-2 text-sm text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1 flex items-center gap-2">
                  <Link2 size={14} /> Similar To
                </label>
                <input
                  type="text"
                  name="relatedTo"
                  value={formData.relatedTo}
                  onChange={handleChange}
                  placeholder="e.g. Similar to 3-Sum"
                  className="w-full rounded-lg border border-navy-700 bg-navy-900 px-3 py-2 text-sm text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                The "Aha!" Moment <span className="text-gray-500 font-normal">(Polya Step 3)</span>
              </label>
              <textarea
                name="aha"
                value={formData.aha}
                onChange={handleChange}
                rows={2}
                placeholder="The trick that solves it..."
                className="w-full rounded-lg border border-navy-700 bg-navy-900 px-3 py-2 text-sm text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Mistake Log <span className="text-gray-500 font-normal">(Edge Case)</span>
              </label>
              <input
                type="text"
                name="mistake"
                value={formData.mistake}
                onChange={handleChange}
                placeholder="Where did you get stuck?"
                className="w-full rounded-lg border border-navy-700 bg-navy-900 px-3 py-2 text-sm text-accent-coral placeholder:text-gray-600"
              />
            </div>
          </div>

          {/* Code */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Code Solution <span className="text-gray-500 font-normal">(Polya Step 4)</span></label>
            <textarea
              name="codeSnippet"
              value={formData.codeSnippet}
              onChange={handleChange}
              rows={6}
              className="w-full rounded-lg border border-navy-700 bg-navy-900 px-3 py-2 text-sm font-mono text-gray-300"
              placeholder="def solve(nums): ..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-navy-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-300 hover:bg-navy-700 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-accent-purple hover:bg-purple-600 rounded-lg shadow-sm transition-colors"
            >
              Save to Brain
            </button>
            {existingProblem && (
              <button
                type="button"
                onClick={() => onDelete?.(existingProblem.id)}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-sm transition-colors"
              >
                Delete
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProblemModal;
