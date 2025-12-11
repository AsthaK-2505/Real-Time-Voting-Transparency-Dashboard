import React, { memo, useState } from 'react';
import { Candidate } from '../types';

interface CandidateManagerProps {
  candidates: Candidate[];
  onAddCandidate: (candidate: Omit<Candidate, 'id'>) => void;
  onUpdateCandidate: (id: string, candidate: Omit<Candidate, 'id'>) => void;
  onDeleteCandidate: (id: string) => void;
}

const PREDEFINED_COLORS = [
  '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', 
  '#06b6d4', '#f97316', '#84cc16', '#6366f1', '#14b8a6', '#f43f5e'
];

const CandidateManager: React.FC<CandidateManagerProps> = memo(({
  candidates,
  onAddCandidate,
  onUpdateCandidate,
  onDeleteCandidate,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    party: '',
    color: PREDEFINED_COLORS[0],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.party.trim()) {
      alert('Please fill in all fields');
      return;
    }

    if (editingId) {
      onUpdateCandidate(editingId, formData);
      setEditingId(null);
    } else {
      onAddCandidate(formData);
      setIsAdding(false);
    }

    setFormData({ name: '', party: '', color: PREDEFINED_COLORS[0] });
  };

  const handleEdit = (candidate: Candidate) => {
    setEditingId(candidate.id);
    setFormData({
      name: candidate.name,
      party: candidate.party,
      color: candidate.color,
    });
    setIsAdding(false);
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingId(null);
    setFormData({ name: '', party: '', color: PREDEFINED_COLORS[0] });
  };

  const handleDelete = (id: string) => {
    if (candidates.length <= 2) {
      alert('You must have at least 2 candidates');
      return;
    }
    if (window.confirm('Are you sure you want to delete this candidate? All their votes will be lost.')) {
      onDeleteCandidate(id);
    }
  };

  return (
    <div className="candidate-manager">
      <div className="candidate-manager-header">
        <h3>Candidate Management</h3>
        {!isAdding && !editingId && (
          <button 
            className="btn-add-candidate"
            onClick={() => setIsAdding(true)}
            aria-label="Add new candidate"
          >
            + Add Candidate
          </button>
        )}
      </div>

      <div className="candidates-list">
        {candidates.map((candidate) => (
          <div key={candidate.id} className="candidate-item">
            <div className="candidate-info">
              <div 
                className="candidate-color-indicator" 
                style={{ backgroundColor: candidate.color }}
                aria-label={`Color for ${candidate.name}`}
              />
              <div className="candidate-details">
                <strong>{candidate.name}</strong>
                <span className="candidate-party">{candidate.party}</span>
              </div>
            </div>
            <div className="candidate-actions">
              <button
                className="btn-edit"
                onClick={() => handleEdit(candidate)}
                aria-label={`Edit ${candidate.name}`}
              >
                ✏️ Edit
              </button>
              <button
                className="btn-delete"
                onClick={() => handleDelete(candidate.id)}
                aria-label={`Delete ${candidate.name}`}
              >
                🗑️ Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {(isAdding || editingId) && (
        <form className="candidate-form" onSubmit={handleSubmit}>
          <h4>{editingId ? 'Edit Candidate' : 'Add New Candidate'}</h4>
          
          <div className="form-group">
            <label htmlFor="candidate-name">
              Candidate Name <span className="required">*</span>
            </label>
            <input
              id="candidate-name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., John Smith"
              required
              maxLength={50}
            />
          </div>

          <div className="form-group">
            <label htmlFor="candidate-party">
              Party Affiliation <span className="required">*</span>
            </label>
            <input
              id="candidate-party"
              type="text"
              value={formData.party}
              onChange={(e) => setFormData({ ...formData, party: e.target.value })}
              placeholder="e.g., Democratic Party"
              required
              maxLength={50}
            />
          </div>

          <div className="form-group">
            <label htmlFor="candidate-color">
              Chart Color
            </label>
            <div className="color-picker">
              {PREDEFINED_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  className={`color-option ${formData.color === color ? 'selected' : ''}`}
                  style={{ backgroundColor: color }}
                  onClick={() => setFormData({ ...formData, color })}
                  aria-label={`Select color ${color}`}
                />
              ))}
            </div>
            <input
              id="candidate-color"
              type="color"
              value={formData.color}
              onChange={(e) => setFormData({ ...formData, color: e.target.value })}
              aria-label="Custom color picker"
            />
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-submit">
              {editingId ? '💾 Update' : '➕ Add'} Candidate
            </button>
            <button type="button" className="btn-cancel" onClick={handleCancel}>
              ❌ Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
});

CandidateManager.displayName = 'CandidateManager';

export default CandidateManager;
