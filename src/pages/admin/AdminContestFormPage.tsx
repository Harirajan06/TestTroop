import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { dbStore } from '../../lib/supabase';
import { Contest, ContestStatus, ContestType, SubmissionCategory } from '../../types';
import { Trophy, ArrowLeft, Save, Sparkles, CheckSquare } from 'lucide-react';

export const AdminContestFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const isEditMode = Boolean(id);

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [contestType, setContestType] = useState<ContestType>('mobile_app');
  const [productName, setProductName] = useState('');
  const [productUrl, setProductUrl] = useState('');
  const [platform, setPlatform] = useState('iOS & Android');
  const [bannerUrl, setBannerUrl] = useState('');
  const [prizeAmount, setPrizeAmount] = useState<number>(10000);
  const [currency, setCurrency] = useState('INR');
  const [status, setStatus] = useState<ContestStatus>('registration_open');

  const [registrationStart, setRegistrationStart] = useState('2026-09-01T00:00');
  const [registrationEnd, setRegistrationEnd] = useState('2026-09-15T23:59');
  const [contestStart, setContestStart] = useState('2026-09-05T00:00');
  const [contestEnd, setContestEnd] = useState('2026-09-25T23:59');
  const [submissionDeadline, setSubmissionDeadline] = useState('2026-09-25T23:59');
  const [resultDate, setResultDate] = useState('2026-09-30T18:00');

  const [testingInstructions, setTestingInstructions] = useState('');
  const [eligibilityRequirements, setEligibilityRequirements] = useState('');
  const [whatsappGroupUrl, setWhatsappGroupUrl] = useState('');
  const [allowedCategories, setAllowedCategories] = useState<SubmissionCategory[]>(['bug_report', 'ui_ux', 'suggestion']);
  const [customConfirmationMessage, setCustomConfirmationMessage] = useState('');

  useEffect(() => {
    if (isEditMode && id) {
      const found = dbStore.getContests().find(c => c.id === id);
      if (found) {
        setTitle(found.title);
        setSlug(found.slug);
        setDescription(found.description);
        setContestType(found.contest_type);
        setProductName(found.product_name);
        setProductUrl(found.product_url || '');
        setPlatform(found.platform);
        setBannerUrl(found.banner_url || '');
        setPrizeAmount(found.prize_amount);
        setCurrency(found.currency || 'INR');
        setStatus(found.status);

        setRegistrationStart(found.registration_start.slice(0, 16));
        setRegistrationEnd(found.registration_end.slice(0, 16));
        setContestStart(found.contest_start.slice(0, 16));
        setContestEnd(found.contest_end.slice(0, 16));
        setSubmissionDeadline(found.submission_deadline.slice(0, 16));
        setResultDate(found.result_date.slice(0, 16));

        setTestingInstructions(found.testing_instructions);
        setEligibilityRequirements(found.eligibility_requirements || '');
        setWhatsappGroupUrl(found.whatsapp_group_url || '');
        setAllowedCategories(found.allowed_categories || ['bug_report', 'ui_ux', 'suggestion']);
        setCustomConfirmationMessage(found.custom_confirmation_message || '');
      }
    }
  }, [id, isEditMode]);

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!isEditMode) {
      setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''));
    }
  };

  const toggleCategory = (cat: SubmissionCategory) => {
    if (allowedCategories.includes(cat)) {
      if (allowedCategories.length === 1) return;
      setAllowedCategories(allowedCategories.filter(c => c !== cat));
    } else {
      setAllowedCategories([...allowedCategories, cat]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const contestObj: Partial<Contest> = {
      id: isEditMode ? id : undefined,
      title,
      slug,
      description,
      contest_type: contestType,
      product_name: productName,
      product_url: productUrl,
      platform,
      banner_url: bannerUrl,
      prize_amount: Number(prizeAmount),
      currency,
      status,
      registration_start: new Date(registrationStart).toISOString(),
      registration_end: new Date(registrationEnd).toISOString(),
      contest_start: new Date(contestStart).toISOString(),
      contest_end: new Date(contestEnd).toISOString(),
      submission_deadline: new Date(submissionDeadline).toISOString(),
      result_date: new Date(resultDate).toISOString(),
      testing_instructions: testingInstructions,
      eligibility_requirements: eligibilityRequirements,
      whatsapp_group_url: whatsappGroupUrl,
      allowed_categories: allowedCategories,
      custom_confirmation_message: customConfirmationMessage,
    };

    dbStore.saveContest(contestObj as Contest);
    navigate('/admin/contests');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-6">
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/admin/contests" className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/10">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-bold text-white">
            {isEditMode ? `Edit Contest` : 'Create New Testing Contest'}
          </h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-glass-card p-8 rounded-3xl border border-white/10 space-y-8">
        
        {/* SECTION 1: BASIC INFO */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-indigo-300 border-b border-white/10 pb-2">
            1. Basic Contest Details
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-group md:col-span-2">
              <label className="form-label">Contest Title *</label>
              <input 
                type="text" 
                required 
                placeholder="e.g. PaySwift Mobile 3.0 Beta Test"
                value={title} 
                onChange={e => handleTitleChange(e.target.value)}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">URL Slug *</label>
              <input 
                type="text" 
                required 
                value={slug} 
                onChange={e => setSlug(e.target.value)}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Contest Status *</label>
              <select 
                value={status} 
                onChange={e => setStatus(e.target.value as ContestStatus)}
                className="form-select"
              >
                <option value="draft">Draft</option>
                <option value="registration_open">Registration Open</option>
                <option value="upcoming">Upcoming</option>
                <option value="testing_live">Testing Live</option>
                <option value="submission_closed">Submission Closed</option>
                <option value="results_pending">Results Pending</option>
                <option value="winner_announced">Winner Announced</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            <div className="form-group md:col-span-2">
              <label className="form-label">Short Description *</label>
              <textarea 
                required 
                rows={2}
                value={description} 
                onChange={e => setDescription(e.target.value)}
                className="form-textarea"
              />
            </div>
          </div>
        </div>

        {/* SECTION 2: PRODUCT & PLATFORM */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-cyan-300 border-b border-white/10 pb-2">
            2. Product & Reward Specs
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="form-group">
              <label className="form-label">Product Name *</label>
              <input 
                type="text" 
                required 
                placeholder="PaySwift Wallet"
                value={productName} 
                onChange={e => setProductName(e.target.value)}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Contest Domain Type *</label>
              <select 
                value={contestType} 
                onChange={e => setContestType(e.target.value as ContestType)}
                className="form-select"
              >
                <option value="mobile_app">Mobile App</option>
                <option value="web_app">Web Application</option>
                <option value="website">Website</option>
                <option value="other">Other Digital Product</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Platform Specs *</label>
              <input 
                type="text" 
                required 
                placeholder="iOS 16+ & Android 13+"
                value={platform} 
                onChange={e => setPlatform(e.target.value)}
                className="form-input"
              />
            </div>

            <div className="form-group md:col-span-2">
              <label className="form-label">Target Application URL</label>
              <input 
                type="url" 
                placeholder="https://testflight.apple.com/..."
                value={productUrl} 
                onChange={e => setProductUrl(e.target.value)}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Prize Amount (₹ INR) *</label>
              <input 
                type="number" 
                required 
                value={prizeAmount} 
                onChange={e => setPrizeAmount(Number(e.target.value))}
                className="form-input"
              />
            </div>

            <div className="form-group md:col-span-3">
              <label className="form-label">Banner Image URL</label>
              <input 
                type="url" 
                placeholder="https://images.unsplash.com/..."
                value={bannerUrl} 
                onChange={e => setBannerUrl(e.target.value)}
                className="form-input"
              />
            </div>
          </div>
        </div>

        {/* SECTION 3: SCHEDULE & DEADLINES */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-amber-300 border-b border-white/10 pb-2">
            3. Schedule & Deadlines
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-group">
              <label className="form-label">Registration Opens *</label>
              <input 
                type="datetime-local" 
                required 
                value={registrationStart} 
                onChange={e => setRegistrationStart(e.target.value)}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Registration Closes *</label>
              <input 
                type="datetime-local" 
                required 
                value={registrationEnd} 
                onChange={e => setRegistrationEnd(e.target.value)}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Testing Starts *</label>
              <input 
                type="datetime-local" 
                required 
                value={contestStart} 
                onChange={e => setContestStart(e.target.value)}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Testing Ends / Submission Deadline *</label>
              <input 
                type="datetime-local" 
                required 
                value={submissionDeadline} 
                onChange={e => setSubmissionDeadline(e.target.value)}
                className="form-input"
              />
            </div>

            <div className="form-group md:col-span-2">
              <label className="form-label">Result Announcement Date *</label>
              <input 
                type="datetime-local" 
                required 
                value={resultDate} 
                onChange={e => setResultDate(e.target.value)}
                className="form-input"
              />
            </div>
          </div>
        </div>

        {/* SECTION 4: INSTRUCTIONS & WHATSAPP & CATEGORIES */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-pink-300 border-b border-white/10 pb-2">
            4. Instructions, WhatsApp & Submission Categories
          </h3>

          <div className="space-y-4">
            <div className="form-group">
              <label className="form-label">Testing Instructions (Markdown Supported) *</label>
              <textarea 
                required 
                rows={5}
                placeholder="Describe test scenarios, key focus areas, and what NOT to test..."
                value={testingInstructions} 
                onChange={e => setTestingInstructions(e.target.value)}
                className="form-textarea"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Eligibility Requirements</label>
              <input 
                type="text" 
                value={eligibilityRequirements} 
                onChange={e => setEligibilityRequirements(e.target.value)}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">WhatsApp Group Link</label>
              <input 
                type="url" 
                placeholder="https://chat.whatsapp.com/..."
                value={whatsappGroupUrl} 
                onChange={e => setWhatsappGroupUrl(e.target.value)}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Allowed Feedback Submission Categories for this Contest:</label>
              <div className="flex flex-wrap gap-4 pt-1">
                <label className="flex items-center gap-2 text-xs font-semibold text-gray-200 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={allowedCategories.includes('bug_report')}
                    onChange={() => toggleCategory('bug_report')}
                    className="w-4 h-4 rounded text-indigo-600"
                  />
                  <span>Bug Reports</span>
                </label>

                <label className="flex items-center gap-2 text-xs font-semibold text-gray-200 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={allowedCategories.includes('ui_ux')}
                    onChange={() => toggleCategory('ui_ux')}
                    className="w-4 h-4 rounded text-indigo-600"
                  />
                  <span>UI/UX Improvements</span>
                </label>

                <label className="flex items-center gap-2 text-xs font-semibold text-gray-200 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={allowedCategories.includes('suggestion')}
                    onChange={() => toggleCategory('suggestion')}
                    className="w-4 h-4 rounded text-indigo-600"
                  />
                  <span>Product Suggestions</span>
                </label>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Custom Submission Confirmation Message</label>
              <input 
                type="text" 
                placeholder="Thank you for testing! Your feedback is under review by lead engineers."
                value={customConfirmationMessage} 
                onChange={e => setCustomConfirmationMessage(e.target.value)}
                className="form-input"
              />
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-4">
          <Link to="/admin/contests" className="btn btn-ghost">Cancel</Link>
          <button type="submit" className="btn btn-primary px-8 flex items-center gap-2">
            <Save className="w-4 h-4" /> Save & Publish Contest
          </button>
        </div>

      </form>

    </div>
  );
};
