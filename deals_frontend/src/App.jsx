import { useState, useEffect } from 'react';
import { DndContext, useDraggable, useDroppable } from '@dnd-kit/core';
import { Briefcase, Info, X } from 'lucide-react';
import { fetchDeals, updateDealStage, fetchDealHistory } from './api';
import './App.css';

const STAGES = ['new', 'qualified', 'proposal', 'negotiation', 'won', 'lost'];

// Deal Detail Modal Component
function DealModal({ deal, onClose }) {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    fetchDealHistory(deal.id)
      .then(data => setHistory(data))
      .catch(console.error);
  }, [deal.id]);

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>{deal.title}</h2>
          <button onClick={onClose} className="close-btn"><X size={20} /></button>
        </div>
        <div className="modal-body">
          <p><strong>Value:</strong> ${deal.value}</p>
          <p><strong>Current Stage:</strong> {deal.stage.toUpperCase()}</p>
          <p><strong>Close Date:</strong> {deal.close_date || 'N/A'}</p>
          
          <h3>Audit History</h3>
          <ul className="history-list">
            {history.map((log) => (
              <li key={log.id}>
                <small>{new Date(log.created_at).toLocaleString()}</small>
                <p>{log.notes}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

// Draggable Deal Card Component
function DealCard({ deal, onViewClick }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: deal.id,
    data: { currentStage: deal.stage },
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  return (
    <div ref={setNodeRef} style={style} {...attributes} className="deal-card">
      <div {...listeners} className="drag-handle">
        <h4><Briefcase size={14} /> {deal.title}</h4>
        <p>Value: ${deal.value}</p>
        <small>Close: {deal.close_date || 'N/A'}</small>
      </div>
      <button className="view-btn" onClick={() => onViewClick(deal)}>
        <Info size={14} /> View Details
      </button>
    </div>
  );
}

// Droppable Column Component
function PipelineColumn({ stage, deals, onViewDeal }) {
  const { setNodeRef } = useDroppable({ id: stage });

  return (
    <div ref={setNodeRef} className="pipeline-column">
      <h3 className="column-header">{stage.toUpperCase()}</h3>
      <div className="column-content">
        {deals.map(deal => (
          <DealCard key={deal.id} deal={deal} onViewClick={onViewDeal} />
        ))}
      </div>
    </div>
  );
}

// Main Application Board
export default function App() {
  const [deals, setDeals] = useState([]);
  const [selectedDeal, setSelectedDeal] = useState(null);

  useEffect(() => {
    fetchDeals().then(data => setDeals(data)).catch(console.error);
  }, []);

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over) return; 

    const dealId = active.id;
    const oldStage = active.data.current.currentStage;
    const newStage = over.id;

    if (oldStage !== newStage) {
      setDeals((prev) => prev.map(d => d.id === dealId ? { ...d, stage: newStage } : d));
      
      updateDealStage(dealId, newStage).catch((err) => {
        console.error("Failed to update stage:", err);
        fetchDeals().then(data => setDeals(data));
      });
    }
  };

  return (
    <div className="board-container">
      <h1>Deals Pipeline (Module 3)</h1>
      <DndContext onDragEnd={handleDragEnd}>
        <div className="kanban-board">
          {STAGES.map(stage => (
            <PipelineColumn 
              key={stage} 
              stage={stage} 
              deals={deals.filter(d => d.stage === stage)} 
              onViewDeal={setSelectedDeal}
            />
          ))}
        </div>
      </DndContext>

      {/* Render Modal if a deal is selected */}
      {selectedDeal && (
        <DealModal deal={selectedDeal} onClose={() => setSelectedDeal(null)} />
      )}
    </div>
  );
}