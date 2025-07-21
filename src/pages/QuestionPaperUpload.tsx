import React, { useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/useToast';
import { usePYQData } from '@/hooks/usePYQData';

const QUESTION_PAPER_BUCKET = 'question-papers';
const ANSWER_KEY_BUCKET = 'answer-keys';

const QuestionPaperUpload = () => {
  const { addPYQEntry } = usePYQData();
  const toast = useToast();
  const [formData, setFormData] = useState({
    year: '',
    title: '',
    paper: '',
    status: 'Available',
    questionPaperFile: null as File | null,
    answerKeyFile: null as File | null,
  });
  const [uploading, setUploading] = useState(false);
  const questionPaperInputRef = useRef<HTMLInputElement>(null);
  const answerKeyInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, files } = e.target as any;
    if (files) {
      setFormData((prev) => ({ ...prev, [name]: files[0] }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.questionPaperFile) {
      toast.error('Please select a question paper PDF.');
      return;
    }
    if (!formData.answerKeyFile) {
      toast.error('Please select an answer key PDF.');
      return;
    }
    setUploading(true);
    try {
      console.log('QP File:', formData.questionPaperFile);
      console.log('AK File:', formData.answerKeyFile);
      // Upload question paper to Supabase Storage
      const qpExt = formData.questionPaperFile.name.split('.').pop();
      const qpPath = `${formData.year}-${formData.paper.toLowerCase()}-${Date.now()}.${qpExt}`;
      const { error: qpError } = await supabase.storage.from(QUESTION_PAPER_BUCKET).upload(qpPath, formData.questionPaperFile, { upsert: true });
      if (qpError) throw qpError;
      const { data: qpUrlData } = supabase.storage.from(QUESTION_PAPER_BUCKET).getPublicUrl(qpPath);
      const questionPaperUrl = qpUrlData.publicUrl;

      // Upload answer key to Supabase Storage
      const akExt = formData.answerKeyFile.name.split('.').pop();
      const akPath = `${formData.year}-${formData.paper.toLowerCase()}-ak-${Date.now()}.${akExt}`;
      const { error: akError } = await supabase.storage.from(ANSWER_KEY_BUCKET).upload(akPath, formData.answerKeyFile, { upsert: true });
      if (akError) throw akError;
      const { data: akUrlData } = supabase.storage.from(ANSWER_KEY_BUCKET).getPublicUrl(akPath);
      const answerKeyUrl = akUrlData.publicUrl;

      // Save to Supabase DB
      await addPYQEntry({
        year: parseInt(formData.year),
        title: formData.title,
        paper: formData.paper,
        status: formData.status,
        question_paper_url: questionPaperUrl,
        answer_key_url: answerKeyUrl,
      });
      toast.success('Question paper and answer key uploaded successfully!');
      setFormData({
        year: '',
        title: '',
        paper: '',
        status: 'Available',
        questionPaperFile: null,
        answerKeyFile: null,
      });
      // Clear file input fields
      if (questionPaperInputRef.current) questionPaperInputRef.current.value = '';
      if (answerKeyInputRef.current) answerKeyInputRef.current.value = '';
    } catch (err: any) {
      toast.error('Upload failed', err.message || '');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="bg-card border rounded-lg shadow-lg p-6 w-full max-w-lg">
        <h2 className="text-2xl font-bold mb-4 text-center">Upload Question Paper & Answer Key</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="year" className="block text-sm font-medium mb-2">Year *</label>
            <input
              id="year"
              name="year"
              type="number"
              required
              value={formData.year}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="2024"
            />
          </div>
          <div>
            <label htmlFor="paper" className="block text-sm font-medium mb-2">Paper *</label>
            <select
              id="paper"
              name="paper"
              required
              value={formData.paper}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">Select Paper</option>
              <option value="GS">GS</option>
              <option value="CSAT">CSAT</option>
            </select>
          </div>
          <div>
            <label htmlFor="title" className="block text-sm font-medium mb-2">Title *</label>
            <input
              id="title"
              name="title"
              type="text"
              required
              value={formData.title}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="UPSC CSE PRE 2024"
            />
          </div>
          <div>
            <label htmlFor="status" className="block text-sm font-medium mb-2">Status</label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="Available">Available</option>
              <option value="Coming Soon">Coming Soon</option>
              <option value="Not Available">Not Available</option>
            </select>
          </div>
          <div>
            <label htmlFor="questionPaperFile" className="block text-sm font-medium mb-2">Question Paper PDF *</label>
            <input
              id="questionPaperFile"
              name="questionPaperFile"
              type="file"
              accept="application/pdf"
              required
              onChange={handleChange}
              ref={questionPaperInputRef}
              className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div>
            <label htmlFor="answerKeyFile" className="block text-sm font-medium mb-2">Answer Key PDF *</label>
            <input
              id="answerKeyFile"
              name="answerKeyFile"
              type="file"
              accept="application/pdf"
              required
              onChange={handleChange}
              ref={answerKeyInputRef}
              className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-primary text-primary-foreground px-4 py-2 rounded-md font-semibold hover:bg-primary/90 disabled:opacity-50"
            disabled={uploading}
          >
            {uploading ? 'Uploading...' : 'Upload'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default QuestionPaperUpload; 